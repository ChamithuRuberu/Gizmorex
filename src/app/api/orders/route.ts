import { NextResponse } from 'next/server';
import { generateOrderNumber } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = generateOrderNumber();

    const order = {
      _id: 'mock_' + Date.now(),
      orderNumber,
      ...body,
      orderStatus: 'pending',
      paymentStatus: body.paymentMethod === 'cod' ? 'pending' : 'paid',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}

