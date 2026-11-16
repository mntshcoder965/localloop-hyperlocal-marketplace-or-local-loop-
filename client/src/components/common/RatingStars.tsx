import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  count,
  size = 'sm',
  showCount = true,
}) => {
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 18 : 22;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={iconSize}
            className={star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
          />
        ))}
      </div>
      <span className="font-semibold text-slate-700 text-xs">
        {rating > 0 ? rating.toFixed(1) : 'New'}
      </span>
      {showCount && count !== undefined && count > 0 && (
        <span className="text-slate-400 text-xs">({count})</span>
      )}
    </div>
  );
};

