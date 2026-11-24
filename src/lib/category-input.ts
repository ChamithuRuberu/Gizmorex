import CategoryModel from '@/models/Category';
import { slugify } from '@/lib/slugify';
import { InputError } from '@/lib/product-input';

const str = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * Validates an admin category form body. `parent` is a parent category slug or ''.
 * Only two levels are allowed: a parent can't itself have a parent.
 */
export async function parseCategoryInput(body: any, { selfId, partial = false }: { selfId?: string; partial?: boolean } = {}) {
  const out: Record<string, unknown> = {};
  const has = (k: string) => body?.[k] !== undefined;

  if (!partial || has('name')) {
    out.name = str(body.name, 80);
    if (!out.name) throw new InputError('Name is required');
  }
  if (!partial || has('slug') || has('name')) {
    out.slug = slugify(str(body.slug) || str(body.name));
    if (!out.slug) throw new InputError('Slug is required');
  }
  if (has('description')) out.description = str(body.description, 1000);
  if (has('icon')) out.icon = str(body.icon, 40) || 'Package';
  if (has('color')) out.color = /^#[0-9a-f]{6}$/i.test(str(body.color)) ? str(body.color) : '#FF6B00';
  if (has('image')) out.image = str(body.image, 500);
  if (has('sortOrder')) out.sortOrder = Math.floor(Number(body.sortOrder)) || 0;
  if (has('isActive')) out.isActive = Boolean(body.isActive);

  if (has('parent')) {
    const parentSlug = str(body.parent, 100).toLowerCase();
    if (!parentSlug) {
      out.parent = null;
    } else {
      const parent = await CategoryModel.findOne({ slug: parentSlug }).select('_id parent').lean();
      if (!parent) throw new InputError(`Parent category "${parentSlug}" does not exist`);
      if (parent.parent) throw new InputError('Pick a top-level category as parent (only two levels are allowed)');
      if (selfId && String(parent._id) === selfId) throw new InputError('A category cannot be its own parent');
      if (selfId && (await CategoryModel.exists({ parent: selfId }))) {
        throw new InputError('This category has sub-categories, so it must stay top-level');
      }
      out.parent = parent._id;
    }
  }
  return out;
}
