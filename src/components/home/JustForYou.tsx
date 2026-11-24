'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Category, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Star, ShoppingCart, Heart, Sparkles, Truck, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';

interface JustForYouProps {
  products?: Product[];
  /** Top-level categories (with children) to show as filter tabs. */
  categories?: Category[];
}

const ALL = '';

export default function JustForYou({ products = [], categories = [] }: JustForYouProps) {
  const [activeTab, setActiveTab] = useState(ALL);
  const tabs = [{ slug: ALL, name: 'All Products' }, ...categories.slice(0, 6)];
  const activeCategory = categories.find((c) => c.slug === activeTab);
  const activeScope = new Set(activeCategory ? [activeCategory.slug, ...(activeCategory.children ?? []).map((c) => c.slug)] : []);
  const [displayCount, setDisplayCount] = useState(12);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { toggle, isWishlisted } = useWishlistStore();

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addItem(product, 1);
    openCart();
    toast.success(`${product.name} added to cart!`, { icon: '🛒' });
  };

  const filteredProducts = activeTab === ALL ? products : products.filter((p) => activeScope.has(p.category));

  const visibleProducts = filteredProducts.slice(0, displayCount);

  return (
    <section className="py-6 bg-gray-50">
      <div className="container-custom">
        {/* Daraz "Just For You" Sticky/Prominent Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 fill-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-dark-300">
                Just For You
              </h2>
              <p className="text-xs text-gray-500">
                Personalized top-rated electronics and daily essentials
              </p>
            </div>
          </div>

          {/* Daraz Category Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
            {tabs.map((tab) => (
              <button
                key={tab.slug}
                onClick={() => {
                  setActiveTab(tab.slug);
                  setDisplayCount(12);
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.slug
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* 6-Column Daraz Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {visibleProducts.map((product) => {
            const discount =
              product.originalPrice > product.price
                ? Math.round(
                    ((product.originalPrice - product.price) / product.originalPrice) * 100
                  )
                : 0;
            const wishlisted = isWishlisted(product._id);

            return (
              <div
                key={product._id}
                className="group bg-white rounded-xl border border-gray-100 hover:border-primary/40 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Product Image */}
                <Link
                  href={`/products/${product.slug}`}
                  className="block relative aspect-square bg-gray-50 overflow-hidden"
                >
                  <Image
                    src={product.images[0] || 'https://placehold.co/300x300'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  />

                  {/* Discount tag */}
                  {discount > 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-[#FF6B00] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs">
                      -{discount}%
                    </span>
                  )}

                  {/* Wishlist button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggle(product);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 shadow-xs flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        wishlisted ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                  </button>
                </Link>

                {/* Content */}
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-xs text-dark-300 font-medium line-clamp-2 hover:text-primary transition-colors leading-snug min-h-[2rem] mb-1.5">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price in Daraz Orange */}
                    <div className="flex flex-col mb-1.5">
                      <span className="text-sm font-black text-[#FF6B00]">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Ratings */}
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="text-[10px] font-bold text-gray-700 ml-0.5">
                          {product.rating ? product.rating.toFixed(1) : '5.0'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        ({product.numReviews || Math.floor(Math.random() * 40 + 5)})
                      </span>
                    </div>

                    {/* Daraz Badges (Free delivery & COD) */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Truck className="w-2.5 h-2.5" /> Free Shipping
                      </span>
                      <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> COD
                      </span>
                    </div>
                  </div>

                  {/* Add To Cart */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full bg-gray-50 hover:bg-[#FF6B00] text-gray-700 hover:text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors border border-gray-200 hover:border-[#FF6B00]"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Daraz "LOAD MORE" Button */}
        {filteredProducts.length > displayCount && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setDisplayCount((prev) => prev + 12)}
              className="btn-outline font-bold text-xs sm:text-sm py-2.5 px-8 hover:bg-[#FF6B00] hover:text-white hover:border-[#FF6B00] transition-all"
            >
              LOAD MORE PRODUCTS
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
