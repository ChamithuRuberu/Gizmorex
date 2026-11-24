'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Loader2, X, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Category, Product } from '@/types';

interface HeaderSearchProps {
  categories: Category[];
  isMobile?: boolean;
  onSearchSubmit?: () => void;
}

export default function HeaderSearch({ categories, isMobile = false, onSearchSubmit }: HeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [matchingBrands, setMatchingBrands] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search fetch
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setTotal(0);
      setMatchingBrands([]);
      setIsLoading(false);
      setIsOpen(false);
      setHasSearched(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    setSelectedIndex(-1);

    const timer = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const catParam = selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : '';
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(trimmed)}${catParam}&limit=5`,
          {
            signal: abortControllerRef.current.signal,
            cache: 'no-store',
          }
        );
        const data = await res.json();

        if (data.success) {
          setResults(data.data || []);
          setTotal(data.total || 0);
          setMatchingBrands((data.brands || []).map((b: any) => (typeof b === 'string' ? b : b._id)).filter(Boolean).slice(0, 4));
        } else {
          setResults([]);
          setTotal(0);
          setMatchingBrands([]);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Search autocomplete error:', err);
          setResults([]);
        }
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
    };
  }, [query, selectedCategory]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const executeSearch = (searchVal: string, catVal = selectedCategory) => {
    const trimmed = searchVal.trim();
    if (!trimmed) return;
    setIsOpen(false);
    const cat = catVal ? `&category=${encodeURIComponent(catVal)}` : '';
    router.push(`/products?search=${encodeURIComponent(trimmed)}${cat}`);
    if (onSearchSubmit) onSearchSubmit();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      const selected = results[selectedIndex];
      setIsOpen(false);
      router.push(`/products/${selected.slug}`);
      if (onSearchSubmit) onSearchSubmit();
      return;
    }
    executeSearch(query);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${isMobile ? 'w-full' : 'flex-1 max-w-2xl'}`}>
      <form
        onSubmit={handleSubmit}
        className={`flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-primary focus-within:shadow-sm transition-all bg-white ${
          isMobile ? 'h-10' : 'h-11'
        }`}
      >
        {/* Category selector on desktop */}
        {!isMobile && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="hidden lg:block bg-gray-50/80 hover:bg-gray-100 border-r border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer max-w-[150px] truncate transition-colors"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((c) =>
              c.children?.length ? (
                <optgroup key={c.slug} label={c.name}>
                  <option value={c.slug}>All {c.name}</option>
                  {c.children.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              )
            )}
          </select>
        )}

        {/* Search input field */}
        <div className="relative flex-1 flex items-center h-full">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isMobile ? 'Search products, brands...' : 'Search for products, brands, accessories...'}
            className="w-full h-full px-3.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            aria-label="Search products"
            aria-autocomplete="list"
            aria-expanded={isOpen}
          />

          {/* Status indicators inside input */}
          <div className="flex items-center gap-1.5 pr-2">
            {isLoading && (
              <span className="flex items-center text-primary animate-spin" title="Loading similar products...">
                <Loader2 className="w-4 h-4" />
              </span>
            )}
            {query.length > 0 && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="w-5 h-5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="bg-primary hover:bg-primary-600 active:scale-95 text-white h-full px-4 sm:px-5 flex items-center justify-center transition-all flex-shrink-0"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      {/* Live Similar Products Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100/90 z-50 overflow-hidden animate-slide-up backdrop-blur-sm">
          {/* Header Bar */}
          <div className="px-4 py-2.5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold flex items-center gap-1.5 text-dark-300">
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  <span>Loading similar products...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {total > 0
                      ? `Similar products (${total} found)`
                      : hasSearched
                      ? 'No exact matches'
                      : 'Similar products'}
                  </span>
                </>
              )}
            </span>
            <span className="text-[11px] text-gray-400 hidden sm:inline">Press Enter to search all</span>
          </div>

          {/* Results List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
            {isLoading && results.length === 0 ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                    </div>
                    <div className="w-16 h-4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              results.map((product, idx) => {
                const isSelected = selectedIndex === idx;
                const thumb = product.images?.[0] || '/logo-wordmark.png';

                return (
                  <Link
                    key={product._id}
                    href={`/products/${product.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      if (onSearchSubmit) onSearchSubmit();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3 p-3 transition-colors ${
                      isSelected ? 'bg-orange-50/70' : 'hover:bg-gray-50/80'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 p-1">
                      <Image
                        src={thumb}
                        alt={product.name}
                        fill
                        className="object-contain p-0.5"
                        sizes="48px"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {product.brand && (
                          <span className="text-[10px] font-black uppercase text-primary tracking-wide">
                            {product.brand}
                          </span>
                        )}
                        {product.stock <= 0 && (
                          <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.2 rounded">
                            Out of stock
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-[13px] font-bold text-gray-800 truncate leading-snug group-hover:text-primary">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        in <span className="capitalize">{product.category.replace(/-/g, ' ')}</span>
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs sm:text-sm font-black text-primary">
                        {formatPrice(product.price)}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-[10px] text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : hasSearched && !isLoading ? (
              <div className="p-6 text-center">
                <p className="text-xs font-bold text-gray-700">No similar products found for &ldquo;{query}&rdquo;</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
                  Try checking your spelling or searching for generic terms like &ldquo;cable&rdquo;, &ldquo;charger&rdquo;, or &ldquo;mouse&rdquo;.
                </p>
              </div>
            ) : null}
          </div>

          {/* Matching Brands Pills */}
          {matchingBrands.length > 0 && (
            <div className="px-3.5 py-2 bg-gray-50/50 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1 flex-shrink-0">
                <Tag className="w-3 h-3" /> Brands:
              </span>
              <div className="flex items-center gap-1.5">
                {matchingBrands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push(`/products?brand=${encodeURIComponent(brand)}`);
                      if (onSearchSubmit) onSearchSubmit();
                    }}
                    className="px-2 py-0.5 rounded-lg bg-white border border-gray-200 hover:border-primary hover:text-primary text-[11px] font-semibold text-gray-700 transition-colors flex-shrink-0"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer View All Link */}
          {total > 0 && (
            <button
              type="button"
              onClick={() => executeSearch(query)}
              className="w-full py-2.5 px-4 bg-orange-50/90 hover:bg-orange-100/90 text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border-t border-orange-100/60"
            >
              <span>View all {total} matching products for &ldquo;{query}&rdquo;</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
