'use client';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { SL_DISTRICTS, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Link from 'next/link';
import { CheckCircle2, Truck, CreditCard, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const [placed, setPlaced] = useState(false);
  const [orderNum, setOrderNum] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'bank'>('cod');
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', addressLine1: '', addressLine2: '',
    city: '', district: 'Colombo', postalCode: '', notes: '',
  });

  const total = getTotal();
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const grandTotal = total + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.addressLine1 || !form.city) {
      toast.error('Please fill in all required fields');
      return;
    }
    const num = generateOrderNumber();
    setOrderNum(num);
    setPlaced(true);
    clearCart();
    toast.success('Order placed successfully! 🎉', { duration: 5000 });
  };

  if (placed) {
    return (
      <div className="container-custom py-16 text-center max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-card p-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-dark-300 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 text-sm mb-4">Thank you for your order. We'll start processing it right away.</p>
          <div className="bg-orange-50 rounded-xl p-4 mb-6">
            <span className="text-xs text-gray-500">Order Number</span>
            <p className="text-lg font-black text-primary font-mono">{orderNum}</p>
          </div>
          <p className="text-xs text-gray-500 mb-6">A confirmation has been sent to your phone/email.</p>
          <Link href="/products" className="btn-primary w-full justify-center">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Link href="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-6">
      <Breadcrumb items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="text-2xl font-bold text-dark-300 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-dark-300 text-lg mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name *</label>
                <input required type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="input-field" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone Number *</label>
                <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+94 7X XXX XXXX" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="john@example.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Address Line 1 *</label>
                <input required type="text" value={form.addressLine1} onChange={e => setForm({ ...form, addressLine1: e.target.value })} className="input-field" placeholder="123 Street Name" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Address Line 2 (Optional)</label>
                <input type="text" value={form.addressLine2} onChange={e => setForm({ ...form, addressLine2: e.target.value })} className="input-field" placeholder="Apt, Suite, Unit" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">City *</label>
                <input required type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-field" placeholder="Colombo" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">District *</label>
                <select value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="input-field bg-white">
                  {SL_DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-dark-300 text-lg mb-4">Payment Method</h2>
            <div className="space-y-3">
              {[
                { id: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay with cash when your order arrives', icon: Truck },
                { id: 'card', label: 'Credit / Debit Card', desc: 'Pay online securely with Visa or MasterCard', icon: CreditCard },
                { id: 'bank', label: 'Bank Transfer', desc: 'Transfer directly to our bank account', icon: Building2 },
              ].map(({ id, label, desc, icon: Icon }) => (
                <label key={id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === id ? 'border-primary bg-orange-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id as any)} className="mt-1 accent-primary" />
                  <Icon className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <span className="font-semibold text-dark-300 text-sm block">{label}</span>
                    <span className="text-xs text-gray-500">{desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-4 sticky top-24">
            <h2 className="font-bold text-dark-300 text-lg border-b border-gray-100 pb-3">Your Order</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product._id} className="flex justify-between items-center text-sm">
                  <div className="flex-1 pr-2">
                    <p className="font-medium text-dark-300 line-clamp-1">{product.name}</p>
                    <span className="text-xs text-gray-400">Qty: {quantity}</span>
                  </div>
                  <span className="font-semibold text-dark-300">{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatPrice(shipping)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-dark-300 text-base">
                <span>Total</span><span className="text-primary text-xl">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center text-base py-3">
              Place Order ({formatPrice(grandTotal)})
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

