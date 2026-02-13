import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import API, { mediaUrl } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatPrice } from '../../utils/currency';
import toast from 'react-hot-toast';

const TABS = [
  { value: 'all', label: 'All', statuses: [] },
  { value: 'active', label: 'Active', statuses: ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'] },
  { value: 'completed', label: 'Completed', statuses: ['delivered'] },
  { value: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
];

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    setLoading(true);
    const activeTab = TABS.find((t) => t.value === tab);
    const params = { page };
    if (activeTab?.statuses.length === 1) {
      params.status = activeTab.statuses[0];
    }
    API.get('orders/', { params })
      .then(({ data }) => {
        let list = data.results || data;
        // Client-side filter for multi-status tabs
        if (activeTab?.statuses.length > 1) {
          list = list.filter((o) => activeTab.statuses.includes(o.status));
        }
        setOrders(list);
        setHasNext(!!data.next);
      })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [tab, page]);

  useEffect(() => { setPage(1); }, [tab]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              tab === t.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FiPackage size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">
            {tab === 'all' ? 'No orders yet' : `No ${tab} orders`}
          </p>
          {tab === 'all' && (
            <Link to="/restaurants" className="inline-block mt-4 px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition">
              Order Now
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} to={`/orders/${order.order_number}`}
                className="block bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    <img
                      src={mediaUrl(order.restaurant_image) || `https://placehold.co/80x80/f3f4f6/9ca3af?text=R`}
                      alt={order.restaurant_name} loading="lazy" className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{order.restaurant_name}</h3>
                      <FiChevronRight size={18} className="text-gray-400 shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>{order.order_number}</span>
                      <span>{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>
                      <span className="font-medium text-gray-900">{formatPrice(Number(order.grand_total))}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge status={order.status} />
                      <span className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-3 mt-8">
            {page > 1 && (
              <button onClick={() => setPage(page - 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                Previous
              </button>
            )}
            {hasNext && (
              <button onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
                Next
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
