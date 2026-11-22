'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { useCategoryStore } from '@/store/categoryStore';

export default function Navbar() {
  const pathname = usePathname();
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Clean, beautifully structured nav items (updates category name if edited in admin)
  const navItems = NAV_ITEMS.map((item) => {
    if (item.href.startsWith('/categories/')) {
      const slug = item.href.replace('/categories/', '').toLowerCase();
      const matched = categories.find((c) => c.slug.toLowerCase() === slug);
      if (matched) {
        return { ...item, label: matched.name };
      }
    }
    return item;
  });

  return (
    <nav className="bg-white border-b border-gray-100 hidden md:block">
      <div className="container-custom">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  isActive
                    ? 'text-primary border-primary font-semibold'
                    : 'text-gray-600 border-transparent hover:text-primary hover:border-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
