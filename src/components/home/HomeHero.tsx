'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown, Zap, Tag, LayoutGrid, MessageCircle, ArrowRight } from 'lucide-react';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { BRAND } from '@/lib/constants';
import type { Category } from '@/types';
import type { HomeBanner } from '@/lib/catalog';

const SLIDE_MS = 5000;

/**
 * Senior Designer Hero Section:
 * - Left: Curated Department Hub with smooth flyout mega-menus, quick deals, and WhatsApp anchor (eliminating empty space).
 * - Right: High-impact flagship banner carousel with glassmorphic controls and refined indicators.
 */
export default function HomeHero({ categories, banners }: { categories: Category[]; banners: HomeBanner[] }) {
  const [current, setCurrent] = useState(0);
  const count = banners.length;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setCurrent((i) => (i + 1) % count), SLIDE_MS);
    return () => clearInterval(t);
  }, [count]);

  const go = (step: number) => setCurrent((i) => (i + step + count) % count);
  const slide = banners[current];

  return (
    <section className="pt-3 bg-gray-50">
      <div className="container-custom grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left: Department & Shopping Hub */}
        <nav
          aria-label="Categories"
          className="hidden lg:flex lg:col-span-3 flex-col bg-white rounded-2xl border border-gray-100 shadow-card p-3 justify-between relative"
        >
          {/* Header */}
          <div>
            <div className="px-2 py-1 flex items-center justify-between border-b border-gray-100 pb-2.5 mb-2">
              <span className="text-xs font-black text-dark-300 uppercase tracking-wider flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                Categories
              </span>
              <Link href="/categories" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Top-Level Categories */}
            <ul className="space-y-1">
              {categories.slice(0, 5).map((cat) => {
                const subs = cat.children ?? [];
                return (
                  <li key={cat.slug} className="group/cat relative">
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-primary hover:bg-orange-50/70 transition-all"
                    >
                      <span className="w-7 h-7 rounded-lg bg-orange-50/80 text-primary group-hover/cat:bg-primary group-hover/cat:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                        <CategoryIcon name={cat.icon} label={cat.name} className="w-3.5 h-3.5" />
                      </span>
                      <span className="flex-1 truncate text-xs sm:text-[13px]">{cat.name}</span>
                      {subs.length > 0 && (
                        <span className="text-[11px] text-gray-400 group-hover/cat:text-primary transition-colors flex items-center gap-0.5">
                          {subs.length}
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover/cat:text-primary group-hover/cat:translate-x-0.5 transition-all" />
                        </span>
                      )}
                    </Link>

                    {/* Flyout Mega Panel on Hover */}
                    {subs.length > 0 && (
                      <div className="invisible opacity-0 group-hover/cat:visible group-hover/cat:opacity-100 transition-all duration-200 absolute left-full top-0 z-40 ml-3 w-[min(580px,58vw)] bg-white rounded-2xl border border-gray-100 shadow-2xl p-4">
                        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-3">
                          <Link href={`/categories/${cat.slug}`} className="font-extrabold text-sm text-dark-300 hover:text-primary transition-colors flex items-center gap-1.5">
                            {cat.name}
                            <ArrowRight className="w-3.5 h-3.5 text-primary" />
                          </Link>
                          <span className="text-xs text-gray-400 font-medium">{subs.length} sub-categories</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                          {subs.map((s) => (
                            <Link
                              key={s.slug}
                              href={`/categories/${s.slug}`}
                              className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-orange-50/70 group/sub transition-colors"
                            >
                              <span className="w-7 h-7 rounded-lg bg-gray-50 group-hover/sub:bg-white text-gray-500 group-hover/sub:text-primary flex items-center justify-center flex-shrink-0 transition-colors">
                                <CategoryIcon name={s.icon} label={s.name} className="w-3.5 h-3.5" />
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-xs font-semibold text-gray-800 group-hover/sub:text-primary truncate">{s.name}</span>
                                {s.productCount > 0 && (
                                  <span className="block text-[10px] text-gray-400">{s.productCount} item{s.productCount === 1 ? '' : 's'}</span>
                                )}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Quick Shopping Shortcuts (Fills space with high-conversion links) */}
            <div className="pt-2.5 mt-2 border-t border-gray-100 space-y-1">
              <span className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Quick Access
              </span>
              <Link
                href="/products?deals=true"
                className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-red-50/80 hover:bg-red-100/80 text-red-700 transition-colors group"
              >
                <span className="flex items-center gap-2 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                  Flash Deals
                </span>
                <span className="text-[10px] font-extrabold bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                  HOT
                </span>
              </Link>
              <Link
                href="/products"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-primary hover:bg-orange-50/60 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  Top Tech Brands
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              </Link>
            </div>
          </div>

          {/* Bottom WhatsApp Help Anchor */}
          <div className="pt-2.5 mt-2 border-t border-gray-100">
            <a
              href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50/70 border border-emerald-100/80 hover:border-emerald-300 text-emerald-900 transition-all group"
            >
              <span className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <MessageCircle className="w-3.5 h-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold text-emerald-900 leading-tight">Need help choosing?</span>
                <span className="block text-[10px] text-emerald-600 leading-tight truncate">WhatsApp our experts</span>
              </div>
            </a>
          </div>
        </nav>

        {/* Right: High-Impact Flagship Hero Banner Carousel */}
        <div className="lg:col-span-9 relative rounded-2xl overflow-hidden shadow-card border border-gray-100 bg-dark-500 min-h-[220px] sm:min-h-[280px] lg:min-h-[350px] flex items-center justify-center group/hero">
          {slide ? (
            <>
              <Link href={slide.link || '/products'} aria-label={slide.title} className="absolute inset-0 block">
                {/* Ambient glowing backdrop: blends widescreen marketing banners seamlessly without harsh black bars */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <Image
                    src={slide.image}
                    alt=""
                    aria-hidden="true"
                    fill
                    className="object-cover blur-2xl opacity-45 scale-110"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-dark-500/25" />
                </div>

                {/* Crystal-clear foreground banner: 100% visible with zero text or price cropping */}
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority
                  className="object-contain transition-transform duration-700 ease-out group-hover/hero:scale-[1.01]"
                  sizes="(max-width: 1024px) 100vw, 920px"
                />
              </Link>

              {/* Navigation Arrows */}
              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); go(-1); }}
                    aria-label="Previous banner"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-dark-300 shadow-md backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover/hero:opacity-100 hover:scale-105 active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); go(1); }}
                    aria-label="Next banner"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-dark-300 shadow-md backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover/hero:opacity-100 hover:scale-105 active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Refined Pill Indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    {banners.map((b, i) => (
                      <button
                        key={b._id}
                        type="button"
                        onClick={(e) => { e.preventDefault(); setCurrent(i); }}
                        aria-label={`Show banner ${i + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white shadow-sm' : 'w-2 bg-white/50 hover:bg-white/80'
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6 sm:p-10 text-white">
              <h1 className="text-3xl sm:text-4xl font-black">{BRAND.name}</h1>
              <p className="text-white/80 max-w-md">{BRAND.description}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products" className="btn-primary">
                  Browse products
                </Link>
                <a
                  href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary bg-green-600 hover:bg-green-700"
                >
                  WhatsApp {BRAND.whatsapp}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
