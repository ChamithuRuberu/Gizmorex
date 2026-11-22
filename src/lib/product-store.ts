import { MOCK_PRODUCTS } from '@/lib/data';
import { Product } from '@/types';
import idoProducts from '@/data/products.json';

// Global in-memory product cache persisting across HMR
declare global {
  // eslint-disable-next-line no-var
  var __inMemoryProducts: Product[] | undefined;
}

export function getInitialFallbackProducts(): Product[] {
  if (!global.__inMemoryProducts || global.__inMemoryProducts.length < 50) {
    const rawList: Product[] = [
      ...MOCK_PRODUCTS,
      ...(idoProducts as unknown as Product[]),
    ];
    const seen = new Set<string>();
    const unique: Product[] = [];

    for (const p of rawList) {
      const key = (p.slug || p._id).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push({
          ...p,
          specifications: { ...(p.specifications || {}) },
          features: [...(p.features || [])],
          images: [...(p.images || [])],
          tags: [...(p.tags || [])],
        });
      }
    }
    global.__inMemoryProducts = unique;
  }
  return global.__inMemoryProducts;
}

export function getFallbackProduct(idOrSlug: string): Product | null {
  const products = getInitialFallbackProducts();
  const target = idOrSlug.toLowerCase().trim();

  const found = products.find(
    (p) => p._id === idOrSlug || p.slug.toLowerCase() === target
  );

  return found ? { ...found } : null;
}

export function updateFallbackProduct(
  idOrSlug: string,
  updates: Partial<Product> & Record<string, any>
): Product {
  const products = getInitialFallbackProducts();
  const target = idOrSlug.toLowerCase().trim();

  const parseNumber = (val: any, fallback: number): number => {
    if (typeof val === 'number') return isNaN(val) ? fallback : val;
    if (typeof val === 'string' && val.trim()) {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };

  const index = products.findIndex(
    (p) => p._id === idOrSlug || p.slug.toLowerCase() === target
  );

  if (index === -1) {
    const newProduct: Product = {
      _id: updates._id || idOrSlug,
      name: updates.name || 'New Product',
      slug: (updates.slug || idOrSlug).toLowerCase().trim(),
      description: updates.description || '',
      price: parseNumber(updates.price, 0),
      originalPrice: parseNumber(updates.originalPrice, parseNumber(updates.price, 0)),
      discount: updates.discount || 0,
      images: Array.isArray(updates.images) ? updates.images : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'],
      category: updates.category || 'General',
      brand: updates.brand || 'Gizmorex',
      stock: parseNumber(updates.stock, 10),
      sold: parseNumber(updates.sold, 0),
      rating: 5.0,
      numReviews: 0,
      features: Array.isArray(updates.features) ? updates.features : [],
      specifications: updates.specifications || {},
      tags: Array.isArray(updates.tags) ? updates.tags : [],
      isActive: updates.isActive !== false,
      isFeatured: Boolean(updates.isFeatured),
      isFlashDeal: Boolean(updates.isFlashDeal),
      isNew: Boolean(updates.isNew ?? updates.isNewArrival),
      flashDealEndsAt: updates.flashDealEndsAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    return newProduct;
  }

  const existing = products[index];
  const updated: Product = {
    ...existing,
    ...updates,
    price: updates.price !== undefined ? parseNumber(updates.price, existing.price) : existing.price,
    originalPrice: updates.originalPrice !== undefined ? parseNumber(updates.originalPrice, existing.originalPrice) : existing.originalPrice,
    stock: updates.stock !== undefined ? parseNumber(updates.stock, existing.stock) : existing.stock,
    sold: updates.sold !== undefined ? parseNumber(updates.sold, existing.sold) : existing.sold,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updated;
  return updated;
}

export function deleteFallbackProduct(idOrSlug: string): boolean {
  const products = getInitialFallbackProducts();
  const target = idOrSlug.toLowerCase().trim();

  const index = products.findIndex(
    (p) => p._id === idOrSlug || p.slug.toLowerCase() === target
  );

  if (index !== -1) {
    products.splice(index, 1);
    return true;
  }
  return false;
}
