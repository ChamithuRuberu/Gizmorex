import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { MOCK_PRODUCTS } from '@/lib/data';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/lib/constants';
import { getInitialFallbackProducts } from '@/lib/product-store';
import { getInitialFallbackCategories } from '@/lib/category-store';

export async function POST() {
  // Always update in-memory stores first so changes take effect immediately
  const fallbackProducts = getInitialFallbackProducts();
  const fallbackCategories = getInitialFallbackCategories();

  let dbProductsCount = fallbackProducts.length;
  let dbCategoriesCount = fallbackCategories.length;
  let isDbConnected = false;

  try {
    await dbConnect();
    isDbConnected = true;

    // 1. Seed or Upsert Categories
    for (let index = 0; index < DEFAULT_CATEGORIES.length; index++) {
      const c = DEFAULT_CATEGORIES[index];
      await Category.findOneAndUpdate(
        { slug: c.slug.toLowerCase() },
        {
          $setOnInsert: {
            name: c.name,
            slug: c.slug.toLowerCase(),
            description: `Browse latest ${c.name} and accessories`,
            icon: c.icon || 'Package',
            color: c.color || '#FF6B00',
            image: (c as any).image || '',
            sortOrder: index,
            isActive: true,
          },
        },
        { upsert: true, new: true }
      );
    }

    // 2. Seed or Upsert Products by slug
    let newProductsAdded = 0;
    for (const p of fallbackProducts) {
      const { _id, isNew, ...rest } = p as any;
      const existing = await Product.findOne({ slug: p.slug.toLowerCase() });
      if (!existing) {
        await Product.create({
          ...rest,
          slug: p.slug.toLowerCase(),
          isNewArrival: true,
          specifications: new Map(Object.entries(p.specifications || {})),
        });
        newProductsAdded++;
      }
    }

    // 3. Update Category product counts
    const allCategories = await Category.find();
    for (const cat of allCategories) {
      const count = await Product.countDocuments({
        $or: [
          { category: { $regex: new RegExp(`^${cat.name}$`, 'i') } },
          { category: { $regex: new RegExp(`^${cat.slug}$`, 'i') } },
        ],
      });
      cat.productCount = count;
      await cat.save();
    }

    dbProductsCount = await Product.countDocuments();
    dbCategoriesCount = await Category.countDocuments();

    return NextResponse.json({
      success: true,
      message: `Database synchronized! Total products: ${dbProductsCount} (${newProductsAdded} newly added), Categories: ${dbCategoriesCount}`,
      data: {
        productsCount: dbProductsCount,
        categoriesCount: dbCategoriesCount,
        isDbConnected: true,
      },
    });
  } catch (error: any) {
    console.warn('Seed database notice (using local store):', error.message);
  }

  return NextResponse.json({
    success: true,
    message: `Catalog synchronized in local cache! (${fallbackProducts.length} products, ${fallbackCategories.length} categories ready)`,
    data: {
      productsCount: fallbackProducts.length,
      categoriesCount: fallbackCategories.length,
      isDbConnected: false,
    },
  });
}
