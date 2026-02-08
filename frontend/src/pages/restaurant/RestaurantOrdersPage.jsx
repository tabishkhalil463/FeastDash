import { useState, useEffect, useRef } from 'react';
import { FiRefreshCw, FiClock, FiPackage, FiChevronDown, FiMapPin } from 'react-icons/fi';
import API from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatPrice } from '../../utils/currency';
import toast from 'react-hot-toast';

const TABS = [
  { value: 'new', label: 'New', statuses: ['pending'] },
  { value: 'active', label: 'Active', statuses: ['confirmed', 'preparing', 'ready'] },
  { value: 'completed', label: 'Completed', statuses: ['delivered'] },
  { value: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
];

const ACTIONS = {
  pending: [
    { label: 'Accept Order', next: 'confirmed', color: 'bg-green-600 hover:bg-green-700' },
  ],
  confirmed: [
    { label: 'Start Preparing', next: 'preparing', color: 'bg-orange-500 hover:bg-orange-600' },
  ],
  preparing: [
    { label: 'Mark Ready', next: 'ready', color: 'bg-purple-600 hover:bg-purple-700' },
  ],
};

function timeAgo(dateStr) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RestaurantOrdersPage() {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('new');
  const [updating, setUpdating] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedDetail, setExpandedDetail] = useState(null);
  const refreshRef = useRef();

  const fetchOrders = (showLoading = true) => {
    if (showLoading) setLoading(true);
    API.get('restaurant/orders/')
      .then(({ data }) => setAllOrders(data.results || data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    refreshRef.current = setInterval(() => fetchOrders(false), 30000);
    return () => clearInterval(refreshRef.current);
  }, []);

  const activeTab = TABS.find((t) => t.value === tab);
  const filtered = allOrders.filter((o) => activeTab?.statuses.includes(o.status));

  // Count badges
  const counts = {};
  TABS.forEach((t) => {
    counts[t.value] = allOrders.filter((o) => t.statuses.includes(o.status)).length;
  });

  const handleStatusUpdate = async (orderNumber, newStatus) => {
    setUpdating(orderNumber);
    try {
      await API.patch(`restaurant/orders/${orderNumber}/update/`, { status: newStatus });
      toast.success(`Order ${newStatus}`);
      fetchOrders(false);
    } catch (err) {
      toast.error(err.response?.data?.status?.[0] || 'Failed to update');
    }
    setUpdating(null);
  };

  const toggleExpand = async (orderId, orderNumber) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      setExpandedDetail(null);
      return;
    }
    setExpandedId(orderId);
    try {
      // Fetch full detail for this order through the restaurant order endpoint
      // We'll use the basic info we already have since restaurant endpoint doesn't expose full detail
      setExpandedDetail(null);
    } catch {
      // silent
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button onClick={() => fetchOrders(false)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter Tabs with counts */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${
              tab === t.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {t.label}
            {counts[t.value] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === t.value ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {counts[t.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FiPackage size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No {activeTab?.label.toLowerCase()} orders</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const actions = ACTIONS[order.status] || [];
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(order.id, order.order_number)}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">{order.order_number}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>
                        <span className="font-medium text-gray-900">{formatPrice(Number(order.grand_total))}</span>
                        <span className="capitalize">{order.payment_method === 'cod' ? 'COD' : order.payment_method}</span>
                        <span className="flex items-center gap-1">
                          <FiClock size={12} /> {timeAgo(order.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {actions.map((action) => (
                        <button key={action.next}
                          onClick={() => handleStatusUpdate(order.order_number, action.next)}
                          disabled={updating === order.order_number}
                          className={`px-5 py-2.5 text-white rounded-lg font-medium transition disabled:opacity-50 ${action.color}`}
                        >
                          {updating === order.order_number ? 'Updating...' : action.label}
                        </button>
                      ))}
                      <button onClick={() => toggleExpand(order.id, order.order_number)}
                        className="p-2 text-gray-400 hover:text-gray-600">
                        <FiChevronDown size={18} className={`transition ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 text-sm space-y-2">
                    <p className="text-gray-500">
                      <span className="font-medium text-gray-700">Payment:</span>{' '}
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method} &mdash;{' '}
                      <StatusBadge status={order.payment_status} />
                    </p>
                    <p className="text-gray-500">
                      <span className="font-medium text-gray-700">Placed:</span>{' '}
                      {new Date(order.created_at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {order.status === 'ready' && (
                      <p className="text-purple-600 font-medium">Waiting for driver pickup...</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
