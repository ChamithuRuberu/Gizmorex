'use client';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react';
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/constants';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const total = getTotal();
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const grandTotal = total + shipping;

  return (
    <div className="container-custom py-6">
      <Breadcrumb items={[{ label: 'Shopping Cart' }]} />
      <h1 className="text-2xl font-bold text-dark-300 mb-6">Shopping Cart ({items.length})</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-dark-300 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="font-semibold text-dark-300">Items</span>
                <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear All</button>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map(({ product, quantity }) => (
                  <div key={product._id} className="py-4 flex gap-4 items-center">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="80px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-dark-300 text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
                      <p className="text-primary font-bold text-sm mt-1">{formatPrice(product.price)}</p>
                    </div>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product._id, quantity - 1)}
                        className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold border-x border-gray-200">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product._id, quantity + 1)}
                        className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-dark-300 text-sm min-w-[5rem] text-right">{formatPrice(product.price * quantity)}</span>
                    <button onClick={() => removeItem(product._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="Remove item">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-card p-6 space-y-4 sticky top-24">
              <h2 className="font-bold text-dark-300 text-lg border-b border-gray-100 pb-3">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-dark-300 text-base">
                  <span>Total</span><span className="text-primary text-xl">{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-primary w-full justify-center text-base py-3">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
