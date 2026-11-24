/**
 * Original product copy for imported products.
 *
 * Nothing here copies another shop's wording. For each product we keep only
 * FACTS (brand, model name, capacity, wattage, ports, length, specs) and write
 * the sentences ourselves from templates. Wording varies per product (picked
 * from the product id) so listings do not all read the same.
 *
 * Nothing is invented: if a fact was not found, that sentence is left out.
 */

const pick = (arr, seed) => arr[Math.abs(Number(seed) || 0) % arr.length];

// "Hot Product in Sri Lanka"-style SEO tails and shouting are not part of a name.
export function cleanName(name = '') {
  return name
    .replace(/\s+(in|at|for)\s+sri\s*lanka.*$/i, '')
    .replace(/\s*[-–|]\s*(best|buy|price).*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Pull plain facts out of text (name, short description, spec values). */
export function extractFacts(text = '') {
  const t = text.replace(/\s+/g, ' ');
  const first = (re) => (t.match(re) || [])[0];
  const facts = {};
  facts.capacity = first(/\b\d{3,6}\s?mah\b/i);
  facts.watts = first(/\b\d{1,3}(\.\d)?\s?w(att)?s?\b(?!h)/i);
  facts.ram = first(/\b(4|8|12|16|24|32|64)\s?gb\s?(ram|ddr\d)\b/i) || first(/\bddr[345]\b/i);
  facts.storage = first(/\b(64|128|256|512)\s?gb\s?(ssd|nvme|storage)\b|\b[12]\s?tb\s?(ssd|hdd|nvme)?\b/i);
  facts.cpu = first(/\b(core\s?(i[3579]|ultra\s?[579])(-\s?\d{4,5}[a-z]{0,2})?|ryzen\s?[3579](\s\d{4}[a-z]{0,2})?|celeron|pentium|apple\s?m[1-4])\b/i);
  facts.screen = first(/\b1[0-9](\.\d)?\s?(inch|"|″)/i);
  facts.length = first(/\b\d(\.\d)?\s?(m|meter|metre|cm|ft)\b(?![a-z])/i);
  facts.ports = [...new Set((t.match(/\b(usb[\s-]?c|type[\s-]?c|lightning|micro[\s-]?usb|usb[\s-]?a|hdmi|displayport|vga|ethernet|rj45|aux)\b/gi) || []).map((s) => s.replace(/\s+/g, ' ')))].slice(0, 4);
  facts.wireless = first(/\b(bluetooth\s?\d(\.\d)?|wi-?fi\s?\d?|2\.4\s?g(hz)?|wireless)\b/i);
  facts.resolution = first(/\b(4k|2k|1080p|720p|full\s?hd|qhd)\b/i);
  facts.fast = /\b(fast\s?charg|quick\s?charg|pd\b|power delivery|qc\s?\d)/i.test(t);
  facts.magsafe = /magsafe/i.test(t);
  return facts;
}

const TYPES = [
  ['powerbank', /power\s?bank|powerbank/i],
  ['charger', /charger|adapter|adaptor|gan\b/i],
  ['cable', /cable|cord|lead\b/i],
  ['protector', /screen\s?protect|tempered|glass/i],
  ['case', /\bcase\b|cover|pouch|sleeve|bag\b/i],
  ['laptop', /laptop|notebook|macbook|thinkpad|ideapad|vivobook|zenbook/i],
  ['phone', /smart\s?phone|iphone|galaxy|redmi|\bphone\b|tablet|ipad/i],
  ['keyboard', /keyboard/i],
  ['mouse', /mouse|mice/i],
  ['webcam', /web\s?cam|webcam|camera/i],
  ['storage', /ssd|hdd|hard\s?drive|pen\s?drive|flash drive|memory card|sd card/i],
  ['hub', /\bhub\b|dock|converter|splitter|extender/i],
  ['stand', /stand|holder|mount|tripod/i],
];

function detectType(p, categoryText) {
  const hay = `${p.name} ${categoryText}`;
  return (TYPES.find(([, re]) => re.test(hay)) || ['generic'])[0];
}

const INTRO = {
  powerbank: [
    (n) => `${n} keeps your phone and other devices running when there is no socket nearby.`,
    (n) => `Carry ${n} in your bag and top up on the go, whether you are commuting, travelling or caught in a power cut.`,
  ],
  charger: [
    (n) => `${n} is a wall charger for everyday top-ups at home, at the office or while travelling.`,
    (n) => `Replace a lost or slow charger with ${n} and get your device charging again.`,
  ],
  cable: [
    (n) => `${n} is a cable for charging and connecting your devices.`,
    (n) => `Keep a spare at home, in the car or in your bag: ${n} covers the everyday job of linking devices.`,
  ],
  protector: [
    (n) => `${n} helps guard the screen against everyday scratches.`,
    (n) => `Protect your display from daily wear with ${n}.`,
  ],
  case: [
    (n) => `${n} gives your device a layer of protection for daily carry.`,
    (n) => `Add protection and a bit of style with ${n}.`,
  ],
  laptop: [
    (n) => `${n} is a laptop for study, office work and everyday computing.`,
    (n) => `Looking for a dependable machine for work, classes and browsing? ${n} is built for exactly that.`,
  ],
  phone: [
    (n) => `${n} is a mobile device for calls, messaging, photos and daily apps.`,
    (n) => `${n} covers the daily phone jobs: calls, social media, camera and navigation.`,
  ],
  keyboard: [
    (n) => `${n} is a keyboard for comfortable typing at home or at the desk.`,
    (n) => `Type more comfortably with ${n}.`,
  ],
  mouse: [
    (n) => `${n} is a mouse for smooth pointing and clicking at your desk or on the move.`,
    (n) => `Upgrade your workspace with ${n}.`,
  ],
  webcam: [
    (n) => `${n} is a camera for video calls, online classes and streaming.`,
    (n) => `Join meetings and classes with ${n}.`,
  ],
  storage: [
    (n) => `${n} gives you extra space to store and carry your files.`,
    (n) => `Back up documents, photos and videos with ${n}.`,
  ],
  hub: [
    (n) => `${n} adds the connections your device is missing.`,
    (n) => `Plug in more of your gear with ${n}.`,
  ],
  stand: [
    (n) => `${n} holds your device in a convenient position.`,
    (n) => `Free up your hands and set up your device properly with ${n}.`,
  ],
  generic: [
    (n) => `${n} is available from Gizmorex.`,
    (n) => `Meet ${n}, a practical pick from the Gizmorex range.`,
  ],
};

/**
 * @param p  product from the ido.lk Store API
 * @param ctx { name, brand, categoryName, specifications }
 * @returns { description, features }
 */
export function writeContent(p, ctx) {
  const { name, brand, categoryName, specifications = {} } = ctx;
  const specText = Object.entries(specifications).map(([k, v]) => `${k} ${v}`).join(' ');
  const facts = extractFacts(`${name} ${specText} ${p.short_description || ''}`.replace(/<[^>]+>/g, ' '));
  const type = detectType(p, categoryText(categoryName));
  const seed = p.id;

  const parts = [pick(INTRO[type], seed)(name)];

  const bits = [];
  if (facts.capacity) bits.push(`a ${mah(facts.capacity)} capacity`);
  if (facts.watts) bits.push(`up to ${facts.watts.replace(/\s/g, '').toUpperCase()} output`);
  if (facts.cpu) bits.push(`a ${facts.cpu.trim()} processor`);
  if (facts.ram) bits.push(`${facts.ram.trim()} memory`);
  if (facts.storage) bits.push(`${facts.storage.trim()} storage`);
  if (facts.screen) bits.push(`a ${facts.screen.trim()} display`);
  if (facts.resolution) bits.push(`${facts.resolution.toUpperCase()} resolution`);
  if (facts.length) bits.push(`${facts.length.trim()} length`);
  if (facts.wireless) bits.push(`${facts.wireless.trim()} connectivity`);
  if (facts.ports.length) bits.push(`${facts.ports.join(' / ')} connection`);
  if (bits.length) parts.push(`Key details: ${bits.slice(0, 5).join(', ')}.`);

  if (brand && brand !== 'Generic') parts.push(`Brand: ${brand}.`);
  parts.push(`Order online from Gizmorex, and contact us on WhatsApp if you need help choosing.`);

  const features = [];
  if (facts.capacity) features.push(`${mah(facts.capacity)} battery capacity`);
  if (facts.watts) features.push(`${facts.watts.toUpperCase()} power rating`);
  if (facts.fast) features.push('Supports fast charging');
  if (facts.magsafe) features.push('MagSafe compatible');
  if (facts.cpu) features.push(`${facts.cpu.trim()} processor`);
  if (facts.ram) features.push(`${facts.ram.trim()} memory`);
  if (facts.storage) features.push(`${facts.storage.trim()} storage`);
  if (facts.screen) features.push(`${facts.screen.trim()} screen`);
  if (facts.resolution) features.push(`${facts.resolution.toUpperCase()} video`);
  if (facts.length) features.push(`${facts.length.trim()} length`);
  if (facts.wireless) features.push(facts.wireless.trim());
  for (const port of facts.ports) features.push(`${port} port`);
  for (const [k, v] of Object.entries(specifications).slice(0, 3)) {
    if (!features.some((f) => f.toLowerCase().includes(String(v).toLowerCase()))) features.push(`${k}: ${v}`);
  }

  return { description: parts.join('\n\n'), features: [...new Set(features)].slice(0, 6) };
}

const categoryText = (c = '') => c;
const mah = (v) => v.replace(/\s/g, '').replace(/mah/i, 'mAh');
