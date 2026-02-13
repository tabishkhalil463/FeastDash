import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiShoppingCart,
  FiTruck,
  FiList,
} from 'react-icons/fi';
import API from '../../services/api';
import RestaurantCard from '../../components/common/RestaurantCard';
import { RestaurantCardSkeleton } from '../../components/common/LoadingSkeleton';

const STEPS = [
  {
    icon: FiList,
    title: 'Choose Restaurant',
    desc: 'Browse through our restaurants and menus',
  },
  {
    icon: FiShoppingCart,
    title: 'Place Order',
    desc: 'Add items to cart and checkout',
  },
  {
    icon: FiTruck,
    title: 'Fast Delivery',
    desc: 'Get food delivered to your doorstep',
  },
];

const DEFAULT_CATEGORIES = [
  { name: 'Fast Food', slug: 'fast-food' },
  { name: 'Pizza', slug: 'pizza' },
  { name: 'Biryani', slug: 'biryani' },
  { name: 'Chinese', slug: 'chinese' },
  { name: 'BBQ', slug: 'bbq' },
  { name: 'Desserts', slug: 'desserts' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [restRes, catRes] = await Promise.all([
          API.get('restaurants/', { params: { page_size: 8 } }).catch(() => null),
          API.get('restaurants/categories/').catch(() => null),
        ]);
        if (restRes?.data?.results) setRestaurants(restRes.data.results);
        else if (restRes?.data && Array.isArray(restRes.data)) setRestaurants(restRes.data);
        if (catRes?.data?.length) setCategories(catRes.data);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Delicious Food, Delivered<br className="hidden sm:block" /> To Your Door
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            Order from the best restaurants in your city
          </p>
          <form
            onSubmit={handleSearch}
            className="mt-8 max-w-xl mx-auto flex bg-white rounded-xl overflow-hidden shadow-lg"
          >
            <div className="flex-1 flex items-center px-4">
              <FiSearch className="text-gray-400 shrink-0" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants or dishes..."
                className="w-full px-3 py-3.5 text-gray-700 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 bg-primary text-white font-medium hover:bg-primary/90 transition"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon size={28} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            What are you craving?
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat.slug || cat.id}
                to={`/restaurants?category=${cat.slug || cat.name.toLowerCase()}`}
                className="shrink-0 w-28 flex flex-col items-center gap-2 group"
              >
                <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden border-2 border-transparent group-hover:border-primary transition">
                  <img
                    src={cat.image || `https://placehold.co/160x160/f3f4f6/FF6B35?text=${encodeURIComponent(cat.name)}`}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition text-center">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Popular Restaurants
            </h2>
            <Link
              to="/restaurants"
              className="text-primary font-medium hover:underline hidden sm:inline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <RestaurantCardSkeleton key={i} />
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restaurants.slice(0, 8).map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">
              No restaurants available yet. Check back soon!
            </p>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link
              to="/restaurants"
              className="inline-block px-6 py-2.5 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition"
            >
              View All Restaurants
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Own a restaurant? Partner with us
          </h2>
          <p className="text-gray-700 mt-2 max-w-lg mx-auto">
            Reach more customers, grow your business, and manage orders seamlessly.
          </p>
          <Link
            to="/register"
            className="inline-block mt-6 px-8 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-secondary/90 transition"
          >
            Register Your Restaurant
          </Link>
        </div>
      </section>
    </div>
  );
}
