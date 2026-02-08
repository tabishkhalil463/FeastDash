import { formatPrice } from '../../utils/currency';

export default function MenuItemCard({ item, onAddToCart, cartQty = 0, onIncrease, onDecrease }) {
  return (
    <div className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
      {/* Image */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-gray-100 overflow-hidden shrink-0">
        <img
          src={item.image || `https://placehold.co/200x200/f3f4f6/9ca3af?text=${encodeURIComponent(item.name)}`}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
          <div className="flex gap-1 shrink-0">
            {item.is_vegetarian && (
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                VEG
              </span>
            )}
            {item.is_spicy && (
              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                SPICY
              </span>
            )}
          </div>
        </div>

        {item.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-end justify-between mt-3">
          <div>
            {item.discounted_price ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">
                  {formatPrice(item.discounted_price)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(item.price)}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-gray-900">
                {formatPrice(item.price)}
              </span>
            )}
          </div>

          {/* Cart controls */}
          {cartQty > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDecrease?.(item)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                -
              </button>
              <span className="w-6 text-center font-medium">{cartQty}</span>
              <button
                onClick={() => onIncrease?.(item)}
                className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart?.(item)}
              className="px-4 py-1.5 bg-primary text-white text-sm rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
