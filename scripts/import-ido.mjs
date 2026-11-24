#!/usr/bin/env node
/**
 * Import ido.lk categories and products into MongoDB, with images on Cloudinary.
 *
 *   npm run import:ido -- --dry-run                        preview, writes nothing
 *   npm run import:ido -- --categories=laptops-computers,headphones
 *   npm run import:ido -- --update --prune                 refresh existing products, remove empty categories
 *
 * Options
 *   --categories=a,b   only these ido.lk top-level category slugs (default: all)
 *   --limit=N          stop after N products (useful for a first test)
 *   --update           also refresh products that already exist (name, price, images, category).
 *                      Without it, existing products are left exactly as you edited them.
 *   --inactive         import new products hidden (isActive: false) so you can review them first
 *   --prune            afterwards, delete categories that have no products and no sub-categories
 *   --dry-run          show what would happen, write nothing
 *   --source-text      copy ido.lk's own description text instead of writing original copy (not recommended)
 *
 * Reads MONGODB_URI and CLOUDINARY_* from .env.local. Only real data is stored:
 * stock comes from "in stock", and sold / rating / reviews start at 0.
 */
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import nextEnv from '@next/env';
import { cleanName, writeContent } from './own-content.mjs';

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error: console.error });

const SOURCE = 'https://ido.lk';
const API = `${SOURCE}/wp-json/wc/store`;
const MAX_IMAGES = 4;
const DEFAULT_STOCK = 10;

// ---------- options ----------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);
const opt = {
  categories: args.categories ? String(args.categories).split(',').map((s) => s.trim()).filter(Boolean) : null,
  limit: args.limit ? Number(args.limit) : Infinity,
  update: Boolean(args.update),
  inactive: Boolean(args.inactive),
  prune: Boolean(args.prune),
  dryRun: Boolean(args['dry-run']),
  sourceText: Boolean(args['source-text']),
};

// ---------- helpers ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'Gizmorex catalog import' } });
    if (res.ok) return { data: await res.json(), headers: res.headers };
    if (attempt === 3) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    await sleep(1000 * attempt);
  }
}

