import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/auth/ProfilePage';

// Customer pages
import HomePage from './pages/customer/HomePage';
import RestaurantListPage from './pages/customer/RestaurantListPage';
import RestaurantDetailPage from './pages/customer/RestaurantDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';

// Restaurant owner pages
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantSetupPage from './pages/restaurant/RestaurantSetupPage';
import MenuManagementPage from './pages/restaurant/MenuManagementPage';
import RestaurantOrdersPage from './pages/restaurant/RestaurantOrdersPage';

// Driver pages
import DriverDashboard from './pages/driver/DriverDashboard';

// Placeholder component for pages not yet built
function Placeholder({ title }) {
  return (
    <div className="p-8 text-center text-2xl text-gray-500 min-h-[60vh] flex items-center justify-center">
      {title} &mdash; Coming Soon
    </div>
  );
}

const SearchPage = () => <Placeholder title="Search" />;
const AboutPage = () => <Placeholder title="About" />;
const ContactPage = () => <Placeholder title="Contact" />;
const AdminDashboard = () => <Placeholder title="Admin Dashboard" />;
const AdminUsersPage = () => <Placeholder title="Admin Users" />;
const AdminRestaurantsPage = () => <Placeholder title="Admin Restaurants" />;
const AdminOrdersPage = () => <Placeholder title="Admin Orders" />;

const NotFoundPage = () => (
  <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
    <h1 className="text-6xl font-bold text-primary">404</h1>
    <p className="text-xl text-gray-500 mt-2">Page not found</p>
  </div>
);

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurants" element={<RestaurantListPage />} />
        <Route path="/restaurants/:slug" element={<RestaurantDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth (guest only) */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Protected — any authenticated user */}
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />

        {/* Customer only */}
        <Route
          path="/cart"
          element={<ProtectedRoute allowedTypes={['customer']}><CartPage /></ProtectedRoute>}
        />
        <Route
          path="/checkout"
          element={<ProtectedRoute allowedTypes={['customer']}><CheckoutPage /></ProtectedRoute>}
        />
        <Route
          path="/orders"
          element={<ProtectedRoute allowedTypes={['customer']}><CustomerOrdersPage /></ProtectedRoute>}
        />
        <Route
          path="/orders/:orderNumber"
          element={<ProtectedRoute allowedTypes={['customer']}><OrderDetailPage /></ProtectedRoute>}
        />

        {/* Restaurant owner only */}
        <Route
          path="/restaurant/dashboard"
          element={<ProtectedRoute allowedTypes={['restaurant_owner']}><RestaurantDashboard /></ProtectedRoute>}
        />
        <Route
          path="/restaurant/menu"
          element={<ProtectedRoute allowedTypes={['restaurant_owner']}><MenuManagementPage /></ProtectedRoute>}
        />
        <Route
          path="/restaurant/orders"
          element={<ProtectedRoute allowedTypes={['restaurant_owner']}><RestaurantOrdersPage /></ProtectedRoute>}
        />
        <Route
          path="/restaurant/setup"
          element={<ProtectedRoute allowedTypes={['restaurant_owner']}><RestaurantSetupPage /></ProtectedRoute>}
        />

        {/* Driver only */}
        <Route
          path="/driver/dashboard"
          element={<ProtectedRoute allowedTypes={['delivery_driver']}><DriverDashboard /></ProtectedRoute>}
        />

        {/* Admin only */}
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute allowedTypes={['admin']}><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin/users"
          element={<ProtectedRoute allowedTypes={['admin']}><AdminUsersPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/restaurants"
          element={<ProtectedRoute allowedTypes={['admin']}><AdminRestaurantsPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/orders"
          element={<ProtectedRoute allowedTypes={['admin']}><AdminOrdersPage /></ProtectedRoute>}
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
