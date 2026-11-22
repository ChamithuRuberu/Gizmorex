import { CATEGORIES as DEFAULT_CATEGORIES } from '@/lib/constants';

export interface InMemoryCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  image: string;
  productCount: number;
  isActive: boolean;
  sortOrder: number;
}

// Global cache that persists across hot reloads in dev mode
declare global {
  // eslint-disable-next-line no-var
  var __inMemoryCategories: InMemoryCategory[] | undefined;
}

export function getInitialFallbackCategories(): InMemoryCategory[] {
  if (!global.__inMemoryCategories) {
    global.__inMemoryCategories = DEFAULT_CATEGORIES.map((c, index) => ({
      _id: `cat_${c.slug}`,
      name: c.name,
      slug: c.slug,
      description: `Browse latest ${c.name} and accessories`,
      icon: c.icon || 'Package',
      color: c.color || '#FF6B00',
      image: (c as any).image || '',
      productCount: 0,
      isActive: true,
      sortOrder: index,
    }));
  }
  return global.__inMemoryCategories;
}

export function updateFallbackCategory(idOrSlug: string, updates: Partial<InMemoryCategory>): InMemoryCategory {
  const categories = getInitialFallbackCategories();
  const cleanId = idOrSlug.toLowerCase().replace(/^cat_/, '');

  let index = categories.findIndex(
    (c) =>
      c._id === idOrSlug ||
      c.slug.toLowerCase() === cleanId ||
      c.name.toLowerCase() === cleanId
  );

  if (index === -1) {
    // If not found, create new entry
    const newCategory: InMemoryCategory = {
      _id: `cat_${(updates.slug || cleanId).toLowerCase()}`,
      name: updates.name || cleanId,
      slug: (updates.slug || cleanId).toLowerCase(),
      description: updates.description || '',
      icon: updates.icon || 'Package',
      color: updates.color || '#FF6B00',
      image: updates.image || '',
      productCount: updates.productCount || 0,
      isActive: updates.isActive !== false,
      sortOrder: updates.sortOrder || categories.length,
    };
    categories.push(newCategory);
    return newCategory;
  }

  const existing = categories[index];
  const updated: InMemoryCategory = {
    ...existing,
    ...updates,
    slug: updates.slug ? updates.slug.toLowerCase().trim() : existing.slug,
    name: updates.name ? updates.name.trim() : existing.name,
    image: updates.image !== undefined ? updates.image : existing.image,
  };

  categories[index] = updated;
  return updated;
}

export function deleteFallbackCategory(idOrSlug: string): boolean {
  const categories = getInitialFallbackCategories();
  const cleanId = idOrSlug.toLowerCase().replace(/^cat_/, '');

  const index = categories.findIndex(
    (c) =>
      c._id === idOrSlug ||
      c.slug.toLowerCase() === cleanId ||
      c.name.toLowerCase() === cleanId
  );

  if (index !== -1) {
    categories.splice(index, 1);
    return true;
  }
  return false;
}
