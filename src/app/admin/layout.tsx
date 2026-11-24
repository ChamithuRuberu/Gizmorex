'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ArrowLeft,
  Grid3x3,
  Star,
  LogOut,
  ImageIcon,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-500 text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-dark-400">
          <Link href="/" className="block">
            <span className="text-2xl font-black tracking-tight">
              <span className="text-primary">GIZMO</span>
              <span className="text-white">REX</span>
            </span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary mt-2 block">
            Admin Console
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin')
                ? 'bg-[#FF6B00] text-white'
                : 'text-gray-300 hover:bg-dark-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/products')
                ? 'bg-[#FF6B00] text-white'
                : 'text-gray-300 hover:bg-dark-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            Products
          </Link>
          <Link
            href="/admin/categories"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/categories')
                ? 'bg-[#FF6B00] text-white'
                : 'text-gray-300 hover:bg-dark-400 hover:text-white'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            Categories
          </Link>
          <Link
            href="/admin/banners"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/banners')
                ? 'bg-[#FF6B00] text-white'
                : 'text-gray-300 hover:bg-dark-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Banners
          </Link>
          <Link
            href="/admin/orders"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/orders')
                ? 'bg-[#FF6B00] text-white'
                : 'text-gray-300 hover:bg-dark-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Orders
          </Link>
          <Link
            href="/admin/customers"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/customers')
                ? 'bg-[#FF6B00] text-white'
                : 'text-gray-300 hover:bg-dark-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Customers
          </Link>
          <Link
            href="/admin/reviews"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/reviews')
                ? 'bg-[#FF6B00] text-white'
                : 'text-gray-300 hover:bg-dark-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" />
            Reviews
          </Link>
        </nav>

        <div className="p-4 border-t border-dark-400 space-y-3">
          <button
            type="button"
            onClick={async () => {
              await fetch('/api/admin-auth', { method: 'DELETE' });
              window.location.href = '/admin-login';
            }}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-primary transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log out
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to store
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-dark-300">Admin Portal</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">
              Live Store
            </span>
            <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              AD
            </div>
          </div>
        </header>
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

