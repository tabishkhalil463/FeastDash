import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';

// Eagerly loaded (always needed)
import HomePage from './pages/customer/HomePage';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/auth/ProfilePage'));

const RestaurantListPage = lazy(() => import('./pages/customer/RestaurantListPage'));
const RestaurantDetailPage = lazy(() => import('./pages/customer/RestaurantDetailPage'));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'));
const CustomerOrdersPage = lazy(() => import('./pages/customer/CustomerOrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/customer/OrderDetailPage'));
const SearchPage = lazy(() => import('./pages/customer/SearchPage'));
const AboutPage = lazy(() => import('./pages/customer/AboutPage'));
const ContactPage = lazy(() => import('./pages/customer/ContactPage'));

const RestaurantDashboard = lazy(() => import('./pages/restaurant/RestaurantDashboard'));
const RestaurantSetupPage = lazy(() => import('./pages/restaurant/RestaurantSetupPage'));
const MenuManagementPage = lazy(() => import('./pages/restaurant/MenuManagementPage'));
const RestaurantOrdersPage = lazy(() => import('./pages/restaurant/RestaurantOrdersPage'));

const DriverDashboard = lazy(() => import('./pages/driver/DriverDashboard'));

const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminRestaurantsPage = lazy(() => import('./pages/admin/AdminRestaurantsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ children }) {
  return (
    <ProtectedRoute allowedTypes={['admin']}>
      <Suspense fallback={<LoadingSpinner />}>
        <AdminLayout>{children}</AdminLayout>
      </Suspense>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
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
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Customer only */}
            <Route path="/cart" element={<ProtectedRoute allowedTypes={['customer']}><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute allowedTypes={['customer']}><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute allowedTypes={['customer']}><CustomerOrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:orderNumber" element={<ProtectedRoute allowedTypes={['customer']}><OrderDetailPage /></ProtectedRoute>} />

            {/* Restaurant owner only */}
            <Route path="/restaurant/dashboard" element={<ProtectedRoute allowedTypes={['restaurant_owner']}><RestaurantDashboard /></ProtectedRoute>} />
            <Route path="/restaurant/menu" element={<ProtectedRoute allowedTypes={['restaurant_owner']}><MenuManagementPage /></ProtectedRoute>} />
            <Route path="/restaurant/orders" element={<ProtectedRoute allowedTypes={['restaurant_owner']}><RestaurantOrdersPage /></ProtectedRoute>} />
            <Route path="/restaurant/setup" element={<ProtectedRoute allowedTypes={['restaurant_owner']}><RestaurantSetupPage /></ProtectedRoute>} />

            {/* Driver only */}
            <Route path="/driver/dashboard" element={<ProtectedRoute allowedTypes={['delivery_driver']}><DriverDashboard /></ProtectedRoute>} />

            {/* Admin only — wrapped in AdminLayout */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            <Route path="/admin/restaurants" element={<AdminRoute><AdminRestaurantsPage /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}
