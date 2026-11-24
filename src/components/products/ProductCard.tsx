'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(s => s.addItem);
  const openCart = useCartStore(s => s.openCart);
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    openCart();
    toast.success(`${product.name} added to cart!`, { icon: '🛒' });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
      icon: wishlisted ? '💔' : '❤️',
    });
  };

  const discountPct = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPct > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                -{discountPct}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">NEW</span>
            )}
            {product.isFlashDeal && (
              <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-md">⚡ DEAL</span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
              wishlisted ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Quick actions on hover */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-2 flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary hover:bg-primary-600 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="bg-white hover:bg-gray-50 text-dark-300 p-2 rounded-lg flex items-center justify-center transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <Eye className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-xs text-gray-400 font-medium mb-1">{product.brand}</p>
          <h3 className="text-sm font-medium text-dark-300 line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          {product.numReviews > 0 && <StarRating rating={product.rating} numReviews={product.numReviews} size="sm" />}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-primary font-bold text-base">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="text-gray-400 text-xs line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

