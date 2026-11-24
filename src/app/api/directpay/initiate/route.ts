import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

/**
 * POST /api/directpay/initiate
 * Initiates DirectPay IPG payment session with HMAC-SHA256 signature and base64 payload.
 * Supports passing order_id to fetch details from DB, or direct customer/amount parameters.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order_id = body.order_id || body.orderNumber;

    const merchant_id = process.env.DIRECTPAY_MERCHANT_ID;
    const secret = process.env.DIRECTPAY_SECRET_KEY;
    const stage = process.env.DIRECTPAY_STAGE === 'PROD' ? 'PROD' : 'DEV';
    const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://gizmorex.onrender.com').replace(/\/$/, '');

    if (!merchant_id || !secret) {
      console.error('DirectPay credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    let amount = body.amount;
    let customer_name = body.customer_name || '';
    let customer_email = body.customer_email || '';
    let customer_phone = body.customer_phone || '';
    let currency = body.currency || 'LKR';

    // If order_id is provided, verify against DB
    if (order_id) {
      await dbConnect();
      const order = await Order.findOne({ orderNumber: order_id });
      if (order) {
        amount = order.total.toFixed(2);
        customer_name = customer_name || order.shippingAddress.fullName || 'Customer';
        customer_email = customer_email || order.shippingAddress.email || '';
        customer_phone = customer_phone || order.shippingAddress.phone || '';
      }
    }

    if (!amount || !order_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: order_id and amount' },
        { status: 400 }
      );
    }

    const [firstName, ...rest] = (customer_name || 'Customer').trim().split(/\s+/);

    const json_payload = {
      merchant_id,
      amount: Number(amount).toFixed(2),
      type: 'ONE_TIME',
      order_id,
      currency,
      response_url: `${siteUrl}/api/directpay/notify`,
      return_url: `${siteUrl}/checkout/status?gateway=directpay&order_id=${encodeURIComponent(order_id)}`,
      first_name: firstName || 'Customer',
      last_name: rest.join(' '),
      email: customer_email || '',
      phone: customer_phone || '',
      logo: '',
    };

    const encoded_payload = Buffer.from(JSON.stringify(json_payload)).toString('base64');
    const signature = crypto.createHmac('sha256', secret).update(encoded_payload).digest('hex');

    return NextResponse.json({
      success: true,
      signature,
      dataString: encoded_payload,
      stage,
    });
  } catch (error) {
    console.error('DirectPay initiate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate DirectPay payment' },
      { status: 500 }
    );
  }
}
