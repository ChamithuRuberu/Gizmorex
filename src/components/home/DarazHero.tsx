'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CategoryIcon from '@/components/ui/CategoryIcon';
import type { Category } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Laptop,
  Headphones,
  Gamepad2,
  Home,
  Camera,
  Cable,
  Watch,
  Package,
  Copy,
  Check,
  ShieldCheck,
  Truck,
  PhoneCall,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';


interface DarazHeroProps {
  categories: Category[];
}

const SLIDES = [
  {
    id: 1,
    badge: '🔥 MEGA ELECTRONICS SALE',
    headline: 'Flagship Tech & Gadgets',
    subtext: 'Get up to 45% OFF on latest smartphones, laptops & gaming gear',
    cta: 'Shop Mega Deals',
    ctaHref: '/products?deals=true',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=900&q=80',
    bg: 'from-[#0B0C10] via-[#1F2833] to-[#0B0C10]',
    accent: '#FF6B00',
  },
  {
    id: 2,
    badge: '🎵 AUDIO FESTIVAL',
    headline: 'Feel Every Beat with ANC',
    subtext: 'Premium Sony, Apple & JBL wireless headphones at official prices',
    cta: 'Explore Audio',
    ctaHref: '/categories/audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80',
    bg: 'from-[#14121E] via-[#2D1B4E] to-[#14121E]',
    accent: '#A855F7',
  },
  {
    id: 3,
    badge: '⚡ GIZMOMALL GUARANTEED',
    headline: '100% Genuine with Warranty',
    subtext: 'Direct imports, islandwide delivery, and cash on delivery available',
    cta: 'Browse Catalog',
    ctaHref: '/products',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80',
    bg: 'from-[#0A192F] via-[#172A45] to-[#0A192F]',
    accent: '#0066CC',
  },
];

export default function DarazHero({ categories }: DarazHeroProps) {
  const [current, setCurrent] = useState(0);
  const [copiedVoucher, setCopiedVoucher] = useState(false);
  const categoryList = categories;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText('GIZMO1000');
    setCopiedVoucher(true);
    toast.success('Voucher GIZMO1000 copied! Rs. 1,000 OFF on checkout.', { icon: '🎁' });
    setTimeout(() => setCopiedVoucher(false), 3000);
  };

  const slide = SLIDES[current];

  return (
    <section className="py-3 bg-gray-50">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-auto lg:h-[390px] xl:h-[410px]">
          {/* 1. Left Vertical Categories Sidebar (Daraz Iconic Category Menu) */}
          <div className="hidden lg:flex lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-xs p-2 flex-col justify-between overflow-hidden">
            <div className="space-y-0.5">
              <div className="px-3 py-1.5 flex items-center justify-between border-b border-gray-100 mb-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Categories
                </span>
                <Link
                  href="/categories"
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
                >
                  All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {categoryList.slice(0, 8).map((cat) => {
                return (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:text-primary hover:bg-orange-50/70 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CategoryIcon name={cat.icon} className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                );
              })}
            </div>

            <div className="p-2.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase block">Hot Deals</span>
                <span className="text-xs font-bold text-dark-300">Under Rs. 5,000</span>
              </div>
              <Link
                href="/products?deals=true"
                className="btn-primary text-[10px] py-1 px-2.5"
              >
                View
              </Link>
            </div>
          </div>

          {/* 2. Center Slider (Daraz Prominent Carousel) */}
          <div className="lg:col-span-6 xl:col-span-6 relative rounded-2xl overflow-hidden shadow-xs border border-gray-100 min-h-[280px] sm:min-h-[340px] lg:min-h-0">
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slide.bg} transition-all duration-700`}
            >
              {/* Background cover image */}
              <div className="absolute inset-0 opacity-25 mix-blend-overlay">
                <Image
                  src={slide.image}
                  alt={slide.headline}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Slider Content */}
              <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 z-10 max-w-[75%] sm:max-w-[70%]">
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full w-fit backdrop-blur-md mb-3">
                  <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                  {slide.badge}
                </span>

                <h2 className="text-white text-xl sm:text-3xl font-black leading-tight tracking-tight mb-2">
                  {slide.headline}
                </h2>

                <p className="text-white/80 text-xs sm:text-sm line-clamp-2 mb-5 leading-relaxed">
                  {slide.subtext}
                </p>

                <Link
                  href={slide.ctaHref}
                  className="btn-primary text-xs sm:text-sm py-2.5 px-5 w-fit shadow-lg shadow-orange-600/30 font-bold"
                >
                  {slide.cta} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {/* Slider Floating Product Preview */}
              <div className="absolute right-0 bottom-0 top-0 w-2/5 opacity-80 hidden sm:block pointer-events-none">
                <Image
                  src={slide.image}
                  alt={slide.headline}
                  fill
                  className="object-cover object-left"
                  sizes="30vw"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to right, rgba(11,12,16,1) 0%, rgba(11,12,16,0.1) 100%)',
                  }}
                />
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-6 sm:left-10 flex items-center gap-1.5 z-20">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === current ? 'w-5 h-1.5 bg-[#FF6B00]' : 'w-1.5 h-1.5 bg-white/50'
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 3. Right Utility Card (Daraz Iconic Welcome & Voucher Panel) */}
          <div className="hidden lg:flex lg:col-span-3 xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex-col justify-between">
            {/* User Greeting & Voucher */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#FF6B00] font-black text-sm">
                  GZ
                </div>
                <div>
                  <h3 className="text-xs font-bold text-dark-300">Welcome to Gizmorex!</h3>
                  <p className="text-[11px] text-gray-400">Sri Lanka's Tech Universe</p>
                </div>
              </div>

              {/* New User Welcome Voucher */}
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-3 text-white shadow-sm mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block">
                  New Customer Promo
                </span>
                <div className="text-sm font-black mt-0.5">Rs. 1,000 OFF</div>
                <p className="text-[10px] text-orange-100 mt-0.5">On your 1st order over Rs. 10k</p>
                <button
                  onClick={handleCopyVoucher}
                  className="mt-2 w-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-white/20"
                >
                  {copiedVoucher ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3" />}
                  {copiedVoucher ? 'Code Copied!' : 'Code: GIZMO1000'}
                </button>
              </div>

              {/* Daraz Quick Guarantees */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <Truck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-[11px]">Free delivery islandwide</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  <span className="text-[11px]">100% Genuine with Warranty</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="text-[11px]">WhatsApp Hotline: +94 71 234 5678</span>
                </div>
              </div>
            </div>

            {/* Quick Auth Link */}
            <div className="pt-3 border-t border-gray-100">
              <Link
                href="/login"
                className="btn-outline w-full text-center text-xs py-2 justify-center font-bold"
              >
                Sign In / Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
