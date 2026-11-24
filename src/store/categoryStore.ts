import { create } from 'zustand';
import type { Category } from '@/types';

/**
 * Client cache of the category tree for menus and filters (from /api/categories).
 * Top-level categories carry their sub-categories in `children`.
 */
interface CategoryStore {
  categories: Category[];
  loading: boolean;
  lastFetched: number;
  fetchCategories: (force?: boolean) => Promise<void>;
}

const STALE_MS = 60_000;

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  loading: false,
  lastFetched: 0,
  fetchCategories: async (force = false) => {
    if (!force && (get().loading || Date.now() - get().lastFetched < STALE_MS)) return;
    set({ loading: true });
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) set({ categories: data.data, lastFetched: Date.now() });
    } catch (err) {
      console.warn('Could not load categories', err);
    } finally {
      set({ loading: false });
    }
  },
}));

/** Tell every open tab that categories changed (called by the admin after a save). */
export function broadcastCategoryUpdate() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('gizmorex_categories_updated', Date.now().toString());
  } catch {
    // storage can be unavailable (private mode); the current tab still refreshes below
  }
  useCategoryStore.getState().fetchCategories(true);
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'gizmorex_categories_updated') useCategoryStore.getState().fetchCategories(true);
  });
}
