import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Loading spinner fallback
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy-loaded Pages
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Reservations = lazy(() => import('../pages/Reservations'));
const BookReservation = lazy(() => import('../pages/BookReservation'));
const ReservationDetails = lazy(() => import('../pages/ReservationDetails'));
const Profile = lazy(() => import('../pages/Profile'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Forbidden = lazy(() => import('../pages/Forbidden'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const AdminReservations = lazy(() => import('../pages/AdminReservations'));
const AdminTables = lazy(() => import('../pages/AdminTables'));

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import GuestRoute from './GuestRoute';

// Constants
import { ROLES } from '../utils/constants';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
            <LoadingSpinner size="lg" message="Loading page components..." />
          </div>
        }
      >
        <Routes>
          {/* Public Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          <Route path="/forbidden" element={<Forbidden />} />

          {/* Guest Routes - only accessible when NOT logged in */}
          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>
          </Route>

          {/* Protected Routes - accessible by any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Customer & Admin access */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/reservations" element={<Reservations />} />
              
              {/* Auto allocation & Details endpoints */}
              <Route path="/reservations/new" element={<BookReservation />} />
              <Route path="/reservations/:id" element={<ReservationDetails />} />
              
              {/* Dashboard wrapper matching role protections */}
              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={[ROLES.CUSTOMER, ROLES.ADMIN]}
                  />
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              {/* Admin Operations Console Routes */}
              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={[ROLES.ADMIN]}
                  />
                }
              >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/reservations" element={<AdminReservations />} />
                <Route path="/admin/tables" element={<AdminTables />} />
              </Route>
            </Route>
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
