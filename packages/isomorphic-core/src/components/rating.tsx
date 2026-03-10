import cn from '@core/utils/class-names';
import { PiStar, PiStarFill } from 'react-icons/pi';

type RatingProps = {
  rating: number[];
  className?: string;
  disableText?: boolean;
};

function getRating(rating: number[]) {
  const totalRating = rating.reduce(
    (partialSum, value) => partialSum + value,
    0
  );
  const review = totalRating / rating.length;

  return {
    review,
    totalRating,
  };
}

const STAR_POSITIONS = [0, 1, 2, 3, 4] as const;

export default function Rating({
  rating,
  disableText = false,
  className,
}: Readonly<RatingProps>) {
  const { review, totalRating } = getRating(rating);
  const filledCount = Math.round(review);
  return (
    <div className={cn("flex flex-col items-end", className)}>
      <div className="flex items-center">
        {STAR_POSITIONS.map((position) => {
          return position < filledCount ? (
            <PiStarFill
              className="w-4 fill-orange text-orange"
              key={position}
            />
          ) : (
            <PiStar
              className="w-4 fill-gray-300 text-gray-500"
              key={position}
            />
          );
        })}{' '}
      </div>
      {!disableText && (
        <span className="mt-1 shrink-0 text-gray-500">
          {totalRating} {totalRating > 1 ? 'reviews' : 'review'}
        </span>
      )}
    </div>
  );
}
