import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import CategoryModel from '@/models/Category';
import ProductModel from '@/models/Product';
import { parseCategoryInput } from '@/lib/category-input';
import { InputError } from '@/lib/product-input';
import { revalidateStorefront } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };
const byIdOrSlug = (id: string) => (mongoose.isValidObjectId(id) ? { _id: id } : { slug: id.toLowerCase() });

/** PATCH /api/admin/categories/:id — renaming a slug moves its products with it. */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    await dbConnect();
    const existing = await CategoryModel.findOne(byIdOrSlug(id));
    if (!existing) return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });

    const data = await parseCategoryInput(await request.json(), { selfId: String(existing._id), partial: true });
    const oldSlug = existing.slug;
    if (data.slug && data.slug !== oldSlug && (await CategoryModel.exists({ slug: data.slug }))) {
      return NextResponse.json({ success: false, error: 'Another category already uses this slug' }, { status: 409 });
    }

    existing.set(data);
    await existing.save();
    if (data.slug && data.slug !== oldSlug) {
      await ProductModel.updateMany({ category: oldSlug }, { $set: { category: data.slug } });
    }

    revalidateStorefront();
    return NextResponse.json({ success: true, data: { ...existing.toObject(), _id: String(existing._id) }, message: 'Category updated' });
  } catch (error) {
    if (error instanceof InputError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('PATCH /api/admin/categories/[id] failed', error);
    return NextResponse.json({ success: false, error: 'Could not update the category' }, { status: 500 });
  }
}

/** DELETE /api/admin/categories/:id — only when it has no products and no sub-categories. */
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    await dbConnect();
    const category = await CategoryModel.findOne(byIdOrSlug(id));
    if (!category) return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });

    const [products, children] = await Promise.all([
      ProductModel.countDocuments({ category: category.slug }),
      CategoryModel.countDocuments({ parent: category._id }),
    ]);
    if (products || children) {
      return NextResponse.json(
        { success: false, error: `Move its ${products} product(s) and ${children} sub-categor${children === 1 ? 'y' : 'ies'} first` },
        { status: 409 }
      );
    }

    await category.deleteOne();
    revalidateStorefront();
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('DELETE /api/admin/categories/[id] failed', error);
    return NextResponse.json({ success: false, error: 'Could not delete the category' }, { status: 500 });
  }
}
