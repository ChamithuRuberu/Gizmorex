import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistStore {
  items: Product[];
  toggle: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  clear: () => void;
  count: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) =>
        set((state) => {
          const exists = state.items.find((i) => i._id === product._id);
          return {
            items: exists
              ? state.items.filter((i) => i._id !== product._id)
              : [...state.items, product],
          };
        }),
      isWishlisted: (productId) => get().items.some((i) => i._id === productId),
      clear: () => set({ items: [] }),
      count: () => get().items.length,
    }),
    { name: 'gizmorex-wishlist' }
  )
);

