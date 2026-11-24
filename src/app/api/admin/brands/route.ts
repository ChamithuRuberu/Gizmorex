import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BrandModel from '@/models/Brand';
import ProductModel from '@/models/Product';
import { revalidateStorefront } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

/** GET /api/admin/brands: every brand used by a product, with its saved logo and settings. */
export async function GET() {
  try {
    await dbConnect();
    const [counts, saved] = await Promise.all([
      ProductModel.aggregate<{ _id: string; count: number }>([
        { $match: { brand: { $nin: ['', null, 'Generic'] } } },
        { $group: { _id: { $toLower: '$brand' }, name: { $first: '$brand' }, count: { $sum: 1 } } },
        { $project: { _id: 1, name: 1, count: 1 } },
        { $sort: { count: -1 } },
      ]),
      BrandModel.find().lean(),
    ]);
    const byKey = new Map(saved.map((b: any) => [b.key, b]));
    const data = (counts as any[]).map((c) => {
      const s: any = byKey.get(c._id);
      return {
        key: c._id,
        name: s?.name || c.name,
        count: c.count,
        logo: s?.logo || '',
        isActive: s ? s.isActive !== false : true,
        sortOrder: s?.sortOrder ?? 0,
      };
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET /api/admin/brands failed', error);
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }
}

/** PUT /api/admin/brands { key, name?, logo?, isActive?, sortOrder? }: save one brand's display settings. */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const key = String(body.key || '').trim().toLowerCase().slice(0, 80);
    if (!key) return NextResponse.json({ success: false, error: 'Brand is required' }, { status: 400 });

    const set: Record<string, unknown> = {};
    if (typeof body.name === 'string' && body.name.trim()) set.name = body.name.trim().slice(0, 80);
    if (typeof body.logo === 'string') {
      const logo = body.logo.trim();
      if (logo && !/^https:\/\/res\.cloudinary\.com\//.test(logo)) {
        return NextResponse.json({ success: false, error: 'Upload the logo here so it is stored on Cloudinary' }, { status: 400 });
      }
      set.logo = logo;
    }
    if (typeof body.isActive === 'boolean') set.isActive = body.isActive;
    if (Number.isFinite(Number(body.sortOrder))) set.sortOrder = Math.trunc(Number(body.sortOrder));

    await dbConnect();
    const brand = await BrandModel.findOneAndUpdate(
      { key },
      { $set: set, $setOnInsert: { key, ...(set.name ? {} : { name: String(body.name || key) }) } },
      { upsert: true, new: true }
    ).lean();
    revalidateStorefront();
    return NextResponse.json({ success: true, data: brand, message: 'Brand saved' });
  } catch (error) {
    console.error('PUT /api/admin/brands failed', error);
    return NextResponse.json({ success: false, error: 'Could not save the brand' }, { status: 500 });
  }
}
