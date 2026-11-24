'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCw, MessageSquare, ArrowLeft, ShoppingBag, HelpCircle, Truck } from 'lucide-react';
import { BRAND } from '@/lib/constants';

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') || '';

  const wa = `https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi Gizmorex, I cancelled my card payment for order ${orderId || 'checkout'}. Can you help me complete it?`
  )}`;

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-slate-50/70 via-white to-gray-50 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-4 text-center w-full">
        {/* Cancel Icon */}
        <div className="mb-6">
          <div className="relative inline-flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-slate-400 blur-xl opacity-20" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-slate-400 to-slate-600 flex items-center justify-center text-white shadow-xl shadow-slate-500/20">
              <XCircle className="w-12 h-12" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-dark-300 tracking-tight mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 text-sm sm:text-base font-medium mb-6 max-w-md mx-auto">
          No charges were made to your account. Your payment window was closed before completion.
        </p>

        {/* Order Details & Next Options */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-6 text-left">
          {orderId && (
            <div className="pb-3 border-b border-gray-100 mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Order Reference</span>
              <span className="font-mono text-sm font-black text-primary">{orderId}</span>
            </div>
          )}

          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2.5 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-primary" /> What would you like to do?
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100/80 text-xs">
              <span className="w-7 h-7 rounded-lg bg-orange-50 text-primary flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-4 h-4" />
              </span>
              <div>
                <p className="font-bold text-gray-800">Retry Online Card Payment</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Re-enter your card details securely on DirectPay to complete the purchase right away.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100/80 text-xs">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4" />
              </span>
              <div>
                <p className="font-bold text-gray-800">Prefer to Pay on Delivery?</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Select Cash on Delivery during checkout and pay cash when the courier hands over your package.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/checkout"
            className="btn-primary w-full sm:w-auto text-xs py-3 px-6 inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Return to Checkout
          </Link>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full sm:w-auto text-xs py-3 px-5 inline-flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-green-600" /> WhatsApp Us
          </a>
          <Link
            href="/products"
            className="w-full sm:w-auto text-xs font-bold text-gray-500 hover:text-primary py-3 px-4 inline-flex items-center justify-center gap-1 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-16 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}
