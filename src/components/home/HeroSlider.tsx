'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    headline: 'The Future of Tech Is Here',
    subtext: 'Discover the latest smartphones, laptops, and gadgets at unbeatable prices',
    cta: 'Shop Now',
    ctaHref: '/products',
    bgFrom: '#0f0c29',
    bgTo: '#302b63',
    accent: '#FF6B00',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
    badge: '🔥 Up to 40% OFF',
  },
  {
    id: 2,
    headline: 'Sound That Moves You',
    subtext: 'Premium headphones, earbuds & speakers — Feel every beat',
    cta: 'Explore Audio',
    ctaHref: '/categories/audio',
    bgFrom: '#1a0533',
    bgTo: '#6b21a8',
    accent: '#a855f7',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
    badge: '🎵 New Arrivals',
  },
  {
    id: 3,
    headline: 'Smart Deals, Smarter Living',
    subtext: 'Smart home devices, wearables & accessories for the modern lifestyle',
    cta: 'View Deals',
    ctaHref: '/products?deals=true',
    bgFrom: '#7c2d12',
    bgTo: '#c2410c',
    accent: '#FF6B00',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
    badge: '⚡ Flash Deals',
  },
];

const SIDE_BANNERS = [
  { text: '📱 Smartphones from Rs. 29,999', href: '/categories/smartphones', bg: 'from-blue-600 to-blue-800' },
  { text: '💻 Laptops up to 30% off', href: '/categories/laptops', bg: 'from-purple-600 to-purple-800' },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const go = (idx: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((idx + SLIDES.length) % SLIDES.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    const timer = setInterval(() => go(current + 1), 5000);
    return () => clearInterval(timer);
  }, [current]);

  const slide = SLIDES[current];

  return (
    <div className="container-custom py-4">
      <div className="flex gap-3 h-[320px] sm:h-[400px]">
        {/* Main Slider */}
        <div
          className="flex-1 relative rounded-2xl overflow-hidden transition-all duration-500"
          style={{ background: `linear-gradient(135deg, ${slide.bgFrom}, ${slide.bgTo})` }}
        >
          {/* Background image */}
          <div className="absolute inset-0 opacity-20">
            <Image src={slide.image} alt={slide.headline} fill className="object-cover" sizes="70vw" />
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-center px-8 sm:px-12 max-w-[65%]">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 w-fit backdrop-blur-sm">
              {slide.badge}
            </span>
            <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-3">
              {slide.headline}
            </h1>
            <p className="text-white/80 text-sm sm:text-base mb-6 leading-relaxed line-clamp-2">
              {slide.subtext}
            </p>
            <Link
              href={slide.ctaHref}
              className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all w-fit"
              style={{ background: slide.accent, color: '#fff' }}
            >
              {slide.cta} →
            </Link>
          </div>

          {/* Product image */}
          <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-70 hidden sm:block">
            <Image src={slide.image} alt={slide.headline} fill className="object-cover object-left" sizes="30vw" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${slide.bgFrom}, transparent)` }} />
          </div>

          {/* Navigation */}
          <div className="absolute bottom-4 left-8 flex items-center gap-3">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => go(current - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => go(current + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Side Banners */}
        <div className="hidden lg:flex flex-col gap-3 w-56">
          {SIDE_BANNERS.map((b, i) => (
            <Link
              key={i}
              href={b.href}
              className={`flex-1 rounded-2xl bg-gradient-to-br ${b.bg} flex items-center justify-center p-4 text-white text-sm font-bold text-center hover:opacity-90 transition-opacity`}
            >
              {b.text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

