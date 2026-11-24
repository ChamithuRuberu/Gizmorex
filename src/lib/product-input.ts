import CategoryModel from '@/models/Category';
import { slugify } from '@/lib/slugify';

/** Validates an admin product form body into a document ready for MongoDB. */

export class InputError extends Error {}

const str = (v: unknown, max = 5000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : NaN;
};
const list = (v: unknown): string[] =>
  (Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [])
    .map((x) => String(x).trim())
    .filter(Boolean);

export async function parseProductInput(body: any, { partial = false } = {}) {
  const out: Record<string, unknown> = {};
  const has = (k: string) => body?.[k] !== undefined;

  if (!partial || has('name')) {
    out.name = str(body.name, 200);
    if (!out.name) throw new InputError('Name is required');
  }
  if (!partial || has('slug') || has('name')) {
    out.slug = slugify(str(body.slug) || str(body.name));
    if (!out.slug) throw new InputError('Slug is required');
  }
  if (!partial || has('description')) out.description = str(body.description, 20000);
  if (!partial || has('brand')) {
    out.brand = str(body.brand, 80);
    if (!out.brand) throw new InputError('Brand is required');
  }
  if (!partial || has('price')) {
    out.price = num(body.price);
    if (!((out.price as number) >= 0)) throw new InputError('Price must be a number');
  }
  if (!partial || has('originalPrice') || has('price')) {
    const original = num(body.originalPrice);
    out.originalPrice = Number.isFinite(original) && original > 0 ? original : out.price ?? num(body.price);
  }
  if (!partial || has('stock')) out.stock = Math.max(0, Math.floor(num(body.stock) || 0));
  if (has('sold')) out.sold = Math.max(0, Math.floor(num(body.sold) || 0));

  if (!partial || has('category')) {
    const slug = str(body.category, 100).toLowerCase();
    if (!slug) throw new InputError('Choose a category');
    const exists = await CategoryModel.exists({ slug });
    if (!exists) throw new InputError(`Category "${slug}" does not exist. Create it in Categories first.`);
    out.category = slug;
  }

  if (has('images')) out.images = list(body.images).slice(0, 12);
  if (has('features')) out.features = list(body.features);
  if (has('tags')) out.tags = list(body.tags).map((t) => t.toLowerCase());
  if (has('specifications') && body.specifications && typeof body.specifications === 'object') {
    out.specifications = new Map(
      Object.entries(body.specifications)
        .map(([k, v]) => [str(k, 80), str(v, 300)] as [string, string])
        .filter(([k, v]) => k && v)
    );
  }
  for (const flag of ['isActive', 'isFeatured', 'isFlashDeal', 'isNewArrival'] as const) {
    if (has(flag)) out[flag] = Boolean(body[flag]);
  }
  if (has('flashDealEndsAt')) {
    const d = body.flashDealEndsAt ? new Date(body.flashDealEndsAt) : null;
    out.flashDealEndsAt = d && !isNaN(d.getTime()) ? d : undefined;
  }
  return out;
}
