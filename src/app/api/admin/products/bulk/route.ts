import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import CategoryModel from '@/models/Category';
import { revalidateStorefront } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

const MAX_IDS = 500;
const ACTIONS = ['move', 'delete', 'activate', 'deactivate'] as const;
type Action = (typeof ACTIONS)[number];

/**
 * POST /api/admin/products/bulk
 * { action: 'move' | 'delete' | 'activate' | 'deactivate', ids: string[], category?: string }
 * Admin only (middleware covers /api/admin/*).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action as Action;
    const ids: string[] = Array.isArray(body.ids) ? [...new Set<string>(body.ids.map(String))] : [];

    if (!ACTIONS.includes(action)) {
      return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
    if (ids.length === 0 || ids.length > MAX_IDS || !ids.every((id) => mongoose.isValidObjectId(id))) {
      return NextResponse.json({ success: false, error: `Select between 1 and ${MAX_IDS} products` }, { status: 400 });
    }

    await dbConnect();
    const filter = { _id: { $in: ids } };

    if (action === 'move') {
      const slug = String(body.category || '').trim().toLowerCase();
      const target = slug ? await CategoryModel.findOne({ slug }).lean() : null;
      if (!target) return NextResponse.json({ success: false, error: 'Choose an existing category to move to' }, { status: 400 });
      const res = await ProductModel.updateMany(filter, { $set: { category: slug } });
      revalidateStorefront();
      return NextResponse.json({ success: true, count: res.modifiedCount, message: `Moved ${res.matchedCount} product(s) to ${(target as any).name}` });
    }

    if (action === 'delete') {
      const res = await ProductModel.deleteMany(filter);
      revalidateStorefront();
      return NextResponse.json({ success: true, count: res.deletedCount, message: `Deleted ${res.deletedCount} product(s)` });
    }

    const res = await ProductModel.updateMany(filter, { $set: { isActive: action === 'activate' } });
    revalidateStorefront();
    return NextResponse.json({
      success: true,
      count: res.modifiedCount,
      message: `${action === 'activate' ? 'Activated' : 'Deactivated'} ${res.matchedCount} product(s)`,
    });
  } catch (error) {
    console.error('POST /api/admin/products/bulk failed', error);
    return NextResponse.json({ success: false, error: 'Bulk update failed' }, { status: 500 });
  }
}
