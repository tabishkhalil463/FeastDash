import { useState, useEffect } from 'react';
import { FiUsers, FiShoppingBag, FiClipboard, FiDollarSign } from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import API from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatPrice } from '../../utils/currency';

const STAT_CARDS = [
  { key: 'total_users', label: 'Total Users', icon: FiUsers, color: 'bg-blue-500' },
  { key: 'total_restaurants', label: 'Total Restaurants', icon: FiShoppingBag, color: 'bg-green-500' },
  { key: 'total_orders', label: 'Total Orders', icon: FiClipboard, color: 'bg-orange-500' },
  { key: 'total_revenue', label: 'Total Revenue', icon: FiDollarSign, color: 'bg-purple-500', isCurrency: true },
];

const PIE_COLORS = ['#eab308', '#3b82f6', '#f97316', '#8b5cf6', '#6366f1', '#22c55e', '#ef4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('admin/dashboard/')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-white rounded-xl animate-pulse" />)}
        </div>
        <div className="h-80 bg-white rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!stats) return <p className="text-gray-500 text-center py-20">Failed to load dashboard</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, isCurrency }) => (
          <div key={key} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                <Icon size={22} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isCurrency ? formatPrice(Number(stats[key])) : stats[key]?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders per day */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Orders (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stats.orders_per_day}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis allowDecimals={false} />
              <Tooltip labelFormatter={(d) => d} />
              <Line type="monotone" dataKey="count" stroke="#FF6B35" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue per day */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.revenue_per_day}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatPrice(Number(v))} labelFormatter={(d) => d} />
              <Bar dataKey="amount" fill="#004E89" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders by status + Popular restaurants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats.orders_by_status}
                dataKey="count"
                nameKey="status"
                cx="50%" cy="50%"
                outerRadius={100}
                label={({ status, count }) => `${status} (${count})`}
              >
                {stats.orders_by_status.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Popular restaurants */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Popular Restaurants</h3>
          <div className="space-y-3">
            {stats.popular_restaurants.map((r, i) => (
              <div key={r.id} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.cuisine_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{r.order_count} orders</p>
                  <p className="text-xs text-gray-500">{r.average_rating} rating</p>
                </div>
              </div>
            ))}
            {stats.popular_restaurants.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Order #</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Restaurant</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_orders.map((o) => (
                <tr key={o.order_number} className="border-b border-gray-50">
                  <td className="py-3 font-mono text-xs">{o.order_number}</td>
                  <td className="py-3">{o.customer}</td>
                  <td className="py-3">{o.restaurant}</td>
                  <td className="py-3 font-medium">{formatPrice(Number(o.grand_total))}</td>
                  <td className="py-3"><StatusBadge status={o.status} /></td>
                  <td className="py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString('en-PK')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
