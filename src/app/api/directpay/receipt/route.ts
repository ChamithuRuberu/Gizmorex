import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { formatPrice } from '@/lib/utils';
import { BRAND } from '@/lib/constants';

export const dynamic = 'force-dynamic';

/**
 * GET /api/directpay/receipt?order_id=...
 * Generates an official downloadable payment receipt for a paid DirectPay order.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const order_id = searchParams.get('order_id') || searchParams.get('orderNumber') || '';
    const token = searchParams.get('token') || '';

    await dbConnect();
    const order = (await Order.findOne({ orderNumber: order_id.slice(0, 40) })
      .select('+statusToken')
      .lean()) as any;

    // Receipt holds personal details: needs the secret token and a settled payment.
    const a = Buffer.from(token);
    const b = Buffer.from(order?.statusToken || '');
    if (!order || !token || a.length !== b.length || !crypto.timingSafeEqual(a, b) || order.paymentStatus !== 'paid') {
      return new NextResponse('Order not found', { status: 404 });
    }

    const dateStr = order.paidAt ? new Date(order.paidAt).toLocaleString('en-LK') : new Date().toLocaleString('en-LK');
    const itemsList = order.items
      .map((item: any, i: number) => `  ${i + 1}. ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`)
      .join('\n');

    const receipt = `=====================================================
                  PAYMENT RECEIPT
                   ${BRAND.name.toUpperCase()}
=====================================================

Order Number:       ${order.orderNumber}
Payment Gateway:    DirectPay IPG (Online Card Payment)
Payment Status:     ${order.paymentStatus.toUpperCase()}
Transaction Date:   ${dateStr}

CUSTOMER DETAILS
-----------------------------------------------------
Name:               ${order.shippingAddress.fullName}
Phone:              ${order.shippingAddress.phone}
Email:              ${order.shippingAddress.email || 'N/A'}
Delivery Address:   ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}

ORDER ITEMS
-----------------------------------------------------
${itemsList}

FINANCIAL BREAKDOWN
-----------------------------------------------------
Subtotal:           ${formatPrice(order.subtotal)}
Shipping Fee:       ${formatPrice(order.shippingCost)}
Discount:           -${formatPrice(order.discount || 0)}
Total Amount Paid:  ${formatPrice(order.total)}

=====================================================
Thank you for shopping with ${BRAND.name}!
For support, WhatsApp us at ${BRAND.whatsapp}
Website: ${process.env.NEXT_PUBLIC_APP_URL || 'https://gizmorex.onrender.com'}
=====================================================
`;

    return new NextResponse(receipt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="receipt-${order.orderNumber}.txt"`,
      },
    });
  } catch (error) {
    console.error('DirectPay receipt download error:', error);
    return new NextResponse('Error generating receipt', { status: 500 });
  }
}
