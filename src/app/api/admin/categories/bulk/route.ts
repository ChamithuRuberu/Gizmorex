import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import CategoryModel from '@/models/Category';
import ProductModel from '@/models/Product';
import { revalidateStorefront } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

const MAX_IDS = 200;

/**
 * POST /api/admin/categories/bulk
 * { action: 'delete', ids: string[], cascade?: boolean }
 *  - cascade false (default): only empty categories (no products, no sub-categories) are deleted;
 *    the rest are reported back and left alone.
 *  - cascade true: also deletes the selected categories' sub-categories and ALL their products.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body.ids) ? [...new Set<string>(body.ids.map(String))] : [];
    if (body.action !== 'delete') return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    if (ids.length === 0 || ids.length > MAX_IDS || !ids.every((id) => mongoose.isValidObjectId(id))) {
      return NextResponse.json({ success: false, error: `Select between 1 and ${MAX_IDS} categories` }, { status: 400 });
    }

    await dbConnect();
    const selected = await CategoryModel.find({ _id: { $in: ids } }).lean();
    if (selected.length === 0) return NextResponse.json({ success: false, error: 'Categories not found' }, { status: 404 });

    if (body.cascade === true) {
      const all = await CategoryModel.find({}, { _id: 1, slug: 1, parent: 1 }).lean();
      const doomed = new Set(selected.map((c: any) => String(c._id)));
      // include every descendant of a selected category
      for (let grew = true; grew; ) {
        grew = false;
        for (const c of all as any[]) {
          if (c.parent && doomed.has(String(c.parent)) && !doomed.has(String(c._id))) {
            doomed.add(String(c._id));
            grew = true;
          }
        }
      }
      const slugs = (all as any[]).filter((c) => doomed.has(String(c._id))).map((c) => c.slug);
      const products = await ProductModel.deleteMany({ category: { $in: slugs } });
      const cats = await CategoryModel.deleteMany({ _id: { $in: [...doomed] } });
      revalidateStorefront();
      return NextResponse.json({
        success: true,
        deleted: cats.deletedCount,
        productsDeleted: products.deletedCount,
        message: `Deleted ${cats.deletedCount} categor${cats.deletedCount === 1 ? 'y' : 'ies'} and ${products.deletedCount} product(s)`,
      });
    }

    const deletable: string[] = [];
    const blocked: string[] = [];
    for (const c of selected as any[]) {
      const [products, children] = await Promise.all([
        ProductModel.countDocuments({ category: c.slug }, { limit: 1 }),
        CategoryModel.countDocuments({ parent: c._id }, { limit: 1 }),
      ]);
      (products || children ? blocked : deletable).push(products || children ? c.name : String(c._id));
    }
    const res = deletable.length ? await CategoryModel.deleteMany({ _id: { $in: deletable } }) : { deletedCount: 0 };
    if (res.deletedCount) revalidateStorefront();
    return NextResponse.json({
      success: true,
      deleted: res.deletedCount,
      blocked,
      message: blocked.length
        ? `Deleted ${res.deletedCount}. Not deleted (still have products or sub-categories): ${blocked.join(', ')}`
        : `Deleted ${res.deletedCount} categor${res.deletedCount === 1 ? 'y' : 'ies'}`,
    });
  } catch (error) {
    console.error('POST /api/admin/categories/bulk failed', error);
    return NextResponse.json({ success: false, error: 'Bulk delete failed' }, { status: 500 });
  }
}
