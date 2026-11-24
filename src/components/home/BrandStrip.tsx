import Link from 'next/link';
import Image from 'next/image';
import type { BrandCount } from '@/lib/catalog';

/** Brands you stock. Logo when one is uploaded in Admin → Brands, otherwise the name. */
export default function BrandStrip({ brands }: { brands: BrandCount[] }) {
  if (brands.length === 0) return null;
  return (
    <section className="bg-gray-50">
      <div className="container-custom">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 sm:p-5">
          <h2 className="text-base sm:text-lg font-black text-dark-300 mb-3">Top brands</h2>
          <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
            {brands.map((b) => (
              <li key={b.name}>
                <Link
                  href={`/products?brand=${encodeURIComponent(b.name)}`}
                  aria-label={`${b.name}, ${b.count} products`}
                  className="group flex flex-col items-center justify-center h-24 rounded-xl border border-gray-100 bg-white hover:border-primary/50 hover:shadow-card transition-all px-3"
                >
                  {b.logo ? (
                    <span className="relative w-full h-10">
                      <Image src={b.logo} alt={`${b.name} logo`} fill className="object-contain grayscale group-hover:grayscale-0 transition" sizes="160px" />
                    </span>
                  ) : (
                    <span className="text-sm sm:text-base font-black tracking-tight text-dark-300 group-hover:text-primary uppercase text-center">{b.name}</span>
                  )}
                  <span className="text-[11px] text-gray-400 mt-1.5">{b.count} product{b.count === 1 ? '' : 's'}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
