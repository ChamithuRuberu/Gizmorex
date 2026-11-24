import Link from 'next/link';
import Image from 'next/image';
import type { BrandCount } from '@/lib/catalog';

const BRAND_FALLBACK_LOGOS: Record<string, string> = {
  ugreen: '/brands/ugreen.svg',
  aspor: '/brands/aspor.png',
  kisonli: '/brands/kisonli.svg',
  'lb-link': '/brands/lb-link.png',
  lblink: '/brands/lb-link.png',
  lenovo: '/brands/lenovo.svg',
  baseus: '/brands/baseus.svg',
  meetion: '/brands/meetion.svg',
  aoc: '/brands/aoc.svg',
  'c max': '/brands/c-max.svg',
  cmax: '/brands/c-max.svg',
  dell: '/brands/dell.svg',
  panasonic: '/brands/panasonic.svg',
  wiwu: '/brands/wiwu.svg',
  xiaomi: '/brands/xiaomi.svg',
  philips: '/brands/philips.svg',
  anker: '/brands/anker.svg',
  'tp-link': '/brands/tp-link.svg',
  tplink: '/brands/tp-link.svg',
};

function resolveBrandLogo(name: string, logo?: string): string {
  if (logo && logo.trim()) return logo.trim();
  const lower = name.toLowerCase().trim();
  const norm = lower.replace(/[^a-z0-9]/g, '');
  return BRAND_FALLBACK_LOGOS[lower] || BRAND_FALLBACK_LOGOS[norm] || '';
}

/** Brands you stock with official logos and balanced aspect ratios. */
export default function BrandStrip({ brands }: { brands: BrandCount[] }) {
  if (brands.length === 0) return null;

  return (
    <section className="bg-gray-50">
      <div className="container-custom">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-base sm:text-lg font-black text-dark-300">Top brands</h2>
            <Link
              href="/products"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all products →
            </Link>
          </div>
          <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
            {brands.map((b) => {
              const logo = resolveBrandLogo(b.name, b.logo);
              const isSvg = logo.toLowerCase().endsWith('.svg');

              return (
                <li key={b.name}>
                  <Link
                    href={`/products?brand=${encodeURIComponent(b.name)}`}
                    aria-label={`${b.name}, ${b.count} products`}
                    className="group flex flex-col items-center justify-between h-24 sm:h-28 rounded-xl border border-gray-100 bg-white hover:border-primary/50 hover:shadow-card hover:-translate-y-0.5 transition-all p-2.5 sm:p-3"
                  >
                    <div className="flex-1 w-full flex items-center justify-center min-h-[46px]">
                      {logo ? (
                        <span className="relative w-full h-10 sm:h-12 flex items-center justify-center px-1">
                          <Image
                            src={logo}
                            alt={`${b.name} logo`}
                            fill
                            className="object-contain transition-transform duration-200 group-hover:scale-105"
                            sizes="(max-width: 640px) 30vw, (max-width: 1024px) 25vw, 16vw"
                            unoptimized={isSvg}
                          />
                        </span>
                      ) : (
                        <span className="text-xs sm:text-sm font-black tracking-tight text-dark-300 group-hover:text-primary uppercase text-center px-1">
                          {b.name}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-gray-400 group-hover:text-primary transition-colors mt-1">
                      {b.count} product{b.count === 1 ? '' : 's'}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
