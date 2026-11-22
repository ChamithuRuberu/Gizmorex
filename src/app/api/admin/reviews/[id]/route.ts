import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';

// PATCH /api/admin/reviews/[id] - Update review (approve/reject)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await context.params;
    const body = await request.json();
    const { isApproved } = body;

    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Recalculate product rating if approved
    if (isApproved) {
      const reviews = await Review.find({
        product: review.product,
        isApproved: true,
      });
      
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const numReviews = reviews.length;
      const avgRating = numReviews > 0 ? totalRating / numReviews : 0;

      await Product.findByIdAndUpdate(review.product, {
        rating: Math.round(avgRating * 10) / 10,
        numReviews,
      });
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews/[id] - Delete review
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await context.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Recalculate product rating
    const reviews = await Review.find({
      product: review.product,
      isApproved: true,
    });
    
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const numReviews = reviews.length;
    const avgRating = numReviews > 0 ? totalRating / numReviews : 0;

    await Product.findByIdAndUpdate(review.product, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews,
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
