import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import reservationApi from '../api/reservationApi';
import SummaryCard from '../components/cards/SummaryCard';
import EmptyState from '../components/common/EmptyState';
import SkeletonLoader from '../components/common/SkeletonLoader';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  Calendar,
  CheckCircle,
  XCircle,
  CalendarDays,
  Plus,
  ArrowRight,
  User,
  Clock,
  Users
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await reservationApi.getMyReservations();
        if (response.success && response.data.reservations) {
          setReservations(response.data.reservations);
        }
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Compute Stats
  const totalCount = reservations.length;
  const upcomingList = reservations.filter(
    (r) =>
      ['PENDING', 'CONFIRMED'].includes(r.reservationStatus) &&
      new Date(r.startTime) >= new Date()
  );
  const upcomingCount = upcomingList.length;

  const completedCount = reservations.filter(
    (r) => r.reservationStatus === 'COMPLETED'
  ).length;

  const cancelledCount = reservations.filter(
    (r) => r.reservationStatus === 'CANCELLED'
  ).length;

  // Find nearest upcoming reservation
  const nextReservation = upcomingList
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Banner */}
      <div className="rounded-2xl premium-gradient p-6 text-white shadow-sm md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-indigo-100 max-w-lg text-sm">
            Easily manage your tables, schedule a new reservation, or inspect your reservation logs.
          </p>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <SkeletonLoader variant="stat" count={4} />
        ) : (
          <>
            <SummaryCard
              name="Total Bookings"
              value={totalCount}
              icon={CalendarDays}
              color="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
            />
            <SummaryCard
              name="Upcoming"
              value={upcomingCount}
              icon={Calendar}
              color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
            />
            <SummaryCard
              name="Completed"
              value={completedCount}
              icon={CheckCircle}
              color="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
            />
            <SummaryCard
              name="Cancelled"
              value={cancelledCount}
              icon={XCircle}
              color="bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
            />
          </>
        )}
      </div>

      {/* Content Split: Next Booking vs Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Next Booking Section */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Upcoming Reservation
          </h3>
          
          {loading ? (
            <div className="h-48 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse"></div>
          ) : nextReservation ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {nextReservation._id.substring(nextReservation._id.length - 8)}
                  </p>
                  <h4 className="font-bold text-slate-800 dark:text-white">
                    Table {nextReservation.table?.tableNumber || 'Assigned'}
                  </h4>
                </div>
                <Badge variant="success">Confirmed</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-1 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span>
                    {new Date(nextReservation.reservationDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  <span>
                    {new Date(nextReservation.startTime).toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <span>{nextReservation.guestCount} Guests</span>
                </div>
              </div>

              {nextReservation.notes && (
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 text-xs text-slate-500 italic">
                  Notes: "{nextReservation.notes}"
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Link to={`/reservations/${nextReservation._id}`}>
                  <Button variant="outline" size="sm" icon={ArrowRight}>
                    View details
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No upcoming reservations"
              description="You have no reservations scheduled. Ready to secure a table for fine dining?"
              actionLabel="Book table now"
              onActionClick={() => navigate('/reservations/new')}
            />
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h3>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <Link to="/reservations/new" className="block">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-colors duration-150 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">New Booking</p>
                    <p className="text-xs text-slate-500">Auto-allocate optimal table</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>

            <Link to="/reservations" className="block">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-colors duration-150 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">View Bookings</p>
                    <p className="text-xs text-slate-500">Search and filter logs</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>

            <Link to="/profile" className="block">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-colors duration-150 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">My Profile</p>
                    <p className="text-xs text-slate-500">Inspect credentials and stats</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
