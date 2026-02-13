import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import CartDrawer from '../customer/CartDrawer';
import logoFull from '../../assets/logo-full.svg';
import logoWhite from '../../assets/logo-white.svg';
import {
  FiMenu,
  FiX,
  FiShoppingCart,
  FiChevronDown,
  FiUser,
  FiPackage,
  FiGrid,
  FiLogOut,
  FiSearch,
  FiSun,
  FiMoon,
} from 'react-icons/fi';

const DASHBOARDS = {
  customer: '/',
  restaurant_owner: '/restaurant/dashboard',
  delivery_driver: '/driver/dashboard',
  admin: '/admin/dashboard',
};

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemsCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'gradient-primary shadow-lg shadow-primary-dark/20'
            : 'bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-200/50 dark:border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img
                src={scrolled ? logoWhite : (isDark ? logoWhite : logoFull)}
                alt="FeastDash"
                className="h-9"
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    scrolled
                      ? isActive(link.to)
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                      : isActive(link.to)
                        ? 'bg-primary-accent/10 text-primary-accent dark:bg-primary-accent/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-mid dark:hover:text-primary-accent hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop right side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={`p-2 rounded-lg transition-all duration-200 ${
                  scrolled
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>

              <Link
                to="/search"
                className={`p-2 rounded-lg transition-all duration-200 ${
                  scrolled
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
                aria-label="Search"
              >
                <FiSearch size={18} />
              </Link>

              {isAuthenticated ? (
                <>
                  {user?.user_type === 'customer' && (
                    <button
                      onClick={() => setCartOpen(true)}
                      aria-label="Shopping cart"
                      className={`relative p-2 rounded-lg transition-all duration-200 ${
                        scrolled
                          ? 'text-white/80 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <FiShoppingCart size={18} />
                      {itemsCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 gradient-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                          {itemsCount > 9 ? '9+' : itemsCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* User dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                        scrolled
                          ? 'text-white hover:bg-white/10'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {user?.first_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-medium text-sm max-w-[100px] truncate">
                        {user?.first_name || user?.username}
                      </span>
                      <FiChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-card-dark rounded-xl shadow-xl border border-gray-100 dark:border-white/10 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user?.first_name} {user?.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                        >
                          <FiUser size={16} /> My Profile
                        </Link>
                        {user?.user_type === 'customer' && (
                          <Link
                            to="/orders"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                          >
                            <FiPackage size={16} /> My Orders
                          </Link>
                        )}
                        <Link
                          to={DASHBOARDS[user?.user_type] || '/'}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                        >
                          <FiGrid size={16} /> Dashboard
                        </Link>
                        <hr className="my-1 border-gray-100 dark:border-white/10" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full transition"
                        >
                          <FiLogOut size={16} /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      scrolled
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-mid dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md ${
                      scrolled
                        ? 'bg-white text-primary-dark hover:bg-white/90'
                        : 'gradient-accent text-white hover:shadow-lg hover:shadow-primary-accent/30'
                    }`}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: theme + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={`p-2 rounded-lg ${
                  scrolled ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                className={`p-2 rounded-lg ${
                  scrolled ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed top-0 right-0 h-full w-80 z-50 md:hidden flex flex-col gradient-primary shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <img src={logoWhite} alt="FeastDash" className="h-8" />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <FiX size={24} className="text-white/80 hover:text-white" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 font-medium transition ${
                      isActive(link.to) ? 'bg-white/15 text-white' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/search"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 font-medium transition"
                >
                  <FiSearch size={18} /> Search
                </Link>

                {isAuthenticated ? (
                  <>
                    <hr className="my-3 border-white/10" />
                    <div className="px-4 py-2">
                      <p className="text-white font-semibold text-sm">{user?.first_name} {user?.last_name}</p>
                      <p className="text-white/50 text-xs">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
                    >
                      <FiUser size={18} /> My Profile
                    </Link>
                    {user?.user_type === 'customer' && (
                      <>
                        <Link
                          to="/orders"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
                        >
                          <FiPackage size={18} /> My Orders
                        </Link>
                        <Link
                          to="/cart"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
                        >
                          <FiShoppingCart size={18} /> Cart
                          {itemsCount > 0 && (
                            <span className="ml-auto bg-primary-accent text-white text-xs px-2 py-0.5 rounded-full">
                              {itemsCount}
                            </span>
                          )}
                        </Link>
                      </>
                    )}
                    <Link
                      to={DASHBOARDS[user?.user_type] || '/'}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
                    >
                      <FiGrid size={18} /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/10 transition"
                    >
                      <FiLogOut size={18} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="my-3 border-white/10" />
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 font-medium transition"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-xl bg-white/15 text-white text-center font-semibold hover:bg-white/20 transition"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
