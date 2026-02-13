import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

const DASHBOARDS = {
  customer: '/',
  restaurant_owner: '/restaurant/dashboard',
  delivery_driver: '/driver/dashboard',
  admin: '/admin/dashboard',
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Login successful!');
      navigate(DASHBOARDS[user.user_type] || '/');
    } catch (err) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative items-center justify-center p-12">
        <div className="relative z-10 text-center max-w-md">
          <h2 className="text-4xl font-heading font-bold text-white mb-4">
            Welcome Back!
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Sign in to explore restaurants, track your orders, and enjoy
            delicious meals delivered to your doorstep.
          </p>
          <div className="mt-10 flex justify-center">
            <div className="w-48 h-48 rounded-full bg-white/10 flex items-center justify-center">
              <FiLogIn size={72} className="text-white/70" />
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute bottom-20 right-16 w-48 h-48 rounded-full bg-white/5" />
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
              Welcome to <span className="gradient-text">FeastDash</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-300 mt-2">Sign in to your account</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-surface-card-dark rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-8 space-y-5"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-accent/50 bg-white dark:bg-surface-dark dark:text-white dark:placeholder-gray-500 ${
                    errors.email ? 'border-red-400' : 'border-gray-200 dark:border-white/10'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-accent/50 bg-white dark:bg-surface-dark dark:text-white dark:placeholder-gray-500 ${
                    errors.password ? 'border-red-400' : 'border-gray-200 dark:border-white/10'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="h-4 w-4 text-primary-accent border-gray-300 dark:border-white/10 rounded focus:ring-primary-accent"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 gradient-accent text-white py-2.5 rounded-xl font-medium transition shadow-lg hover:shadow-xl hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiLogIn size={18} /> Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 dark:text-gray-300 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-accent font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
