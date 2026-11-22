'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import type { AdminStats } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Total Revenue
            </span>
            <div className="p-2 bg-orange-100 text-primary rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-dark-300">
            {formatPrice(stats?.totalRevenue || 0)}
          </p>
          <span className="text-xs text-gray-500 mt-2 block">
            All time earnings
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Total Orders
            </span>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-dark-300">
            {stats?.totalOrders || 0}
          </p>
          <Link
            href="/admin/orders?status=pending"
            className="text-xs text-orange-600 font-semibold flex items-center gap-1 mt-2 hover:underline"
          >
            <Clock className="w-3.5 h-3.5" /> {stats?.pendingOrders || 0} pending
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Products
            </span>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-dark-300">
            {stats?.totalProducts || 0}
          </p>
          <Link
            href="/admin/products?status=low-stock"
            className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-2 hover:underline"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> {stats?.lowStockProducts || 0}{' '}
            low stock
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Customers
            </span>
            <div className="p-2 bg-green-100 text-green-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-dark-300">
            {stats?.totalCustomers || 0}
          </p>
          <Link
            href="/admin/customers"
            className="text-xs text-primary font-semibold hover:underline mt-2 block"
          >
            View all customers →
          </Link>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-dark-300">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-primary font-semibold hover:underline"
            >
              View all orders →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentOrders.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark-300">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">
                    {formatPrice(order.total)}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      order.orderStatus === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.orderStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-dark-300">
              Top Selling Products
            </h2>
            <Link
              href="/admin/products"
              className="text-xs text-primary font-semibold hover:underline"
            >
              View all products →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.topProducts.slice(0, 5).map((product) => (
              <div
                key={product._id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark-300 truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{product.sold} sold</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{product.rating}</span>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-sm text-primary">
                  {formatPrice(product.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products/new"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-4 text-center transition-all"
          >
            <Package className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-semibold">Add Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-4 text-center transition-all"
          >
            <ShoppingCart className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-semibold">Manage Orders</span>
          </Link>
          <Link
            href="/admin/categories"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-4 text-center transition-all"
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-semibold">Categories</span>
          </Link>
          <Link
            href="/admin/reviews"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-4 text-center transition-all"
          >
            <Star className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-semibold">Reviews</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

