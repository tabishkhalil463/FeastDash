import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiClipboard,
  FiDollarSign,
  FiStar,
  FiClock,
  FiSettings,
  FiList,
  FiPackage,
} from 'react-icons/fi';
import API from '../../services/api';
import { formatPrice } from '../../utils/currency';
import toast from 'react-hot-toast';

export default function RestaurantDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('restaurants/dashboard/')
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="h-8 w-8 border-4 border-primary-accent/30 border-t-primary-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.has_restaurant) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-white dark:bg-surface-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8">
          <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-4">
            <FiSettings size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Set Up Your Restaurant
          </h2>
          <p className="text-gray-500 mt-2">
            Create your restaurant profile to start receiving orders.
          </p>
          <Link
            to="/restaurant/setup"
            className="inline-block mt-6 px-6 py-2.5 gradient-accent text-white rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  const { restaurant, stats, recent_orders } = data;

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.total_orders,
      icon: FiClipboard,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Revenue',
      value: formatPrice(stats.total_revenue),
      icon: FiDollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Average Rating',
      value: `${Number(stats.average_rating).toFixed(1)} / 5`,
      icon: FiStar,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Pending Orders',
      value: stats.pending_orders_count,
      icon: FiClock,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-purple-100 text-purple-700',
    ready: 'bg-cyan-100 text-cyan-700',
    picked_up: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {restaurant.name}
          </h1>
          <span
            className={`inline-block text-xs px-2.5 py-0.5 rounded-full mt-1 font-medium ${
              restaurant.is_approved
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {restaurant.is_approved ? 'Approved' : 'Pending Approval'}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white dark:bg-surface-card-dark rounded-2xl border border-gray-100 dark:border-white/5 p-5"
            >
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          to="/restaurant/menu"
          className="flex items-center gap-2 px-5 py-2.5 gradient-accent text-white rounded-lg font-medium hover:bg-primary/90 transition"
        >
          <FiList size={16} /> Manage Menu
        </Link>
        <Link
          to="/restaurant/orders"
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          <FiPackage size={16} /> View Orders
        </Link>
        <Link
          to="/restaurant/setup"
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          <FiSettings size={16} /> Edit Restaurant
        </Link>
      </div>

      {/* Recent orders */}
      <div className="bg-white dark:bg-surface-card-dark rounded-2xl border border-gray-100 dark:border-white/5">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Orders
          </h2>
        </div>
        {recent_orders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Order #</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.map((o) => (
                  <tr key={o.order_number} className="border-b border-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">
                      {o.order_number}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{o.customer}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {formatPrice(o.total)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-10 text-center text-gray-400">
            No orders yet.
          </p>
        )}
      </div>
    </div>
  );
}
