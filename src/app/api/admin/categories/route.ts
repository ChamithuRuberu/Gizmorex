import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CategoryModel from '@/models/Category';
import { getCategoryTree } from '@/lib/catalog';
import { parseCategoryInput } from '@/lib/category-input';
import { InputError } from '@/lib/product-input';
import { revalidateStorefront } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/categories
 * `data`: flat list in tree order (each parent followed by its sub-categories), with parentSlug and counts.
 * `tree`: top-level categories with `children`.
 */
export async function GET() {
  try {
    const { tree } = await getCategoryTree({ includeInactive: true });
    const flat = tree.flatMap(({ children = [], ...parent }) => [parent, ...children.map(({ children: _c, ...c }) => c)]);
    return NextResponse.json({ success: true, data: flat, tree });
  } catch (error) {
    console.error('GET /api/admin/categories failed', error);
    return NextResponse.json({ success: false, error: 'Database unavailable. Check MONGODB_URI and Atlas Network Access.' }, { status: 503 });
  }
}

/** POST /api/admin/categories */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await parseCategoryInput({ parent: '', ...(await request.json()) });
    if (await CategoryModel.exists({ slug: data.slug })) {
      return NextResponse.json({ success: false, error: 'A category with this slug already exists' }, { status: 409 });
    }
    const category = await CategoryModel.create({ isActive: true, ...data });
    revalidateStorefront();
    return NextResponse.json({ success: true, data: { ...category.toObject(), _id: String(category._id) }, message: 'Category created' }, { status: 201 });
  } catch (error) {
    if (error instanceof InputError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('POST /api/admin/categories failed', error);
    return NextResponse.json({ success: false, error: 'Could not save the category' }, { status: 500 });
  }
}
