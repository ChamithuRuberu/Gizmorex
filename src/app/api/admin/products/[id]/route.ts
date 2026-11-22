import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { syncCategoryProductCounts } from '@/lib/category-sync';
import { getFallbackProduct, updateFallbackProduct, deleteFallbackProduct } from '@/lib/product-store';

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await dbConnect();

    let product: any = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).lean();
    } else {
      product = await Product.findOne({
        $or: [{ _id: id }, { slug: id.toLowerCase() }],
      }).lean();
    }

    if (product) {
      return NextResponse.json({
        success: true,
        data: {
          ...product,
          _id: product._id.toString(),
          specifications:
            product.specifications instanceof Map
              ? Object.fromEntries(product.specifications)
              : (product.specifications || {}),
        },
      });
    }
  } catch (error: any) {
    console.warn('GET /api/admin/products/[id] DB notice (using resilient cache):', error.message);
  }

  // Resilient fallback lookup if MongoDB is blocked by IP whitelist or record is in mock store
  const fallback = getFallbackProduct(id);
  if (fallback) {
    return NextResponse.json({
      success: true,
      data: fallback,
      isFallback: true,
    });
  }

  return NextResponse.json(
    { success: false, error: `Product "${id}" not found in database or catalog.` },
    { status: 404 }
  );
}

// PATCH /api/admin/products/[id] - Update product
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const updateData: any = { ...body };
  if (body.price !== undefined) updateData.price = parseFloat(body.price);
  if (body.originalPrice !== undefined) updateData.originalPrice = parseFloat(body.originalPrice);
  if (body.stock !== undefined) updateData.stock = parseInt(body.stock);
  if (body.sold !== undefined) updateData.sold = parseInt(body.sold);
  if (body.slug) updateData.slug = body.slug.toLowerCase().trim();

  try {
    await dbConnect();

    // Format specifications if provided as an object
    const mongoData = { ...updateData };
    if (body.specifications && typeof body.specifications === 'object') {
      mongoData.specifications = new Map(Object.entries(body.specifications));
    }

    let existingProduct = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      existingProduct = await Product.findById(id);
    } else {
      existingProduct = await Product.findOne({
        $or: [{ _id: id }, { slug: id.toLowerCase() }],
      });
    }

    const oldCategory = existingProduct?.category;

    let product = null;
    if (existingProduct) {
      product = await Product.findByIdAndUpdate(
        existingProduct._id,
        { $set: mongoData },
        { new: true, runValidators: true }
      );
    } else {
      product = await Product.create({
        ...mongoData,
        _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined,
      });
    }

    if (product) {
      // Also update in-memory cache
      updateFallbackProduct(id, {
        ...updateData,
        _id: product._id.toString(),
      });

      // Sync product counts for old and new category
      await syncCategoryProductCounts([oldCategory, product.category]);

      return NextResponse.json({
        success: true,
        data: {
          ...product.toObject(),
          _id: product._id.toString(),
          specifications:
            product.specifications instanceof Map
              ? Object.fromEntries(product.specifications)
              : (product.specifications || {}),
        },
        message: 'Product updated successfully!',
      });
    }
  } catch (error: any) {
    console.warn('PATCH /api/admin/products/[id] DB notice (fallback cache used):', error.message);
  }

  // Resilient fallback update when MongoDB Atlas is unreachable / IP not whitelisted
  const fallbackUpdated = updateFallbackProduct(id, updateData);

  return NextResponse.json({
    success: true,
    data: fallbackUpdated,
    message: 'Product updated in local cache! (Whitelist your IP in MongoDB Atlas to persist to cloud)',
  });
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await dbConnect();

    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({
        $or: [{ _id: id }, { slug: id.toLowerCase() }],
      });
    }

    if (product) {
      const category = product.category;
      await Product.findByIdAndDelete(product._id);
      deleteFallbackProduct(id);

      // Sync product count for category after deletion
      await syncCategoryProductCounts([category]);

      return NextResponse.json({
        success: true,
        message: 'Product deleted successfully!',
      });
    }
  } catch (error: any) {
    console.warn('DELETE /api/admin/products/[id] DB notice (fallback cache used):', error.message);
  }

  deleteFallbackProduct(id);

  return NextResponse.json({
    success: true,
    message: 'Product deleted from local cache!',
  });
}
