import { FiStar } from 'react-icons/fi';
import { HiStar, HiOutlineStar } from 'react-icons/hi2';

export default function StarRating({ rating = 0, reviews = 0, size = 16, showCount = true }) {
  const stars = [];
  const r = Math.round(rating * 2) / 2;

  for (let i = 1; i <= 5; i++) {
    if (i <= r) {
      stars.push(<HiStar key={i} size={size} className="text-amber-400" />);
    } else if (i - 0.5 === r) {
      stars.push(
        <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
          <HiOutlineStar size={size} className="text-amber-400 absolute" />
          <span className="absolute overflow-hidden" style={{ width: size / 2 }}>
            <HiStar size={size} className="text-amber-400" />
          </span>
        </span>
      );
    } else {
      stars.push(<HiOutlineStar key={i} size={size} className="text-gray-300 dark:text-gray-600" />);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {showCount && (
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
          {Number(rating).toFixed(1)} {reviews > 0 && `(${reviews})`}
        </span>
      )}
    </div>
  );
}
