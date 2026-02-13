import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import RestaurantCard from '../../components/common/RestaurantCard';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonGrid } from '../../components/common/LoadingSkeleton';
import { FiFilter, FiSearch } from 'react-icons/fi';

const CUISINES = [
  'All',
  'Pakistani',
  'Chinese',
  'Fast Food',
  'BBQ',
  'Pizza',
  'Biryani',
  'Desserts',
  'Karahi',
  'Continental',
];

const SORT_OPTIONS = [
  { label: 'Rating', value: '-average_rating' },
  { label: 'Delivery Time', value: 'estimated_delivery_time' },
  { label: 'Delivery Fee', value: 'delivery_fee' },
  { label: 'Newest', value: '-created_at' },
];

export default function RestaurantListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [cuisine, setCuisine] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState('-average_rating');
  const [city, setCity] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, [page, search, cuisine, sort, city]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = { page, ordering: sort };
      if (search) params.search = search;
      if (cuisine && cuisine !== 'All') params.cuisine_type = cuisine;
      if (city) params.city = city;

      const { data } = await API.get('restaurants/', { params });
      setRestaurants(data.results || data);
      if (data.count != null) {
        setTotalPages(Math.ceil(data.count / 12) || 1);
      }
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCuisine('All');
    setSort('-average_rating');
    setCity('');
    setPage(1);
    setSearchParams({});
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white mb-6">
        All Restaurants
      </h1>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        <SearchBar
          placeholder="Search restaurants..."
          value={search}
          onChange={handleSearchChange}
          className="w-full sm:w-64"
        />
        <select
          value={cuisine}
          onChange={(e) => { setCuisine(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-card-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-accent/50"
        >
          {CUISINES.map((c) => (
            <option key={c} value={c}>{c === 'All' ? 'All Cuisines' : c}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-card-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-accent/50"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>Sort: {o.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={city}
          onChange={(e) => { setCity(e.target.value); setPage(1); }}
          placeholder="City"
          className="px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-card-dark dark:text-white text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary-accent/50"
        />
      </div>

      {/* Results */}
      {loading ? (
        <SkeletonGrid count={8} />
      ) : restaurants.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium ${
                        p === page
                          ? 'gradient-accent text-white'
                          : 'border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 dark:text-gray-300'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={FiSearch}
          title="No restaurants found"
          description="Try adjusting your search or filters"
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      )}
    </div>
  );
}
