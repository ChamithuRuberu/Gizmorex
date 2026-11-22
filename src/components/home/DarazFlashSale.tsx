'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Zap, ChevronRight, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';

interface DarazFlashSaleProps {
  products?: Product[];
}

function DarazTimer({ endsAt }: { endsAt?: string }) {
  const [time, setTime] = useState({ h: 8, m: 24, s: 19 });

  useEffect(() => {
    const target = endsAt ? new Date(endsAt).getTime() : Date.now() + 8 * 3600 * 1000;
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1">
      <span className="bg-[#D32F2F] text-white font-mono font-bold text-xs sm:text-sm px-2 py-1 rounded shadow-xs">
        {pad(time.h)}
      </span>
      <span className="text-[#D32F2F] font-black text-sm">:</span>
      <span className="bg-[#D32F2F] text-white font-mono font-bold text-xs sm:text-sm px-2 py-1 rounded shadow-xs">
        {pad(time.m)}
      </span>
      <span className="text-[#D32F2F] font-black text-sm">:</span>
      <span className="bg-[#D32F2F] text-white font-mono font-bold text-xs sm:text-sm px-2 py-1 rounded shadow-xs">
        {pad(time.s)}
      </span>
    </div>
  );
}

export default function DarazFlashSale({ products = [] }: DarazFlashSaleProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { toggle, isWishlisted } = useWishlistStore();

  if (!products || products.length === 0) return null;

  const firstEndsAt = products[0]?.flashDealEndsAt;

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addItem(product, 1);
    openCart();
    toast.success(`${product.name} added to cart!`, { icon: '🛒' });
  };

  return (
    <section className="py-4 bg-gray-50">
      <div className="container-custom">
        {/* Section Container */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 sm:p-5">
          {/* Daraz Flash Sale Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-base sm:text-lg font-black text-primary uppercase tracking-tight flex items-center gap-1.5">
                <Zap className="w-5 h-5 fill-primary text-primary" />
                Flash Sale
              </h2>
              <span className="text-xs font-semibold text-gray-500">
                Ending in
              </span>
              <DarazTimer endsAt={firstEndsAt} />
            </div>

            <Link
              href="/products?deals=true"
              className="text-xs font-bold text-primary hover:text-orange-600 border border-primary/40 hover:border-primary px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
            >
              SHOP MORE <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Product Cards Grid (Daraz 6-column density on large screens) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.slice(0, 6).map((product, idx) => {
              const discount =
                product.originalPrice > product.price
                  ? Math.round(
                      ((product.originalPrice - product.price) / product.originalPrice) * 100
                    )
                  : 0;

              const wishlisted = isWishlisted(product._id);
              const soldCount = product.sold > 0 ? product.sold : (idx * 7 + 12);
              const progressPct = Math.min(95, Math.max(30, (idx * 16 + 50) % 95));

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-xl border border-gray-100 hover:border-primary/40 hover:shadow-card transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                >
                  {/* Image Container */}
                  <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
                    <Image
                      src={product.images[0] || 'https://placehold.co/300x300'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    />

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-[#FF6B00] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs">
                        -{discount}%
                      </span>
                    )}

                    {/* Wishlist toggle */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggle(product);
                      }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 shadow-xs flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </Link>

                  {/* Body Content */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-xs text-dark-300 font-medium line-clamp-2 hover:text-primary transition-colors leading-snug min-h-[2rem] mb-1.5">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Prices */}
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#FF6B00]">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-400 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              -{discount}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sold progress bar */}
                    <div className="mt-2.5 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                        <span className="font-semibold text-gray-600">{soldCount} Sold</span>
                        <span className="text-[9px] text-[#FF6B00] font-bold">Fast Selling</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-[#FF6B00] h-1.5 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Quick Add To Cart Button */}
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="mt-2 w-full bg-orange-50 hover:bg-[#FF6B00] text-[#FF6B00] hover:text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
