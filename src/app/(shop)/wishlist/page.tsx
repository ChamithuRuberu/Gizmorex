'use client';
import { useWishlistStore } from '@/store/wishlistStore';
import ProductCard from '@/components/products/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { items, clear } = useWishlistStore();

  return (
    <div className="container-custom py-6">
      <Breadcrumb items={[{ label: 'Wishlist' }]} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-300">My Wishlist ({items.length})</h1>
        {items.length > 0 && (
          <button onClick={clear} className="text-sm text-red-500 hover:underline">Clear All</button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-dark-300 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you like to buy them later.</p>
          <Link href="/products" className="btn-primary">Discover Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}

