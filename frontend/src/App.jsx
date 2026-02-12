import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

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
import SearchPage from './pages/customer/SearchPage';
import AboutPage from './pages/customer/AboutPage';
import ContactPage from './pages/customer/ContactPage';

// Restaurant owner pages
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantSetupPage from './pages/restaurant/RestaurantSetupPage';
import MenuManagementPage from './pages/restaurant/MenuManagementPage';
import RestaurantOrdersPage from './pages/restaurant/RestaurantOrdersPage';

// Driver pages
import DriverDashboard from './pages/driver/DriverDashboard';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRestaurantsPage from './pages/admin/AdminRestaurantsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';

// NotFound
import NotFoundPage from './pages/NotFoundPage';

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ children }) {
  return (
    <ProtectedRoute allowedTypes={['admin']}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
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

        {/* Admin only — wrapped in AdminLayout */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/admin/restaurants" element={<AdminRoute><AdminRestaurantsPage /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
