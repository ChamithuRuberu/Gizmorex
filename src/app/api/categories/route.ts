import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { getInitialFallbackCategories } from '@/lib/category-store';
import { getInitialFallbackProducts } from '@/lib/product-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const dbCategories = await Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    if (dbCategories.length > 0) {
      // Calculate live counts
      let countMap: Record<string, number> = {};
      try {
        const counts = await Product.aggregate([
          { $match: { status: 'active' } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
        ]);
        counts.forEach((c: any) => {
          if (c._id) {
            countMap[c._id.toLowerCase()] = c.count;
          }
        });
      } catch {}

      return NextResponse.json({
        success: true,
        data: dbCategories.map((c: any) => ({
          ...c,
          _id: c._id.toString(),
          productCount: countMap[c.slug.toLowerCase()] || countMap[c.name.toLowerCase()] || c.productCount || 0,
        })),
      }, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    }
  } catch (error: any) {
    console.warn('API Categories DB query notice (fallback used):', error.message);
  }

  // Resilient fallback with live product counts
  const fbCategories = getInitialFallbackCategories();
  const fbProducts = getInitialFallbackProducts();

  const data = fbCategories
    .filter(c => c.isActive !== false)
    .map(c => {
      const pCount = fbProducts.filter(p =>
        p.category?.toLowerCase() === c.slug.toLowerCase() ||
        p.category?.toLowerCase() === c.name.toLowerCase()
      ).length;
      return {
        ...c,
        productCount: pCount,
      };
    });

  return NextResponse.json({
    success: true,
    data,
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
