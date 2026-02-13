import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiCheck, FiMapPin, FiCreditCard, FiFileText,
  FiDollarSign, FiSmartphone, FiX,
} from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { mediaUrl } from '../../services/api';
import API from '../../services/api';
import { formatPrice } from '../../utils/currency';
import toast from 'react-hot-toast';

const STEPS = ['Delivery', 'Payment', 'Review'];

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Peshawar', 'Multan', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Abbottabad', 'Mardan',
];

const PAYMENT_METHODS = [
  {
    value: 'cod',
    label: 'Cash on Delivery',
    desc: 'Pay when your food arrives',
    icon: FiDollarSign,
    iconColor: 'text-green-600 bg-green-100',
    badge: 'Most Popular',
  },
  {
    value: 'jazzcash',
    label: 'JazzCash',
    desc: 'Pay from your JazzCash wallet',
    icon: FiSmartphone,
    iconColor: 'text-red-600 bg-red-100',
  },
  {
    value: 'easypaisa',
    label: 'EasyPaisa',
    desc: 'Pay from your EasyPaisa account',
    icon: FiSmartphone,
    iconColor: 'text-green-600 bg-green-100',
  },
  {
    value: 'card',
    label: 'Card Payment',
    desc: 'Visa / Mastercard',
    icon: FiCreditCard,
    iconColor: 'text-blue-600 bg-blue-100',
  },
];

const PROCESSING_MESSAGES = {
  cod: 'Placing your order...',
  jazzcash: 'Processing via JazzCash...',
  easypaisa: 'Processing via EasyPaisa...',
  card: 'Processing card payment...',
};

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

function formatPhone(value) {
  return value.replace(/\D/g, '').slice(0, 11);
}

