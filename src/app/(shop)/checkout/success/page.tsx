'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Download, MessageSquare, ArrowRight, Package, Truck, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { BRAND } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') || '';
  const token = searchParams.get('token') || '';
  const clearCart = useCartStore((s) => s.clearCart);

  const [orderDetails, setOrderDetails] = useState<{ total?: number; status?: string } | null>(null);

  useEffect(() => {
    clearCart();
    if (orderId) {
      fetch(`/api/orders/${encodeURIComponent(orderId)}/status?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setOrderDetails({ total: data.data.total, status: data.data.paymentStatus });
          }
        })
        .catch(() => {});
    }
  }, [orderId, token, clearCart]);

  const wa = `https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi Gizmorex, I just completed DirectPay payment for order ${orderId}`
  )}`;

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-emerald-50/60 via-white to-gray-50 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-4 text-center w-full">
        {/* Animated Check Icon */}
        <div className="mb-6">
          <div className="relative inline-flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-emerald-400 blur-xl opacity-30 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-green-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-dark-300 tracking-tight mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 text-sm sm:text-base font-medium mb-6 max-w-md mx-auto">
          Thank you for choosing <span className="font-bold text-dark-300">{BRAND.name}</span>. Your payment has been securely confirmed via DirectPay IPG.
        </p>

        {/* Order Details Card */}
        {orderId && (
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-6 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Order Reference</span>
                <span className="font-mono text-base font-black text-primary">{orderId}</span>
              </div>
              {orderDetails?.total ? (
                <div className="text-right">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Paid</span>
                  <span className="text-base font-black text-dark-300">{formatPrice(orderDetails.total)}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">What Happens Next?</h3>
              <div className="space-y-2.5">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Payment Cleared & Logged',
                    desc: 'DirectPay bank authorization verified and order status updated to Confirmed.',
                  },
                  {
                    icon: Package,
                    title: 'Quality Check & Packing',
                    desc: 'Your genuine accessories are checked and securely wrapped for transit.',
                  },
                  {
                    icon: Truck,
                    title: 'Islandwide Express Delivery',
                    desc: 'Handed over to courier. We will send tracking updates directly to your WhatsApp.',
                  },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100/80 text-xs">
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">
                      <s.icon className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="font-bold text-gray-800">{s.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {orderId && (
            <a
              href={`/api/directpay/receipt?order_id=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`}
              className="btn-outline w-full sm:w-auto text-xs py-3 px-5 inline-flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Receipt
            </a>
          )}
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full sm:w-auto bg-green-600 hover:bg-green-700 text-xs py-3 px-5 inline-flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp Support
          </a>
          <Link
            href="/products"
            className="w-full sm:w-auto text-xs font-bold text-gray-500 hover:text-primary py-3 px-4 inline-flex items-center justify-center gap-1 transition-colors"
          >
            Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-24 text-center text-sm text-gray-400">Loading order confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
