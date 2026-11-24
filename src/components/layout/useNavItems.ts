'use client';

import { useEffect } from 'react';
import { useCategoryStore } from '@/store/categoryStore';

export interface NavItem {
  label: string;
  href: string;
}

/** Main menu: Home, every top-level category that has products, then Deals. */
export function useNavItems(): NavItem[] {
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return [
    { label: 'Home', href: '/' },
    ...categories.filter((c) => c.productCount > 0).map((c) => ({ label: c.name, href: `/categories/${c.slug}` })),
    { label: 'Deals', href: '/products?deals=true' },
  ];
}
