#!/usr/bin/env node
/**
 * Upload brand logos from a folder in one go.
 *
 *   1. Put logo files in ./brand-logos, named after the brand:
 *        ugreen.png  aspor.svg  lb-link.png  kisonli.webp  baseus.png ...
 *      (case, spaces and dashes don't matter: "LB Link.png" matches "LB-Link")
 *   2. npm run brands:logos -- --dry-run     see which files match which brand
 *   3. npm run brands:logos                  upload to Cloudinary and save
 *
 * Options: --dir=path (default ./brand-logos)
 * Reads MONGODB_URI and CLOUDINARY_* from .env.local.
 */
import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error: console.error });
if (process.env.IMPORT_DNS !== 'system') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.promises.setServers(['8.8.8.8', '1.1.1.1']);
}

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const dir = path.resolve(String(args.dir || 'brand-logos'));
const dryRun = Boolean(args['dry-run']);
const EXT = new Set(['.png', '.svg', '.webp', '.jpg', '.jpeg']);
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

async function main() {
  if (!fs.existsSync(dir)) throw new Error(`Folder not found: ${dir}. Create it and add logo files named after each brand.`);
  for (const k of ['MONGODB_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
    if (!process.env[k] && !(dryRun && k.startsWith('CLOUDINARY'))) throw new Error(`${k} is missing in .env.local`);
  }
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  const brands = await db.collection('products').aggregate([
    { $match: { brand: { $nin: ['', null, 'Generic'] } } },
    { $group: { _id: { $toLower: '$brand' }, name: { $first: '$brand' }, count: { $sum: 1 } } },
  ]).toArray();
  const byNorm = new Map(brands.map((b) => [norm(b.name), b]));

  const files = fs.readdirSync(dir).filter((f) => EXT.has(path.extname(f).toLowerCase()));
  const used = new Set();
  for (const file of files) {
    const brand = byNorm.get(norm(path.parse(file).name));
    if (!brand) {
      console.log(`  ? ${file}: no product uses a brand with this name, skipped`);
      continue;
    }
    used.add(brand._id);
    if (dryRun) {
      console.log(`  ${file} -> ${brand.name} (${brand.count} products)`);
      continue;
    }
    const res = await cloudinary.uploader.upload(path.join(dir, file), {
      folder: 'gizmorex-brands',
      public_id: norm(brand.name),
      overwrite: true,
      transformation: [{ width: 600, height: 240, crop: 'limit' }],
    });
    await db.collection('brands').updateOne(
      { key: brand._id },
      { $set: { logo: res.secure_url, updatedAt: new Date() }, $setOnInsert: { key: brand._id, name: brand.name, isActive: true, sortOrder: 0, createdAt: new Date() } },
      { upsert: true }
    );
    console.log(`  uploaded ${file} -> ${brand.name}`);
  }

  const missing = brands.filter((b) => !used.has(b._id)).sort((a, b) => b.count - a.count).map((b) => b.name);
  if (missing.length) console.log(`\nStill without a logo file (most products first): ${missing.slice(0, 20).join(', ')}`);
  console.log(dryRun ? '\nDry run, nothing uploaded.' : '\nDone. Refresh the home page to see the logos.');
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error('\nFailed:', e.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
