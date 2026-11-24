'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { SL_DISTRICTS, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Link from 'next/link';
import { Truck, CreditCard, Building2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

type Method = 'cod' | 'directpay' | 'bank';

declare global {
  interface Window {
    DirectPayIpg?: any;
  }
}

const DIRECTPAY_SCRIPT = 'https://cdn.directpay.lk/v3/directpayipg.min.js';

function loadDirectPay(): Promise<void> {
  if (typeof window !== 'undefined' && window.DirectPayIpg) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${DIRECTPAY_SCRIPT}"]`);
    const script = existing || document.createElement('script');
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Could not load the card payment window')));
    if (!existing) {
      script.src = DIRECTPAY_SCRIPT;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<Method>('cod');
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', addressLine1: '', addressLine2: '',
    city: '', district: 'Colombo', postalCode: '', notes: '',
  });

  // Display only: the server recalculates every price and the total.
  const total = getTotal();
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const grandTotal = total + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.addressLine1 || !form.city) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      if (paymentMethod === 'directpay') await loadDirectPay();

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({ productId: product._id, slug: product.slug, quantity })),
          shipping: form,
          paymentMethod,
          notes: form.notes,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not place the order');

      const { orderNumber, statusToken, directpay } = json.data;
      const statusUrl = `/checkout/status?order=${encodeURIComponent(orderNumber)}&token=${statusToken}`;

      if (paymentMethod === 'directpay') {
        const dp = new window.DirectPayIpg.Init({
          signature: directpay.signature,
          dataString: directpay.dataString,
          stage: directpay.stage || 'DEV',
        });

        dp.doInAppCheckout()
          .then(async (result: any) => {
            console.log('DirectPay payment result:', result);
            const status = result?.transaction?.status?.toLowerCase();

            if (status === 'success' || status === 'paid' || status === 'successful') {
              await fetch('/api/directpay/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderNumber, status: 'SUCCESS' }),
              });
              clearCart();
              router.push(`/checkout/success?gateway=directpay&order_id=${encodeURIComponent(orderNumber)}`);
            } else if (status === 'failed' || status === 'fail') {
              const failureReason = result?.transaction?.message || 'Card payment declined';
              await fetch('/api/directpay/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderNumber, status: 'FAILED', message: failureReason }),
              });
              router.push(`/checkout/fail?gateway=directpay&order_id=${encodeURIComponent(orderNumber)}&reason=${encodeURIComponent(failureReason)}`);
            } else {
              // User closed or cancelled modal
              await fetch('/api/directpay/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderNumber, status: 'CANCELLED' }),
              });
              router.push(`/checkout/cancel?gateway=directpay&order_id=${encodeURIComponent(orderNumber)}`);
            }
          })
          .catch(async (error: any) => {
            console.error('DirectPay in-app checkout error:', error);
            const reason = error?.message || 'Payment processing was interrupted';
            await fetch('/api/directpay/status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_id: orderNumber, status: 'FAILED', message: reason }),
            });
            router.push(`/checkout/fail?gateway=directpay&order_id=${encodeURIComponent(orderNumber)}&reason=${encodeURIComponent(reason)}`);
          });
        return;
      }

      clearCart();
      router.push(statusUrl);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

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
                { id: 'directpay', label: 'Card / Online payment', desc: 'Visa, Mastercard and more, securely through DirectPay', icon: CreditCard },
                { id: 'bank', label: 'Bank Transfer', desc: 'We send our bank details on WhatsApp after you order', icon: Building2 },
              ].map(({ id, label, desc, icon: Icon }) => (
                <label key={id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === id ? 'border-primary bg-orange-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id as Method)} className="mt-1 accent-primary" />
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
            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center text-base py-3 disabled:opacity-60">
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : paymentMethod === 'directpay' ? (
                <>Pay {formatPrice(grandTotal)}</>
              ) : (
                <>Place Order ({formatPrice(grandTotal)})</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

