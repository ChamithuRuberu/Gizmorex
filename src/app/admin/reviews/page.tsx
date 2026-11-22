'use client';

import { useEffect, useState } from 'react';
import { Star, Check, X, Trash2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Review, Product } from '@/types';

interface ReviewWithProduct extends Omit<Review, 'product'> {
  product: Product;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [filter, page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/reviews?status=${filter}&page=${page}&limit=20`
      );
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
        setTotalPages(data.pages);
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string, approve: boolean) => {
    const toastId = toast.loading(approve ? 'Approving...' : 'Rejecting...');
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: approve }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message, { id: toastId });
        fetchReviews();
      } else {
        toast.error(data.error, { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to update review', { id: toastId });
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    const toastId = toast.loading('Deleting...');
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message, { id: toastId });
        fetchReviews();
      } else {
        toast.error(data.error, { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to delete review', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-300">Customer Reviews</h1>
          <p className="text-sm text-gray-600">
            Moderate and manage product reviews
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-[#FF6B00] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'pending'
                ? 'bg-[#FF6B00] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'approved'
                ? 'bg-[#FF6B00] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card"
            >
              <div className="flex items-start gap-4">
                {/* Product Image */}
                <img
                  src={review.product.images[0]}
                  alt={review.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-dark-300">
                        {review.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">{review.userName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!review.isApproved ? (
                        <>
                          <button
                            onClick={() => handleApprove(review._id, true)}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleApprove(review._id, false)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                          Approved
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 mb-2">{review.comment}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="text-green-600 font-medium">
                        ✓ Verified Purchase
                      </span>
                    )}
                    <span className="text-blue-600">
                      Language: {review.language === 'en' ? 'English' : 'Sinhala'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                page === i + 1
                  ? 'bg-[#FF6B00] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
