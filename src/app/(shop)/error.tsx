'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BRAND } from '@/lib/constants';

/** Shown when a shop page can't load (for example the database is unreachable). */
export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const wa = `https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}`;

  return (
    <div className="container-custom py-20 text-center max-w-lg mx-auto">
      <h1 className="text-2xl font-black text-dark-300 mb-2">We&apos;ll be right back</h1>
      <p className="text-gray-500 text-sm mb-6">
        The shop couldn&apos;t load just now. Please try again in a moment, or order directly on WhatsApp.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button type="button" onClick={reset} className="btn-primary justify-center">
          Try again
        </button>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary justify-center bg-green-600 hover:bg-green-700">
          WhatsApp {BRAND.whatsapp}
        </a>
        <Link href="/" className="text-sm text-gray-500 hover:text-primary self-center">
          Home
        </Link>
      </div>
    </div>
  );
}
