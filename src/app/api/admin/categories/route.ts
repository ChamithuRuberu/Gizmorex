import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/lib/constants';
import { getInitialFallbackCategories, updateFallbackCategory } from '@/lib/category-store';

// GET /api/admin/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    let categories = await Category.find().sort({ sortOrder: 1, name: 1 });

    // Auto-seed default categories if empty in MongoDB
    if (categories.length === 0) {
      const toInsert = DEFAULT_CATEGORIES.map((c, index) => ({
        name: c.name,
        slug: c.slug,
        description: `Browse latest ${c.name} and accessories`,
        icon: c.icon || 'Package',
        color: c.color || '#FF6B00',
        image: (c as any).image || '',
        sortOrder: index,
        productCount: 0,
        isActive: true,
      }));
      await Category.insertMany(toInsert);
      categories = await Category.find().sort({ sortOrder: 1, name: 1 });
    }

    // Update product counts
    for (const category of categories) {
      const count = await Product.countDocuments({
        category: { $regex: new RegExp(`^${category.name}$`, 'i') },
        isActive: true,
      });
      if (count !== category.productCount) {
        category.productCount = count;
        await category.save();
      }
    }

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.warn('Admin categories DB notice (using resilient cache):', error.message);
    
    // Graceful fallback from in-memory category store
    const fallbackCategories = getInitialFallbackCategories();

    return NextResponse.json({
      success: true,
      data: fallbackCategories,
      isFallback: true,
      warning: error.message,
    });
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, slug, description, icon, color, image, sortOrder } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { success: false, error: 'Name and slug are required' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Check if category already exists in MongoDB
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name or slug already exists' },
        { status: 400 }
      );
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      description: description || '',
      icon: icon || 'Package',
      color: color || '#FF6B00',
      image: image || '',
      sortOrder: sortOrder || 0,
      isActive: true,
      productCount: 0,
    });

    // Also update in-memory fallback
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

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully!',
    });
  } catch (error: any) {
    console.warn('POST Category DB notice (fallback cache used):', error.message);

    // Save to resilient in-memory store so user is not blocked
    const fallbackSaved = updateFallbackCategory(slug, {
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      description: description || '',
      icon: icon || 'Package',
      color: color || '#FF6B00',
      image: image || '',
      sortOrder: sortOrder || 0,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      data: fallbackSaved,
      message: 'Category created in local cache! (Whitelist your IP in MongoDB Atlas to sync to cloud)',
    });
  }
}
