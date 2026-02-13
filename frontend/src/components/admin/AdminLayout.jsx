import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiUsers, FiShoppingBag, FiClipboard,
  FiMenu, FiX, FiLogOut,
} from 'react-icons/fi';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/restaurants', label: 'Restaurants', icon: FiShoppingBag },
  { to: '/admin/orders', label: 'Orders', icon: FiClipboard },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const Sidebar = ({ mobile }) => (
    <div className={`flex flex-col h-full bg-secondary text-white ${mobile ? 'w-64' : 'w-64 shrink-0'}`}>
      <div className="px-6 py-5 border-b border-white/10">
        <Link to="/admin/dashboard" className="text-xl font-bold">
          <span className="text-primary">Feast</span>
          <span className="text-white">Dash</span>
          <span className="text-xs ml-2 bg-white/20 px-2 py-0.5 rounded-full">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                active ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white w-full transition"
        >
          <FiLogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen -mt-16 pt-0">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 h-full z-50 lg:hidden">
            <Sidebar mobile />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 bg-white border-b border-gray-200 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="lg:hidden text-gray-600">
                <FiMenu size={22} />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">FeastDash Admin</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {user?.first_name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.first_name || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
