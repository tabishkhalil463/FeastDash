import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiClock,
  FiMapPin,
  FiPhone,
  FiShoppingCart,
} from 'react-icons/fi';
import API from '../../services/api';
import StarRating from '../../components/common/StarRating';
import MenuItemCard from '../../components/common/MenuItemCard';
import { MenuItemSkeleton } from '../../components/common/LoadingSkeleton';
import { formatPrice } from '../../utils/currency';
import toast from 'react-hot-toast';

export default function RestaurantDetailPage() {
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState({});          // { itemId: qty }
  const categoryRefs = useRef({});

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

  const scrollToCategory = (id) => {
    setActiveCategory(id);
    categoryRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const addToCart = (item) => setCart((c) => ({ ...c, [item.id]: 1 }));
  const increase = (item) => setCart((c) => ({ ...c, [item.id]: (c[item.id] || 0) + 1 }));
  const decrease = (item) =>
    setCart((c) => {
      const qty = (c[item.id] || 0) - 1;
      if (qty <= 0) {
        const { [item.id]: _, ...rest } = c;
        return rest;
      }
      return { ...c, [item.id]: qty };
    });

  const cartItems = Object.values(cart);
  const totalQty = cartItems.reduce((s, q) => s + q, 0);
  const totalAmount = restaurant?.menu_categories?.reduce((sum, cat) => {
    return (
      sum +
      cat.items.reduce((s, item) => {
        const qty = cart[item.id] || 0;
        const price = item.discounted_price || item.price;
        return s + qty * Number(price);
      }, 0)
    );
  }, 0) || 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <MenuItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-8 text-center text-gray-500 min-h-[60vh] flex items-center justify-center">
        Restaurant not found
      </div>
    );
  }

  const r = restaurant;
  const isOpen = true; // simplified — could compare opening_time/closing_time

  return (
    <div>
      {/* Cover */}
      <div className="relative h-56 sm:h-72 bg-gray-200">
        <img
          src={r.image || `https://placehold.co/1200x400/FF6B35/white?text=${encodeURIComponent(r.name)}`}
          alt={r.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Info bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
          {/* Logo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow shrink-0 -mt-14 sm:-mt-16">
            <img
              src={r.logo || `https://placehold.co/200x200/004E89/white?text=${encodeURIComponent(r.name[0])}`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{r.name}</h1>
                {r.cuisine_type && (
                  <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1">
                    {r.cuisine_type}
                  </span>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isOpen
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="mt-2">
              <StarRating rating={r.average_rating} reviews={r.total_reviews} />
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FiClock size={14} /> {r.estimated_delivery_time} min
              </span>
              <span className="flex items-center gap-1">
                Delivery: {r.formatted_delivery_fee}
              </span>
              <span className="flex items-center gap-1">
                <FiMapPin size={14} /> {r.address}, {r.city}
              </span>
              {r.phone && (
                <span className="flex items-center gap-1">
                  <FiPhone size={14} /> {r.phone}
                </span>
              )}
            </div>
            {r.minimum_order > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Minimum order: {r.formatted_minimum_order}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="flex gap-8">
          {/* Category tabs */}
          {r.menu_categories?.length > 0 && (
            <nav className="hidden lg:block w-48 shrink-0 sticky top-20 self-start">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Menu
              </h3>
              <ul className="space-y-1">
                {r.menu_categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => scrollToCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        activeCategory === cat.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Menu items */}
          <div className="flex-1 min-w-0">
            {/* Mobile category tabs */}
            {r.menu_categories?.length > 0 && (
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                {r.menu_categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                      activeCategory === cat.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {cat.name}
                  </h2>
                  {cat.items?.length > 0 ? (
                    <div className="space-y-4">
                      {cat.items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          cartQty={cart[item.id] || 0}
                          onAddToCart={addToCart}
                          onIncrease={increase}
                          onDecrease={decrease}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No items in this category yet.
                    </p>
                  )}
                </section>
              ))
            ) : (
              <p className="text-gray-500 text-center py-16">
                Menu is being prepared. Check back soon!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Cart Bar */}
      {totalQty > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <FiShoppingCart className="text-primary" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {totalQty} item{totalQty !== 1 ? 's' : ''} in cart
                </p>
                <p className="text-sm text-gray-500">
                  Total: {formatPrice(totalAmount)}
                </p>
              </div>
            </div>
            <Link
              to="/cart"
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
            >
              View Cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
