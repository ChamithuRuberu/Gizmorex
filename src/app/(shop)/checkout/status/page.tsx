'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { BRAND } from '@/lib/constants';

type Status = {
  orderNumber: string;
  paymentMethod: 'cod' | 'bank' | 'directpay';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
  total: number;
  failureReason: string | null;
};

const POLL_MS = 3000;
const MAX_POLLS = 40; // about 2 minutes

function StatusView() {
  const params = useSearchParams();
  const order = params.get('order') || '';
  const token = params.get('token') || '';
  const clearCart = useCartStore((s) => s.clearCart);
  const [data, setData] = useState<Status | null>(null);
  const [error, setError] = useState('');
  const [polls, setPolls] = useState(0);

  useEffect(() => {
    if (!order || !token) {
      setError('Order not found');
      return;
    }
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(order)}/status?token=${token}`, { cache: 'no-store' });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        if (!stop) setData(json.data);
      } catch (e: any) {
        if (!stop) setError(e.message || 'Order not found');
      }
    };
    load();
    return () => {
      stop = true;
    };
  }, [order, token, polls]);

  // Card payments: keep checking until DirectPay's confirmation reaches the server.
  useEffect(() => {
    if (data?.paymentMethod !== 'directpay' || data.paymentStatus !== 'pending' || polls >= MAX_POLLS) return;
    const t = setTimeout(() => setPolls((p) => p + 1), POLL_MS);
    return () => clearTimeout(t);
  }, [data, polls]);

  useEffect(() => {
    if (data?.paymentStatus === 'paid') clearCart();
  }, [data, clearCart]);

  const wa = `https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi Gizmorex, my order number is ${order}`)}`;

  if (error) {
    return <Card icon={<XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />} title="Order not found" text={error} wa={wa} />;
  }
  if (!data) {
    return <Card icon={<Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />} title="Loading your order..." />;
  }

  const isCard = data.paymentMethod === 'directpay';
  if (isCard && data.paymentStatus === 'pending') {
    return polls >= MAX_POLLS ? (
      <Card
        icon={<Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />}
        title="Payment still processing"
        text="We haven't received the bank's confirmation yet. If money was taken from your card, WhatsApp us with your order number and we'll confirm it."
        order={data.orderNumber}
        wa={wa}
      />
    ) : (
      <Card icon={<Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />} title="Confirming your payment..." text="This usually takes a few seconds. Please don't close this page." order={data.orderNumber} />
    );
  }
  if (isCard && data.paymentStatus !== 'paid') {
    return (
      <Card
        icon={<XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />}
        title={data.paymentStatus === 'cancelled' ? 'Payment cancelled' : 'Payment failed'}
        text={data.failureReason || 'No money was taken. You can try again or choose Cash on Delivery.'}
        order={data.orderNumber}
        wa={wa}
        retry
      />
    );
  }

  const text =
    data.paymentStatus === 'paid'
      ? `Payment of ${formatPrice(data.total)} received. We'll WhatsApp you when it's dispatched.`
      : data.paymentMethod === 'bank'
        ? `Total ${formatPrice(data.total)}. We'll send our bank details on WhatsApp; send us the slip and we'll dispatch.`
        : `Total ${formatPrice(data.total)}, pay cash on delivery. We'll call or WhatsApp you to confirm.`;

  return <Card icon={<CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />} title="Order confirmed!" text={text} order={data.orderNumber} wa={wa} />;
}

function Card({ icon, title, text, order, wa, retry }: { icon: React.ReactNode; title: string; text?: string; order?: string; wa?: string; retry?: boolean }) {
  return (
    <div className="container-custom py-16 text-center max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-card p-8">
        {icon}
        <h1 className="text-2xl font-black text-dark-300 mb-2">{title}</h1>
        {text && <p className="text-gray-500 text-sm mb-4">{text}</p>}
        {order && (
          <div className="bg-orange-50 rounded-xl p-4 mb-6">
            <span className="text-xs text-gray-500">Order Number</span>
            <p className="text-lg font-black text-primary font-mono">{order}</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {retry && <Link href="/checkout" className="btn-primary w-full justify-center">Try again</Link>}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center bg-green-600 hover:bg-green-700">
              WhatsApp us
            </a>
          )}
          <Link href="/products" className="text-sm text-gray-500 hover:text-primary">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutStatusPage() {
  return (
    <Suspense fallback={null}>
      <StatusView />
    </Suspense>
  );
}
