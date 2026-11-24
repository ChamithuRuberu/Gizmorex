import { InputError } from '@/lib/product-input';

const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Only site paths ("/categories/audio") or https links are allowed as banner links. */
function safeLink(v: unknown): string {
  const link = str(v, 500) || '/products';
  if (link.startsWith('/') && !link.startsWith('//')) return link;
  if (/^https:\/\/[^\s]+$/i.test(link)) return link;
  throw new InputError('Link must start with / (a page on this site) or https://');
}

export function parseBannerInput(body: any, { partial = false } = {}) {
  const out: Record<string, unknown> = {};
  const has = (k: string) => body?.[k] !== undefined;

  if (!partial || has('title')) {
    out.title = str(body.title, 120);
    if (!out.title) throw new InputError('Title is required');
  }
  if (!partial || has('image')) {
    out.image = str(body.image, 500);
    if (!/^https:\/\//i.test(out.image as string)) throw new InputError('Upload a banner image');
  }
  if (!partial || has('subtitle')) out.subtitle = str(body.subtitle, 200);
  if (!partial || has('link')) out.link = safeLink(body.link);
  if (!partial || has('buttonText')) out.buttonText = str(body.buttonText, 40) || 'Shop now';
  if (has('position')) out.position = str(body.position, 20) || 'hero';
  if (has('isActive')) out.isActive = Boolean(body.isActive);
  if (has('sortOrder')) out.sortOrder = Math.floor(Number(body.sortOrder)) || 0;
  return out;
}
