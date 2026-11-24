import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, MessageCircle } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import type { HomeBanner } from '@/lib/catalog';

interface PromoBandProps {
  maxDiscount: number;
  promoBanners?: {
    left?: HomeBanner;
    right?: HomeBanner;
  };
}

/**
 * Two promotional blocks in the middle of the homepage.
 * Configured in Admin → Banners:
 * - If custom promo banner images are uploaded, displays the images with links.
 * - Otherwise falls back to the dynamic Deals card and WhatsApp Support card.
 */
export default function PromoBand({ maxDiscount, promoBanners }: PromoBandProps) {
  const wa = `https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
    'Hi Gizmorex, I need help choosing a product'
  )}`;

  const hasLeftCustom = Boolean(promoBanners?.left?.image);
  const hasRightCustom = Boolean(promoBanners?.right?.image);

  return (
    <section className="bg-gray-50">
      <div className="container-custom grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Left Block: Custom Image Banner or Default Deals Card */}
        {hasLeftCustom ? (
          <Link
            href={promoBanners!.left!.link || '/products?deals=true'}
            aria-label={promoBanners!.left!.title || 'Special Promotion'}
            className="group relative overflow-hidden rounded-2xl min-h-[160px] sm:min-h-[190px] shadow-card border border-gray-100 flex items-center justify-center bg-gray-900"
          >
            <Image
              src={promoBanners!.left!.image}
              alt={promoBanners!.left!.title || 'Special Promotion'}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </Link>
        ) : (
          maxDiscount >= 5 && (
            <Link
              href="/products?deals=true"
              className="group relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white bg-gradient-to-br from-[#FF7A1A] via-[#FF6B00] to-[#E14A00] min-h-[160px] sm:min-h-[190px] flex flex-col justify-center shadow-card"
            >
              <span aria-hidden className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
              <span aria-hidden className="absolute right-10 -bottom-16 w-40 h-40 rounded-full bg-white/10" />
              <span className="relative inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/90">
                <Zap className="w-4 h-4 fill-white" /> Deals live now
              </span>
              <span className="relative mt-2 text-3xl sm:text-4xl font-black leading-none">
                Up to {maxDiscount}% off
              </span>
              <span className="relative mt-2 text-sm text-white/90">
                On chargers, cables, power banks and more
              </span>
              <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-bold bg-white text-primary w-fit px-4 py-2 rounded-full group-hover:gap-2.5 transition-all">
                Shop deals <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          )
        )}

        {/* Right Block: Custom Image Banner or Default WhatsApp Support Card */}
        {hasRightCustom ? (
          <Link
            href={promoBanners!.right!.link || wa}
            aria-label={promoBanners!.right!.title || 'Expert Support'}
            target={promoBanners!.right!.link?.startsWith('http') ? '_blank' : undefined}
            rel={promoBanners!.right!.link?.startsWith('http') ? 'noopener noreferrer' : undefined}
            className={`group relative overflow-hidden rounded-2xl min-h-[160px] sm:min-h-[190px] shadow-card border border-gray-100 flex items-center justify-center bg-gray-900 ${
              !hasLeftCustom && maxDiscount < 5 ? 'md:col-span-2' : ''
            }`}
          >
            <Image
              src={promoBanners!.right!.image}
              alt={promoBanners!.right!.title || 'Expert Support'}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </Link>
        ) : (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white bg-gradient-to-br from-[#262626] to-[#111] min-h-[160px] sm:min-h-[190px] flex flex-col justify-center shadow-card ${
              !hasLeftCustom && maxDiscount < 5 ? 'md:col-span-2' : ''
            }`}
          >
            <span aria-hidden className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-primary/25 blur-2xl" />
            <span className="relative inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <MessageCircle className="w-4 h-4" /> Not sure what fits?
            </span>
            <span className="relative mt-2 text-2xl sm:text-3xl font-black leading-tight">
              Tell us your device,
              <br />
              we&apos;ll find the right one
            </span>
            <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-bold bg-green-600 group-hover:bg-green-700 text-white w-fit px-4 py-2 rounded-full transition-colors">
              WhatsApp {BRAND.whatsapp}
            </span>
          </a>
        )}
      </div>
    </section>
  );
}
