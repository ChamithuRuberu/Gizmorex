import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifyDirectPayNotification, mapDirectPayStatus } from '@/lib/directpay';

export const dynamic = 'force-dynamic';

/**
 * DirectPay server-to-server notification (response_url).
 * This is the ONLY place an order becomes "paid": the signature must match and
 * the amount must equal the total saved on the order.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  let payload: Record<string, any> | null;
  try {
    payload = verifyDirectPayNotification(rawBody, req.headers.get('authorization'));
  } catch (e) {
    console.error('DirectPay not configured', e);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
  if (!payload) {
    return NextResponse.json({ status: 'verification_failed' }, { status: 401 });
  }

  const orderNumber = String(payload.order_id || '');
  const tx = payload.transaction || {};
  const status = mapDirectPayStatus(tx.status || payload.status);
  const amount = Number(tx.amount ?? payload.amount);
  const message = String(tx.message || payload.message || '').slice(0, 300);

  await dbConnect();
  const order = await Order.findOne({ orderNumber, paymentMethod: 'directpay' });
  if (!order) {
    console.warn('DirectPay notification for unknown order', orderNumber);
    return NextResponse.json({ status: 'received' });
  }

  // Already settled: acknowledge repeats without changing anything.
  if (order.paymentStatus === 'paid') {
    return NextResponse.json({ status: 'received' });
  }

  if (status === 'paid') {
    if (!Number.isFinite(amount) || Math.abs(amount - order.total) > 0.009) {
      console.error('DirectPay amount mismatch', { orderNumber, amount, expected: order.total });
      order.paymentStatus = 'failed';
      order.failureReason = 'Amount mismatch, please contact Gizmorex';
      await order.save();
      return NextResponse.json({ status: 'received' });
    }
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.gatewayTransactionId = String(tx.id || payload.transaction_id || '') || undefined;
    order.failureReason = undefined;
    await order.save();

    // Reserve stock once the money is in.
    for (const item of order.items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity, sold: item.quantity } });
    }
  } else if (status === 'failed' || status === 'cancelled') {
    order.paymentStatus = status;
    order.failureReason = message || undefined;
    await order.save();
  }

  return NextResponse.json({ status: 'received' });
}
