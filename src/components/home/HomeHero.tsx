'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { BRAND } from '@/lib/constants';
import type { Category } from '@/types';
import type { HomeBanner } from '@/lib/catalog';

const SLIDE_MS = 5000;

/** Category menu (from the database) + banner slider (from Admin → Banners). */
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
      <div className="container-custom grid grid-cols-1 lg:grid-cols-12 gap-3">
        <nav aria-label="Categories" className="hidden lg:flex lg:col-span-3 flex-col relative bg-white rounded-2xl border border-gray-100 p-2">
          <div className="px-3 py-1.5 flex items-center justify-between border-b border-gray-100 mb-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Categories</span>
            <Link href="/categories" className="text-[11px] font-bold text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="flex-1">
            {categories.slice(0, 10).map((cat) => {
              const subs = cat.children ?? [];
              return (
                <li key={cat.slug} className="group/cat">
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 group-hover/cat:text-primary group-hover/cat:bg-orange-50"
                  >
                    <CategoryIcon name={cat.icon} label={cat.name} className="w-4 h-4 text-gray-400 group-hover/cat:text-primary" />
                    <span className="flex-1 truncate">{cat.name}</span>
                    {subs.length > 0 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                  </Link>
                  {subs.length > 0 && (
                    <p className="pl-[38px] pr-3 -mt-1 pb-2 text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {subs.slice(0, 4).map((s, i) => (
                        <span key={s.slug}>
                          {i > 0 && ' · '}
                          <Link href={`/categories/${s.slug}`} className="hover:text-primary">
                            {s.name}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                  {subs.length > 0 && (
                    <div className="invisible opacity-0 group-hover/cat:visible group-hover/cat:opacity-100 transition-opacity absolute left-full top-0 z-30 ml-2 h-full w-[min(640px,62vw)] bg-white rounded-2xl border border-gray-100 shadow-xl p-5 overflow-y-auto">
                      <Link href={`/categories/${cat.slug}`} className="flex items-baseline justify-between mb-3">
                        <span className="font-black text-dark-300">{cat.name}</span>
                        <span className="text-xs font-bold text-primary hover:underline">View all</span>
                      </Link>
                      <div className="grid grid-cols-3 gap-1">
                        {subs.map((s) => (
                          <Link
                            key={s.slug}
                            href={`/categories/${s.slug}`}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-orange-50 group/sub"
                          >
                            <span className="w-9 h-9 rounded-lg bg-orange-50 group-hover/sub:bg-white flex items-center justify-center flex-shrink-0">
                              <CategoryIcon name={s.icon} label={s.name} className="w-4 h-4 text-primary" />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-semibold text-gray-800 group-hover/sub:text-primary truncate">{s.name}</span>
                              <span className="block text-[11px] text-gray-400">{s.productCount > 0 ? `${s.productCount} ${s.productCount === 1 ? 'item' : 'items'}` : 'Coming soon'}</span>
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
        </nav>

        <div className="lg:col-span-9 relative rounded-2xl overflow-hidden aspect-[3/1] bg-dark-500">
          {slide ? (
            <>
              <Link href={slide.link || '/products'} aria-label={slide.title} className="absolute inset-0 block">
                <Image src={slide.image} alt={slide.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 900px" />
              </Link>
              {count > 1 && (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label="Previous banner" className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white shadow flex items-center justify-center">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label="Next banner" className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white shadow flex items-center justify-center">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {banners.map((b, i) => (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => setCurrent(i)}
                        aria-label={`Show banner ${i + 1}`}
                        className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
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
                <a href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-primary bg-green-600 hover:bg-green-700">
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