function luhnCheck(num) {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCart();
  const { items, restaurant, itemsCount } = cart;
  const { subtotal, deliveryFee, tax, grandTotal } = cart.getCartTotal();

  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState(null); // { success, orderNumber, error }
  const [form, setForm] = useState({
    delivery_address: user?.address || '',
    delivery_city: user?.city || CITIES[0],
    phone: user?.phone || '',
    payment_method: 'cod',
    special_instructions: '',
    // Payment fields
    wallet_phone: '',
    card_number: '',
    card_name: '',
    card_expiry: '',
    card_cvv: '',
  });
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validateStep0 = () => {
    const e = {};
    if (!form.delivery_address.trim()) e.delivery_address = 'Address is required';
    if (!form.delivery_city.trim()) e.delivery_city = 'City is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^03\d{9}$/.test(form.phone)) e.phone = 'Enter valid Pakistani phone (03XXXXXXXXX)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e = {};
    const pm = form.payment_method;
    if (pm === 'jazzcash' || pm === 'easypaisa') {
      if (!form.wallet_phone.trim()) e.wallet_phone = 'Phone number is required';
      else if (!/^03\d{9}$/.test(form.wallet_phone)) e.wallet_phone = 'Enter valid phone (03XXXXXXXXX)';
    }
    if (pm === 'card') {
      const cardDigits = form.card_number.replace(/\D/g, '');
      if (!cardDigits) e.card_number = 'Card number is required';
      else if (!luhnCheck(cardDigits)) e.card_number = 'Invalid card number';
      if (!form.card_name.trim()) e.card_name = 'Cardholder name is required';
      if (!form.card_expiry.trim()) e.card_expiry = 'Expiry is required';
      else {
        const parts = form.card_expiry.split('/');
        const mm = parseInt(parts[0], 10);
        if (parts.length !== 2 || mm < 1 || mm > 12 || parts[1]?.length !== 2) e.card_expiry = 'Use MM/YY format';
      }
      if (!form.card_cvv.trim()) e.card_cvv = 'CVV is required';
      else if (!/^\d{3,4}$/.test(form.card_cvv)) e.card_cvv = 'Enter 3 or 4 digit CVV';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setProcessing(true);
    // Simulate payment processing delay for non-COD methods
    const delay = form.payment_method === 'cod' ? 1000 : 2000;
    await new Promise((r) => setTimeout(r, delay));

    try {
      const { data } = await API.post('orders/create/', {
        delivery_address: form.delivery_address,
        delivery_city: form.delivery_city,
        payment_method: form.payment_method,
        special_instructions: form.special_instructions,
      });
      cart.fetchCart();
      setOrderResult({ success: true, orderNumber: data.order_number });
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.detail
        || (typeof err.response?.data === 'string' ? err.response.data : null)
        || Object.values(err.response?.data || {})?.[0]
        || 'Failed to place order';
      setOrderResult({ success: false, error: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    } finally {
      setProcessing(false);
    }
  };

  // Processing overlay
  if (processing) {
    return (
      <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">{PROCESSING_MESSAGES[form.payment_method]}</p>
          <p className="text-sm text-gray-500 mt-1">Please don't close this page</p>
        </div>
      </div>
    );
  }

  // Success state
  if (orderResult?.success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-500 mb-1">Your order number is</p>
        <p className="text-xl font-mono font-bold text-primary mb-2">{orderResult.orderNumber}</p>
        <p className="text-sm text-gray-400 mb-8">Estimated delivery: 30-45 minutes</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/orders/${orderResult.orderNumber}`}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition">
            Track Order
          </Link>
          <Link to="/"
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Failure state
  if (orderResult && !orderResult.success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiX size={40} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-500 mb-8">{orderResult.error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => { setOrderResult(null); setStep(1); }}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition">
            Try Again
          </button>
          <button onClick={() => { update('payment_method', 'cod'); setOrderResult(null); setStep(2); }}
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
            Switch to Cash on Delivery
          </button>
        </div>
      </div>
    );
  }

  // Empty cart guard
  if (itemsCount === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items before checking out.</p>
        <Link to="/restaurants" className="px-6 py-3 bg-primary text-white rounded-lg font-medium">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  const selectedPM = PAYMENT_METHODS.find((p) => p.value === form.payment_method);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
        <FiArrowLeft size={14} /> Back to Cart
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? <FiCheck size={16} /> : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Step Content */}
        <div className="lg:col-span-2">
          {/* Step 0: Delivery */}
          {step === 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <FiMapPin className="text-primary" /> Delivery Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                  <textarea
                    value={form.delivery_address}
                    onChange={(e) => update('delivery_address', e.target.value)}
                    rows={3}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${errors.delivery_address ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="Enter your full delivery address"
                  />
                  {errors.delivery_address && <p className="text-xs text-red-500 mt-1">{errors.delivery_address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <select
                    value={form.delivery_city}
                    onChange={(e) => update('delivery_city', e.target.value)}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white ${errors.delivery_city ? 'border-red-300' : 'border-gray-200'}`}
                  >
                    <option value="">Select City</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.delivery_city && <p className="text-xs text-red-500 mt-1">{errors.delivery_city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => update('phone', formatPhone(e.target.value))}
                    className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
                    placeholder="03XX XXXXXXX"
                    maxLength={11}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (optional)</label>
                  <textarea
                    value={form.special_instructions}
                    onChange={(e) => update('special_instructions', e.target.value)}
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Any special delivery instructions?"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <FiCreditCard className="text-primary" /> Choose Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <div key={pm.value}>
                      <label
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                          form.payment_method === pm.value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <input type="radio" name="payment" value={pm.value}
                          checked={form.payment_method === pm.value}
                          onChange={() => update('payment_method', pm.value)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${pm.iconColor}`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{pm.label}</p>
                            {pm.badge && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{pm.badge}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{pm.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          form.payment_method === pm.value ? 'border-primary' : 'border-gray-300'
                        }`}>
                          {form.payment_method === pm.value && (
                            <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                          )}
                        </div>
                      </label>

                      {/* JazzCash / EasyPaisa phone input */}
                      {(pm.value === 'jazzcash' || pm.value === 'easypaisa') && form.payment_method === pm.value && (
                        <div className="mt-3 ml-14 mr-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">{pm.label} Phone Number</label>
                          <input
                            value={form.wallet_phone}
                            onChange={(e) => update('wallet_phone', formatPhone(e.target.value))}
                            className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${errors.wallet_phone ? 'border-red-300' : 'border-gray-200'}`}
                            placeholder="03XX XXXXXXX"
                            maxLength={11}
                          />
                          {errors.wallet_phone && <p className="text-xs text-red-500 mt-1">{errors.wallet_phone}</p>}
                        </div>
                      )}

                      {/* Card form */}
                      {pm.value === 'card' && form.payment_method === 'card' && (
                        <div className="mt-3 ml-14 mr-4 space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                            <input
                              value={form.card_number}
                              onChange={(e) => update('card_number', formatCardNumber(e.target.value))}
                              className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono ${errors.card_number ? 'border-red-300' : 'border-gray-200'}`}
                              placeholder="XXXX XXXX XXXX XXXX"
                              maxLength={19}
                            />
                            {errors.card_number && <p className="text-xs text-red-500 mt-1">{errors.card_number}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                            <input
                              value={form.card_name}
                              onChange={(e) => update('card_name', e.target.value)}
                              className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${errors.card_name ? 'border-red-300' : 'border-gray-200'}`}
                              placeholder="Name on card"
                            />
                            {errors.card_name && <p className="text-xs text-red-500 mt-1">{errors.card_name}</p>}
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                              <input
                                value={form.card_expiry}
                                onChange={(e) => update('card_expiry', formatExpiry(e.target.value))}
                                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono ${errors.card_expiry ? 'border-red-300' : 'border-gray-200'}`}
                                placeholder="MM/YY"
                                maxLength={5}
                              />
                              {errors.card_expiry && <p className="text-xs text-red-500 mt-1">{errors.card_expiry}</p>}
                            </div>
                            <div className="w-28">
                              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                              <input
                                type="password"
                                value={form.card_cvv}
                                onChange={(e) => update('card_cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono ${errors.card_cvv ? 'border-red-300' : 'border-gray-200'}`}
                                placeholder="***"
                                maxLength={4}
                              />
                              {errors.card_cvv && <p className="text-xs text-red-500 mt-1">{errors.card_cvv}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <FiFileText className="text-primary" /> Review Your Order
              </h2>
              {/* Restaurant */}
              {restaurant && (
                <p className="text-sm text-gray-500 mb-4">
                  From <span className="font-medium text-gray-700">{restaurant.name}</span>
                </p>
              )}
              {/* Items */}
              <div className="space-y-3 mb-6">
                {items.map((ci) => {
                  const item = ci.menu_item;
                  const price = Number(item.discounted_price || item.price);
                  return (
                    <div key={ci.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        <img src={mediaUrl(item.image) || `https://placehold.co/60x60/f3f4f6/9ca3af?text=${encodeURIComponent(item.name[0])}`}
                          alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{ci.quantity} x {formatPrice(price)}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{formatPrice(price * ci.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              {/* Delivery & Payment summary */}
              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery To</span>
                  <span className="text-gray-900 text-right max-w-[60%]">{form.delivery_address}, {form.delivery_city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-900">{form.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Payment</span>
                  <div className="flex items-center gap-2">
                    {selectedPM && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedPM.iconColor}`}>
                        <selectedPM.icon size={12} />
                      </div>
                    )}
                    <span className="text-gray-900">{selectedPM?.label}</span>
                  </div>
                </div>
                {form.special_instructions && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Notes</span>
                    <span className="text-gray-900 text-right max-w-[60%]">{form.special_instructions}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition">
                Back
              </button>
            ) : <div />}
            {step < 2 ? (
              <button onClick={nextStep}
                className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition">
                {step === 0 ? 'Continue to Payment' : 'Review Order'}
              </button>
            ) : (
              <button onClick={handleSubmit}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2">
                Place Order &mdash; {formatPrice(grandTotal)}
              </button>
            )}
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-1">Order Summary</h3>
            {restaurant && (
              <p className="text-sm text-gray-500 mb-4">From {restaurant.name}</p>
            )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
