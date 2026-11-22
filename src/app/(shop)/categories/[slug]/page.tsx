'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getInitialFallbackCategories } from '@/lib/category-store';
import { getProductsByCategory } from '@/lib/data';
import ProductCard from '@/components/products/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { Product } from '@/types';

export default function CategoryDetailPage() {
  const routerParams = useParams();
  const slug = typeof routerParams?.slug === 'string' ? routerParams.slug : Array.isArray(routerParams?.slug) ? routerParams.slug[0] : '';
  const targetSlug = slug.toLowerCase().trim();

  // Find category from fallback store
  const getInitialCategory = () => {
    const list = getInitialFallbackCategories();
    const found = list.find(
      (c) =>
        c.slug.toLowerCase() === targetSlug ||
        c.name.toLowerCase() === targetSlug ||
        c.slug.toLowerCase().replace(/-/g, ' ') === targetSlug.replace(/-/g, ' ')
    );
    if (found) return found;

    return {
      _id: slug,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      slug: slug,
      icon: 'Package',
      color: '#FF6B00',
      bg: '#FFF3E8',
      image: '',
      description: '',
      productCount: 0,
      isActive: true,
      sortOrder: 0,
    };
  };

  const [category, setCategory] = useState(getInitialCategory);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryData() {
      setLoading(true);

      // 1. Try fetching updated category details
      try {
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData.success && Array.isArray(catData.data)) {
          const match = catData.data.find(
            (c: any) =>
              c.slug.toLowerCase() === targetSlug ||
              c.name.toLowerCase() === targetSlug ||
              c.slug.toLowerCase().replace(/-/g, ' ') === targetSlug.replace(/-/g, ' ')
          );
          if (match) {
            setCategory(match);
          }
        }
      } catch (err) {
        console.warn('Category API notice:', err);
      }

      // 2. Fetch assigned products
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Products API notice, using fallback:', err);
      }

      // 3. Fallback to product store
      const fallback = getProductsByCategory(slug);
      setProducts(fallback);
      setLoading(false);
    }

    if (slug) {
      loadCategoryData();
    }
  }, [slug, targetSlug]);

  return (
    <div className="container-custom py-6">
      <Breadcrumb
        items={[
          { label: 'Categories', href: '/categories' },
          { label: category.name },
        ]}
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Category
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-dark-300 mt-1">
            {category.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {products.length} products available
          </p>
        </div>

        {category.image ? (
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        ) : (
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0 bg-orange-50"
          >
            <span
              className="text-2xl font-black text-[#FF6B00]"
            >
              {category.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading products in {category.name}...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100">
          No products currently available in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
