#!/usr/bin/env node
/**
 * One-off clean-up after an ido.lk import made with an older version of import-ido.mjs.
 *
 *   npm run tidy:catalog -- --dry-run    show what would change
 *   npm run tidy:catalog                 apply
 *
 * 1. Clears category descriptions that were copied from ido.lk (SEO text such as
 *    "... price in Sri Lanka"). Descriptions you wrote yourself are left alone.
 * 2. Turns off the NEW badge on imported products (they are stock, not new arrivals).
 */
import dns from 'node:dns';
import mongoose from 'mongoose';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error: console.error });
if (process.env.IMPORT_DNS !== 'system') dns.setServers(['8.8.8.8', '1.1.1.1']);

const dryRun = process.argv.includes('--dry-run');
const COPIED = /sri\s*lanka|looking for the best|near me|best price|buy online/i;

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing in .env.local');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;

  const cats = await db.collection('categories').find({ description: { $regex: COPIED } }, { projection: { name: 1 } }).toArray();
  console.log(`Category descriptions to clear: ${cats.length}${cats.length ? ' (' + cats.map((c) => c.name).join(', ') + ')' : ''}`);

  const newFilter = { 'source.name': 'ido.lk', isNewArrival: true };
  const newCount = await db.collection('products').countDocuments(newFilter);
  console.log(`Imported products marked NEW: ${newCount}`);

  if (!dryRun) {
    if (cats.length) await db.collection('categories').updateMany({ _id: { $in: cats.map((c) => c._id) } }, { $set: { description: '' } });
    if (newCount) await db.collection('products').updateMany(newFilter, { $set: { isNewArrival: false } });
    console.log('Done.');
  } else {
    console.log('Dry run, nothing changed.');
  }
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error('Tidy failed:', e.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
