import 'server-only';
import dbConnect from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import CategoryModel from '@/models/Category';
import BannerModel from '@/models/Banner';
import BrandModel from '@/models/Brand';
import type { Category, Product } from '@/types';

/**
 * The one place the storefront reads products and categories from.
 * MongoDB is the only source of truth: no JSON files, no in-memory copies.
 */

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600/png?text=Gizmorex';

// ---------- serializers ----------

export function toProduct(doc: any): Product {
  const price = Number(doc.price) || 0;
  const originalPrice = Number(doc.originalPrice) || price;
  const specs = doc.specifications instanceof Map ? Object.fromEntries(doc.specifications) : doc.specifications || {};
  return {
    _id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description || '',
    price,
    originalPrice,
    discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
    images: doc.images?.length ? doc.images : [PLACEHOLDER_IMAGE],
    category: doc.category,
    brand: doc.brand || '',
    stock: doc.stock ?? 0,
    sold: doc.sold ?? 0,
    rating: doc.rating ?? 0,
    numReviews: doc.numReviews ?? 0,
    features: doc.features || [],
    specifications: specs,
    tags: doc.tags || [],
    isActive: doc.isActive !== false,
    isFeatured: Boolean(doc.isFeatured),
    isFlashDeal: Boolean(doc.isFlashDeal),
    isNew: Boolean(doc.isNewArrival),
    flashDealEndsAt: doc.flashDealEndsAt ? new Date(doc.flashDealEndsAt).toISOString() : undefined,
    createdAt: new Date(doc.createdAt || Date.now()).toISOString(),
    updatedAt: new Date(doc.updatedAt || Date.now()).toISOString(),
  };
}

// ---------- categories ----------

export interface CategoryTree {
  /** Top-level categories, each with `children`. */
  tree: Category[];
  /** Every category by slug (parents and sub-categories). */
  bySlug: Map<string, Category>;
}

/**
 * Loads all categories with live product counts and builds the parent → children tree.
 * A parent's count is the sum of its own products and its sub-categories'.
 */
