'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, Filter, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categoriesList, setCategoriesList] = useState<{ slug: string; name: string; parentSlug?: string | null }[]>([]);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit, setLimit] = useState(20);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [moveTo, setMoveTo] = useState('');
  const [busy, setBusy] = useState(false);
  
  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter, categoryFilter, limit]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategoriesList(data.data);
        }
      } catch {
        // the filter just stays empty
      }
    }
    loadCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: String(limit),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
      });

      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setProducts(data.data);
        setSelected(new Set());
        setTotalPages(data.pages);
        setTotalProducts(data.total);
        setLoadError('');
      } else {
        setProducts([]);
        setLoadError(data.error);
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const toastId = toast.loading('Deleting...');
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message, { id: toastId });
        fetchProducts();
      } else {
        toast.error(data.error, { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to delete product', { id: toastId });
    }
  };

  const allOnPage = products.length > 0 && products.every((p) => selected.has(p._id));
  const toggleAll = () => setSelected(allOnPage ? new Set() : new Set(products.map((p) => p._id)));
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const bulk = async (action: 'move' | 'delete' | 'activate' | 'deactivate') => {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (action === 'move' && !moveTo) return toast.error('Choose a category to move to');
    if (action === 'delete' && !confirm(`Delete ${ids.length} product(s)? This cannot be undone.`)) return;

    setBusy(true);
    const toastId = toast.loading('Working...');
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids, category: moveTo }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { id: toastId });
        setMoveTo('');
        await fetchProducts();
      } else {
        toast.error(data.error || 'Bulk action failed', { id: toastId });
      }
    } catch {
      toast.error('Bulk action failed', { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-dark-300">Product Catalog</h2>
          <p className="text-xs text-gray-500">
            Manage, edit, and track your electronics inventory ({totalProducts || products.length} items total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/products/new" className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-sm text-red-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by title, brand, or tag..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="input-field min-w-[140px]"
            >
              <option value="">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.parentSlug ? `  ${cat.name}` : cat.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input-field min-w-[120px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="low-stock">Low Stock</option>
            </select>
            <button type="submit" className="btn-primary">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            {(categoryFilter || statusFilter !== 'all' || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('');
                  setStatusFilter('all');
                  setSearchTerm('');
                  setPage(1);
                }}
                className="btn-secondary text-xs px-3"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="sticky top-2 z-20 bg-dark-300 text-white rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3 shadow-lg">
          <span className="text-sm font-bold">{selected.size} selected</span>
          <select
            value={moveTo}
            onChange={(e) => setMoveTo(e.target.value)}
            className="input-field !py-1.5 !text-xs !text-dark-300 min-w-[180px]"
            aria-label="Move selected products to category"
          >
            <option value="">Move to category...</option>
            {categoriesList.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.parentSlug ? `  ${cat.name}` : cat.name}
              </option>
            ))}
          </select>
          <button disabled={busy || !moveTo} onClick={() => bulk('move')} className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50">
            Move
          </button>
          <button disabled={busy} onClick={() => bulk('activate')} className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">
            Activate
          </button>
          <button disabled={busy} onClick={() => bulk('deactivate')} className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">
            Deactivate
          </button>
          <button disabled={busy} onClick={() => bulk('delete')} className="text-xs font-bold bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-300 hover:text-white inline-flex items-center gap-1">
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="pl-6 pr-2 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={allOnPage}
                    onChange={toggleAll}
                    aria-label="Select all products on this page"
                    className="w-4 h-4 accent-[#FF6B00] cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Sold</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="max-w-sm mx-auto text-center space-y-3">
                      <p className="font-semibold text-dark-300">No products found in catalog</p>
                      <p className="text-xs text-gray-400">
                        {categoryFilter
                          ? `No products found under category "${categoryFilter}".`
                          : 'Add a product, or import the catalog with npm run import:ido.'}
                      </p>
                      {categoryFilter ? (
                        <button
                          onClick={() => setCategoryFilter('')}
                          className="btn-outline text-xs py-1.5 px-3 mx-auto"
                        >
                          View All Categories
                        </button>
                      ) : (
                        <Link href="/admin/products/new" className="btn-primary text-xs py-2 px-4 mx-auto inline-flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" />
                          Add your first product
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className={`transition-colors ${selected.has(p._id) ? 'bg-orange-50/60' : 'hover:bg-gray-50/50'}`}>
                    <td className="pl-6 pr-2 py-4 w-8">
                      <input
                        type="checkbox"
                        checked={selected.has(p._id)}
                        onChange={() => toggleOne(p._id)}
                        aria-label={`Select ${p.name}`}
                        className="w-4 h-4 accent-[#FF6B00] cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={p.images[0] || 'https://placehold.co/100x100'}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-dark-300 block line-clamp-1">
                          {p.name}
                        </span>
                        <span className="text-xs text-gray-400">{p.brand}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setCategoryFilter(p.category);
                          setPage(1);
                        }}
                        className="text-xs bg-orange-50 hover:bg-orange-100 text-[#FF6B00] px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer border border-orange-100 inline-block"
                        title="Click to filter by this category"
                      >
                        {categoriesList.find((c) => c.slug === p.category)?.name ?? p.category}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 w-fit ${
                          p.stock > 10
                            ? 'bg-green-100 text-green-700'
                            : p.stock > 0
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {p.stock < 10 && p.stock > 0 && (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.sold}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          p.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p._id}`}
                          className="inline-flex items-center gap-1 bg-orange-50 hover:bg-[#FF6B00] text-[#FF6B00] hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                          title="Edit full options"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-gray-500 hover:text-primary hover:underline text-xs font-semibold px-1.5 py-1"
                          title="Preview in customer storefront"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded text-xs font-semibold transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
        <label htmlFor="page-size">Per page</label>
        <select
          id="page-size"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="input-field !py-1 !text-xs w-20"
        >
          {[20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                page === i + 1
                  ? 'bg-[#FF6B00] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
