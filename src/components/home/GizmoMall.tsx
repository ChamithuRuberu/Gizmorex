'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, RotateCcw, Truck, ChevronRight, Award } from 'lucide-react';

const MALL_BRANDS = [
  {
    name: 'Apple',
    tagline: 'iPhone, iPad & Mac',
    logo: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300&q=80',
    slug: 'apple',
    discount: 'Up to 20% OFF',
  },
  {
    name: 'Sony',
    tagline: 'Audio, Cameras & PS5',
    logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&q=80',
    slug: 'sony',
    discount: 'Up to 35% OFF',
  },
  {
    name: 'Samsung',
    tagline: 'Galaxy & Smart Living',
    logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&q=80',
    slug: 'samsung',
    discount: 'Up to 25% OFF',
  },
  {
    name: 'Asus ROG',
    tagline: 'Gaming Laptops & Rigs',
    logo: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=300&q=80',
    slug: 'asus',
    discount: 'Up to 30% OFF',
  },
  {
    name: 'JBL',
    tagline: 'Pro Sound & Bass',
    logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80',
    slug: 'jbl',
    discount: 'Up to 40% OFF',
  },
  {
    name: 'Anker',
    tagline: 'Fast Chargers & Hubs',
    logo: 'https://images.unsplash.com/photo-1609592424079-66bf1369f6bb?w=300&q=80',
    slug: 'anker',
    discount: 'Up to 30% OFF',
  },
];

export default function GizmoMall() {
  return (
    <section className="py-4 bg-gray-50">
      <div className="container-custom">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 sm:p-5">
          {/* DarazMall Top Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#002F6C] text-white text-xs font-black px-2.5 py-1 rounded tracking-wide">
                  GIZMOMALL
                </span>
                <h2 className="text-base sm:text-lg font-black text-dark-300">
                  Official Brand Stores
                </h2>
              </div>

              {/* Guarantees */}
              <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 font-semibold border-l border-gray-200 pl-4">
                <span className="flex items-center gap-1 text-emerald-600">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Authentic
                </span>
                <span className="flex items-center gap-1 text-blue-600">
                  <RotateCcw className="w-3.5 h-3.5" /> 14-Day Free Returns
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <Truck className="w-3.5 h-3.5" /> Islandwide Delivery
                </span>
              </div>
            </div>

            <Link
              href="/products?featured=true"
              className="text-xs font-bold text-[#002F6C] hover:text-blue-700 flex items-center gap-1"
            >
              Shop All Brands <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Brands Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MALL_BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/products?search=${encodeURIComponent(brand.name)}`}
                className="group bg-white rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-card transition-all duration-300 p-3 flex flex-col items-center text-center overflow-hidden"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden mb-2 bg-gray-50 flex items-center justify-center">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="64px"
                  />
                  <div className="absolute top-1 right-1">
                    <Award className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                  </div>
                </div>

                <h3 className="text-xs font-bold text-dark-300 group-hover:text-blue-700 transition-colors">
                  {brand.name}
                </h3>
                <p className="text-[10px] text-gray-400 line-clamp-1 mb-1">
                  {brand.tagline}
                </p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {brand.discount}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
