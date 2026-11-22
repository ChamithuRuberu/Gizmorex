'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Pagination from '@/components/ui/Pagination';
import { MOCK_PRODUCTS } from '@/lib/data';
import { useCategoryStore } from '@/store/categoryStore';
import { Product } from '@/types';
import { SlidersHorizontal, X } from 'lucide-react';

function ProductsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const { categories, fetchCategories } = useCategoryStore();
  const LIMIT = 12;

  const search = params.get('search') || '';
  const category = (params.get('category') || '').toLowerCase();
  const deals = params.get('deals') === 'true';

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Load products from API dynamically
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAllProducts(data.data);
        }
      } catch (e) {
        console.warn('Using fallback products catalog:', e);
      }
    }
    loadProducts();
  }, []);

  const brands = useMemo(() => {
    return [...new Set(allProducts.map(p => p.brand).filter(Boolean))].sort();
  }, [allProducts]);

  useEffect(() => {
    let filtered = [...allProducts];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (category) {
      filtered = filtered.filter(p => {
        const prodCat = (p.category || '').toLowerCase();
        return prodCat === category ||
               prodCat.replace(/[^a-z0-9]+/g, '-') === category ||
               categories.some(c => c.slug.toLowerCase() === category && (prodCat === c.name.toLowerCase() || prodCat === c.slug.toLowerCase()));
      });
    }

    if (deals) {
      filtered = filtered.filter(p => p.isFlashDeal);
    }

    if (selectedBrands.length) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }

    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (sort === 'newest') filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setProducts(filtered);
    setPage(1);
  }, [allProducts, search, category, deals, sort, selectedBrands, priceRange, categories]);

  const pageProducts = products.slice((page - 1) * LIMIT, page * LIMIT);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const handleCategorySelect = (selectedSlug: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (category === selectedSlug.toLowerCase()) {
      newParams.delete('category');
    } else {
      newParams.set('category', selectedSlug);
    }
    router.push(`/products?${newParams.toString()}`);
  };

  return (
    <div className="container-custom py-6">
      <Breadcrumb items={[{ label: 'Products' }]} />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className={`md:w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-dark-300">Filters</h3>
              <button
                onClick={() => {
                  setSelectedBrands([]);
                  setPriceRange([0, 500000]);
                  router.push('/products');
                }}
                className="text-xs text-primary hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Categories */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Category</h4>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                <label
                  onClick={() => handleCategorySelect('')}
                  className="flex items-center gap-2 cursor-pointer group py-1"
                >
                  <input
                    type="radio"
                    name="category"
                    className="accent-primary"
                    checked={!category}
                    readOnly
                  />
                  <span className={`text-sm ${!category ? 'font-bold text-primary' : 'text-gray-600'} group-hover:text-primary transition-colors`}>
                    All Categories
                  </span>
                </label>
                {categories.map(cat => {
                  const isSelected = category === cat.slug.toLowerCase();
                  return (
                    <label
                      key={cat.id || cat.slug}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className="flex items-center justify-between gap-2 cursor-pointer group py-1"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="category"
                          className="accent-primary"
                          checked={isSelected}
                          readOnly
                        />
                        <span className={`text-sm ${isSelected ? 'font-bold text-primary' : 'text-gray-600'} group-hover:text-primary transition-colors`}>
                          {cat.name}
                        </span>
                      </div>
                      {cat.productCount !== undefined && cat.productCount > 0 && (
                        <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {cat.productCount}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Price Range</h4>
              <div className="text-xs text-gray-500 mb-1">
                Rs. {priceRange[0].toLocaleString()} – Rs. {priceRange[1].toLocaleString()}
              </div>
              <input
                type="range"
                min={0} max={500000} step={5000}
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-primary"
              />
            </div>

            {/* Brands */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Brand</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {brands.map(brand => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                    />
                    <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-gray-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
              <span className="text-sm text-gray-500">
                {products.length} products {search && `for "${search}"`}
              </span>
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Active filters */}
          {(selectedBrands.length > 0 || category || search) && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs text-gray-500">Active:</span>
              {category && (
                <span className="flex items-center gap-1 bg-orange-100 text-primary text-xs px-2.5 py-1 rounded-full font-medium">
                  Category: {categories.find(c => c.slug.toLowerCase() === category)?.name || category}
                  <button onClick={() => handleCategorySelect(category)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedBrands.map(b => (
                <span key={b} className="flex items-center gap-1 bg-orange-100 text-primary text-xs px-2.5 py-1 rounded-full font-medium">
                  {b}
                  <button onClick={() => toggleBrand(b)}><X className="w-3 h-3" /></button>
                </span>
              ))}
              {search && (
                <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  Query: {search}
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {pageProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pageProducts.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination page={page} pages={Math.ceil(products.length / LIMIT)} onPageChange={setPage} />
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try different filters or browse another category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
