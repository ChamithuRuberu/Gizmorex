import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/:orderNumber/status?token=...
 * Read-only. The buyer's browser polls this after paying; only DirectPay's signed
 * notification can change the status, never this route.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const token = req.nextUrl.searchParams.get('token') || '';

  await dbConnect();
  const order: any = await Order.findOne({ orderNumber })
    .select('+statusToken orderNumber paymentMethod paymentStatus orderStatus total failureReason')
    .lean();

  const a = Buffer.from(token);
  const b = Buffer.from(order?.statusToken || '');
  if (!order || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      total: order.total,
      failureReason: order.failureReason || null,
    },
  });
}
