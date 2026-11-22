'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  language: 'en' | 'si';
  createdAt: string;
  isVerifiedPurchase: boolean;
}

const testimonials: Review[] = [
  {
    _id: '1',
    userName: 'Nusrith A.',
    rating: 5,
    comment: 'This had the lowest price out of all the places I checked. Good value for money',
    language: 'en',
    createdAt: '2 months ago',
    isVerifiedPurchase: true,
  },
  {
    _id: '2',
    userName: 'Sampath K Amarapathi',
    rating: 5,
    comment: 'The parcel arrived in good condition, all sealed, the order was exact and complete, no damage seen during unboxing, easy pairing and set-up',
    language: 'en',
    createdAt: '2 months ago',
    isVerifiedPurchase: true,
  },
  {
    _id: '3',
    userName: 'Dilshan P.',
    rating: 5,
    comment: 'කවරය දැම්මට පස්සේ case එක අල්ලන්න ලේසියි. Fit එකත් හොඳයි. සාක්කුවට දාද්දි කලින්ට වඩා ටිකක් ලොකුයි වගේ දැනෙනවා හැබැයි මට නම් අවුලක් නෑ.',
    language: 'si',
    createdAt: '2 months ago',
    isVerifiedPurchase: true,
  },
  {
    _id: '4',
    userName: 'Achira Nisal',
    rating: 5,
    comment: 'case eka hodai. mage R60i NC ekata hariyata fit una. alladdi grip ekath hodai gaanata watinawa 👍',
    language: 'si',
    createdAt: '2 months ago',
    isVerifiedPurchase: true,
  },
  {
    _id: '5',
    userName: 'Aisha A.',
    rating: 5,
    comment: 'best thing i bought recently haha 10/10 recommended',
    language: 'en',
    createdAt: '3 months ago',
    isVerifiedPurchase: true,
  },
  {
    _id: '6',
    userName: 'Nimantha k',
    rating: 5,
    comment: 'Searched everywhere and this was the lowest price by far. Really friendly customer service and fast delivery too.',
    language: 'en',
    createdAt: '3 months ago',
    isVerifiedPurchase: true,
  },
  {
    _id: '7',
    userName: 'Allen M.',
    rating: 5,
    comment: 'Got this 70mai M310 Pro at the lowest price online here. The 2K video clarity is sharp, even at night. I got the item delivered via uber in just about 10 minutes after ordering. Outstanding customer service!',
    language: 'en',
    createdAt: '3 months ago',
    isVerifiedPurchase: true,
  },
  {
    _id: '8',
    userName: 'Supul Sashmitha',
    rating: 5,
    comment: 'ඇත්තටම හිතුවට වඩා ගොඩක් හොඳයි! TikTok එකේ වීඩියෝ එක දැකලා ගත්තේ, බලාපොරොත්තු වුණාටත් වඩා සුපිරියටම තියෙනවා.',
    language: 'si',
    createdAt: '4 months ago',
    isVerifiedPurchase: true,
  },
];

export default function CustomerReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleReviews = testimonials.slice(
    currentIndex * itemsPerPage,
    currentIndex * itemsPerPage + itemsPerPage
  );

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real reviews from real customers who love shopping with Gizmorex
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900">5.0</span>
            <span className="text-gray-600">({testimonials.length} reviews)</span>
          </div>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleReviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-700 mb-4 line-clamp-4 min-h-[80px]">
                  {review.comment}
                </p>

                {/* User Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900">{review.userName}</p>
                    <p className="text-sm text-gray-500">{review.createdAt}</p>
                  </div>
                  {review.isVerifiedPurchase && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {totalPages > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors z-10"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors z-10"
                aria-label="Next reviews"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? 'w-8 bg-[#FF6B00]'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
