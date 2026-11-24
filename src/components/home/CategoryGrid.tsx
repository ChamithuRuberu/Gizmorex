'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { Category } from '@/types';


interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  // Shop by the specific sub-categories (what people actually look for), busiest first.
  const displayCategories = categories
    .flatMap((c) => {
      const subs = (c.children ?? []).filter((s) => s.productCount > 0);
      return subs.length ? subs : [c];
    })
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 16);

  return (
    <section className="py-4 bg-gray-50">
      <div className="container-custom">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-dark-300">
                Shop by category
              </h2>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1 text-primary text-xs font-bold hover:underline"
            >
              All Categories <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Category grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {displayCategories.map((cat) => {
              return (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="group flex flex-col items-center p-3 bg-white hover:bg-orange-50/30 rounded-xl border border-gray-100 hover:border-primary/40 hover:shadow-xs transition-all duration-200 text-center"
                >
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden mb-2 shadow-xs group-hover:scale-105 transition-transform duration-300 bg-gray-50 flex items-center justify-center">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: '#FFF3E8' }}
                      >
                        <CategoryIcon name={cat.icon} label={cat.name} className="w-7 h-7 text-primary" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {cat.name}
                  </span>
                  {typeof cat.productCount === 'number' && cat.productCount > 0 && (
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
