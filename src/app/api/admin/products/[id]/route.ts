import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import { toProduct } from '@/lib/catalog';
import { parseProductInput, InputError } from '@/lib/product-input';
import { revalidateStorefront } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

/** Accepts a Mongo _id or a slug. */
function byIdOrSlug(id: string) {
  return mongoose.isValidObjectId(id) ? { _id: id } : { slug: id.toLowerCase() };
}

function adminView(doc: any) {
  return { ...toProduct(doc), isActive: doc.isActive !== false, isNewArrival: Boolean(doc.isNewArrival) };
}

const unavailable = (error: unknown, where: string) => {
  console.error(where, error);
  return NextResponse.json({ success: false, error: 'Database unavailable. Check MONGODB_URI and Atlas Network Access.' }, { status: 503 });
};

export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    await dbConnect();
    const doc = await ProductModel.findOne(byIdOrSlug(id)).lean();
    if (!doc) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: adminView(doc) });
  } catch (error) {
    return unavailable(error, 'GET /api/admin/products/[id] failed');
  }
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    await dbConnect();
    const data = await parseProductInput(await request.json(), { partial: true });
    const existing = await ProductModel.findOne(byIdOrSlug(id)).select('_id').lean();
    if (!existing) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

    if (data.slug && (await ProductModel.exists({ slug: data.slug, _id: { $ne: existing._id } }))) {
      return NextResponse.json({ success: false, error: 'Another product already uses this slug' }, { status: 409 });
    }

    const doc = await ProductModel.findByIdAndUpdate(existing._id, { $set: data }, { new: true, runValidators: true }).lean();
    revalidateStorefront();
    return NextResponse.json({ success: true, data: adminView(doc), message: 'Product updated' });
  } catch (error) {
    if (error instanceof InputError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return unavailable(error, 'PATCH /api/admin/products/[id] failed');
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    await dbConnect();
    const doc = await ProductModel.findOneAndDelete(byIdOrSlug(id)).lean();
    if (!doc) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    revalidateStorefront();
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    return unavailable(error, 'DELETE /api/admin/products/[id] failed');
  }
}
