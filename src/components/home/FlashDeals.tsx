'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import { Zap, ArrowRight, Flame } from 'lucide-react';

interface FlashDealsProps {
  products?: Product[];
}

function CountdownTimer({ endsAt }: { endsAt?: string }) {
  const [time, setTime] = useState({ h: 14, m: 32, s: 45 });

  useEffect(() => {
    const target = endsAt ? new Date(endsAt).getTime() : Date.now() + 14 * 3600 * 1000;
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const Box = ({ v, l }: { v: string; l: string }) => (
    <div className="flex flex-col items-center">
      <span className="bg-dark-500 text-white font-mono font-black text-sm sm:text-base px-2.5 py-1.5 rounded-lg min-w-[2.4rem] text-center shadow-inner">
        {v}
      </span>
      <span className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">{l}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm p-1.5 sm:p-2 rounded-xl border border-orange-200">
      <Box v={pad(time.h)} l="HRS" />
      <span className="text-primary font-black text-sm sm:text-base -mt-3">:</span>
      <Box v={pad(time.m)} l="MIN" />
      <span className="text-primary font-black text-sm sm:text-base -mt-3">:</span>
      <Box v={pad(time.s)} l="SEC" />
    </div>
  );
}

export default function FlashDeals({ products = [] }: FlashDealsProps) {
  if (!products || products.length === 0) return null;
  const firstEndsAt = products[0]?.flashDealEndsAt;

  return (
    <section className="py-6">
      <div className="container-custom">
        <div className="bg-gradient-to-r from-orange-100/70 via-red-50 to-amber-50 rounded-3xl p-5 sm:p-8 border border-orange-200 shadow-sm">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-orange-200/60">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center shadow-md animate-pulse-soft">
                <Flame className="w-6 h-6 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-dark-300 tracking-tight">
                    ⚡ Super Flash Deals
                  </h2>
                  <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Limited Time
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Top discount electronics updated daily — Grab yours before stock clears out!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <CountdownTimer endsAt={firstEndsAt} />
              <Link
                href="/products?deals=true"
                className="hidden sm:inline-flex items-center gap-1.5 text-primary text-sm font-bold hover:gap-2.5 transition-all"
              >
                View All Deals <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {products.slice(0, 5).map((p, idx) => {
              // Simulated sold % between 45% and 92% to drive urgency
              const soldPct = Math.min(95, Math.max(45, ((idx * 17 + 55) % 95)));
              return (
                <div key={p._id} className="flex flex-col">
                  <ProductCard product={p} />
                  {/* Stock progress meter */}
                  <div className="mt-2 bg-white p-2 rounded-xl border border-orange-100 shadow-xs">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 mb-1">
                      <span className="text-primary font-black">🔥 {soldPct}% Sold</span>
                      <span>Only few left</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${soldPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/products?deals=true"
              className="btn-primary w-full justify-center text-xs py-2.5"
            >
              View All Flash Deals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
