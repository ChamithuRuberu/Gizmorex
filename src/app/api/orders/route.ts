import { NextResponse } from 'next/server';
import crypto from 'crypto';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { generateOrderNumber } from '@/lib/utils';
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD, SL_DISTRICTS } from '@/lib/constants';
import { createDirectPaySession, isDirectPayConfigured } from '@/lib/directpay';

export const dynamic = 'force-dynamic';

const METHODS = ['cod', 'bank', 'directpay'] as const;
type Method = (typeof METHODS)[number];

// Best-effort per-IP limit (in-memory, per server instance): slows order spam and card testing.
const hits = new Map<string, number[]>();
function rateLimited(ip: string, max = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return recent.length > max;
}

const clean = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * POST /api/orders — create an order.
 * Body: { items: [{ productId, slug, quantity }], shipping: {...}, paymentMethod, notes }
 * Prices, totals and stock are taken from the database; anything price-like in the body is ignored.
 */
export async function POST(request: Request) {
  const ip = (request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ success: false, error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }

  const paymentMethod = body?.paymentMethod as Method;
  if (!METHODS.includes(paymentMethod)) {
    return NextResponse.json({ success: false, error: 'Choose a payment method' }, { status: 400 });
  }
  if (paymentMethod === 'directpay' && !isDirectPayConfigured()) {
    return NextResponse.json({ success: false, error: 'Card payments are not available right now' }, { status: 503 });
  }

  const s = body?.shipping || {};
  const shippingAddress = {
    fullName: clean(s.fullName, 100),
    phone: clean(s.phone, 20),
    email: clean(s.email, 120),
    addressLine1: clean(s.addressLine1),
    addressLine2: clean(s.addressLine2),
    city: clean(s.city, 80),
    district: clean(s.district, 40),
    postalCode: clean(s.postalCode, 10),
  };
  if (!shippingAddress.fullName || !/^\+?[0-9 ]{9,15}$/.test(shippingAddress.phone) || !shippingAddress.addressLine1 || !shippingAddress.city) {
    return NextResponse.json({ success: false, error: 'Please fill in name, a valid phone number, address and city' }, { status: 400 });
  }
  if (!SL_DISTRICTS.includes(shippingAddress.district)) {
    return NextResponse.json({ success: false, error: 'Choose a district' }, { status: 400 });
  }

  const requested: { productId?: string; slug?: string; quantity: number }[] = Array.isArray(body?.items) ? body.items : [];
  if (requested.length === 0 || requested.length > 50) {
    return NextResponse.json({ success: false, error: 'Your cart is empty' }, { status: 400 });
  }

  try {
    await dbConnect();
  } catch {
    return NextResponse.json({ success: false, error: 'We could not take orders right now. Please WhatsApp us.' }, { status: 503 });
  }

  // Re-price every line from the database.
  const items = [];
  for (const line of requested) {
    const quantity = Math.floor(Number(line?.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      return NextResponse.json({ success: false, error: 'Invalid quantity' }, { status: 400 });
    }
    const byId = line?.productId && mongoose.isValidObjectId(line.productId);
    const product: any = await Product.findOne(
      byId ? { _id: line.productId } : { slug: clean(line?.slug, 200).toLowerCase() }
    ).lean();

    if (!product || !product.isActive) {
      return NextResponse.json({ success: false, error: 'An item in your cart is no longer available' }, { status: 409 });
    }
    if (product.stock < quantity) {
      return NextResponse.json({ success: false, error: `Only ${product.stock} left of ${product.name}` }, { status: 409 });
    }
    items.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.price,
      quantity,
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;
  const statusToken = crypto.randomBytes(24).toString('hex');

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    items,
    shippingAddress,
    paymentMethod,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    subtotal,
    shippingCost,
    total,
    statusToken,
    paymentGateway: paymentMethod === 'directpay' ? 'directpay' : undefined,
    notes: clean(body?.notes, 500),
  });

  const result: Record<string, unknown> = {
    orderNumber: order.orderNumber,
    statusToken,
    total,
    paymentMethod,
  };

  if (paymentMethod === 'directpay') {
    result.directpay = createDirectPaySession({
      orderNumber: order.orderNumber,
      total,
      statusToken,
      fullName: shippingAddress.fullName,
      email: shippingAddress.email,
      phone: shippingAddress.phone,
    });
  }

  return NextResponse.json({ success: true, data: result }, { status: 201 });
}
