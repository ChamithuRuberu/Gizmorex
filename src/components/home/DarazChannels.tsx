'use client';

import Link from 'next/link';
import { Zap, ShieldCheck, Truck, Gift, Banknote, RotateCcw } from 'lucide-react';

const CHANNELS = [
  {
    icon: Zap,
    title: 'Flash Sale',
    subtitle: 'Up to 60% OFF',
    href: '/products?deals=true',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'hover:border-amber-400',
  },
  {
    icon: ShieldCheck,
    title: 'GizmoMall',
    subtitle: '100% Authentic',
    href: '/products?featured=true',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'hover:border-blue-400',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    subtitle: 'Over Rs. 10,000',
    href: '/products',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'hover:border-emerald-400',
  },
  {
    icon: Gift,
    title: 'Welcome Voucher',
    subtitle: 'Rs. 1,000 OFF',
    href: '/account',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'hover:border-purple-400',
  },
  {
    icon: Banknote,
    title: 'Cash on Delivery',
    subtitle: 'Pay at Doorstep',
    href: '/checkout',
    color: 'text-[#FF6B00]',
    bg: 'bg-orange-50',
    border: 'hover:border-[#FF6B00]',
  },
  {
    icon: RotateCcw,
    title: '7-Day Return',
    subtitle: 'Hassle-Free',
    href: '/products',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'hover:border-rose-400',
  },
];

export default function DarazChannels() {
  return (
    <section className="py-3 bg-white border-b border-gray-100">
      <div className="container-custom">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {CHANNELS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`group flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border border-gray-100 bg-white transition-all duration-200 hover:shadow-xs hover:-translate-y-0.5 ${item.border}`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-dark-300 group-hover:text-primary transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium truncate">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
