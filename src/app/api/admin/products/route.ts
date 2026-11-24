import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import { toProduct, getCategoryTree, categoryScope } from '@/lib/catalog';
import { parseProductInput, InputError } from '@/lib/product-input';
import { revalidateStorefront } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** GET /api/admin/products?page=&limit=&search=&category=&status=active|inactive|low-stock */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const page = Math.max(Number(p.get('page')) || 1, 1);
  const limit = Math.min(Math.max(Number(p.get('limit')) || 20, 1), 100);
  const search = (p.get('search') || '').trim();
  const category = (p.get('category') || '').trim().toLowerCase();
  const status = p.get('status') || '';

  try {
    await dbConnect();
    const filter: Record<string, any> = {};
    if (search) {
      const rx = new RegExp(escapeRegex(search.slice(0, 80)), 'i');
      filter.$or = [{ name: rx }, { brand: rx }, { tags: rx }, { slug: rx }];
    }
    if (category) {
      const { bySlug } = await getCategoryTree({ includeInactive: true });
      filter.category = { $in: categoryScope(category, bySlug) };
    }
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (status === 'low-stock') filter.stock = { $lt: 10 };

    const [docs, total] = await Promise.all([
      ProductModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      ProductModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: docs.map((d: any) => ({ ...toProduct(d), isActive: d.isActive !== false, isNewArrival: Boolean(d.isNewArrival) })),
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error('GET /api/admin/products failed', error);
    return NextResponse.json({ success: false, error: 'Database unavailable. Check MONGODB_URI and Atlas Network Access.' }, { status: 503 });
  }
}

/** POST /api/admin/products */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await parseProductInput(await request.json());
    if (await ProductModel.exists({ slug: data.slug })) {
      return NextResponse.json({ success: false, error: 'A product with this slug already exists' }, { status: 409 });
    }
    const product = await ProductModel.create(data);
    revalidateStorefront();
    return NextResponse.json({ success: true, data: toProduct(product.toObject()), message: 'Product created' }, { status: 201 });
  } catch (error) {
    if (error instanceof InputError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('POST /api/admin/products failed', error);
    return NextResponse.json({ success: false, error: 'Could not save the product' }, { status: 500 });
  }
}
