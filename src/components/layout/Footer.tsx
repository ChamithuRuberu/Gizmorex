'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import { useCategoryStore } from '@/store/categoryStore';

export default function Footer() {
  const { categories } = useCategoryStore();

  return (
    <footer className="bg-dark-500 text-gray-400">
      <div className="container-custom pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="text-2xl font-black tracking-tight mb-3">
              <span className="text-primary">GIZMO</span>
              <span className="text-white">REX</span>
            </div>
            <p className="text-sm leading-relaxed mb-5 text-gray-500">
              {BRAND.description}. Quality tech products with islandwide delivery.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-dark-400 hover:bg-primary flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', href: '/' },
                { label: 'All Products', href: '/products' },
                { label: 'All Categories', href: '/categories' },
                { label: 'Flash Deals', href: '/products?deals=true' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms & Conditions', href: '/terms' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2">
              {categories.slice(0, 8).map(cat => (
                <li key={cat.slug}>
                  <Link href={`/categories/${cat.slug}`} className="text-sm hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length > 8 && (
                <li>
                  <Link href="/categories" className="text-xs text-primary font-medium hover:underline">
                    View all {categories.length} categories →
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-sm">{BRAND.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`tel:${BRAND.phone}`} className="text-sm hover:text-primary transition-colors">{BRAND.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`mailto:${BRAND.email}`} className="text-sm hover:text-primary transition-colors">{BRAND.email}</a>
              </li>
              <li className="mt-4">
                <a
                  href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dark-400 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Gizmorex. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">We Accept:</span>
            {['VISA', 'MC', 'COD'].map(p => (
              <span key={p} className="bg-dark-400 text-gray-400 text-xs px-2 py-1 rounded font-semibold">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
