import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import reservationApi from '../api/reservationApi';
import PageHeader from '../components/common/PageHeader';
import Badge from '../components/common/Badge';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { User, Mail, Shield, ShieldCheck, CalendarCheck, CalendarRange, Clock } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await reservationApi.getMyReservations();
        if (response.success && response.data.reservations) {
          const list = response.data.reservations;
          const total = list.length;
          const upcoming = list.filter(
            (r) =>
              ['PENDING', 'CONFIRMED'].includes(r.reservationStatus) &&
              new Date(r.startTime) >= new Date()
          ).length;
          const completed = list.filter((r) => r.reservationStatus === 'COMPLETED').length;
          const cancelled = list.filter((r) => r.reservationStatus === 'CANCELLED').length;
          
          setStats({ total, upcoming, completed, cancelled });
        }
      } catch (err) {
        console.error('Failed to load user reservation statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="mx-auto max-w-3xl text-left space-y-6">
      <PageHeader
        title="My Profile"
        description="Verify your user credentials, security role, and dining statistics."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* User Information Card */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {user?.fullName}
              </h3>
              <p className="text-xs text-slate-400">
                User ID: {user?._id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 text-sm">
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Mail className="h-3.5 w-3.5" /> Email Address
              </span>
              <p className="font-semibold text-slate-800 dark:text-white truncate">
                {user?.email}
              </p>
            </div>

            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Shield className="h-3.5 w-3.5" /> Security Privilege
              </span>
              <div>
                <Badge variant={user?.role === 'ADMIN' ? 'danger' : 'info'}>
                  {user?.role}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Account Status
              </span>
              <div>
                <Badge variant={user?.isActive ? 'success' : 'danger'}>
                  {user?.isActive ? 'Active' : 'Suspended'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary Sidebar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CalendarRange className="h-5 w-5 text-indigo-500" />
            Dining Stats
          </h3>

          {loading ? (
            <div className="space-y-3">
              <SkeletonLoader count={4} className="h-8" />
            </div>
          ) : (
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total Bookings</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Upcoming Active</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.upcoming}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Completed Visits</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Cancelled Bookings</span>
                <span className="font-bold text-red-600 dark:text-red-400">{stats.cancelled}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
