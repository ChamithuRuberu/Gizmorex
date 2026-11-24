'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavItems } from '@/components/layout/useNavItems';

export default function Navbar() {
  const pathname = usePathname();
  const navItems = useNavItems();

  return (
    <nav className="bg-white border-b border-gray-100 hidden md:block">
      <div className="container-custom">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  isActive
                    ? 'text-primary border-primary font-semibold'
                    : 'text-gray-600 border-transparent hover:text-primary hover:border-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
