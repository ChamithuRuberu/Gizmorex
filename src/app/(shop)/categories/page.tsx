'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Smartphone, Laptop, Headphones, Gamepad2, Home, Camera, Cable, Watch, ArrowRight, Package } from 'lucide-react';
import { getInitialFallbackCategories } from '@/lib/category-store';
import { getInitialFallbackProducts } from '@/lib/product-store';
import Breadcrumb from '@/components/ui/Breadcrumb';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Smartphone, Laptop, Headphones, Gamepad2, Home, Camera, Cable, Watch, Package,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState(() => getInitialFallbackCategories());
  const [products, setProducts] = useState(() => getInitialFallbackProducts());

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?limit=100'),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (catData.success && Array.isArray(catData.data) && catData.data.length > 0) {
          setCategories(catData.data);
        }
        if (prodData.success && Array.isArray(prodData.data)) {
          setProducts(prodData.data);
        }
      } catch (err) {
        console.warn('API fetch notice, using active fallback store:', err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="container-custom py-6">
      <Breadcrumb items={[{ label: 'Categories' }]} />
      <div className="mb-8">
        <h1 className="text-3xl font-black text-dark-300">All Categories</h1>
        <p className="text-gray-500 text-sm mt-1">Explore our wide selection of tech gear and electronics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Package;
          const targetSlug = cat.slug.toLowerCase().trim();
          const targetName = cat.name.toLowerCase().trim();

          const count = products.filter((p) => {
            const pCat = (p.category || '').toLowerCase().trim();
            return (
              pCat === targetSlug ||
              pCat === targetName ||
              pCat.replace(/-/g, ' ') === targetName ||
              pCat.replace(/\s+/g, '-') === targetSlug
            );
          }).length;

          return (
            <Link
              key={cat._id || cat.slug}
              href={`/categories/${cat.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
            >
              <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center bg-orange-50"
                  >
                    <Icon className="w-12 h-12 text-[#FF6B00]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 text-white">
                  <span className="text-[11px] font-medium bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
                    {count} Products
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-dark-300 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Explore deals & specs</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-50 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