export async function getCategoryTree({ includeInactive = false } = {}): Promise<CategoryTree> {
  await dbConnect();
  const [docs, counts] = await Promise.all([
    CategoryModel.find(includeInactive ? {} : { isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
    ProductModel.aggregate<{ _id: string; count: number }>([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
  ]);

  const countBySlug = new Map(counts.map((c) => [c._id, c.count]));
  const slugById = new Map(docs.map((d: any) => [String(d._id), d.slug as string]));

  const bySlug = new Map<string, Category>();
  for (const d of docs as any[]) {
    bySlug.set(d.slug, {
      _id: String(d._id),
      name: d.name,
      slug: d.slug,
      description: d.description || '',
      image: d.image || '',
      icon: d.icon || 'Package',
      color: d.color || '#FF6B00',
      isActive: d.isActive !== false,
      sortOrder: d.sortOrder ?? 0,
      parentSlug: d.parent ? slugById.get(String(d.parent)) ?? null : null,
      productCount: countBySlug.get(d.slug) ?? 0,
      children: [],
    });
  }

  const tree: Category[] = [];
  for (const cat of bySlug.values()) {
    const parent = cat.parentSlug ? bySlug.get(cat.parentSlug) : undefined;
    if (parent) {
      parent.children!.push(cat);
      parent.productCount += cat.productCount;
    } else {
      tree.push(cat);
    }
  }
  return { tree, bySlug };
}

/** The category plus every sub-category slug under it, for filtering products. */
export function categoryScope(slug: string, bySlug: Map<string, Category>): string[] {
  const cat = bySlug.get(slug);
  if (!cat) return [];
  return [cat.slug, ...(cat.children ?? []).map((c) => c.slug)];
}

// ---------- products ----------

export type ProductSort = 'newest' | 'price-asc' | 'price-desc' | 'popular';

export interface ProductQuery {
  category?: string;
  search?: string;
  /** One brand, or several separated by commas. */
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  deals?: boolean;
  featured?: boolean;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

const SORTS: Record<ProductSort, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  popular: { sold: -1, rating: -1 },
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function listProducts(q: ProductQuery = {}) {
  await dbConnect();
  const base: Record<string, any> = { isActive: true };

  if (q.category) {
    const { bySlug } = await getCategoryTree();
    base.category = { $in: categoryScope(q.category.toLowerCase(), bySlug) };
  }
  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search.trim().slice(0, 80)), 'i');
    base.$or = [{ name: rx }, { brand: rx }, { tags: rx }];
  }
  if (q.deals) base.isFlashDeal = true;
  if (q.featured) base.isFeatured = true;
  if (q.minPrice || q.maxPrice) {
    base.price = {
      ...(q.minPrice ? { $gte: q.minPrice } : {}),
      ...(q.maxPrice ? { $lte: q.maxPrice } : {}),
    };
  }

  // Brand filter is applied on top, so the brand list can show every brand in the current view.
  const brandList = (q.brand || '').split(',').map((b) => b.trim()).filter(Boolean).slice(0, 20);
  const filter = brandList.length
    ? { ...base, brand: { $in: brandList.map((b) => new RegExp(`^${escapeRegex(b)}$`, 'i')) } }
    : base;

  const limit = Math.min(Math.max(q.limit ?? 24, 1), 100);
  const page = Math.max(q.page ?? 1, 1);

  const [docs, total, brandFacets] = await Promise.all([
    ProductModel.find(filter)
      .sort(SORTS[q.sort ?? 'newest'])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ProductModel.countDocuments(filter),
    ProductModel.aggregate<{ _id: string; count: number }>([
      { $match: { ...base, brand: { $nin: ['', null, 'Generic'] } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 40 },
    ]),
  ]);

  return {
    products: docs.map(toProduct),
    total,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
    brands: brandFacets.map((b) => ({ name: b._id, count: b.count })),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await dbConnect();
  const doc = await ProductModel.findOne({ slug: slug.toLowerCase(), isActive: true }).lean();
  return doc ? toProduct(doc) : null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  await dbConnect();
  const docs = await ProductModel.find({ isActive: true, category: product.category, _id: { $ne: product._id } })
    .sort({ sold: -1 })
    .limit(limit)
    .lean();
  return docs.map(toProduct);
}

// ---------- home page ----------

export interface HomeBanner {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  buttonText: string;
  position?: string;
}

export interface BrandCount {
  logo?: string;
  name: string;
  count: number;
}

export interface HomeRow {
  category: Category;
  products: Product[];
}

export async function getHomeData() {
  await dbConnect();
  const [flash, featured, latest, { tree }, banners, brands, topDiscount] = await Promise.all([
    ProductModel.find({ isActive: true, isFlashDeal: true }).sort({ updatedAt: -1 }).limit(12).lean(),
    ProductModel.find({ isActive: true, isFeatured: true }).sort({ sold: -1 }).limit(12).lean(),
    ProductModel.find({ isActive: true }).sort({ createdAt: -1 }).limit(48).lean(),
    getCategoryTree(),
    BannerModel.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean(),
    ProductModel.aggregate<{ _id: string; count: number }>([
      { $match: { isActive: true, brand: { $nin: ['', 'Generic'] } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 40 },
    ]),
    ProductModel.aggregate<{ pct: number }>([
      { $match: { isActive: true, stock: { $gt: 0 }, $expr: { $gt: ['$originalPrice', '$price'] } } },
      { $project: { pct: { $multiply: [{ $divide: [{ $subtract: ['$originalPrice', '$price'] }, '$originalPrice'] }, 100] } } },
      { $sort: { pct: -1 } },
      { $limit: 1 },
    ]),
  ]);

  // One product row per main category: sold best first, then newest.
  const rows: HomeRow[] = (
    await Promise.all(
      tree
        .filter((c) => c.productCount > 0)
        .slice(0, 6)
        .map(async (category) => {
          const scope = [category.slug, ...(category.children ?? []).map((c) => c.slug)];
          const docs = await ProductModel.find({ isActive: true, category: { $in: scope } })
            .sort({ sold: -1, isFeatured: -1, updatedAt: -1 })
            .limit(12)
            .lean();
          return { category, products: docs.map(toProduct) };
        })
    )
  ).filter((r) => r.products.length > 0);

  const allBanners = banners as any[];
  const heroBanners = allBanners.filter((b) => !b.position || b.position === 'hero').slice(0, 8);
  const promo1 = allBanners.find((b) => b.position === 'promo-1');
  const promo2 = allBanners.find((b) => b.position === 'promo-2');
  const genericPromos = allBanners.filter((b) => b.position === 'promo');
  const promoLeft = promo1 || genericPromos[0];
  const promoRight = promo2 || (genericPromos[0] && genericPromos[0] !== promoLeft ? genericPromos[0] : genericPromos[1]);

  const toHomeBanner = (b: any): HomeBanner => ({
    _id: String(b._id),
    title: b.title,
    subtitle: b.subtitle || '',
    image: b.image,
    link: b.link || '/products',
    buttonText: b.buttonText || 'Shop now',
    position: b.position || 'hero',
  });

  return {
    flashDeals: flash.map(toProduct),
    featured: featured.map(toProduct),
    latest: latest.map(toProduct),
    categories: tree, // every active category, even before it has products
    rows,
    maxDiscount: Math.floor(topDiscount[0]?.pct ?? 0),
    banners: heroBanners.map(toHomeBanner),
    promoBanners: {
      left: promoLeft ? toHomeBanner(promoLeft) : undefined,
      right: promoRight ? toHomeBanner(promoRight) : undefined,
    },
    brands: await withBrandSettings(brands),
  };
}

/** Merge saved logos/order from Admin → Brands; drop brands switched off there. Max 12. */
async function withBrandSettings(counts: { _id: string; count: number }[]): Promise<BrandCount[]> {
  const saved = await BrandModel.find().lean();
  const byKey = new Map(saved.map((b: any) => [b.key, b]));
  const byNorm = new Map(saved.map((b: any) => [String(b.key).toLowerCase().replace(/[^a-z0-9]/g, ''), b]));
  return counts
    .map((c) => {
      const key = String(c._id).toLowerCase();
      const normKey = key.replace(/[^a-z0-9]/g, '');
      const s = (byKey.get(key) || byNorm.get(normKey)) as any;
      return { c, s };
    })
    .filter(({ s }) => !s || s.isActive !== false)
    .sort((a, b) => (a.s?.sortOrder ?? 0) - (b.s?.sortOrder ?? 0) || Number(Boolean(b.s?.logo)) - Number(Boolean(a.s?.logo)) || b.c.count - a.c.count)
    .slice(0, 12)
    .map(({ c, s }) => ({ name: s?.name || c._id, count: c.count, logo: s?.logo || '' }));
}
