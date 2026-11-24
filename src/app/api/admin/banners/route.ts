import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BannerModel from '@/models/Banner';
import { parseBannerInput } from '@/lib/banner-input';
import { InputError } from '@/lib/product-input';
import { revalidateStorefront } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

const toJson = (b: any) => ({ ...b, _id: String(b._id) });

/** GET /api/admin/banners — all banners, in display order. */
export async function GET() {
  try {
    await dbConnect();
    const banners = await BannerModel.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: banners.map(toJson) });
  } catch (error) {
    console.error('GET /api/admin/banners failed', error);
    return NextResponse.json({ success: false, error: 'Database unavailable. Check MONGODB_URI and Atlas Network Access.' }, { status: 503 });
  }
}

/** POST /api/admin/banners */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = parseBannerInput(await request.json());
    const banner = await BannerModel.create(data);
    revalidateStorefront();
    return NextResponse.json({ success: true, data: toJson(banner.toObject()), message: 'Banner added' }, { status: 201 });
  } catch (error) {
    if (error instanceof InputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    console.error('POST /api/admin/banners failed', error);
    return NextResponse.json({ success: false, error: 'Could not save the banner' }, { status: 500 });
  }
}
