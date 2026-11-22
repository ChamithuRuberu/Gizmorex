'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Smartphone, Laptop, Headphones, Gamepad2, Home, Camera, Cable, Watch, Package, ChevronRight } from 'lucide-react';
import { Category } from '@/types';
import { useCategoryStore } from '@/store/categoryStore';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Smartphone, Laptop, Headphones, Gamepad2, Home, Camera, Cable, Watch, Package,
};

interface CategoryGridProps {
  categories?: Category[];
}

export default function CategoryGrid({ categories: propCategories }: CategoryGridProps) {
  const { categories: storeCategories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const displayCategories = (storeCategories && storeCategories.length > 0)
    ? storeCategories
    : (propCategories && propCategories.length > 0)
    ? propCategories
    : [];

  return (
    <section className="py-4 bg-gray-50">
      <div className="container-custom">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-dark-300">
                Categories
              </h2>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1 text-primary text-xs font-bold hover:underline"
            >
              All Categories <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Daraz 2-row / 8-column Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {displayCategories.map((cat: any) => {
              const Icon = ICON_MAP[cat.icon] || Package;
              return (
                <Link
                  key={cat._id || cat.id || cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="group flex flex-col items-center p-3 bg-white hover:bg-orange-50/30 rounded-xl border border-gray-100 hover:border-primary/40 hover:shadow-xs transition-all duration-200 text-center"
                >
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden mb-2 shadow-xs group-hover:scale-105 transition-transform duration-300 bg-gray-50 flex items-center justify-center">
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
                        style={{ backgroundColor: cat.bg || '#FFF3E8' }}
                      >
                        <Icon className="w-8 h-8" style={{ color: cat.color || '#FF6B00' }} />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {cat.name}
                  </span>
                  {typeof cat.productCount === 'number' && cat.productCount > 0 && (
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {cat.productCount} Items
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
