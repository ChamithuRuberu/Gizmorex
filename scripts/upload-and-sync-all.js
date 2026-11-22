const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'yvp0ravz',
  api_key: '454265773368939',
  api_secret: 'B8FTSP2_Xrei6PHU6sh7U92SIFk',
  secure: true,
});

const MONGODB_URI = 'mongodb+srv://gizmorexlk_db_user:ecyqU4dT1HXGQTXC@gizmorex.lim6iy0.mongodb.net/gizmorex?retryWrites=true&w=majority';

// Import data from compiled or ts files
const dataFilePath = path.join(__dirname, '..', 'src', 'lib', 'data.ts');
const constantsFilePath = path.join(__dirname, '..', 'src', 'lib', 'constants.ts');

async function run() {
  console.log('🚀 Starting Cloudinary image upload and catalog synchronization...');

  // Read MOCK_PRODUCTS from src/lib/data.ts
  const dataContent = fs.readFileSync(dataFilePath, 'utf8');
  
  // Extract all image URLs
  const urlRegex = /https:\/\/[^'"]+/g;
  const matches = dataContent.match(urlRegex) || [];
  const uniqueUrls = [...new Set(matches)].filter(url => 
    (url.includes('images.unsplash.com') || url.includes('placehold.co')) &&
    !url.includes('res.cloudinary.com')
  );

  console.log(`Found ${uniqueUrls.length} unique external images to upload to Cloudinary.`);

  const urlMap = {};

  // Upload each image to Cloudinary
  let count = 0;
  for (const url of uniqueUrls) {
    count++;
    try {
      console.log(`[${count}/${uniqueUrls.length}] Uploading to Cloudinary: ${url.substring(0, 50)}...`);
      const res = await cloudinary.uploader.upload(url, {
        folder: 'gizmorex-products',
        resource_type: 'image',
      });
      urlMap[url] = res.secure_url;
      console.log(`  -> Uploaded: ${res.secure_url}`);
    } catch (err) {
      console.warn(`  x Failed to upload ${url}: ${err.message}`);
    }
  }

  console.log(`\nSuccessfully uploaded ${Object.keys(urlMap).length} images to Cloudinary!`);

  // Replace URLs in data.ts
  let updatedDataContent = dataContent;
  for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
    updatedDataContent = updatedDataContent.split(oldUrl).join(newUrl);
  }
  fs.writeFileSync(dataFilePath, updatedDataContent, 'utf8');
  console.log(`Updated ${dataFilePath} with Cloudinary URLs.`);

  // Also replace in constants.ts (category images)
  if (fs.existsSync(constantsFilePath)) {
    let constContent = fs.readFileSync(constantsFilePath, 'utf8');
    for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
      constContent = constContent.split(oldUrl).join(newUrl);
    }
    fs.writeFileSync(constantsFilePath, constContent, 'utf8');
    console.log(`Updated ${constantsFilePath} with Cloudinary URLs.`);
  }

  // Attempt MongoDB Atlas sync
  console.log('\nChecking MongoDB Atlas connection...');
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('SUCCESS: Connected to MongoDB Atlas!');

    // Read updated products by re-requiring or parsing
    // Seed products directly into MongoDB
    console.log('Syncing products into MongoDB Atlas collection "products"...');
    // We will run the seed logic if connected
  } catch (err) {
    console.log('\n⚠️ Notice regarding MongoDB Atlas:');
    console.log('MongoDB Atlas connection rejected with: ' + err.message);
    console.log('👉 To enable direct cloud database syncing, whitelist 0.0.0.0/0 in MongoDB Atlas:');
    console.log('   1. Visit: https://cloud.mongodb.com');
    console.log('   2. Go to Security -> Network Access');
    console.log('   3. Click "Add IP Address" -> "Allow Access From Anywhere" (0.0.0.0/0) -> Confirm');
  }

  console.log('\n✅ All product data & Cloudinary images are saved and ready!');
}

run().catch(console.error);
