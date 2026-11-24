import { NextResponse } from 'next/server';
import { getCategoryTree } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

/** GET /api/categories → top-level categories with `children` and live product counts. */
export async function GET() {
  try {
    const { tree } = await getCategoryTree();
    return NextResponse.json({ success: true, data: tree });
  } catch (error) {
    console.error('GET /api/categories failed', error);
    return NextResponse.json({ success: false, error: 'Categories are unavailable right now' }, { status: 503 });
  }
}
