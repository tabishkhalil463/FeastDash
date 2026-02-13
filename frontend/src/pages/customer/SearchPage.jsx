import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import API, { mediaUrl } from '../../services/api';
import RestaurantCard from '../../components/common/RestaurantCard';
import { formatPrice } from '../../utils/currency';

const POPULAR = ['Biryani', 'Pizza', 'Burger', 'Chinese', 'BBQ'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState({ restaurants: [], menu_items: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQ);
  const inputRef = useRef();
  const timerRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = useCallback((q) => {
    if (!q.trim()) {
      setResults({ restaurants: [], menu_items: [] });
      setSearched(false);
      setSearchParams({});
      return;
    }
    setLoading(true);
    setSearched(true);
    setSearchParams({ q });
    API.get(`restaurants/search/?q=${encodeURIComponent(q)}`)
      .then(({ data }) => setResults(data))
      .catch(() => setResults({ restaurants: [], menu_items: [] }))
      .finally(() => setLoading(false));
  }, [setSearchParams]);

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
  }, []); // eslint-disable-line

  const handleChange = (val) => {
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleChip = (term) => {
    setQuery(term);
    doSearch(term);
  };

  const hasResults = results.restaurants.length > 0 || results.menu_items.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search input */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <FiSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search restaurants, dishes..."
            aria-label="Search restaurants and dishes"
            className="w-full pl-12 pr-10 py-4 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          {query && (
            <button onClick={() => { setQuery(''); doSearch(''); }} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Popular searches */}
      {!searched && (
        <div className="text-center">
          <p className="text-gray-500 mb-4">Popular Searches</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {POPULAR.map((term) => (
              <button
                key={term}
                onClick={() => handleChip(term)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-full text-sm font-medium text-gray-700 transition"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <>
          {!hasResults ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No results for "{query}"</h2>
              <p className="text-gray-500">Try a different search term or browse our restaurants</p>
            </div>
          ) : (
            <>
              {/* Restaurants */}
              {results.restaurants.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Restaurants</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {results.restaurants.map((r) => (
                      <RestaurantCard key={r.id} restaurant={r} />
                    ))}
                  </div>
                </section>
              )}

              {/* Dishes */}
              {results.menu_items.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Dishes</h2>
                  <div className="space-y-3">
                    {results.menu_items.map((item) => (
                      <Link
                        key={item.id}
                        to={`/restaurants/${item.restaurant_slug}`}
                        className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition"
                      >
                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          <img
                            src={mediaUrl(item.image) || `https://placehold.co/80x80/f3f4f6/9ca3af?text=${encodeURIComponent(item.name[0])}`}
                            alt={item.name} loading="lazy" className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-sm text-gray-500 truncate">{item.restaurant_name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {item.discounted_price ? (
                            <>
                              <p className="font-semibold text-primary">{formatPrice(Number(item.discounted_price))}</p>
                              <p className="text-xs text-gray-400 line-through">{formatPrice(Number(item.price))}</p>
                            </>
                          ) : (
                            <p className="font-semibold text-gray-900">{formatPrice(Number(item.price))}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
