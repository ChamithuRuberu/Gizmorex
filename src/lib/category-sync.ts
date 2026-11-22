import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';

/**
 * Recalculates and updates Category.productCount for the given categories
 * (or all categories if no list is passed).
 */
export async function syncCategoryProductCounts(categoryIdentifiers?: (string | undefined | null)[]) {
  try {
    await dbConnect();

    // If specific categories given, clean them up
    const validIdentifiers = (categoryIdentifiers || []).filter(
      (c): c is string => typeof c === 'string' && c.trim().length > 0
    );

    let categoriesToUpdate;
    if (validIdentifiers.length > 0) {
      const orConditions: any[] = [];
      for (const idf of validIdentifiers) {
        const trimmed = idf.trim();
        const spaced = trimmed.replace(/-/g, ' ');
        const hyphenated = trimmed.replace(/\s+/g, '-');
        orConditions.push(
          { name: { $regex: new RegExp(`^${trimmed}$`, 'i') } },
          { slug: { $regex: new RegExp(`^${trimmed}$`, 'i') } },
          { name: { $regex: new RegExp(`^${spaced}$`, 'i') } },
          { slug: { $regex: new RegExp(`^${hyphenated}$`, 'i') } }
        );
      }
      categoriesToUpdate = await Category.find({ $or: orConditions });
    } else {
      categoriesToUpdate = await Category.find();
    }

    for (const cat of categoriesToUpdate) {
      const count = await Product.countDocuments({
        $or: [
          { category: { $regex: new RegExp(`^${cat.name}$`, 'i') } },
          { category: { $regex: new RegExp(`^${cat.slug}$`, 'i') } },
          { category: { $regex: new RegExp(`^${cat.name.replace(/\s+/g, '-')}$`, 'i') } },
          { category: { $regex: new RegExp(`^${cat.slug.replace(/-/g, ' ')}$`, 'i') } },
        ],
        isActive: true,
      });

      if (cat.productCount !== count) {
        cat.productCount = count;
        await cat.save();
      }
    }
  } catch (error) {
    console.warn('Failed to sync category product counts:', error);
  }
}
