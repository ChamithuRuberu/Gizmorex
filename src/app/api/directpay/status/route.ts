import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

/** Finds the order only when the caller holds its secret status token (constant-time compare). */
async function findOrderWithToken(orderNumber: unknown, token: unknown) {
  if (typeof orderNumber !== 'string' || typeof token !== 'string' || !orderNumber || !token) return null;
  await dbConnect();
  const order = await Order.findOne({ orderNumber: orderNumber.slice(0, 40) }).select('+statusToken');
  if (!order) return null;
  const a = Buffer.from(token);
  const b = Buffer.from(order.statusToken || '');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return order;
}

/**
 * POST /api/directpay/status
 * The buyer's browser reports that the card window failed or was closed.
 * This can NEVER mark an order paid (only DirectPay's signed notification does that),
 * and it only touches orders that are still pending.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = await findOrderWithToken(body.order_id || body.orderNumber, body.token);
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

    const s = String(body.status || '').toLowerCase();
    if (order.paymentStatus === 'pending' && (s === 'failed' || s === 'cancelled')) {
      order.paymentStatus = s as 'failed' | 'cancelled';
      order.failureReason =
        s === 'cancelled'
          ? 'Payment was cancelled.'
          : String(body.message || 'Payment failed, please try again.').slice(0, 300);
      await order.save();
    }

    return NextResponse.json({ success: true, paymentStatus: order.paymentStatus, orderNumber: order.orderNumber });
  } catch (error) {
    console.error('Payment status update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update payment status' }, { status: 500 });
  }
}
