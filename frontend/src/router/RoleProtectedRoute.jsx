import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Route guard restricting access to specific user roles (e.g., ADMIN, CUSTOMER).
 * @param {Array<string>} allowedRoles - Whitelisted roles for this route
 */
const RoleProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" message="Checking permissions..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role is not allowed, redirect to home/dashboard or forbidden page
  const hasAccess = allowedRoles.includes(user?.role);

  return hasAccess ? <Outlet /> : <Navigate to="/forbidden" replace />;
};

export default RoleProtectedRoute;
