import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DASHBOARDS = {
  customer: '/',
  restaurant_owner: '/restaurant/dashboard',
  delivery_driver: '/driver/dashboard',
  admin: '/admin/dashboard',
};

export default function ProtectedRoute({ children, allowedTypes }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedTypes && !allowedTypes.includes(user?.user_type)) {
    return <Navigate to={DASHBOARDS[user?.user_type] || '/'} replace />;
  }

  return children;
}
