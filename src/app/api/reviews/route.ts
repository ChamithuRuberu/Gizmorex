import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';

// GET /api/reviews - Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, helpful, rating
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Build sort criteria
    let sortCriteria: any = { createdAt: -1 };
    if (sortBy === 'helpful') sortCriteria = { likes: -1, createdAt: -1 };
    if (sortBy === 'rating') sortCriteria = { rating: -1, createdAt: -1 };

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId, isApproved: true })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name image')
        .lean(),
      Review.countDocuments({ product: productId, isApproved: true }),
    ]);

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { product: productId, isApproved: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
      ratingDistribution,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { productId, userId, userName, rating, comment, language } = body;

    // Validation
    if (!productId || !userId || !userName || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create review
    const review = await Review.create({
      product: productId,
      user: userId,
      userName,
      rating,
      comment,
      language: language || 'en',
      isApproved: false, // Require admin approval
    });

    // Update product rating
    const reviews = await Review.find({ product: productId, isApproved: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) + rating;
    const numReviews = reviews.length + 1;
    const avgRating = totalRating / numReviews;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews,
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully. It will be visible after admin approval.',
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
