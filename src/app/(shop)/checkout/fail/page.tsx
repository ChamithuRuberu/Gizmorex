'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, RefreshCw, MessageSquare, ArrowLeft, CreditCard, ShieldAlert } from 'lucide-react';
import { BRAND } from '@/lib/constants';

function FailContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') || '';
  const reason = searchParams.get('reason') || 'Transaction declined by bank or gateway';

  const wa = `https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi Gizmorex, my card payment failed for order ${orderId}. Reason: ${reason}. Please help.`
  )}`;

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-red-50/60 via-white to-gray-50 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-4 text-center w-full">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="relative inline-flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-red-400 blur-xl opacity-25 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-red-500 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-red-500/30">
              <AlertCircle className="w-12 h-12" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-dark-300 tracking-tight mb-2">
          Payment Unsuccessful
        </h1>
        <p className="text-gray-600 text-sm sm:text-base font-medium mb-3 max-w-md mx-auto">
          We could not complete your online transaction via DirectPay.
        </p>

        {/* Reason Box */}
        <div className="bg-red-50/80 border border-red-200/80 rounded-xl p-3 mb-6 max-w-md mx-auto text-xs font-bold text-red-700">
          Reason: {reason}
        </div>

        {/* Order Details & Troubleshooting */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-6 text-left">
          {orderId && (
            <div className="pb-3 border-b border-gray-100 mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Order Reference</span>
              <span className="font-mono text-sm font-black text-primary">{orderId}</span>
            </div>
          )}

          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2.5">What can you do?</h3>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100/80 text-xs">
              <span className="w-7 h-7 rounded-lg bg-orange-50 text-primary flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4" />
              </span>
              <div>
                <p className="font-bold text-gray-800">Check Card Permissions & Balance</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Ensure online payments/e-commerce are enabled on your card and you have sufficient daily limit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100/80 text-xs">
              <span className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <div>
                <p className="font-bold text-gray-800">Switch to Cash on Delivery</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  You can retry placing the order and choose Cash on Delivery to pay when your package arrives.
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
            <RefreshCw className="w-4 h-4" /> Try Again
          </Link>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full sm:w-auto text-xs py-3 px-5 inline-flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-green-600" /> WhatsApp Us for Help
          </a>
          <Link
            href="/products"
            className="w-full sm:w-auto text-xs font-bold text-gray-500 hover:text-primary py-3 px-4 inline-flex items-center justify-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-24 text-center text-sm text-gray-400">Loading payment status...</div>}>
      <FailContent />
    </Suspense>
  );
}
