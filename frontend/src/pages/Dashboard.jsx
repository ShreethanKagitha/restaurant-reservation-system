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
  Users,
  Utensils,
  Sparkles,
  Layers,
  History
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

  // Last 3 reservations for beautiful timeline history
  const recentTimelineList = [...reservations]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 3);

  // Featured Food Gallery items
  const featuredFoods = [
    {
      title: 'Dry-Aged Ribeye',
      description: '45-day custom dry-aged, wood-fired with bone marrow butter.',
      image: '/gourmet_dish.png',
      price: '$64'
    },
    {
      title: 'Truffle Soufflé',
      description: 'Warm, airy black winter truffle infusion with Grand Marnier.',
      image: '/restaurant_ambience.png',
      price: '$24'
    }
  ];

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto">
      {/* 1) Welcome Banner */}
      <div 
        className="rounded-3xl bg-cover bg-center p-8 text-white shadow-xl relative overflow-hidden animate-scale-in"
        style={{ backgroundImage: `url('/restaurant_ambience.png')` }}
      >
        {/* Deep gradient overlay to ensure text readability while letting the image subtly show through */}
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy/95 via-burgundy/80 to-[#121212]/90 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Gold accent line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gold shadow-[0_0_15px_rgba(212,175,55,0.5)]" />

        <div className="relative z-10 space-y-3 animate-slide-up delay-100">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20 backdrop-blur-md">
            <Sparkles className="h-3 w-3 fill-gold animate-float" /> Gold Tier Member
          </span>
          <h1 className="text-3xl sm:text-4xl font-elegant font-bold tracking-tight drop-shadow-md">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-slate-200 max-w-lg text-xs leading-relaxed font-light drop-shadow-sm">
            Secure priority seating, verify reservation schedules, or check your dining history.
          </p>
        </div>
      </div>

      {/* 2) Grid of stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 animate-slide-up delay-200">
        {loading ? (
          <SkeletonLoader variant="stat" count={4} />
        ) : (
          <>
            <SummaryCard
              name="Total Bookings"
              value={totalCount}
              icon={CalendarDays}
              color="bg-burgundy/5 text-burgundy dark:bg-gold/5 dark:text-gold"
            />
            <SummaryCard
              name="Upcoming"
              value={upcomingCount}
              icon={Calendar}
              color="bg-fresh-green/5 text-fresh-green"
            />
            <SummaryCard
              name="Completed"
              value={completedCount}
              icon={CheckCircle}
              color="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
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

      {/* 3) Split Area: Upcoming Card vs Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-slide-up delay-300">
        {/* Next Booking Section */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-elegant font-bold text-burgundy dark:text-gold flex items-center gap-2">
            <Utensils size={18} />
            Upcoming Seating
          </h3>
          
          {loading ? (
            <div className="h-48 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse"></div>
          ) : nextReservation ? (
            <div 
              className="rounded-2xl border border-gold/15 bg-white p-6 shadow-sm dark:border-gold/5 dark:bg-slate-900 space-y-4 relative overflow-hidden hover-lift hover-glow bg-cover bg-center"
              style={{ backgroundImage: `url('/gourmet_dish.png')` }}
            >
              {/* Overlay to ensure text readability */}
              <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm" />
              
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
              
              <div className="relative z-10 flex justify-between items-center pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: {nextReservation._id.substring(nextReservation._id.length - 8)}
                  </p>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Table {nextReservation.table?.tableNumber || 'Assigned'}
                  </h4>
                </div>
                <Badge variant="success">Confirmed</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 py-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-burgundy dark:text-gold" />
                  <span>
                    {new Date(nextReservation.reservationDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-burgundy dark:text-gold" />
                  <span>
                    {new Date(nextReservation.startTime).toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-burgundy dark:text-gold" />
                  <span>{nextReservation.guestCount} Pax</span>
                </div>
              </div>

              {nextReservation.notes && (
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 text-xs text-slate-500 italic">
                  Host instructions: "{nextReservation.notes}"
                </div>
              )}

              <div className="relative z-10 pt-2 flex justify-end">
                <Link to={`/reservations/${nextReservation._id}`}>
                  <Button variant="outline" size="sm" icon={ArrowRight} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md">
                    Details
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No upcoming reservations"
              description="Ready to secure priority seating for an upcoming culinary event?"
              actionLabel="Book a Table"
              onActionClick={() => navigate('/reservations/new')}
            />
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-elegant font-bold text-burgundy dark:text-gold flex items-center gap-2">
            <Layers size={18} />
            Quick Actions
          </h3>
          <div className="rounded-2xl border border-burgundy/10 bg-white p-5 shadow-sm dark:border-gold/10 dark:bg-slate-900 space-y-3.5 hover-lift hover-glow">
            <Link to="/reservations/new" className="block">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-burgundy/10 p-2 text-burgundy dark:bg-gold/15 dark:text-gold">
                    <Plus className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-950 dark:text-white">New Booking</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Secure optimal seating</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>

            <Link to="/reservations" className="block">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-burgundy/10 p-2 text-burgundy dark:bg-gold/15 dark:text-gold">
                    <CalendarDays className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-950 dark:text-white">View Bookings</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Inspect your history log</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>

            <Link to="/profile" className="block">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-burgundy/10 p-2 text-burgundy dark:bg-gold/15 dark:text-gold">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-950 dark:text-white">My Profile</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Profile & account settings</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 4) Timeline Log History vs Featured Food */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-slide-up delay-400">
        {/* Timeline Log History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-elegant font-bold text-burgundy dark:text-gold flex items-center gap-2">
            <History size={18} />
            Reservation Timeline
          </h3>

          {loading ? (
            <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl animate-pulse"></div>
          ) : recentTimelineList.length > 0 ? (
            <div className="rounded-2xl border border-burgundy/10 bg-white p-6 shadow-sm dark:border-gold/10 dark:bg-slate-900 space-y-5 hover-lift hover-glow">
              <div className="relative pl-4 space-y-5 border-l border-burgundy/15 dark:border-gold/15 py-1">
                {recentTimelineList.map((res, idx) => {
                  const dateStr = new Date(res.reservationDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const isCompleted = res.reservationStatus === 'COMPLETED';
                  const isCancelled = res.reservationStatus === 'CANCELLED';

                  return (
                    <div key={res._id} className="relative space-y-1">
                      {/* Circle dot marker */}
                      <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-white dark:border-slate-900
                        ${isCompleted ? 'bg-indigo-500' : isCancelled ? 'bg-red-500' : 'bg-emerald-500'}`}
                      />
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Table {res.table?.tableNumber || 'Assigned'} booking
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">{dateStr}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <p>{res.guestCount} guests • {new Date(res.startTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</p>
                        <span className={`font-semibold ${isCompleted ? 'text-indigo-500' : isCancelled ? 'text-red-500' : 'text-emerald-500'}`}>
                          {res.reservationStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-slate-400">
              No historical reservations logged.
            </div>
          )}
        </div>

        {/* Featured Food Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-elegant font-bold text-burgundy dark:text-gold flex items-center gap-2">
            <Sparkles size={18} />
            Chef's Selections
          </h3>
          
          <div className="space-y-4">
            {featuredFoods.map((food, idx) => (
              <div
                key={idx}
                className="group rounded-2xl overflow-hidden border border-burgundy/5 bg-white dark:border-gold/5 dark:bg-slate-900 shadow-sm flex items-center h-24 hover-lift"
              >
                <div
                  className="w-24 h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('${food.image}')` }}
                />
                <div className="flex-1 p-3.5 text-left flex flex-col justify-between h-full">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-burgundy dark:group-hover:text-gold transition-colors">
                      {food.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                      {food.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold pt-1 border-t border-slate-50 dark:border-slate-800">
                    <span className="text-burgundy dark:text-gold">{food.price}</span>
                    <Link to="/reservations/new" className="text-slate-400 group-hover:text-burgundy dark:group-hover:text-gold flex items-center gap-0.5">
                      Book Seating →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
