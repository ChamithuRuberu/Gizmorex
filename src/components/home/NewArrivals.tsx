'use client';
import { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import { ArrowRight, Clock } from 'lucide-react';

interface NewArrivalsProps {
  products?: Product[];
}

export default function NewArrivals({ products = [] }: NewArrivalsProps) {
  const [activeTab, setActiveTab] = useState('All');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filtered = activeTab === 'All'
    ? products
    : products.filter(p => p.category?.toLowerCase() === activeTab.toLowerCase());

  return (
    <section className="py-8 bg-gray-50/70 border-t border-gray-100">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-100 text-blue-600">
                <Clock className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Just Dropped</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-dark-300 mt-1">New Arrivals 🆕</h2>
          </div>

          {categories.length > 2 && (
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-xs">
              {categories.slice(0, 5).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-gray-500 hover:text-dark-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.slice(0, 8).map(p => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 btn-secondary text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl hover:gap-3 transition-all"
          >
            Browse All New In Stock <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
