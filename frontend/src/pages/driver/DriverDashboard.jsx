import { useState, useEffect } from 'react';
import { FiNavigation, FiPackage, FiClock, FiCheck, FiMapPin, FiPhone, FiTruck } from 'react-icons/fi';
import API from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatPrice } from '../../utils/currency';
import toast from 'react-hot-toast';

const DRIVER_ACTIONS = {
  ready: { label: 'Pick Up', next: 'picked_up', color: 'bg-indigo-600 hover:bg-indigo-700' },
  picked_up: { label: 'Mark Delivered', next: 'delivered', color: 'bg-green-600 hover:bg-green-700' },
};

export default function DriverDashboard() {
  const [activeOrder, setActiveOrder] = useState(null);
  const [available, setAvailable] = useState([]);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('available');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [activeRes, availableRes, historyRes] = await Promise.all([
        API.get('driver/active-order/').catch(() => ({ data: null })),
        API.get('driver/available-orders/').catch(() => ({ data: [] })),
        API.get('driver/order-history/').catch(() => ({ data: [] })),
      ]);
      setActiveOrder(activeRes.data);
      setAvailable(availableRes.data.results || availableRes.data || []);
      setHistory(historyRes.data.results || historyRes.data || []);
    } catch {
      // silent
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, []);

  const handleAccept = async (orderNumber) => {
    setUpdating(true);
    try {
      await API.post(`driver/orders/${orderNumber}/accept/`);
      toast.success('Order accepted!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept');
    }
    setUpdating(false);
  };

  const handleStatusUpdate = async (orderNumber, newStatus) => {
    setUpdating(true);
    try {
      await API.patch(`driver/orders/${orderNumber}/update/`, { status: newStatus });
      toast.success(`Order ${newStatus.replace('_', ' ')}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.status?.[0] || 'Failed to update');
    }
    setUpdating(false);
  };

  // Today's stats
  const today = new Date().toDateString();
  const todayDeliveries = history.filter((o) => new Date(o.created_at).toDateString() === today);
  const todayEarnings = todayDeliveries.reduce((sum, o) => sum + Number(o.grand_total), 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
      </div>

      {/* Availability Toggle */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{isAvailable ? 'Available' : 'Unavailable'}</p>
          <p className="text-sm text-gray-500">
            {isAvailable ? "You'll receive new delivery requests" : "You won't receive new delivery requests"}
          </p>
        </div>
        <button onClick={() => setIsAvailable(!isAvailable)}
          className={`relative w-14 h-7 rounded-full transition-colors ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}>
          <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${isAvailable ? 'translate-x-7' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-5 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiCheck size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayDeliveries.length}</p>
          <p className="text-sm text-gray-500">Deliveries Today</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 text-center">
          <div className="w-10 h-10 bg-primary-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiTruck size={20} className="text-primary-accent" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(todayEarnings)}</p>
          <p className="text-sm text-gray-500">Today's Earnings</p>
        </div>
      </div>

      {/* Active Order Card */}
      {activeOrder && (
        <div className="bg-primary-accent/5 border-2 border-primary-accent/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiNavigation className="text-primary-accent" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Active Delivery</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">{activeOrder.order_number}</span>
              <StatusBadge status={activeOrder.status} />
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Restaurant:</span> {activeOrder.restaurant_name}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FiMapPin size={14} /> <span className="font-medium">Deliver to:</span> {activeOrder.delivery_address}, {activeOrder.delivery_city}
            </p>
            {activeOrder.restaurant_phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FiPhone size={14} /> Restaurant: {activeOrder.restaurant_phone}
              </p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-primary/10">
              <div>
                <span className="font-medium text-gray-900 text-lg">{formatPrice(Number(activeOrder.grand_total))}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {activeOrder.payment_method === 'cod' ? '(Collect Cash)' : '(Paid Online)'}
                </span>
              </div>
              {DRIVER_ACTIONS[activeOrder.status] && (
                <button
                  onClick={() => handleStatusUpdate(activeOrder.order_number, DRIVER_ACTIONS[activeOrder.status].next)}
                  disabled={updating}
                  className={`px-5 py-2.5 text-white rounded-lg font-medium transition disabled:opacity-50 ${DRIVER_ACTIONS[activeOrder.status].color}`}
                >
                  {updating ? 'Updating...' : DRIVER_ACTIONS[activeOrder.status].label}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setView('available')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            view === 'available' ? 'gradient-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          Available Orders ({available.length})
        </button>
        <button onClick={() => setView('history')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            view === 'history' ? 'gradient-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          Delivery History ({history.length})
        </button>
      </div>

      {view === 'available' && (
        !isAvailable ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-gray-500 font-medium">You are currently unavailable</p>
            <p className="text-sm text-gray-400 mt-1">Toggle availability to see orders</p>
          </div>
        ) : available.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FiPackage size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No available orders right now</p>
            <p className="text-sm text-gray-400 mt-1">New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="space-y-4">
            {available.map((order) => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{order.order_number}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-600">{order.restaurant_name}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                      <span>{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>
                      <span className="font-medium text-gray-900">{formatPrice(Number(order.grand_total))}</span>
                      <span className="capitalize">{order.payment_method === 'cod' ? 'COD' : order.payment_method}</span>
                      <span className="flex items-center gap-1">
                        <FiClock size={12} />
                        {new Date(order.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAccept(order.order_number)}
                    disabled={updating || !!activeOrder}
                    className="px-5 py-2.5 gradient-accent text-white rounded-lg font-medium hover:bg-primary/90 transition shrink-0 disabled:opacity-50"
                  >
                    {updating ? 'Accepting...' : 'Accept Delivery'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {view === 'history' && (
        history.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FiCheck size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No delivery history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((order) => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900">{order.order_number}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-500">{order.restaurant_name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>
                        {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span>{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <span className="font-medium text-gray-900">{formatPrice(Number(order.grand_total))}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
