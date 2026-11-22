import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { syncCategoryProductCounts } from '@/lib/category-sync';
import { updateFallbackCategory, deleteFallbackCategory } from '@/lib/category-store';

// PATCH /api/admin/categories/[id] - Update category
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const updateFields: any = { ...body };
  if (updateFields.slug) {
    updateFields.slug = updateFields.slug.toLowerCase().trim();
  }
  if (updateFields.name) {
    updateFields.name = updateFields.name.trim();
  }

  try {
    await dbConnect();

    let category = null;

    // 1. Try finding by 24-char hex MongoDB ObjectId
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );
    }

    // 2. If not found or if id was a slug or fallback key (e.g. cat_smartphones)
    if (!category) {
      const cleanSlug = (updateFields.slug || id.replace(/^cat_/, '')).toLowerCase();
      category = await Category.findOneAndUpdate(
        {
          $or: [
            { slug: cleanSlug },
            { slug: id.toLowerCase() },
            { name: { $regex: new RegExp(`^${updateFields.name || id}$`, 'i') } },
          ],
        },
        { $set: updateFields },
        { new: true, upsert: true, runValidators: true }
      );
    }

    if (category) {
      // Also update in-memory cache
      updateFallbackCategory(category.slug, {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        icon: category.icon,
        color: category.color,
        sortOrder: category.sortOrder,
      });

      // Refresh category product counts
      await syncCategoryProductCounts([category.name, category.slug]);

      return NextResponse.json({
        success: true,
        data: category,
        message: 'Category updated successfully!',
      });
    }
  } catch (error: any) {
    console.warn('PATCH Category DB notice (fallback cache used):', error.message);
  }

  // Resilient fallback update when MongoDB is unreachable / IP not whitelisted
  const fallbackCategory = updateFallbackCategory(id, updateFields);

  return NextResponse.json({
    success: true,
    data: fallbackCategory,
    message: 'Category updated in local cache! (Whitelist your IP in MongoDB Atlas to persist to cloud)',
  });
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await dbConnect();

    let category = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id);
    } else {
      category = await Category.findOne({
        $or: [
          { slug: id.toLowerCase() },
          { slug: id.replace(/^cat_/, '').toLowerCase() },
          { name: { $regex: new RegExp(`^${id}$`, 'i') } },
        ],
      });
    }

    if (category) {
      // Check if category has products
      const productCount = await Product.countDocuments({
        $or: [
          { category: { $regex: new RegExp(`^${category.name}$`, 'i') } },
          { category: { $regex: new RegExp(`^${category.slug}$`, 'i') } },
        ],
      });

      if (productCount > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot delete "${category.name}" because it contains ${productCount} products. Please reassign or delete those products first.`,
          },
          { status: 400 }
        );
      }

      await Category.findByIdAndDelete(category._id);
      deleteFallbackCategory(id);

      return NextResponse.json({
        success: true,
        message: 'Category deleted successfully!',
      });
    }
  } catch (error: any) {
    console.warn('DELETE Category DB notice (fallback cache used):', error.message);
  }

  deleteFallbackCategory(id);

  return NextResponse.json({
    success: true,
    message: 'Category removed successfully from local cache!',
  });
}
