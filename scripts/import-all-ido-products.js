const fs = require('fs');
const path = require('path');
const https = require('https');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'yvp0ravz',
  api_key: '454265773368939',
  api_secret: 'B8FTSP2_Xrei6PHU6sh7U92SIFk',
  secure: true,
});

async function fetchPage(page) {
  return new Promise((resolve, reject) => {
    https.get('https://ido.lk/wp-json/wc/store/products?per_page=30&page=' + page, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve([]); }
      });
    }).on('error', reject);
  });
}

function cleanHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;/g, '-').replace(/&#8243;/g, '"').replace(/\s+/g, ' ').trim();
}

function extractBrand(name) {
  const brands = [
    'DJI', 'Hollyland', 'Anker', 'Haylou', 'Microlab', 'UGREEN', 'Ugreen', 
    'Aibimy', 'Monster', 'Philips', 'Lenovo', 'Meetion', 'AOC', 'TP-Link', 
    'LB Link', 'Yesido', 'Remax', 'Plokama', 'ZSYB', 'Green Lion', 'BOXU', 
    'Dell', '70mai', 'Aspor', 'Xiaomi', 'Samsung', 'Apple'
  ];
  for (const b of brands) {
    if (new RegExp('\\b' + b + '\\b', 'i').test(name)) {
      return b.toUpperCase() === 'UGREEN' ? 'UGREEN' : b;
    }
  }
  return 'Gizmorex';
}

function categorizeProduct(name, catList) {
  const lower = (name + ' ' + catList.join(' ')).toLowerCase();
  
  if (lower.includes('smart watch') || lower.includes('smartwatch') || lower.includes('calling watch')) return 'wearables';
  if (lower.includes('gaming') || lower.includes('t11 2.1') || lower.includes('c2000')) return 'gaming';
  if (lower.includes('camera') || lower.includes('video light') || lower.includes('softbox') || lower.includes('capture card') || lower.includes('ring light') || lower.includes('audio recorder') || lower.includes('tripod')) return 'cameras';
  if (lower.includes('mic') || lower.includes('earbuds') || lower.includes('headphone') || lower.includes('speaker') || lower.includes('subwoofer') || lower.includes('audio') || lower.includes('sound card')) return 'audio';
  if (lower.includes('wi-fi') || lower.includes('router') || lower.includes('extender') || lower.includes('smart home')) return 'smart-home';
  if (lower.includes('laptop charger') || lower.includes('macbook') || lower.includes('laptop') || lower.includes('keyboard') || lower.includes('mouse') || lower.includes('usb hub')) return 'laptops';
  if (lower.includes('phone') && !lower.includes('holder') && !lower.includes('cable') && !lower.includes('mic')) return 'smartphones';
  
  return 'accessories';
}

async function run() {
  console.log('📡 Fetching extensive catalog from ido.lk API across 6 pages...');
  const pages = await Promise.all([
    fetchPage(1), fetchPage(2), fetchPage(3), fetchPage(4), fetchPage(5), fetchPage(6)
  ]);
  const rawProducts = pages.flat();
  console.log(`Fetched ${rawProducts.length} raw products.`);

  // Filter valid products with images and price > 0
  const valid = rawProducts.filter(p => {
    const price = p.prices ? Math.round(parseInt(p.prices.price) / 100) : 0;
    return price > 500 && p.images && p.images.length > 0;
  });

  console.log(`Filtering down to unique, relevant gadget products... (${valid.length} valid items)`);

  const processed = [];
  const seenSlugs = new Set();

  for (const p of valid) {
    const slug = (p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase();
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);

    const price = Math.round(parseInt(p.prices.price) / 100);
    const regularPrice = p.prices.regular_price ? Math.round(parseInt(p.prices.regular_price) / 100) : Math.round(price * 1.2);
    const originalPrice = regularPrice > price ? regularPrice : Math.round(price * 1.15);
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    
    const catList = p.categories ? p.categories.map(c => cleanHtml(c.name)) : [];
    const category = categorizeProduct(p.name, catList);
    const brand = extractBrand(p.name);
    
    const rawShort = cleanHtml(p.short_description || p.description || '');
    const features = rawShort
      .split(/[\n;•]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8 && s.length < 80)
      .slice(0, 5);

    if (features.length === 0) {
      features.push('100% Genuine Certified Product');
      features.push('Islandwide Cash on Delivery');
      features.push('Manufacturer Warranty Included');
    }

    const imageUrl = p.images[0] ? p.images[0].src : '';

    processed.push({
      _id: 'ido_' + p.id,
      name: cleanHtml(p.name),
      slug,
      description: cleanHtml(p.short_description || p.description || p.name),
      price,
      originalPrice,
      discount,
      category,
      brand,
      stock: 12 + (p.id % 25),
      sold: 30 + (p.id % 180),
      rating: Number((4.6 + ((p.id % 4) * 0.1)).toFixed(1)),
      numReviews: 20 + (p.id % 90),
      isFeatured: p.id % 5 === 0,
      isFlashDeal: discount >= 20 || (p.id % 6 === 0),
      isNew: p.id % 4 === 0,
      isActive: true,
      features,
      specifications: {
        'Brand': brand,
        'Category': catList[0] || category,
        'Warranty': '6 Months Warranty',
        'Condition': 'Brand New in Box',
        'Delivery': 'Islandwide Delivery Available',
      },
      tags: [category, brand.toLowerCase(), 'ido-lk', 'gadgets'],
      tempImageUrl: imageUrl,
      images: [imageUrl],
      createdAt: new Date(Date.now() - (p.id % 30) * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  console.log(`Selecting top 45 curated gadget products across all target categories...`);
  
  // Balance by category
  const categorized = {};
  for (const p of processed) {
    if (!categorized[p.category]) categorized[p.category] = [];
    categorized[p.category].push(p);
  }

  const selected = [];
  for (const [cat, list] of Object.entries(categorized)) {
    console.log(`  Category [${cat}]: ${list.length} products available`);
    selected.push(...list.slice(0, 8)); // Take up to 8 per category
  }

  console.log(`Total selected items to upload images to Cloudinary: ${selected.length}`);

  // Upload images to Cloudinary
  let uploadCount = 0;
  for (const prod of selected) {
    uploadCount++;
    if (prod.tempImageUrl) {
      try {
        console.log(`[${uploadCount}/${selected.length}] Uploading image for: ${prod.name.substring(0, 40)}...`);
        const res = await cloudinary.uploader.upload(prod.tempImageUrl, {
          folder: 'gizmorex-products',
          resource_type: 'image',
        });
        prod.images = [res.secure_url];
      } catch (e) {
        console.warn(`  Image upload failed for ${prod.name}, using existing URL: ${e.message}`);
      }
    }
    delete prod.tempImageUrl;
  }

  // Save to src/data/products.json
  const outPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
  fs.writeFileSync(outPath, JSON.stringify(selected, null, 2), 'utf8');
  console.log(`\n✅ Saved ${selected.length} products to ${outPath}`);

  // Write a summary report
  console.log('\n--- UPLOADED CATEGORY SUMMARY ---');
  const summary = {};
  selected.forEach(p => summary[p.category] = (summary[p.category] || 0) + 1);
  console.log(summary);
}

run().catch(console.error);
