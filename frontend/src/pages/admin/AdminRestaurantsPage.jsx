import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiCheck, FiX } from 'react-icons/fi';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminRestaurantsPage() {
  const [tab, setTab] = useState('pending');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRestaurants = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page });
    if (tab === 'pending') params.set('is_approved', 'false');
    if (search) params.set('search', search);
    API.get(`admin/restaurants/?${params}`)
      .then(({ data }) => {
        setRestaurants(data.results);
        setTotalPages(Math.ceil(data.count / 20));
      })
      .catch(() => toast.error('Failed to load restaurants'))
      .finally(() => setLoading(false));
  }, [page, tab, search]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const handleApproval = async (id, action) => {
    try {
      const { data } = await API.patch(`admin/restaurants/${id}/approve/`, { action });
      toast.success(data.message);
      fetchRestaurants();
    } catch {
      toast.error('Failed to update restaurant');
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setPage(1);
    setSearch('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Restaurants</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {['pending', 'all'].map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'pending' ? 'Pending Approval' : 'All Restaurants'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search restaurants..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          {tab === 'pending' ? 'No restaurants pending approval' : 'No restaurants found'}
        </div>
      ) : tab === 'pending' ? (
        /* Pending cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restaurants.map((r) => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{r.name}</h3>
                  <p className="text-sm text-gray-500">{r.cuisine_type} &middot; {r.city}</p>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleApproval(r.id, 'approve')}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"
                >
                  <FiCheck size={16} /> Approve
                </button>
                <button
                  onClick={() => handleApproval(r.id, 'reject')}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition"
                >
                  <FiX size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* All restaurants table */
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Cuisine</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.city}</td>
                  <td className="px-4 py-3 text-gray-500">{r.cuisine_type}</td>
                  <td className="px-4 py-3 text-gray-500">{r.average_rating}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!r.is_approved ? (
                      <button
                        onClick={() => handleApproval(r.id, 'approve')}
                        className="text-xs px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="text-xs text-green-600 font-medium">Approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      )}
    </div>
  );
}
