import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiClock,
  FiMapPin,
  FiPhone,
  FiShoppingCart,
} from 'react-icons/fi';
import { HiStar } from 'react-icons/hi2';
import API, { mediaUrl } from '../../services/api';
import { useCart } from '../../context/CartContext';
import StarRating from '../../components/common/StarRating';
import MenuItemCard from '../../components/common/MenuItemCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { MenuItemSkeleton } from '../../components/common/LoadingSkeleton';
import { formatPrice } from '../../utils/currency';
import toast from 'react-hot-toast';

export default function RestaurantDetailPage() {
  const { slug } = useParams();
  const cart = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [conflict, setConflict] = useState(null);
  const categoryRefs = useRef({});

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [ratingDist, setRatingDist] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

  useEffect(() => {
    API.get(`restaurants/${slug}/`)
      .then(({ data }) => {
        setRestaurant(data);
        if (data.menu_categories?.length) {
          setActiveCategory(data.menu_categories[0].id);
        }
      })
      .catch(() => toast.error('Failed to load restaurant'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    setReviewsLoading(true);
    API.get(`restaurants/${slug}/reviews/?page=${reviewPage}`)
      .then(({ data }) => {
        const newReviews = data.results || [];
        if (reviewPage === 1) {
          setReviews(newReviews);
          const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          newReviews.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
          setRatingDist(dist);
        } else {
          setReviews((prev) => {
            const existing = new Set(prev.map((r) => r.id));
            const unique = newReviews.filter((r) => !existing.has(r.id));
            return [...prev, ...unique];
          });
          newReviews.forEach((r) => {
            setRatingDist((prev) => ({ ...prev, [r.rating]: (prev[r.rating] || 0) + 1 }));
          });
        }
        setHasMoreReviews(!!data.next);
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [slug, reviewPage]);

  const scrollToCategory = (id) => {
    setActiveCategory(id);
    categoryRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cartQtyMap = {};
  cart.items.forEach((ci) => { cartQtyMap[ci.menu_item.id] = { qty: ci.quantity, cartItemId: ci.id }; });

  const handleAdd = async (item) => {
    const res = await cart.addToCart(item.id);
    if (res.conflict) {
      setConflict({ itemId: item.id, currentRestaurant: res.currentRestaurant });
    }
  };
  const handleIncrease = (item) => cart.addToCart(item.id);
  const handleDecrease = (item) => {
    const entry = cartQtyMap[item.id];
    if (entry) cart.updateQuantity(entry.cartItemId, entry.qty - 1);
  };

  const { grandTotal } = cart.getCartTotal();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-64 bg-gray-200 dark:bg-surface-card-dark rounded-2xl animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <MenuItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 min-h-[60vh] flex items-center justify-center">
        Restaurant not found
      </div>
    );
  }

  const r = restaurant;
  const isOpen = true;
  const maxDist = Math.max(...Object.values(ratingDist), 1);

  return (
    <div>
      {/* Cover */}
      <div className="relative h-56 sm:h-72 bg-gray-200 dark:bg-surface-dark">
        <img
          src={mediaUrl(r.image) || `https://placehold.co/1200x400/4A1982/white?text=${encodeURIComponent(r.name)}`}
          alt={r.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Info bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-8">
        <div className="bg-white dark:bg-surface-card-dark rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-100 dark:bg-surface-dark overflow-hidden border-4 border-white dark:border-surface-card-dark shadow-lg shrink-0 -mt-14 sm:-mt-16">
            <img
              src={mediaUrl(r.logo) || `https://placehold.co/200x200/1B1464/white?text=${encodeURIComponent(r.name[0])}`}
              alt={r.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">{r.name}</h1>
                {r.cuisine_type && (
                  <span className="inline-block text-xs font-semibold bg-primary-accent/10 text-primary-accent px-3 py-0.5 rounded-full mt-1">
                    {r.cuisine_type}
                  </span>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isOpen ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                }`}
              >
                {isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="mt-2">
              <StarRating rating={r.average_rating} reviews={r.total_reviews} />
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><FiClock size={14} className="text-primary-accent" /> {r.estimated_delivery_time} min</span>
              <span className="flex items-center gap-1">Delivery: {r.formatted_delivery_fee}</span>
              <span className="flex items-center gap-1"><FiMapPin size={14} className="text-primary-accent" /> {r.address}, {r.city}</span>
              {r.phone && <span className="flex items-center gap-1"><FiPhone size={14} className="text-primary-accent" /> {r.phone}</span>}
            </div>
            {r.minimum_order > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Minimum order: {r.formatted_minimum_order}</p>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="flex gap-8">
          {r.menu_categories?.length > 0 && (
            <nav className="hidden lg:block w-48 shrink-0 sticky top-20 self-start">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Menu</h3>
              <ul className="space-y-1">
                {r.menu_categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => scrollToCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                        activeCategory === cat.id
                          ? 'bg-primary-accent/10 text-primary-accent font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="flex-1 min-w-0">
            {r.menu_categories?.length > 0 && (
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                {r.menu_categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                      activeCategory === cat.id
                        ? 'gradient-accent text-white shadow-md'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {r.menu_categories?.length > 0 ? (
              r.menu_categories.map((cat) => (
                <section
                  key={cat.id}
                  ref={(el) => (categoryRefs.current[cat.id] = el)}
                  className="mb-10 scroll-mt-20"
                >
                  <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-4">{cat.name}</h2>
                  {cat.items?.length > 0 ? (
                    <div className="space-y-4">
                      {cat.items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          cartQty={cartQtyMap[item.id]?.qty || 0}
                          onAddToCart={handleAdd}
                          onIncrease={handleIncrease}
                          onDecrease={handleDecrease}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 text-sm">No items in this category yet.</p>
                  )}
                </section>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-16">
                Menu is being prepared. Check back soon!
              </p>
            )}

            {/* Reviews Section */}
            <section className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">Customer Reviews</h2>

              <div className="flex flex-col sm:flex-row gap-8 mb-8">
                <div className="text-center sm:text-left shrink-0">
                  <p className="text-5xl font-heading font-bold text-gray-900 dark:text-white">{Number(r.average_rating).toFixed(1)}</p>
                  <div className="mt-1">
                    <StarRating rating={r.average_rating} reviews={r.total_reviews} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">({r.total_reviews} reviews)</p>
                </div>

                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-6 flex items-center gap-0.5">{star}<HiStar size={12} className="text-amber-400" /></span>
                      <div className="flex-1 h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${(ratingDist[star] / maxDist) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-8 text-right">{ratingDist[star]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {reviews.length === 0 && !reviewsLoading ? (
                <p className="text-gray-400 dark:text-gray-500 text-center py-8">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white dark:bg-surface-card-dark border border-gray-100 dark:border-white/5 rounded-xl p-4 flex gap-4">
                      <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {review.user_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{review.user_name}</p>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(review.created_at).toLocaleDateString('en-PK')}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <HiStar key={i} size={14} className={i < review.rating ? 'text-amber-400' : 'text-gray-200 dark:text-white/10'} />
                          ))}
                        </div>
                        {review.comment && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{review.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasMoreReviews && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setReviewPage((p) => p + 1)}
                    disabled={reviewsLoading}
                    className="px-6 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition disabled:opacity-50"
                  >
                    {reviewsLoading ? 'Loading...' : 'Load More Reviews'}
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Sticky Cart Bar */}
      {cart.itemsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-card-dark border-t border-gray-200 dark:border-white/10 shadow-lg z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center shadow-md">
                <FiShoppingCart className="text-white" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {cart.itemsCount} item{cart.itemsCount !== 1 ? 's' : ''} in cart
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total: {formatPrice(grandTotal)}</p>
              </div>
            </div>
            <Link
              to="/cart"
              className="px-6 py-2.5 gradient-accent text-white rounded-xl font-semibold shadow-lg shadow-primary-accent/25 hover:shadow-xl transition-all"
            >
              View Cart
            </Link>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!conflict}
        title="Replace cart items?"
        message={`Your cart has items from ${conflict?.currentRestaurant}. Adding this item will clear your current cart.`}
        confirmLabel="Clear & Add"
        confirmColor="bg-red-500"
        onCancel={() => setConflict(null)}
        onConfirm={async () => {
          await cart.clearCart();
          await cart.addToCart(conflict.itemId);
          setConflict(null);
        }}
      />
    </div>
  );
}
