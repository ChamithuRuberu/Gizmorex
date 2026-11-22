import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { Product as ProductType, Category as CategoryType } from '@/types';
import { getInitialFallbackProducts } from '@/lib/product-store';
import { getInitialFallbackCategories } from '@/lib/category-store';

function serializeProduct(doc: any): ProductType {
  const p = doc.toObject ? doc.toObject() : doc;
  const original = Number(p.originalPrice || p.price || 0);
  const current = Number(p.price || 0);
  const discount = p.discount || (original > current && original > 0 ? Math.round(((original - current) / original) * 100) : 0);

  return {
    _id: p._id?.toString() || Math.random().toString(),
    name: p.name || 'Unnamed Product',
    slug: p.slug || 'product',
    description: p.description || '',
    price: current,
    originalPrice: original,
    discount: discount,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'],
    category: p.category || 'General',
    brand: p.brand || 'Gizmorex',
    stock: typeof p.stock === 'number' ? p.stock : 10,
    sold: typeof p.sold === 'number' ? p.sold : 0,
    rating: typeof p.rating === 'number' ? p.rating : 5,
    numReviews: typeof p.numReviews === 'number' ? p.numReviews : 0,
    features: Array.isArray(p.features) ? p.features : [],
    specifications: p.specifications instanceof Map ? Object.fromEntries(p.specifications) : (p.specifications || {}),
    tags: Array.isArray(p.tags) ? p.tags : [],
    isActive: p.isActive !== false,
    isFeatured: Boolean(p.isFeatured),
    isFlashDeal: Boolean(p.isFlashDeal),
    isNew: Boolean(p.isNewArrival ?? p.isNew),
    flashDealEndsAt: p.flashDealEndsAt ? new Date(p.flashDealEndsAt).toISOString() : undefined,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export async function getLiveLandingData() {
  try {
    await connectDB();

    const [dbFlashDeals, dbFeatured, dbNewArrivals, dbCategories, dbTotalCount] = await Promise.all([
      Product.find({ isActive: true, isFlashDeal: true }).sort({ discount: -1 }).limit(10).lean(),
      Product.find({ isActive: true, isFeatured: true }).sort({ rating: -1, sold: -1 }).limit(8).lean(),
      Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(8).lean(),
      Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
      Product.countDocuments({ isActive: true }),
    ]);

    // If database has products, use real database records!
    if (dbTotalCount > 0) {
      const flashDeals = dbFlashDeals.length > 0 
        ? dbFlashDeals.map(serializeProduct)
        : (dbFeatured.length > 0 ? dbFeatured.slice(0, 5).map(p => ({ ...serializeProduct(p), isFlashDeal: true })) : []);

      const featured = dbFeatured.length > 0 ? dbFeatured.map(serializeProduct) : dbNewArrivals.map(serializeProduct);
      const newArrivals = dbNewArrivals.map(serializeProduct);

      // Map categories with live product count
      const categories: CategoryType[] = dbCategories.length > 0
        ? dbCategories.map((c: any) => ({
            _id: c._id?.toString() || c.slug,
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            image: c.image || '',
            icon: c.icon || 'Package',
            color: c.color || '#FF6B00',
            bg: c.bg || '#FFF3E8',
            productCount: c.productCount || 0,
            isActive: c.isActive !== false,
          }))
        : getInitialFallbackCategories().map(c => ({
            _id: c._id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            image: c.image || '',
            icon: c.icon,
            color: c.color,
            bg: '#FFF3E8',
            productCount: newArrivals.filter(p => p.category.toLowerCase() === c.slug.toLowerCase() || p.category.toLowerCase() === c.name.toLowerCase()).length,
            isActive: true,
          }));

      return {
        isLiveDb: true,
        flashDeals,
        featured,
        newArrivals,
        allProducts: getInitialFallbackProducts(),
        categories,
        totalProducts: Math.max(dbTotalCount, getInitialFallbackProducts().length),
      };
    }
  } catch (err: any) {
    console.warn('Live database query notice (using fallback):', err.message);
  }

  // Graceful fallback from active in-memory stores
  const fbProducts = getInitialFallbackProducts();
  const fbCategories = getInitialFallbackCategories();

  const categories: CategoryType[] = fbCategories.map(c => ({
    _id: c._id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image || '',
    icon: c.icon,
    color: c.color,
    bg: '#FFF3E8',
    productCount: fbProducts.filter(p => {
      const pCat = (p.category || '').toLowerCase().trim();
      return (
        pCat === c.slug.toLowerCase() ||
        pCat === c.name.toLowerCase() ||
        pCat.replace(/-/g, ' ') === c.name.toLowerCase() ||
        pCat.replace(/\s+/g, '-') === c.slug.toLowerCase()
      );
    }).length,
    isActive: c.isActive !== false,
  }));

  return {
    isLiveDb: false,
    flashDeals: fbProducts.filter(p => p.isFlashDeal),
    featured: fbProducts.filter(p => p.isFeatured),
    newArrivals: fbProducts.slice(0, 8),
    allProducts: fbProducts,
    categories,
    totalProducts: fbProducts.length,
  };
}
