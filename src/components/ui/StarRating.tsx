'use client';
import { Star } from 'lucide-react';
import { getStarArray } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  numReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export default function StarRating({ rating, numReviews, size = 'sm', showCount = true }: StarRatingProps) {
  const stars = getStarArray(rating);
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {stars.map((type, i) => (
          <Star
            key={i}
            className={`${sizeClass} ${type === 'empty' ? 'text-gray-300' : 'text-yellow-400'}`}
            fill={type === 'full' ? 'currentColor' : type === 'half' ? 'url(#half)' : 'none'}
          />
        ))}
      </div>
      {showCount && numReviews !== undefined && (
        <span className="text-xs text-gray-500">({numReviews})</span>
      )}
    </div>
  );
}

