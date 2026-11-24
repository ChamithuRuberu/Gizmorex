#!/usr/bin/env node
/**
 * Creates a complete .env.local for Gizmorex.
 *   node scripts/setup-env.js
 * Asks for the values only you have, generates the secrets and the admin
 * password hash, and escapes "$" the way Next.js needs. Nothing is sent anywhere.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const bcrypt = require('bcryptjs');

const target = path.join(__dirname, '..', '.env.local');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
const lines = [];
const waiting = [];
rl.on('line', (l) => (waiting.length ? waiting.shift()(l) : lines.push(l)));
rl.on('close', () => waiting.splice(0).forEach((w) => w('')));
const nextLine = () => new Promise((res) => (lines.length ? res(lines.shift()) : waiting.push(res)));

let muted = false;
const realWrite = process.stdout.write.bind(process.stdout);
rl._writeToOutput = (s) => { if (!muted) realWrite(s); };

async function ask(q, def = '') {
  realWrite(def ? `${q} [${def}]: ` : `${q}: `);
  const a = (await nextLine()).trim();
  if (!process.stdin.isTTY) realWrite('\n');
  return a || def;
}

async function askHidden(q) {
  realWrite(`${q}: `);
  muted = true;
  const a = await nextLine();
  muted = false;
  realWrite('\n');
  return a;
}

// Next.js expands $VAR in env files, so a bcrypt hash must have every $ escaped.
const esc = (v) => String(v).replace(/\$/g, '\\$');

(async () => {
  if (fs.existsSync(target)) {
    const ok = await ask('.env.local already exists. Overwrite it? (yes/no)', 'no');
    if (ok.toLowerCase() !== 'yes') {
      console.log('Stopped. Nothing changed.');
      return rl.close();
    }
    fs.copyFileSync(target, `${target}.backup-${Date.now()}`);
    console.log('Old file backed up next to it.');
  }

  console.log('\n--- Database (MongoDB Atlas > Connect > Drivers) ---');
  const mongo = await ask('MONGODB_URI (mongodb+srv://...)');

  console.log('\n--- Site ---');
  const appUrl = await ask('Site URL', 'http://localhost:3000');

  console.log('\n--- Admin login ---');
  const adminEmail = await ask('Admin email');
  let pw = '';
  while (pw.length < 10) {
    pw = await askHidden('Admin password (min 10 characters, hidden)');
    if (pw.length < 10) console.log('Too short, try again.');
  }
  const hash = bcrypt.hashSync(pw, 12);

  console.log('\n--- Cloudinary (Console > Settings > API Keys) ---');
  const cName = await ask('CLOUDINARY_CLOUD_NAME');
  const cKey = await ask('CLOUDINARY_API_KEY');
  const cSecret = await ask('CLOUDINARY_API_SECRET');

  console.log('\n--- DirectPay (merchant portal). Leave blank to add later; card payment stays off until set ---');
  const dpId = await ask('DIRECTPAY_MERCHANT_ID');
  const dpSecret = await ask('DIRECTPAY_SECRET_KEY');
  const dpStage = (await ask('DIRECTPAY_STAGE (DEV = sandbox, PROD = live)', 'DEV')).toUpperCase() === 'PROD' ? 'PROD' : 'DEV';

  const env = `# Gizmorex local environment. Generated ${new Date().toISOString()}
# Never commit this file. Put the same values in Netlify (without the \\ before $).

MONGODB_URI=${mongo}
NEXT_PUBLIC_APP_URL=${appUrl}
NEXT_PUBLIC_APP_NAME=Gizmorex

JWT_SECRET=${crypto.randomBytes(32).toString('hex')}
NEXTAUTH_SECRET=${crypto.randomBytes(32).toString('hex')}
NEXTAUTH_URL=${appUrl}

ADMIN_EMAIL=${adminEmail}
ADMIN_PASSWORD_HASH=${esc(hash)}

CLOUDINARY_CLOUD_NAME=${cName}
CLOUDINARY_API_KEY=${cKey}
CLOUDINARY_API_SECRET=${cSecret}

DIRECTPAY_MERCHANT_ID=${dpId}
DIRECTPAY_SECRET_KEY=${dpSecret}
DIRECTPAY_STAGE=${dpStage}
`;
  fs.writeFileSync(target, env, { mode: 0o600 });
  console.log(`\nDone: ${target}`);
  console.log('Restart the dev server (Ctrl+C, then npm run dev) and log in at /admin-login.');
  console.log('For Netlify, copy each line into Environment variables and remove the \\ before each $.');
  rl.close();
})();
