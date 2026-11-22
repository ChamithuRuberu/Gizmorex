import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { getFallbackProduct } from '@/lib/product-store';
import { MOCK_PRODUCTS } from '@/lib/data';

// GET /api/products/[id] - Find product by ID or Slug
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const idOrSlug = (id || '').trim();
  const lowerSlug = idOrSlug.toLowerCase();

  try {
    await dbConnect();

    const orConditions: any[] = [
      { slug: lowerSlug },
      { slug: idOrSlug },
      { name: { $regex: new RegExp(`^${lowerSlug.replace(/-/g, ' ')}$`, 'i') } },
    ];

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      orConditions.push({ _id: idOrSlug });
    }

    const product: any = await Product.findOne({ $or: orConditions }).lean();

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
    console.warn('GET /api/products/[id] DB notice (using resilient cache):', error.message);
  }

  // 1. Resilient lookup from in-memory fallback store
  const fromStore = getFallbackProduct(idOrSlug) || getFallbackProduct(lowerSlug);
  if (fromStore) {
    return NextResponse.json({
      success: true,
      data: fromStore,
      isFallback: true,
    });
  }

  // 2. Lookup from MOCK_PRODUCTS
  const fromMock = MOCK_PRODUCTS.find(
    (p) =>
      p._id === idOrSlug ||
      p.slug.toLowerCase() === lowerSlug ||
      p.slug.toLowerCase() === idOrSlug.toLowerCase()
  );

  if (fromMock) {
    return NextResponse.json({
      success: true,
      data: fromMock,
      isFallback: true,
    });
  }

  return NextResponse.json(
    { success: false, error: 'Product not found' },
    { status: 404 }
  );
}
