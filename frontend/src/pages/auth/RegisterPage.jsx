import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiShoppingBag,
  FiHome,
  FiTruck,
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
} from 'react-icons/fi';

const USER_TYPES = [
  {
    value: 'customer',
    label: 'Customer',
    description: 'I want to order food',
    icon: FiShoppingBag,
  },
  {
    value: 'restaurant_owner',
    label: 'Restaurant Owner',
    description: 'I want to sell food',
    icon: FiHome,
  },
  {
    value: 'delivery_driver',
    label: 'Delivery Driver',
    description: 'I want to deliver food',
    icon: FiTruck,
  },
];

const DASHBOARDS = {
  customer: '/',
  restaurant_owner: '/restaurant/dashboard',
  delivery_driver: '/driver/dashboard',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    user_type: 'customer',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (form.phone && !/^03\d{9}$/.test(form.phone))
      errs.phone = 'Enter valid Pakistani number (03XXXXXXXXX)';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8)
      errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm_password)
      errs.confirm_password = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        username: form.email.split('@')[0] + Date.now().toString().slice(-4),
      };
      const user = await register(payload);
      toast.success('Registration successful!');
      navigate(DASHBOARDS[user.user_type] || '/');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const firstErr = Object.values(data).flat()[0];
        toast.error(typeof firstErr === 'string' ? firstErr : 'Registration failed.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Join <span className="text-primary">FeastDash</span>
          </h1>
          <p className="text-gray-500 mt-2">Create your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5"
        >
          {/* User type cards */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a...
            </label>
            <div className="grid grid-cols-3 gap-3">
              {USER_TYPES.map((type) => {
                const Icon = type.icon;
                const selected = form.user_type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm({ ...form, user_type: type.value })}
                    className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition text-center ${
                      selected
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Icon size={24} />
                    <span className="text-xs font-medium leading-tight">
                      {type.label}
                    </span>
                    <span className="text-[10px] leading-tight opacity-70">
                      {type.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    errors.first_name ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  errors.email ? 'border-red-400' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="03XX XXXXXXX"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  errors.phone ? 'border-red-400' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  errors.password ? 'border-red-400' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  errors.confirm_password ? 'border-red-400' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.confirm_password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirm_password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-60"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
