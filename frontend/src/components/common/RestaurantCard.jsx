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
      className="group block bg-white dark:bg-surface-card-dark rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="h-48 bg-gray-100 dark:bg-surface-dark overflow-hidden relative">
        <img
          src={mediaUrl(r.image) || `https://placehold.co/400x250/4A1982/white?text=${encodeURIComponent(r.name)}`}
          alt={r.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {r.cuisine_type && (
          <span className="absolute top-3 left-3 text-xs font-semibold bg-white/90 dark:bg-surface-card-dark/90 text-primary-mid dark:text-primary-accent px-3 py-1 rounded-full backdrop-blur-sm">
            {r.cuisine_type}
          </span>
        )}
        <div className="absolute bottom-3 left-3">
          <h3 className="font-heading font-semibold text-white text-lg drop-shadow-md truncate max-w-[200px]">
            {r.name}
          </h3>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <StarRating rating={r.average_rating} reviews={r.total_reviews} size={14} />
          {r.minimum_order > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Min. {formatPrice(r.minimum_order)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <FiClock size={14} className="text-primary-accent" /> {r.estimated_delivery_time} min
          </span>
          <span className="flex items-center gap-1.5">
            <FiTruck size={14} className="text-primary-accent" /> {formatPrice(r.delivery_fee)}
          </span>
        </div>
      </div>
    </Link>
  );
}
