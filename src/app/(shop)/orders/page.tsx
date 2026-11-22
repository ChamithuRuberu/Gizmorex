'use client';
import { useState } from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { formatPrice } from '@/lib/utils';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

interface MockOrder {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  itemsCount: number;
}

const SAMPLE_ORDERS: MockOrder[] = [
  { id: '1', orderNumber: 'GZX-M89J-91KD', date: '2024-03-12', total: 389900, status: 'processing', itemsCount: 1 },
  { id: '2', orderNumber: 'GZX-K42B-32PA', date: '2024-02-28', total: 48800, status: 'delivered', itemsCount: 2 },
];

export default function OrdersPage() {
  const [orders] = useState<MockOrder[]>(SAMPLE_ORDERS);

  const getStatusBadge = (status: MockOrder['status']) => {
    switch (status) {
      case 'delivered':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
      case 'shipped':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700"><Truck className="w-3.5 h-3.5" /> In Transit</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-primary"><Clock className="w-3.5 h-3.5" /> Processing</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">Pending</span>;
    }
  };

  return (
    <div className="container-custom py-6">
      <Breadcrumb items={[{ label: 'Orders' }]} />
      <h1 className="text-2xl font-bold text-dark-300 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center max-w-md mx-auto">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-dark-300 mb-2">No orders placed yet</h2>
          <p className="text-sm text-gray-500 mb-6">When you place an order, it will appear here.</p>
          <Link href="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono font-bold text-dark-300 text-sm">{order.orderNumber}</span>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-xs text-gray-500">Ordered on {order.date} • {order.itemsCount} item(s)</p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-lg font-black text-primary">{formatPrice(order.total)}</span>
                <button className="btn-outline text-xs py-1.5 px-3">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

