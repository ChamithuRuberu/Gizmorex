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
    <section className="py-3 bg-gray-50">
      <div className="container-custom grid grid-cols-1 lg:grid-cols-12 gap-3">
        <nav aria-label="Categories" className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-2">
          <div className="px-3 py-1.5 flex items-center justify-between border-b border-gray-100 mb-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Categories</span>
            <Link href="/categories" className="text-[11px] font-bold text-primary hover:underline">
              All
            </Link>
          </div>
          <ul>
            {categories.slice(0, 10).map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:text-primary hover:bg-orange-50"
                >
                  <CategoryIcon name={cat.icon} className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{cat.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-9 relative rounded-2xl overflow-hidden min-h-[220px] sm:min-h-[340px] bg-dark-500">
          {slide ? (
            <>
              <Image src={slide.image} alt="" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 900px" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <div className="relative h-full flex flex-col justify-center gap-3 p-6 sm:p-10 max-w-lg text-white min-h-[220px] sm:min-h-[340px]">
                <h2 className="text-2xl sm:text-4xl font-black leading-tight">{slide.title}</h2>
                {slide.subtitle && <p className="text-sm sm:text-base text-white/85">{slide.subtitle}</p>}
                <Link href={slide.link} className="btn-primary w-fit">
                  {slide.buttonText}
                </Link>
              </div>
              {count > 1 && (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label="Previous banner" className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label="Next banner" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
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
            <div className="h-full flex flex-col justify-center gap-3 p-6 sm:p-10 text-white min-h-[220px] sm:min-h-[340px]">
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
