import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export function ApprovedRoute({ children }) {
  const { isAuthenticated, isLoading, isPending, isRejected, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (isPending()) return <Navigate to="/pending" replace />;
  if (isRejected()) return <Navigate to="/rejected" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, isCompanyAdmin } = useAuthStore();
  const location = useLocation();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isCompanyAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
}

export function SuperAdminRoute({ children }) {
  const { isAuthenticated, isLoading, isSuperAdmin } = useAuthStore();
  const location = useLocation();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isSuperAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}
