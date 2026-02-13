import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import ConfirmDialog from '../common/ConfirmDialog';
import { mediaUrl } from '../../services/api';
import { formatPrice } from '../../utils/currency';

export default function CartDrawer({ open, onClose }) {
  const { items, restaurant, itemsCount, updateQuantity, removeItem, clearCart, getCartTotal } = useCart();
  const { subtotal, deliveryFee, tax, grandTotal } = getCartTotal();
  const [clearOpen, setClearOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-surface-dark z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Cart</h2>
          <button onClick={onClose} aria-label="Close cart" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
            <FiX size={22} />
          </button>
        </div>

        {/* Body */}
        {itemsCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-4">
              <FiShoppingBag size={28} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Your cart is empty</p>
            <Link to="/restaurants" onClick={onClose}
              className="mt-4 px-5 py-2 gradient-accent text-white rounded-xl text-sm font-medium hover:opacity-90 transition">
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {/* Restaurant name */}
              {restaurant && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  From <span className="font-medium text-gray-700 dark:text-gray-300">{restaurant.name}</span>
                </p>
              )}

              {/* Items */}
              <div className="space-y-4">
                {items.map((ci) => {
                  const item = ci.menu_item;
                  const price = Number(item.discounted_price || item.price);
                  return (
                    <div key={ci.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0">
                        <img
                          src={mediaUrl(item.image) || `https://placehold.co/100x100/f3f4f6/9ca3af?text=${encodeURIComponent(item.name[0])}`}
                          alt={item.name} loading="lazy" className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-sm text-primary-accent font-medium">{formatPrice(price)}</p>
                        {ci.special_instructions && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{ci.special_instructions}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <button onClick={() => updateQuantity(ci.id, ci.quantity - 1)} aria-label="Decrease quantity"
                            className="w-7 h-7 rounded border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 text-sm">
                            -
                          </button>
                          <span className="w-5 text-center text-sm font-medium">{ci.quantity}</span>
                          <button onClick={() => updateQuantity(ci.id, ci.quantity + 1)} aria-label="Increase quantity"
                            className="w-7 h-7 rounded gradient-accent text-white flex items-center justify-center hover:opacity-90 text-sm">
                            +
                          </button>
                          <button onClick={() => removeItem(ci.id)}
                            aria-label="Remove item"
                            className="ml-auto text-gray-400 hover:text-red-500">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 dark:border-white/10 p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Delivery Fee</span><span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Tax (5%)</span><span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 dark:text-white text-lg pt-2 border-t border-gray-100 dark:border-white/10">
                <span>Total</span><span>{formatPrice(grandTotal)}</span>
              </div>
              <Link to="/checkout" onClick={onClose}
                className="block w-full text-center gradient-accent hover:opacity-90 text-white py-2.5 rounded-xl font-medium transition mt-2">
                Proceed to Checkout
              </Link>
              <button onClick={() => setClearOpen(true)}
                className="w-full text-center text-sm text-red-500 hover:text-red-600 mt-1">
                Clear Cart
              </button>
            </div>
          </>
        )}
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
    </>
  );
}
