import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROLES } from '../utils/constants';

/**
 * Route guard redirecting authenticated users away from Login and Register pages.
 */
const GuestRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect based on role if logged in
    if (user?.role === ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
