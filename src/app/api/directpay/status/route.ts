import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

/**
 * POST /api/directpay/status
 * Updates order payment status from client-side DirectPay callback or webhook.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order_id = body.order_id || body.orderNumber;
    const status = body.status || '';
    const message = body.message || body.failureReason || '';

    if (!order_id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    await dbConnect();

    let paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled' = 'pending';
    const s = String(status).toLowerCase();
    if (s === 'success' || s === 'paid' || s === 'successful') {
      paymentStatus = 'paid';
    } else if (s === 'failed' || s === 'fail') {
      paymentStatus = 'failed';
    } else if (s === 'cancelled' || s === 'canceled') {
      paymentStatus = 'cancelled';
    }

    const order = await Order.findOne({ orderNumber: order_id });
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Only update if not already settled as paid
    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid') {
        order.paidAt = new Date();
        order.orderStatus = 'confirmed';
        order.failureReason = undefined;

        // Reserve stock once paid
        for (const item of order.items) {
          if (item.product) {
            await Product.updateOne(
              { _id: item.product },
              { $inc: { stock: -item.quantity, sold: item.quantity } }
            );
          }
        }
      } else if (paymentStatus === 'failed') {
        order.failureReason = message || 'Payment failed, please try again.';
      } else if (paymentStatus === 'cancelled') {
        order.failureReason = 'Payment was cancelled by user.';
      }
      await order.save();
    }

    return NextResponse.json({
      success: true,
      paymentStatus: order.paymentStatus,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('Payment status update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update payment status' }, { status: 500 });
  }
}

/**
 * GET /api/directpay/status?order_id=...
 * Reads payment status for order polling and verification.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const order_id = searchParams.get('order_id') || searchParams.get('orderNumber');

    if (!order_id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    await dbConnect();
    const order = (await Order.findOne({ orderNumber: order_id }).lean()) as any;

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: order.paymentStatus,
      orderNumber: order.orderNumber,
      total: order.total,
      paymentMethod: order.paymentMethod,
      message: order.failureReason || (order.paymentStatus === 'paid' ? 'Payment successful' : 'Payment pending'),
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get payment status' }, { status: 500 });
  }
}
