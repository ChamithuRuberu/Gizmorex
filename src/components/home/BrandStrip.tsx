import Link from 'next/link';
import type { BrandCount } from '@/lib/catalog';

/** Brands you actually stock, from the products in the database. */
export default function BrandStrip({ brands }: { brands: BrandCount[] }) {
  if (brands.length === 0) return null;
  return (
    <section className="py-4 bg-gray-50">
      <div className="container-custom bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
        <h2 className="text-base sm:text-lg font-black text-dark-300 mb-3">Shop by brand</h2>
        <ul className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <li key={b.name}>
              <Link
                href={`/products?search=${encodeURIComponent(b.name)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary"
              >
                {b.name} <span className="text-xs text-gray-400">{b.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
