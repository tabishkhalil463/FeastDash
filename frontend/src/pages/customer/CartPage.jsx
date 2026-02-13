import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { mediaUrl } from '../../services/api';
import { formatPrice } from '../../utils/currency';

export default function CartPage() {
  const { items, restaurant, itemsCount, updateQuantity, removeItem, clearCart, getCartTotal } = useCart();
  const { subtotal, deliveryFee, tax, grandTotal } = getCartTotal();
  const [clearOpen, setClearOpen] = useState(false);

  if (itemsCount === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <FiShoppingBag size={36} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/restaurants" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          {restaurant && (
            <p className="text-gray-500 mt-1">
              From <Link to={`/restaurants/${restaurant.slug}`} className="text-primary font-medium hover:underline">{restaurant.name}</Link>
            </p>
          )}
        </div>
        <button onClick={() => setClearOpen(true)} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
          <FiTrash2 size={14} /> Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((ci) => {
            const item = ci.menu_item;
            const price = Number(item.discounted_price || item.price);
            return (
              <div key={ci.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  <img
                    src={mediaUrl(item.image) || `https://placehold.co/100x100/f3f4f6/9ca3af?text=${encodeURIComponent(item.name[0])}`}
                    alt={item.name} loading="lazy" className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-primary font-medium text-sm">{formatPrice(price)}</p>
                    </div>
                    <button onClick={() => removeItem(ci.id)} aria-label="Remove item" className="text-gray-400 hover:text-red-500 p-1">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  {ci.special_instructions && (
                    <p className="text-xs text-gray-400 mt-1 truncate">{ci.special_instructions}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <button onClick={() => updateQuantity(ci.id, ci.quantity - 1)} aria-label="Decrease quantity"
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                      -
                    </button>
                    <span className="font-medium text-gray-900 w-6 text-center">{ci.quantity}</span>
                    <button onClick={() => updateQuantity(ci.id, ci.quantity + 1)} aria-label="Increase quantity"
                      className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90">
                      +
                    </button>
                    <span className="ml-auto font-medium text-gray-900">{formatPrice(price * ci.quantity)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal ({itemsCount} items)</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span><span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax (5%)</span><span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 text-lg pt-3 border-t border-gray-100">
                <span>Total</span><span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
            {restaurant?.minimum_order > 0 && subtotal < Number(restaurant.minimum_order) && (
              <p className="text-xs text-red-500 mt-3">
                Minimum order is {formatPrice(Number(restaurant.minimum_order))}. Add {formatPrice(Number(restaurant.minimum_order) - subtotal)} more.
              </p>
            )}
            <Link to="/checkout"
              className="block w-full text-center bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium transition mt-4">
              Proceed to Checkout
            </Link>
            <Link to="/restaurants" className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-primary mt-3">
              <FiArrowLeft size={14} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={clearOpen}
        title="Clear Cart?"
        message="Are you sure you want to remove all items from your cart?"
        confirmLabel="Clear Cart"
        confirmColor="bg-red-500"
        onCancel={() => setClearOpen(false)}
        onConfirm={() => { clearCart(); setClearOpen(false); }}
      />
    </div>
  );
}
