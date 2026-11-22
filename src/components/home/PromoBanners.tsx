import Link from 'next/link';
import { ArrowRight, Flame, Sparkles } from 'lucide-react';

export default function PromoBanners() {
  return (
    <section className="py-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Banner 1: Gaming */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-7 sm:p-9 shadow-md flex flex-col justify-between group">
            <div className="relative z-10 max-w-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary text-white mb-3 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-white" /> Pro Gaming Setup
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight mb-2">
                Level Up Your Battlestation
              </h3>
              <p className="text-sm text-gray-300 mb-5 leading-relaxed">
                RGB Mechanical Keyboards, Wireless Gaming Mice & High-Refresh Headsets with up to 35% discount.
              </p>
              <Link
                href="/categories/gaming"
                className="inline-flex items-center gap-2 bg-white text-dark-500 hover:bg-orange-50 hover:text-primary font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm group-hover:gap-3"
              >
                Shop Gaming Gear <ArrowRight className="w-4 h-4 text-primary" />
              </Link>
            </div>
            {/* Background glowing circle */}
            <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          </div>

          {/* Banner 2: Audio & Noise Cancellation */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-950 via-dark-500 to-dark-400 text-white p-7 sm:p-9 shadow-md flex flex-col justify-between group">
            <div className="relative z-10 max-w-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white mb-3 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Pure Sound Experience
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight mb-2">
                Noise Cancelling Audio
              </h3>
              <p className="text-sm text-gray-300 mb-5 leading-relaxed">
                Immerse yourself with Sony, Apple, JBL & Anker wireless earbuds and bluetooth party speakers.
              </p>
              <Link
                href="/categories/audio"
                className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-600 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm group-hover:gap-3"
              >
                Explore Audio Collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Background glowing circle */}
            <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-orange-600/25 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </section>
  );
}
