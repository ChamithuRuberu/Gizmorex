import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CategoryModel from '@/models/Category';
import ProductModel from '@/models/Product';
import { CATEGORY_TREE, PRODUCT_CATEGORY_MAP } from '@/lib/taxonomy';
import { revalidateStorefront } from '@/lib/revalidate';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/seed — "Sync categories". Safe to run more than once.
 * 1. Creates any missing categories from the Gizmorex tree (never overwrites your edits).
 * 2. Moves products that still use an old category to their sub-category.
 * 3. Deletes old categories that are no longer in use.
 */
export async function POST() {
  try {
    await dbConnect();

    // 1. Categories
    let created = 0;
    for (const [i, node] of CATEGORY_TREE.entries()) {
      const parent = await CategoryModel.findOneAndUpdate(
        { slug: node.slug },
        { $setOnInsert: { name: node.name, slug: node.slug, icon: node.icon, parent: null, sortOrder: i, isActive: true } },
        { upsert: true, new: true }
      );
      for (const [j, child] of (node.children ?? []).entries()) {
        const res = await CategoryModel.updateOne(
          { slug: child.slug },
          { $setOnInsert: { name: child.name, slug: child.slug, icon: node.icon, parent: parent!._id, sortOrder: j, isActive: true } },
          { upsert: true }
        );
        created += res.upsertedCount;
      }
    }

    // 2. Products still on an old category (edits you made to the new ones are kept)
    const treeSlugs = CATEGORY_TREE.flatMap((n) => [n.slug, ...(n.children ?? []).map((c) => c.slug)]);
    let moved = 0;
    for (const [productSlug, categorySlug] of Object.entries(PRODUCT_CATEGORY_MAP)) {
      const res = await ProductModel.updateOne(
        { slug: productSlug, category: { $nin: treeSlugs } },
        { $set: { category: categorySlug } }
      );
      moved += res.modifiedCount;
    }

    // 3. Old categories with no products and no sub-categories
    let removed = 0;
    for (const cat of await CategoryModel.find({ slug: { $nin: treeSlugs } })) {
      const inUse =
        (await ProductModel.exists({ category: cat.slug })) || (await CategoryModel.exists({ parent: cat._id }));
      if (!inUse) {
        await cat.deleteOne();
        removed++;
      }
    }

    const uncategorised = await ProductModel.countDocuments({ category: { $nin: [...(await CategoryModel.distinct('slug'))] } });
    revalidateStorefront();
    return NextResponse.json({
      success: true,
      message: `Categories synced: ${created} added, ${moved} products moved, ${removed} old categories removed${
        uncategorised ? `, ${uncategorised} products need a category` : ''
      }.`,
      data: { created, moved, removed, uncategorised },
    });
  } catch (error) {
    console.error('POST /api/admin/seed failed', error);
    return NextResponse.json({ success: false, error: 'Database unavailable. Check MONGODB_URI and Atlas Network Access.' }, { status: 503 });
  }
}
