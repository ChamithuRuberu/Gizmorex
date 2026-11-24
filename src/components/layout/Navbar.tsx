'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LayoutGrid, Zap } from 'lucide-react';
import { useCategoryStore } from '@/store/categoryStore';
import CategoryIcon from '@/components/ui/CategoryIcon';

/** Desktop main menu: top-level categories with a hover panel of their sub-categories. */
export default function Navbar() {
  const pathname = usePathname();
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const tops = categories.filter((c) => c.productCount > 0);
  const linkCls = (active: boolean) =>
    `whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2 inline-flex items-center gap-1 ${
      active ? 'text-primary border-primary font-semibold' : 'text-gray-700 border-transparent hover:text-primary'
    }`;

  return (
    <nav className="bg-white border-b border-gray-100 hidden md:block" aria-label="Main">
      <div className="container-custom">
        <ul className="flex items-center gap-1">
          <li>
            <Link href="/" className={linkCls(pathname === '/')}>
              Home
            </Link>
          </li>
          {tops.map((cat) => {
            const subs = cat.children?.filter((c) => c.productCount > 0) ?? [];
            const active =
              pathname === `/categories/${cat.slug}` || subs.some((s) => pathname === `/categories/${s.slug}`);
            return (
              <li key={cat.slug} className="relative group">
                <Link href={`/categories/${cat.slug}`} className={linkCls(active)}>
                  {cat.name}
                  {subs.length > 0 && <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform" />}
                </Link>
                {subs.length > 0 && (
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-opacity absolute left-0 top-full z-50 pt-1">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 w-[min(560px,90vw)]">
                      <div className="grid grid-cols-2 gap-1">
                        {subs.map((s) => (
                          <Link
                            key={s.slug}
                            href={`/categories/${s.slug}`}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-orange-50 hover:text-primary"
                          >
                            <CategoryIcon name={s.icon} label={s.name} className="w-4 h-4 text-gray-400" />
                            <span className="flex-1 truncate">{s.name}</span>
                            <span className="text-xs text-gray-400">{s.productCount}</span>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href={`/categories/${cat.slug}`}
                        className="mt-2 block text-center text-xs font-bold text-primary border-t border-gray-100 pt-2.5 hover:underline"
                      >
                        View all {cat.productCount} in {cat.name}
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
          <li>
            <Link href="/products?deals=true" className={`${linkCls(false)} !text-primary`}>
              <Zap className="w-4 h-4" /> Deals
            </Link>
          </li>
          <li className="ml-auto">
            <Link href="/categories" className={linkCls(pathname === '/categories')}>
              <LayoutGrid className="w-4 h-4" /> All categories
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
