import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiShoppingCart,
  FiTruck,
  FiList,
  FiArrowRight,
  FiStar,
  FiUsers,
  FiMapPin,
} from 'react-icons/fi';
import API from '../../services/api';
import RestaurantCard from '../../components/common/RestaurantCard';
import { RestaurantCardSkeleton } from '../../components/common/LoadingSkeleton';

const STEPS = [
  {
    icon: FiList,
    title: 'Browse Restaurants',
    desc: 'Explore a curated list of top-rated restaurants near you',
    color: 'from-primary-dark to-primary-mid',
  },
  {
    icon: FiShoppingCart,
    title: 'Place Your Order',
    desc: 'Add your favourite dishes to cart and checkout in seconds',
    color: 'from-primary-mid to-primary-accent',
  },
  {
    icon: FiTruck,
    title: 'Lightning Delivery',
    desc: 'Sit back and relax while we deliver fresh food to your door',
    color: 'from-primary-accent to-primary-light',
  },
];

const CATEGORIES = [
  { name: 'Biryani', slug: 'biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop' },
  { name: 'Fast Food', slug: 'fast-food', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
  { name: 'Pizza', slug: 'pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop' },
  { name: 'BBQ', slug: 'bbq', image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&h=200&fit=crop' },
  { name: 'Chinese', slug: 'chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop' },
  { name: 'Desserts', slug: 'desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&h=200&fit=crop' },
  { name: 'Pakistani', slug: 'pakistani', image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=200&h=200&fit=crop' },
  { name: 'Karahi', slug: 'karahi', image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=200&h=200&fit=crop' },
];

const STATS = [
  { icon: FiMapPin, value: '50+', label: 'Cities' },
  { icon: FiUsers, value: '10K+', label: 'Happy Customers' },
  { icon: FiStar, value: '500+', label: 'Restaurants' },
  { icon: FiTruck, value: '100K+', label: 'Orders Delivered' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('restaurants/', { params: { page_size: 8 } }).catch(() => null);
        if (res?.data?.results) setRestaurants(res.data.results);
        else if (res?.data && Array.isArray(res.data)) setRestaurants(res.data);
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
      <section className="relative overflow-hidden gradient-primary min-h-[600px] flex items-center">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium mb-6">
            <FiStar size={14} className="text-primary-light" />
            #1 Food Delivery Platform in Pakistan
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold text-white leading-tight">
            Delicious Food,
            <br />
            <span className="bg-gradient-to-r from-primary-light to-white bg-clip-text text-transparent">
              Delivered Fast
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Order from the best restaurants in your city. Fresh, hot meals delivered to your doorstep in minutes.
          </p>
          <form
            onSubmit={handleSearch}
            className="mt-10 max-w-2xl mx-auto flex bg-white dark:bg-surface-card-dark rounded-2xl overflow-hidden shadow-2xl shadow-black/20"
          >
            <div className="flex-1 flex items-center px-5">
              <FiSearch className="text-gray-400 shrink-0" size={22} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants or dishes..."
                className="w-full px-4 py-4 text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none text-lg"
              />
            </div>
            <button
              type="submit"
              className="px-8 gradient-accent text-white font-semibold hover:opacity-90 transition text-lg"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-surface-light dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Three simple steps to get your favourite food delivered
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="group relative bg-white dark:bg-surface-card-dark rounded-2xl p-8 text-center shadow-lg border border-gray-100 dark:border-white/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>
                  <div className="mt-8">
                    <span className="text-xs font-bold text-primary-accent/60 uppercase tracking-wider">
                      Step {i + 1}
                    </span>
                    <h3 className="font-heading font-semibold text-gray-900 dark:text-white text-lg mt-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white dark:bg-surface-card-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white">
              What are you craving?
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Explore our most popular food categories
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/restaurants?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-transparent group-hover:ring-primary-accent shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-accent transition text-center">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-20 bg-surface-light dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white">
                Popular Restaurants
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                The most loved restaurants in your area
              </p>
            </div>
            <Link
              to="/restaurants"
              className="hidden sm:inline-flex items-center gap-2 text-primary-accent font-semibold hover:gap-3 transition-all"
            >
              View All <FiArrowRight size={16} />
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
            <p className="text-gray-500 dark:text-gray-400 text-center py-12">
              No restaurants available yet. Check back soon!
            </p>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 px-6 py-3 gradient-accent text-white rounded-xl font-semibold shadow-lg"
            >
              View All Restaurants <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon size={24} className="text-primary-light" />
                </div>
                <div className="text-3xl sm:text-4xl font-heading font-bold text-white">{value}</div>
                <div className="text-white/60 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-surface-card-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white">
            Own a restaurant? <span className="gradient-text">Partner with us</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-lg mx-auto text-lg leading-relaxed">
            Reach more customers, grow your business, and manage orders seamlessly with FeastDash.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 gradient-primary text-white rounded-xl font-semibold shadow-lg shadow-primary-dark/25 hover:shadow-xl hover:shadow-primary-dark/30 transition-all duration-200 text-lg"
          >
            Register Your Restaurant <FiArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
