'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Pagination from '@/components/ui/Pagination';
import { useCategoryStore } from '@/store/categoryStore';
import type { Product } from '@/types';
import { SlidersHorizontal, X, SearchX } from 'lucide-react';

const LIMIT = 24;
const PRICE_STEPS = [
  { label: 'Under Rs 1,000', min: 0, max: 1000 },
  { label: 'Rs 1,000 – 3,000', min: 1000, max: 3000 },
  { label: 'Rs 3,000 – 7,500', min: 3000, max: 7500 },
  { label: 'Rs 7,500 – 15,000', min: 7500, max: 15000 },
  { label: 'Over Rs 15,000', min: 15000, max: 0 },
];

interface BrandFacet {
  name: string;
  count: number;
}

/**
 * Product listing. Everything (search, category, brand, price, deals, sort, page) lives in the URL
 * and is filtered by the server, so links like /products?brand=Ugreen always show every match.
 */
function ProductsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { categories, fetchCategories } = useCategoryStore();

  const search = params.get('search') || '';
  const category = (params.get('category') || '').toLowerCase();
  const brands = (params.get('brand') || '').split(',').filter(Boolean);
  const deals = params.get('deals') === 'true';
  const sort = params.get('sort') || 'newest';
  const min = Number(params.get('min')) || 0;
  const max = Number(params.get('max')) || 0;
  const page = Math.max(Number(params.get('page')) || 1, 1);

  const [products, setProducts] = useState<Product[]>([]);
  const [brandFacets, setBrandFacets] = useState<BrandFacet[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const queryKey = params.toString();
  useEffect(() => {
    const controller = new AbortController();
    const q = new URLSearchParams(queryKey);
    q.set('limit', String(LIMIT));
    setLoading(true);
    fetch(`/api/products?${q}`, { cache: 'no-store', signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.success ? d.data : []);
        setTotal(d.success ? d.total : 0);
        setPages(d.success ? d.pages : 1);
        setBrandFacets(d.success ? d.brands ?? [] : []);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setProducts([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [queryKey]);

  /** Change some URL params; any filter change goes back to page 1. */
  const update = (changes: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    if (!keepPage) next.delete('page');
    router.push(`${pathname}?${next.toString()}`, { scroll: !keepPage ? false : true });
  };

  const toggleBrand = (name: string) => {
    const has = brands.some((b) => b.toLowerCase() === name.toLowerCase());
    const list = has ? brands.filter((b) => b.toLowerCase() !== name.toLowerCase()) : [...brands, name];
    update({ brand: list.join(',') || null });
  };

  const allCats = categories.flatMap((c) => [c, ...(c.children ?? [])]);
  const categoryName = allCats.find((c) => c.slug === category)?.name;
  const priceLabel = PRICE_STEPS.find((s) => s.min === min && s.max === max)?.label;
  const title = deals
    ? 'Deals'
    : brands.length
      ? brands.join(' & ')
      : search
        ? `Results for “${search}”`
        : categoryName || 'All products';
  const hasFilters = Boolean(search || category || brands.length || deals || min || max);

  return (
    <div className="container-custom py-6">
      <Breadcrumb items={[{ label: 'Products', href: '/products' }, ...(title !== 'All products' ? [{ label: title }] : [])]} />

      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-dark-300">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{loading ? 'Loading…' : `${total} product${total === 1 ? '' : 's'}`}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters */}
        <aside className={`md:w-60 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:sticky md:top-24 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-dark-300">Filters</h2>
              {hasFilters && (
                <button onClick={() => router.push(pathname)} className="text-xs font-semibold text-primary hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-[#FF6B00]" checked={deals} onChange={() => update({ deals: deals ? null : 'true' })} />
              <span className="text-sm font-semibold text-gray-700">Deals only</span>
            </label>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
              <ul className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
                <li>
                  <button onClick={() => update({ category: null })} className={`w-full text-left text-sm px-2 py-1 rounded-lg ${!category ? 'bg-orange-50 text-primary font-semibold' : 'text-gray-600 hover:text-primary'}`}>
                    All categories
                  </button>
                </li>
                {categories.map((c) => (
                  <li key={c.slug}>
                    <button onClick={() => update({ category: c.slug })} className={`w-full text-left text-sm px-2 py-1 rounded-lg font-medium ${category === c.slug ? 'bg-orange-50 text-primary font-semibold' : 'text-gray-700 hover:text-primary'}`}>
                      {c.name}
                    </button>
                    {(c.children ?? []).length > 0 && (
                      <ul className="ml-3 border-l border-gray-100 pl-2">
                        {c.children!.map((s) => (
                          <li key={s.slug}>
                            <button onClick={() => update({ category: s.slug })} className={`w-full text-left text-[13px] px-2 py-0.5 rounded-lg ${category === s.slug ? 'text-primary font-semibold' : 'text-gray-500 hover:text-primary'}`}>
                              {s.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Price</h3>
              <ul className="space-y-1">
                {PRICE_STEPS.map((s) => {
                  const on = s.min === min && s.max === max;
                  return (
                    <li key={s.label}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="price"
                          className="accent-[#FF6B00]"
                          checked={on}
                          onChange={() => update({ min: s.min ? String(s.min) : null, max: s.max ? String(s.max) : null })}
                        />
                        <span className={`text-sm ${on ? 'text-primary font-semibold' : 'text-gray-600'}`}>{s.label}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            {brandFacets.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Brand</h3>
                <ul className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {brandFacets.map((b) => {
                    const on = brands.some((x) => x.toLowerCase() === b.name.toLowerCase());
                    return (
                      <li key={b.name}>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 accent-[#FF6B00]" checked={on} onChange={() => toggleBrand(b.name)} />
                          <span className={`flex-1 text-sm ${on ? 'text-primary font-semibold' : 'text-gray-600'}`}>{b.name}</span>
                          <span className="text-[11px] text-gray-400">{b.count}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-3 bg-white rounded-xl border border-gray-100 px-3 sm:px-4 py-2.5">
            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <div className="hidden md:flex items-center gap-2 flex-wrap text-xs">
              {!hasFilters && <span className="text-gray-400">Showing everything</span>}
              {categoryName && <Chip label={categoryName} onClear={() => update({ category: null })} />}
              {brands.map((b) => <Chip key={b} label={b} onClear={() => toggleBrand(b)} />)}
              {priceLabel && <Chip label={priceLabel} onClear={() => update({ min: null, max: null })} />}
              {deals && <Chip label="Deals" onClear={() => update({ deals: null })} />}
              {search && <Chip label={`“${search}”`} onClear={() => update({ search: null })} />}
            </div>
            <select
              value={sort}
              onChange={(e) => update({ sort: e.target.value === 'newest' ? null : e.target.value })}
              aria-label="Sort products"
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
            >
              <option value="newest">Newest</option>
              <option value="popular">Best selling</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <SearchX className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-dark-300">No products match these filters</p>
              <p className="text-sm text-gray-500 mt-1">Try removing a filter, or search for something else.</p>
              {hasFilters && (
                <button onClick={() => router.push(pathname)} className="btn-primary mt-4 mx-auto">
                  Show all products
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <div className="mt-6">
                <Pagination page={page} pages={pages} onPageChange={(n) => update({ page: n > 1 ? String(n) : null }, true)} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-orange-50 text-primary font-semibold px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onClear} aria-label={`Remove ${label}`}>
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container-custom py-12 text-center text-gray-500">Loading…</div>}>
      <ProductsContent />
    </Suspense>
  );
}
