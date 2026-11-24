import { NextRequest, NextResponse } from 'next/server';
import { listProducts, type ProductSort } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

/** GET /api/products?category=&search=&brand=a,b&min=&max=&deals=true&featured=true&sort=newest|price-asc|price-desc|popular&page=&limit= */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  try {
    const result = await listProducts({
      category: p.get('category') || undefined,
      search: p.get('search') || undefined,
      brand: p.get('brand') || undefined,
      minPrice: Number(p.get('min')) || undefined,
      maxPrice: Number(p.get('max')) || undefined,
      deals: p.get('deals') === 'true',
      featured: p.get('featured') === 'true',
      sort: (p.get('sort') as ProductSort) || undefined,
      page: Number(p.get('page')) || 1,
      limit: Number(p.get('limit')) || 24,
    });
    return NextResponse.json({ success: true, data: result.products, total: result.total, page: result.page, pages: result.pages, brands: result.brands });
  } catch (error) {
    console.error('GET /api/products failed', error);
    return NextResponse.json({ success: false, error: 'Products are unavailable right now' }, { status: 503 });
  }
}