async function getAllPages(path) {
  const out = [];
  for (let page = 1; ; page++) {
    const { data, headers } = await getJson(`${API}/${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    out.push(...data);
    const totalPages = Number(headers.get('x-wp-totalpages') || 1);
    if (page >= totalPages || data.length === 0) break;
    await sleep(300); // be polite to their server
  }
  return out;
}

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&#8211;': '–', '&#8217;': '’', '&#8243;': '″', '&nbsp;': ' ' };
function htmlToText(html = '') {
  return html
    .replace(/<(br|\/p|\/li|\/h\d|\/div)\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&[#a-z0-9]+;/gi, (e) => ENTITIES[e] ?? ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

const money = (value, minor) => Math.round(Number(value || 0) / 10 ** Number(minor ?? 2));

// ---------- categories ----------
/**
 * ido.lk's tree can be 3 levels deep; Gizmorex uses parent → sub-category.
 * Each ido category is placed under its top-level ancestor.
 */
function buildCategoryIndex(idoCats) {
  const byId = new Map(idoCats.map((c) => [c.id, c]));
  const rootOf = (c) => {
    let cur = c;
    for (let i = 0; cur.parent && byId.has(cur.parent) && i < 10; i++) cur = byId.get(cur.parent);
    return cur;
  };
  const depthOf = (c) => {
    let d = 0;
    for (let cur = c; cur.parent && byId.has(cur.parent) && d < 10; d++) cur = byId.get(cur.parent);
    return d;
  };
  return { byId, rootOf, depthOf };
}

/** The most specific of a product's ido categories. */
function pickCategory(product, index) {
  const cats = (product.categories || []).map((c) => index.byId.get(c.id)).filter(Boolean);
  return cats.sort((a, b) => index.depthOf(b) - index.depthOf(a))[0];
}

async function upsertCategory(db, idoCat, parentId, sortOrder) {
  const now = new Date();
  const slug = idoCat.slug.toLowerCase();
  if (opt.dryRun) return { _id: new mongoose.Types.ObjectId(), slug };
  await db.collection('categories').updateOne(
    { slug },
    {
      $setOnInsert: {
        name: htmlToText(idoCat.name),
        slug,
        ...(opt.update ? {} : { parent: parentId }),
        description: htmlToText(idoCat.description || ''),
        icon: 'Package',
        color: '#FF6B00',
        image: '',
        isActive: true,
        sortOrder,
        createdAt: now,
      },
      // --update also re-applies ido.lk's placement; otherwise your edits are kept.
      $set: opt.update ? { parent: parentId, updatedAt: now } : { updatedAt: now },
    },
    { upsert: true }
  );
  return db.collection('categories').findOne({ slug }, { projection: { _id: 1, slug: 1, parent: 1 } });
}

// ---------- images ----------
async function uploadImages(product) {
  const sources = (product.images || []).slice(0, MAX_IMAGES).map((i) => i.src).filter(Boolean);
  if (opt.dryRun) return sources;
  const urls = [];
  for (const [n, src] of sources.entries()) {
    try {
      // Stable public_id: re-running the import reuses the same Cloudinary image.
      const res = await cloudinary.uploader.upload(src, {
        folder: 'gizmorex-products',
        public_id: `ido-${product.id}-${n}`,
        overwrite: false,
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }, { quality: 'auto:good' }],
      });
      urls.push(res.secure_url);
    } catch (e) {
      console.warn(`    image ${n + 1} failed: ${e.message}`);
    }
  }
  return urls;
}

// ---------- main ----------
async function main() {
  for (const key of ['MONGODB_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
    if (!process.env[key] && !(opt.dryRun && key.startsWith('CLOUDINARY'))) throw new Error(`${key} is missing in .env.local`);
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log(`Fetching categories from ${SOURCE} ...`);
  const idoCats = await getAllPages('products/categories');
  const index = buildCategoryIndex(idoCats);
  const wantedRoots = opt.categories ? new Set(opt.categories) : null;
  if (wantedRoots) {
    const roots = new Set(idoCats.filter((c) => !c.parent).map((c) => c.slug));
    const unknown = [...wantedRoots].filter((s) => !roots.has(s));
    if (unknown.length) {
      console.log(`Unknown top-level slugs: ${unknown.join(', ')}\nAvailable: ${[...roots].sort().join(', ')}`);
      process.exit(1);
    }
  }

  console.log('Fetching products ...');
  const idoProducts = await getAllPages('products');
  console.log(`  ${idoCats.length} categories, ${idoProducts.length} products on ${SOURCE}`);

  let db = null;
  if (!opt.dryRun) {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    db = mongoose.connection.db;
  }

  const catIds = new Map(); // ido category id -> Mongo category doc
  const stats = { created: 0, updated: 0, skipped: 0, noCategory: 0, failed: 0 };
  let processed = 0;

  for (const p of idoProducts) {
    if (processed >= opt.limit) break;
    const leaf = pickCategory(p, index);
    if (!leaf) {
      stats.noCategory++;
      continue;
    }
    const root = index.rootOf(leaf);
    if (wantedRoots && !wantedRoots.has(root.slug)) continue;
    processed++;

    try {
      // Categories: root (top-level) and, if different, the sub-category under it.
      if (!catIds.has(root.id)) catIds.set(root.id, await upsertCategory(db, root, null, catIds.size));
      if (leaf.id !== root.id && !catIds.has(leaf.id)) {
        catIds.set(leaf.id, await upsertCategory(db, leaf, catIds.get(root.id)._id, 0));
      }
      const categorySlug = catIds.get(leaf.id).slug;

      const slug = p.slug.toLowerCase();
      const existing = opt.dryRun ? null : await db.collection('products').findOne({ slug }, { projection: { _id: 1 } });
      if (existing && !opt.update) {
        stats.skipped++;
        continue;
      }

      const price = money(p.prices?.price, p.prices?.currency_minor_unit);
      if (!price) {
        stats.failed++;
        console.warn(`  - ${p.name}: no price, skipped`);
        continue;
      }
      const regular = money(p.prices?.regular_price, p.prices?.currency_minor_unit);
      const images = await uploadImages(p);
      const specifications = Object.fromEntries(
        (p.attributes || [])
          .filter((a) => a.name && a.terms?.length)
          .map((a) => [htmlToText(a.name), a.terms.map((t) => htmlToText(t.name)).join(', ')])
      );
      const now = new Date();
      const name = opt.sourceText ? htmlToText(p.name) : cleanName(htmlToText(p.name));
      const brand = htmlToText(p.brands?.[0]?.name || '') || 'Generic';
      // Original copy: only facts (model, capacity, ports...) are reused, the sentences are ours.
      const copy = opt.sourceText
        ? { description: htmlToText(p.description || p.short_description || ''), features: [] }
        : writeContent(p, { name, brand, categoryName: htmlToText(leaf.name), specifications });
      const fields = {
        name,
        slug,
        description: copy.description || name,
        features: copy.features,
        price,
        originalPrice: regular > price ? regular : price,
        images,
        category: categorySlug,
        brand,
        specifications,
        tags: (p.tags || []).map((t) => htmlToText(t.name).toLowerCase()).filter(Boolean),
        source: { name: 'ido.lk', id: p.id, url: p.permalink },
        updatedAt: now,
      };

      if (opt.dryRun) {
        console.log(`  [dry-run] ${root.slug} / ${categorySlug}: ${fields.name} — Rs ${price}`);
        stats.created++;
        continue;
      }

      await db.collection('products').updateOne(
        { slug },
        {
          $set: fields,
          $setOnInsert: {
            stock: p.is_in_stock ? DEFAULT_STOCK : 0,
            sold: 0,
            rating: 0,
            numReviews: 0,
            isActive: !opt.inactive,
            isFeatured: false,
            isFlashDeal: Boolean(p.on_sale),
            isNewArrival: true,
            createdAt: now,
          },
        },
        { upsert: true }
      );
      existing ? stats.updated++ : stats.created++;
      console.log(`  ${existing ? 'updated' : 'added  '} ${categorySlug}: ${fields.name}`);
    } catch (e) {
      stats.failed++;
      console.warn(`  ! ${p.name}: ${e.message}`);
    }
  }

  if (opt.prune && !opt.dryRun) {
    let pruned = 0;
    for (const cat of await db.collection('categories').find().toArray()) {
      const used =
        (await db.collection('products').countDocuments({ category: cat.slug }, { limit: 1 })) ||
        (await db.collection('categories').countDocuments({ parent: cat._id }, { limit: 1 }));
      if (!used) {
        await db.collection('categories').deleteOne({ _id: cat._id });
        pruned++;
      }
    }
    console.log(`Removed ${pruned} empty categories.`);
  }

  console.log(`\nDone${opt.dryRun ? ' (dry run, nothing written)' : ''}:`, stats);
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error('\nImport failed:', e.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
