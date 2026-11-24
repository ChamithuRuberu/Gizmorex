import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

/** GET /api/products/:slug */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = await getProductBySlug(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('GET /api/products/[id] failed', error);
    return NextResponse.json({ success: false, error: 'Product is unavailable right now' }, { status: 503 });
  }
}
