'use client';
import { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface FeaturedProductsProps {
  products?: Product[];
}

export default function FeaturedProducts({ products = [] }: FeaturedProductsProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Derive unique categories from the products list
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filtered = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section className="py-8">
      <div className="container-custom">
        {/* Section Header with Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-orange-100 text-primary">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Top Rated Gear</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-dark-300 mt-1">Featured Products</h2>
          </div>

          {/* Category Tabs */}
          {categories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 max-w-full">
              {categories.slice(0, 5).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap capitalize ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.slice(0, 8).map(p => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <Link
            href="/products?featured=true"
            className="inline-flex items-center gap-2 btn-outline text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl hover:gap-3 transition-all"
          >
            Explore All Featured Gadgets <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
