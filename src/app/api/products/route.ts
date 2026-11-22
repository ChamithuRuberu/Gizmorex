import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getInitialFallbackProducts } from '@/lib/product-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const deals = searchParams.get('deals');
  const featured = searchParams.get('featured');
  const limit = parseInt(searchParams.get('limit') || '150', 10);

  try {
    await connectDB();
    const query: any = { isActive: true };

    if (category) {
      const spaced = category.replace(/-/g, ' ');
      const hyphenated = category.replace(/\s+/g, '-');
      query.$or = [
        { category: { $regex: new RegExp(`^${category}$`, 'i') } },
        { category: { $regex: new RegExp(`^${spaced}$`, 'i') } },
        { category: { $regex: new RegExp(`^${hyphenated}$`, 'i') } },
      ];
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (deals === 'true') {
      query.isFlashDeal = true;
    }
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const dbProducts = await Product.find(query).limit(limit).lean();
    const fallbackAll = getInitialFallbackProducts();

    if (dbProducts.length > 0) {
      const formatted = dbProducts.map((p: any) => ({
        ...p,
        _id: p._id.toString(),
      }));

      // Merge any catalog products not yet synced to MongoDB
      for (const p of fallbackAll) {
        if (!formatted.some((dbP: any) => dbP.slug === p.slug || dbP.name.toLowerCase() === p.name.toLowerCase())) {
          formatted.push(p);
        }
      }

      return NextResponse.json({
        success: true,
        total: formatted.length,
        data: formatted.slice(0, limit),
      });
    }
  } catch (error: any) {
    console.warn('API Products DB query fallback:', error.message);
  }

  // Fallback to active product store
  let results = [...getInitialFallbackProducts()];

  if (category) {
    const qCat = category.toLowerCase().trim();
    const qSpaced = qCat.replace(/-/g, ' ');
    const qHyphen = qCat.replace(/\s+/g, '-');
    results = results.filter(p => {
      const pCat = (p.category || '').toLowerCase().trim();
      const pSpaced = pCat.replace(/-/g, ' ');
      const pHyphen = pCat.replace(/\s+/g, '-');
      return (
        pCat === qCat ||
        pSpaced === qSpaced ||
        pHyphen === qHyphen ||
        pCat === qSpaced ||
        pSpaced === qCat
      );
    });
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
  }
  if (deals === 'true') {
    results = results.filter(p => p.isFlashDeal);
  }
  if (featured === 'true') {
    results = results.filter(p => p.isFeatured);
  }

  return NextResponse.json({
    success: true,
    total: results.length,
    data: results.slice(0, limit),
  });
}
