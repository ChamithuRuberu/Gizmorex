'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import CategoryIcon from '@/components/ui/CategoryIcon';
import type { HomeRow } from '@/lib/catalog';

/** One swipeable product row per main category, with its sub-categories as quick links. */
export default function CategoryRows({ rows }: { rows: HomeRow[] }) {
  if (rows.length === 0) return null;
  return (
    <>
      {rows.map((row) => (
        <Row key={row.category.slug} row={row} />
      ))}
    </>
  );
}

function Row({ row }: { row: HomeRow }) {
  const track = useRef<HTMLDivElement>(null);
  const { category, products } = row;
  const subs = (category.children ?? []).filter((c) => c.productCount > 0).slice(0, 6);
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.9, behavior: 'smooth' });

  return (
    <section className="bg-gray-50">
      <div className="container-custom">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <Link href={`/categories/${category.slug}`} className="flex items-center gap-2.5 min-w-0 group">
              <span className="w-9 h-9 rounded-xl bg-orange-50 text-primary flex items-center justify-center flex-shrink-0">
                <CategoryIcon name={category.icon} label={category.name} className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-dark-300 truncate group-hover:text-primary">{category.name}</h2>
            </Link>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${category.name} left`} className="hidden sm:flex w-8 h-8 rounded-full border border-gray-200 items-center justify-center text-gray-500 hover:border-primary hover:text-primary">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${category.name} right`} className="hidden sm:flex w-8 h-8 rounded-full border border-gray-200 items-center justify-center text-gray-500 hover:border-primary hover:text-primary">
                <ChevronRight className="w-4 h-4" />
              </button>
              <Link href={`/categories/${category.slug}`} className="text-xs font-bold text-primary border border-primary/40 hover:border-primary px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {subs.length > 0 && (
            <nav aria-label={`${category.name} sub-categories`} className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-1">
              {subs.map((s) => (
                <Link key={s.slug} href={`/categories/${s.slug}`} className="whitespace-nowrap text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-orange-50 hover:text-primary border border-gray-100 px-3 py-1.5 rounded-full">
                  {s.name}
                </Link>
              ))}
            </nav>
          )}

          <div ref={track} className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-1 px-1 pb-1">
            {products.map((p) => (
              <div key={p._id} className="snap-start flex-shrink-0 w-[46%] sm:w-[31%] md:w-[23.5%] lg:w-[18.8%] xl:w-[15.8%]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
