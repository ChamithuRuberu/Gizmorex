import { create } from 'zustand';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/lib/constants';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  image?: string;
  productCount?: number;
}

interface CategoryStore {
  categories: CategoryItem[];
  loading: boolean;
  lastFetched: number;
  fetchCategories: (force?: boolean) => Promise<void>;
  setCategories: (categories: CategoryItem[]) => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: DEFAULT_CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    color: c.color,
    image: (c as any).image,
    productCount: 0,
  })),
  loading: false,
  lastFetched: 0,
  fetchCategories: async (force = false) => {
    const now = Date.now();
    // Throttle calls to avoid rapid duplicate network requests
    if (!force && now - get().lastFetched < 60000 && get().categories.length > 0) {
      return;
    }
    try {
      set({ loading: true });
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const mapped: CategoryItem[] = data.data.map((c: any) => ({
          id: c._id || c.id || c.slug,
          name: c.name,
          slug: c.slug,
          icon: c.icon || 'Package',
          color: c.color || '#FF6B00',
          image: c.image || '',
          productCount: c.productCount || 0,
        }));
        set({ categories: mapped, loading: false, lastFetched: Date.now() });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.warn('Error fetching categories in store:', err);
      set({ loading: false });
    }
  },
  setCategories: (categories) => set({ categories, lastFetched: Date.now() }),
}));

// Helper to broadcast category updates across components & browser tabs
export const broadcastCategoryUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gizmorex_categories_updated'));
    try {
      localStorage.setItem('gizmorex_categories_updated', Date.now().toString());
    } catch {}
    // Also trigger instant fetch in current store
    useCategoryStore.getState().fetchCategories(true);
  }
};

// Global browser listeners for automatic synchronization
if (typeof window !== 'undefined') {
  // Listen for admin changes in same window
  window.addEventListener('gizmorex_categories_updated', () => {
    useCategoryStore.getState().fetchCategories(true);
  });
  // Listen for admin changes across different tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'gizmorex_categories_updated') {
      useCategoryStore.getState().fetchCategories(true);
    }
  });
  // Auto-refresh when tab gains focus
  window.addEventListener('focus', () => {
    const now = Date.now();
    if (now - useCategoryStore.getState().lastFetched > 4000) {
      useCategoryStore.getState().fetchCategories(true);
    }
  });
}
