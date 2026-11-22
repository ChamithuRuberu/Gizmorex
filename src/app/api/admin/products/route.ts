import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { syncCategoryProductCounts } from '@/lib/category-sync';
import { getInitialFallbackProducts, updateFallbackProduct } from '@/lib/product-store';
import { MOCK_PRODUCTS } from '@/lib/data';

// GET /api/admin/products - Get all products with filters and pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || ''; // active, inactive, low-stock
    
    // Check if products collection is empty and auto-populate
    const totalCountInDb = await Product.countDocuments();
    if (totalCountInDb === 0) {
      const initialProducts = MOCK_PRODUCTS.map((p) => {
        const { _id, isNew, ...rest } = p as any;
        return {
          ...rest,
          isNewArrival: true,
          specifications: new Map(Object.entries(p.specifications || {})),
        };
      });
      await Product.insertMany(initialProducts);
    }

    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category) query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (status === 'low-stock') query.stock = { $lt: 10, $gt: 0 };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: products.map((p: any) => ({ ...p, _id: p._id.toString() })),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error: any) {
    console.warn('Admin products DB query notice (using fallback):', error.message);
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let filtered = [...getInitialFallbackProducts()];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    if (category) {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      isFallback: true,
      warning: error.message,
    });
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    slug,
    description,
    price,
    originalPrice,
    images,
    category,
    brand,
    stock,
    features,
    specifications,
    tags,
    isActive,
    isFeatured,
    isFlashDeal,
    isNewArrival,
    flashDealEndsAt,
  } = body;

  // Validation
  if (!name || !slug || !description || !price || !category || !brand) {
    return NextResponse.json(
      { success: false, error: 'Required fields are missing' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      slug: slug.toLowerCase(),
      description,
      price,
      originalPrice: originalPrice || price,
      images: images || [],
      category,
      brand,
      stock: stock || 0,
      features: features || [],
      specifications: new Map(Object.entries(specifications || {})),
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      isFlashDeal: isFlashDeal || false,
      isNewArrival: isNewArrival !== undefined ? isNewArrival : true,
      flashDealEndsAt: flashDealEndsAt || undefined,
    });

    // Also update in-memory cache
    updateFallbackProduct(slug, {
      ...body,
      _id: product._id.toString(),
    });

    // Sync category product count
    await syncCategoryProductCounts([category]);

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error: any) {
    console.warn('POST /api/admin/products DB notice (fallback cache used):', error.message);

    const fallbackProduct = updateFallbackProduct(slug, {
      name,
      slug: slug.toLowerCase(),
      description,
      price,
      originalPrice: originalPrice || price,
      images: images || [],
      category,
      brand,
      stock: stock || 0,
      features: features || [],
      specifications: specifications || {},
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      isFlashDeal: isFlashDeal || false,
      isNewArrival: isNewArrival !== undefined ? isNewArrival : true,
      flashDealEndsAt: flashDealEndsAt || undefined,
    });

    return NextResponse.json({
      success: true,
      data: fallbackProduct,
      message: 'Product created in local cache! (Whitelist your IP in MongoDB Atlas to persist to cloud)',
    });
  }
}
