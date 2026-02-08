import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import API, { mediaUrl } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatPrice } from '../../utils/currency';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered'];

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);

  const fetchOrder = () => {
    API.get(`orders/${orderNumber}/`)
      .then(({ data }) => setOrder(data))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [orderNumber]);

  const handleCancel = async () => {
    try {
      await API.post(`orders/${orderNumber}/cancel/`);
      toast.success('Order cancelled');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    }
    setCancelOpen(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">
        Order not found
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const isCancelled = order.status === 'cancelled';
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
        <FiArrowLeft size={14} /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Progress stepper */}
      {!isCancelled && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Order Progress</h3>
          <div className="flex items-center">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-initial">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                  i <= currentStepIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i <= currentStepIndex ? '✓' : i + 1}
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 rounded ${i < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STATUS_STEPS.map((s) => (
              <span key={s} className="text-[10px] text-gray-400 capitalize w-12 text-center">{s.replace('_', ' ')}</span>
            ))}
          </div>
        </div>
      )}

      {/* Restaurant & Driver Info */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
            <img src={mediaUrl(order.restaurant_image) || 'https://placehold.co/80x80/f3f4f6/9ca3af?text=R'}
              alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{order.restaurant_name}</p>
            {order.restaurant_phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1"><FiPhone size={12} /> {order.restaurant_phone}</p>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-500 space-y-1">
          <p className="flex items-center gap-1"><FiMapPin size={14} /> {order.delivery_address}, {order.delivery_city}</p>
          {order.estimated_delivery && (
            <p className="flex items-center gap-1"><FiClock size={14} /> Est. delivery: {new Date(order.estimated_delivery).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</p>
          )}
        </div>
        {order.driver_name && (
          <div className="border-t border-gray-100 mt-4 pt-4">
            <p className="text-sm text-gray-500">Driver: <span className="font-medium text-gray-900">{order.driver_name}</span></p>
            {order.driver_phone && <p className="text-sm text-gray-500"><FiPhone size={12} className="inline" /> {order.driver_phone}</p>}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                <img src={mediaUrl(item.menu_item_image) || 'https://placehold.co/60x60/f3f4f6/9ca3af?text=F'}
                  alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.menu_item_name}</p>
                <p className="text-xs text-gray-500">{item.quantity} x {formatPrice(Number(item.price))}</p>
              </div>
              <span className="text-sm font-medium text-gray-900">{formatPrice(Number(item.subtotal))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPrice(Number(order.total_amount))}</span></div>
          <div className="flex justify-between text-gray-500"><span>Delivery Fee</span><span>{formatPrice(Number(order.delivery_fee))}</span></div>
          <div className="flex justify-between text-gray-500"><span>Tax</span><span>{formatPrice(Number(order.tax_amount))}</span></div>
          <div className="flex justify-between font-semibold text-gray-900 text-lg pt-3 border-t border-gray-100">
            <span>Total</span><span>{formatPrice(Number(order.grand_total))}</span>
          </div>
          <div className="flex justify-between text-gray-500 pt-2">
            <span>Payment Method</span>
            <span className="capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Payment Status</span><StatusBadge status={order.payment_status} />
          </div>
        </div>
      </div>

      {order.special_instructions && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Special Instructions</h3>
          <p className="text-sm text-gray-500">{order.special_instructions}</p>
        </div>
      )}

      {canCancel && (
        <button onClick={() => setCancelOpen(true)}
          className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition">
          Cancel Order
        </button>
      )}

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Cancel Order"
        confirmColor="bg-red-500"
        onCancel={() => setCancelOpen(false)}
        onConfirm={handleCancel}
      />
    </div>
  );
}
