import { Product } from '@/types';
import fs from 'fs';
import path from 'path';
import idoProducts from '@/data/products.json';

const PRODUCTS_JSON_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');

// Global in-memory product cache persisting across HMR
declare global {
  // eslint-disable-next-line no-var
  var __inMemoryProducts: Product[] | undefined;
}

function loadProductsFromDisk(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_JSON_PATH)) {
      const content = fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading products.json from disk:', err);
  }
  return Array.isArray(idoProducts) ? (idoProducts as unknown as Product[]) : [];
}

export function saveProductsToDisk(products: Product[]): void {
  try {
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing products.json to disk:', err);
  }
}

export function getInitialFallbackProducts(): Product[] {
  if (!global.__inMemoryProducts) {
    global.__inMemoryProducts = loadProductsFromDisk();
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
      images: Array.isArray(updates.images) && updates.images.length > 0 ? updates.images : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'],
      category: updates.category || 'accessories',
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
    saveProductsToDisk(products);
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
  saveProductsToDisk(products);
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
    saveProductsToDisk(products);
    return true;
  }
  return false;
}
