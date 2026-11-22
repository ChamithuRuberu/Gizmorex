import { Product } from '@/types';
import { getFallbackProduct, getInitialFallbackProducts } from '@/lib/product-store';

// MOCK_PRODUCTS proxy dynamically reflects the authentic catalog from products.json
// Supports full array methods (.map, .filter, .slice, .length, [index], etc.)
export const MOCK_PRODUCTS: Product[] = new Proxy([] as Product[], {
  get(target, prop, receiver) {
    const list = getInitialFallbackProducts();
    const value = Reflect.get(list, prop);
    if (typeof value === 'function') {
      return value.bind(list);
    }
    return value;
  },
});

export const FLASH_DEAL_PRODUCTS: Product[] = new Proxy([] as Product[], {
  get(target, prop, receiver) {
    const list = getInitialFallbackProducts().filter((p) => p.isFlashDeal);
    const value = Reflect.get(list, prop);
    if (typeof value === 'function') {
      return value.bind(list);
    }
    return value;
  },
});

export const FEATURED_PRODUCTS: Product[] = new Proxy([] as Product[], {
  get(target, prop, receiver) {
    const list = getInitialFallbackProducts().filter((p) => p.isFeatured);
    const value = Reflect.get(list, prop);
    if (typeof value === 'function') {
      return value.bind(list);
    }
    return value;
  },
});

export const NEW_ARRIVALS: Product[] = new Proxy([] as Product[], {
  get(target, prop, receiver) {
    const list = getInitialFallbackProducts().filter((p) => p.isNew);
    const value = Reflect.get(list, prop);
    if (typeof value === 'function') {
      return value.bind(list);
    }
    return value;
  },
});

export function getProductsByCategory(category: string): Product[] {
  if (!category) return [];
  const target = category.toLowerCase().trim();
  const targetClean = target.replace(/-/g, ' ');
  const allProducts = getInitialFallbackProducts();

  return allProducts.filter((p) => {
    const pCat = (p.category || '').toLowerCase().trim();
    const pCatClean = pCat.replace(/-/g, ' ');
    return (
      pCat === target ||
      pCatClean === targetClean ||
      pCat.replace(/\s+/g, '-') === target.replace(/\s+/g, '-')
    );
  });
}

export function getProductBySlug(slug: string): Product | undefined {
  if (!slug) return undefined;
  const target = slug.toLowerCase().trim();
  const fromStore = getFallbackProduct(slug) || getFallbackProduct(target);
  if (fromStore) return fromStore;
  return getInitialFallbackProducts().find(
    (p) => p.slug.toLowerCase() === target || p._id === slug
  );
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return getInitialFallbackProducts().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
  );
}
