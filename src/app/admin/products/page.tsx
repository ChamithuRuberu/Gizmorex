'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, Filter, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategoriesList(data.data.map((c: any) => c.name));
        }
      } catch {
        // fallback
      }
    }
    loadCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
      });

      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setProducts(data.data || []);
        setTotalPages(data.pages || 1);
        setTotalProducts(data.total || data.data?.length || 0);
        setIsFallback(Boolean(data.isFallback));
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

  const handleSeedDatabase = async () => {
    setSeeding(true);
    const toastId = toast.loading('Populating sample catalog into database...');
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Database populated!', { id: toastId });
        await fetchProducts();
      } else {
        toast.error(data.error || 'Failed to populate database', { id: toastId });
      }
    } catch (err) {
      toast.error('Something went wrong seeding the database', { id: toastId });
    } finally {
      setSeeding(false);
    }
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
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
            title="Populate 20 electronics products & 8 categories into database"
          >
            {seeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Populate Sample Catalog
          </button>
          <Link href="/admin/products/new" className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Database & Cloudinary Status Banner */}
      {isFallback && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Catalog active in local resilient store ({totalProducts} products & Cloudinary images active).</span>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              MongoDB Atlas returned connection alert (IP not whitelisted). To sync all {totalProducts} products to cloud MongoDB Atlas, add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">0.0.0.0/0</code> in <a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer" className="underline font-bold text-primary hover:text-primary-600">MongoDB Atlas &rarr; Network Access</a>, then click &quot;Populate Sample Catalog&quot;.
            </p>
          </div>
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
                <option key={cat} value={cat}>
                  {cat}
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

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider border-b border-gray-100">
              <tr>
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
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="max-w-sm mx-auto text-center space-y-3">
                      <p className="font-semibold text-dark-300">No products found in catalog</p>
                      <p className="text-xs text-gray-400">
                        {categoryFilter
                          ? `No products found under category "${categoryFilter}".`
                          : 'You can populate the initial sample catalog or create your first product.'}
                      </p>
                      {categoryFilter ? (
                        <button
                          onClick={() => setCategoryFilter('')}
                          className="btn-outline text-xs py-1.5 px-3 mx-auto"
                        >
                          View All Categories
                        </button>
                      ) : (
                        <button
                          onClick={handleSeedDatabase}
                          disabled={seeding}
                          className="btn-primary text-xs py-2 px-4 mx-auto inline-flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Populate 20 Sample Products
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
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
                        {p.category}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
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
