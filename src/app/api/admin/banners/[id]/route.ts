import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import BannerModel from '@/models/Banner';
import { parseBannerInput } from '@/lib/banner-input';
import { InputError } from '@/lib/product-input';
import { revalidateStorefront } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };
const notFound = () => NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return notFound();
  try {
    await dbConnect();
    const data = parseBannerInput(await request.json(), { partial: true });
    const banner = await BannerModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
    if (!banner) return notFound();
    revalidateStorefront();
    return NextResponse.json({ success: true, data: { ...banner, _id: String(banner._id) }, message: 'Banner updated' });
  } catch (error) {
    if (error instanceof InputError) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    console.error('PATCH /api/admin/banners/[id] failed', error);
    return NextResponse.json({ success: false, error: 'Could not update the banner' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return notFound();
  try {
    await dbConnect();
    const banner = await BannerModel.findByIdAndDelete(id).lean();
    if (!banner) return notFound();
    revalidateStorefront();
    return NextResponse.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    console.error('DELETE /api/admin/banners/[id] failed', error);
    return NextResponse.json({ success: false, error: 'Could not delete the banner' }, { status: 500 });
  }
}
