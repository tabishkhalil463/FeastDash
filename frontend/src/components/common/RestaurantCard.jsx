import { Link } from 'react-router-dom';
import { FiClock, FiTruck } from 'react-icons/fi';
import StarRating from './StarRating';
import { formatPrice } from '../../utils/currency';
import { mediaUrl } from '../../services/api';

export default function RestaurantCard({ restaurant }) {
  const r = restaurant;
  return (
    <Link
      to={`/restaurants/${r.slug}`}
      className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-44 bg-gray-100 overflow-hidden">
        <img
          src={mediaUrl(r.image) || `https://placehold.co/400x250/FF6B35/white?text=${encodeURIComponent(r.name)}`}
          alt={r.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{r.name}</h3>
        {r.cuisine_type && (
          <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1">
            {r.cuisine_type}
          </span>
        )}
        <div className="mt-2">
          <StarRating
            rating={r.average_rating}
            reviews={r.total_reviews}
            size={14}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FiClock size={14} /> {r.estimated_delivery_time} min
          </span>
          <span className="flex items-center gap-1">
            <FiTruck size={14} /> {formatPrice(r.delivery_fee)}
          </span>
        </div>
        {r.minimum_order > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            Min. order: {formatPrice(r.minimum_order)}
          </p>
        )}
      </div>
    </Link>
  );
}
