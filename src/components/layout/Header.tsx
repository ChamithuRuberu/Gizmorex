'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useNavItems } from '@/components/layout/useNavItems';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const router = useRouter();
  const itemCount = useCartStore(s => s.getItemCount());
  const wishlistCount = useWishlistStore(s => s.count());
  const openCart = useCartStore(s => s.openCart);
  const { categories, fetchCategories } = useCategoryStore();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems = useNavItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const cat = selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : '';
      router.push(`/products?search=${encodeURIComponent(searchQuery)}${cat}`);
      setSearchQuery('');
    }
  };

  return (
    <header className={`sticky top-0 z-40 bg-white transition-shadow ${isScrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
      <div className="container-custom">
        <div className="flex items-center gap-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <div className="relative w-36 h-10 hidden sm:block">
              <Image src="/logo.jpg" alt="Gizmorex" fill className="object-contain" priority />
            </div>
            <span className="sm:hidden text-2xl font-black tracking-tight">
              <span className="text-primary">GIZMO</span>
              <span className="text-dark-300">REX</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 hidden sm:flex items-center border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-primary transition-colors">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="hidden lg:block bg-gray-50 border-r border-gray-200 px-3 py-2.5 text-sm text-gray-600 focus:outline-none cursor-pointer max-w-[160px] truncate"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands..."
              className="flex-1 px-4 py-2.5 text-sm focus:outline-none"
            />
            <button type="submit" className="bg-primary hover:bg-primary-600 text-white px-4 py-2.5 transition-colors" aria-label="Search">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1 ml-auto sm:ml-0">
            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 hover:text-primary text-gray-600 transition-colors group" aria-label="Wishlist">
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button onClick={openCart} className="relative p-2 hover:text-primary text-gray-600 transition-colors group" aria-label="Shopping Cart">
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 p-2 hover:text-primary text-gray-600 transition-colors"
                aria-label="User Account"
              >
                <User className="w-5 h-5" />
                <ChevronDown className="w-3 h-3 hidden sm:block" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-slide-up z-50">
                  <Link href="/login" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary transition-colors">
                    <User className="w-4 h-4" /> Login
                  </Link>
                  <Link href="/register" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary transition-colors">
                    <Settings className="w-4 h-4" /> Register
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary transition-colors">
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                  <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary transition-colors">
                    <Settings className="w-4 h-4" /> Account
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="sm:hidden flex items-center gap-2 pb-3">
          <div className="flex-1 flex items-center border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-primary transition-colors">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
            />
            <button type="submit" className="bg-primary text-white px-3 py-2" aria-label="Search">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Nav Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-slide-up shadow-lg">
          <div className="container-custom py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
