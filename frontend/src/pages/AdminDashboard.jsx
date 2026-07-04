import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminApi from '../api/adminApi';
import PageHeader from '../components/common/PageHeader';
import SkeletonLoader from '../components/common/SkeletonLoader';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Layers,
  Settings,
  Activity,
  Heart,
  Clock,
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const tablesRes = await adminApi.getTables();
      const reservationsRes = await adminApi.getReservations({ limit: 1000 });

      if (tablesRes.success && tablesRes.data.tables) {
        setTables(tablesRes.data.tables);
      }
      if (reservationsRes.success && reservationsRes.data.reservations) {
        setReservations(reservationsRes.data.reservations);
      }
    } catch (error) {
      console.error('Failed to load operations metrics:', error);
      toast.error('Failed to load operations data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickStatus = async (id, status) => {
    try {
      const response = await adminApi.updateReservationStatus(id, status);
      if (response.success) {
        toast.success(`Reservation #${id.substring(id.length - 8)} updated to ${status}`);
        fetchDashboardData(); // Reload
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Helper date matches
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // Filter Today
  const todayReservations = reservations.filter(
    (r) => new Date(r.reservationDate) >= todayStart && new Date(r.reservationDate) <= todayEnd
  );

  // Status Counts
  const totalCount = reservations.length;
  const todayCount = todayReservations.length;
  
  const upcomingCount = reservations.filter(
    (r) => ['PENDING', 'CONFIRMED'].includes(r.reservationStatus) && new Date(r.startTime) > now
  ).length;

  const completedCount = reservations.filter((r) => r.reservationStatus === 'COMPLETED').length;
  const cancelledCount = reservations.filter((r) => r.reservationStatus === 'CANCELLED').length;

  // Table Stats
  const activeTablesCount = tables.filter((t) => t.status === 'AVAILABLE').length;
  const maintenanceTablesCount = tables.filter((t) => t.status === 'MAINTENANCE').length;
  const disabledTablesCount = tables.filter((t) => t.status === 'DISABLED').length;

  // Determine current active ocupancy
  // A table is occupied if it's AVAILABLE and there is a confirmed/pending reservation occurring right now
  const occupiedTableIds = new Set(
    reservations
      .filter((r) => ['PENDING', 'CONFIRMED'].includes(r.reservationStatus))
      .map((r) => r.table?._id?.toString())
      .filter(Boolean)
  );

  const occupiedTablesCount = tables.filter((t) => occupiedTableIds.has(t._id.toString())).length;
  
  // Utilization Percentage
  const totalTables = tables.length || 1;
  const occupancyPercentage = Math.round((occupiedTablesCount / totalTables) * 100);

  // Average guest count
  const nonCancelledToday = todayReservations.filter((r) => r.reservationStatus !== 'CANCELLED');
  const avgGuestsToday = nonCancelledToday.length > 0
    ? (nonCancelledToday.reduce((sum, r) => sum + r.guestCount, 0) / nonCancelledToday.length).toFixed(1)
    : 0;

  // Attention Required reservations (PENDING status)
  const pendingAttentionList = reservations.filter((r) => r.reservationStatus === 'PENDING').slice(0, 5);

  // Operations Feed chronologies
  // We can merge reservation updates, creations and table creations sorted by time
  const feedEvents = [];
  reservations.forEach((r) => {
    feedEvents.push({
      time: new Date(r.createdAt),
      type: 'reservation_created',
      message: `Reservation #${r._id.substring(r._id.length - 8)} created for ${r.customer?.fullName || 'Guest'} (${r.guestCount} pax)`,
      id: r._id
    });
    if (r.updatedAt !== r.createdAt) {
      feedEvents.push({
        time: new Date(r.updatedAt),
        type: 'reservation_updated',
        message: `Reservation #${r._id.substring(r._id.length - 8)} updated to status: ${r.reservationStatus}`,
        id: r._id
      });
    }
  });

  const sortedEvents = feedEvents
    .sort((a, b) => b.time - a.time)
    .slice(0, 8);

  // Schedule Peak Density Heatmap calculation
  // 12 blocks: 11:00 to 22:00
  const hourBlocks = Array.from({ length: 12 }, (_, i) => 11 + i); // [11, 12, 13, ..., 22]
  const densityCounts = hourBlocks.map((hour) => {
    return todayReservations.filter((r) => {
      const startHour = new Date(r.startTime).getHours();
      const endHour = new Date(r.endTime).getHours();
      return hour >= startHour && hour < endHour;
    }).length;
  });

  const maxDensity = Math.max(...densityCounts, 1);

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Operations Center"
        description="Monitor seating occupancy metrics, evaluate schedules, and authorize pending bookings in real time."
      >
        <Link to="/admin/reservations">
          <Button variant="outline" size="sm">
            Reservations Logs
          </Button>
        </Link>
        <Link to="/admin/tables">
          <Button variant="primary" size="sm">
            Configure Tables
          </Button>
        </Link>
      </PageHeader>

      {/* Critical Banners: Attention Required */}
      {pendingAttentionList.length > 0 && (
        <div className="rounded-2xl border border-soft-orange/30 bg-soft-orange/5 p-5 dark:border-soft-orange/20 dark:bg-soft-orange/10 space-y-3 glassmorphism hover-lift">
          <h4 className="text-sm font-bold text-soft-orange flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5" />
            Attention Required ({pendingAttentionList.length} Booking requests pending review)
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingAttentionList.map((res) => (
              <div
                key={res._id}
                className="rounded-xl border border-soft-orange/20 bg-white/60 p-3.5 shadow-sm dark:border-soft-orange/10 dark:bg-slate-900/60 space-y-3 text-xs glassmorphism"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-slate-400">#{res._id.substring(res._id.length - 8)}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{res.guestCount} guests</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-bold">{res.customer?.fullName}</p>
                  <p>
                    {new Date(res.startTime).toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}{' '}
                    on{' '}
                    {new Date(res.reservationDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800 pt-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleQuickStatus(res._id, 'CANCELLED')}
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/20"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => handleQuickStatus(res._id, 'CONFIRMED')}
                    className="bg-fresh-green hover:bg-green-700 text-white border-none"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 1: Restaurant Health & Heatmap Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-slide-up delay-100">
        {/* Restaurant Health Summary */}
        <div className="rounded-2xl border border-burgundy/10 bg-white p-5 shadow-sm dark:border-gold/10 dark:bg-slate-900 space-y-4 hover-lift">
          <h3 className="text-base font-elegant font-bold text-burgundy dark:text-gold flex items-center gap-2 pb-3 border-b border-burgundy/10 dark:border-gold/10">
            <Heart className="h-5 w-5 text-burgundy dark:text-gold" />
            Restaurant Health
          </h3>
          
          {loading ? (
            <div className="space-y-3">
              <SkeletonLoader count={4} className="h-8" />
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3.5 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Occupancy</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{occupancyPercentage}%</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3.5 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Avg Guests/Res</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{avgGuestsToday}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Available Tables</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeTablesCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Occupied Tables (Now)</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{occupiedTablesCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Maintenance Tables</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{maintenanceTablesCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Disabled Tables</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400">{disabledTablesCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Today's Schedule Reservation Density Timeline */}
        <div className="lg:col-span-2 rounded-2xl border border-burgundy/10 bg-white p-5 shadow-sm dark:border-gold/10 dark:bg-slate-900 space-y-4 hover-lift hover-glow">
          <div className="flex justify-between items-center pb-3 border-b border-burgundy/10 dark:border-gold/10">
            <h3 className="text-base font-elegant font-bold text-burgundy dark:text-gold flex items-center gap-2">
              <Clock className="h-5 w-5 text-burgundy dark:text-gold" />
              Today's Schedule Density
            </h3>
            <span className="text-xs text-slate-400">{todayCount} Bookings Scheduled</span>
          </div>

          {loading ? (
            <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          ) : (
            <div className="space-y-5 py-2">
              {/* Density Blocks representing peak volumes */}
              <div className="grid grid-cols-12 gap-1.5 md:gap-2">
                {densityCounts.map((count, idx) => {
                  const hour = hourBlocks[idx];
                  const ratio = count / maxDensity;
                  
                  // Heatmap colors based on density counts
                  let bgClass = 'bg-slate-100 dark:bg-slate-800/80';
                  if (count > 0) {
                    if (ratio <= 0.4) bgClass = 'bg-fresh-green/20 dark:bg-fresh-green/10 text-fresh-green';
                    else if (ratio <= 0.8) bgClass = 'bg-fresh-green/50 dark:bg-fresh-green/30 text-emerald-900 dark:text-emerald-100';
                    else bgClass = 'bg-fresh-green text-white font-bold';
                  }

                  return (
                    <div
                      key={hour}
                      className={`rounded-lg py-3 text-center flex flex-col items-center justify-center min-h-[4rem] transition-all duration-200 hover:scale-105 shadow-sm ${bgClass} animate-scale-in`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <span className="text-xs font-bold leading-none">{count}</span>
                      <span className="text-[9px] uppercase tracking-wider opacity-60 mt-1.5 leading-none">
                        {hour > 12 ? `${hour - 12}p` : `${hour}a`}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1"><TrendingUp size={14} /> Heatmap blocks represent reservation duration volumes per hour</span>
                <div className="flex gap-2.5 items-center">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-slate-100 dark:bg-slate-800 border" /> vacant</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-fresh-green/20 dark:bg-fresh-green/10" /> light</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-fresh-green" /> peak</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Live Table Grid vs Operations Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-slide-up delay-200">
        {/* Real-time occupied table grid */}
        <div className="lg:col-span-2 rounded-2xl border border-burgundy/10 bg-white p-5 shadow-sm dark:border-gold/10 dark:bg-slate-900 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-burgundy/10 dark:border-gold/10">
            <h3 className="text-base font-elegant font-bold text-burgundy dark:text-gold flex items-center gap-2">
              <Layers className="h-5 w-5 text-burgundy dark:text-gold" />
              Live Table Occupancy Grid
            </h3>
            <span className="text-xs text-slate-400">
              {occupiedTablesCount}/{totalTables} Tables Occupied
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <SkeletonLoader variant="card" count={4} />
            </div>
          ) : tables.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {tables.map((t) => {
                const isOccupied = occupiedTableIds.has(t._id.toString());
                const isMaintenance = t.status === 'MAINTENANCE';
                const isDisabled = t.status === 'DISABLED';
                
                // Indicators logic
                let borderClass = 'border-slate-200 dark:border-slate-800';
                let indicatorColor = 'bg-slate-300 dark:bg-slate-700'; // vacant default
                let statusLabel = 'Vacant';
                let bgOverride = '';
                
                if (isOccupied) {
                  borderClass = 'border-burgundy/30 dark:border-gold/30 shadow-sm shadow-burgundy/5 dark:shadow-gold/5';
                  indicatorColor = 'bg-burgundy dark:bg-gold animate-pulse';
                  statusLabel = 'Occupied';
                  bgOverride = 'bg-burgundy/5 dark:bg-gold/5';
                } else if (isMaintenance) {
                  borderClass = 'border-soft-orange/40';
                  indicatorColor = 'bg-soft-orange';
                  statusLabel = 'Maintenance';
                  bgOverride = 'bg-soft-orange/5';
                } else if (isDisabled) {
                  borderClass = 'border-red-200 dark:border-red-950/40';
                  indicatorColor = 'bg-red-500';
                  statusLabel = 'Disabled';
                  bgOverride = 'bg-red-50 dark:bg-red-950/10';
                }

                return (
                  <div
                    key={t._id}
                    className={`rounded-xl border p-4 flex flex-col justify-between min-h-[6.5rem] bg-white dark:bg-slate-900 text-left transition-all hover-lift animate-scale-in ${borderClass} ${bgOverride}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-xs font-mono text-slate-400">#{t.tableNumber}</span>
                        <h4 className="font-bold text-slate-800 dark:text-white">Table {t.tableNumber}</h4>
                      </div>
                      {/* Visual occupancy indicators */}
                      <span className={`h-2.5 w-2.5 rounded-full ${indicatorColor}`} />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <span>{t.capacity} Pax size</span>
                      <span className={`font-semibold ${isOccupied ? 'text-burgundy dark:text-gold' : 'text-slate-400'}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">No tables seeded.</div>
          )}
        </div>

        {/* Operations Feed chronological updates */}
        <div className="rounded-2xl border border-burgundy/10 bg-white p-5 shadow-sm dark:border-gold/10 dark:bg-slate-900 space-y-4 hover-lift">
          <h3 className="text-base font-elegant font-bold text-burgundy dark:text-gold flex items-center gap-2 pb-3 border-b border-burgundy/10 dark:border-gold/10">
            <Activity className="h-5 w-5 text-burgundy dark:text-gold" />
            Operations Feed
          </h3>

          {loading ? (
            <div className="space-y-4">
              <SkeletonLoader count={4} className="h-8" />
            </div>
          ) : sortedEvents.length > 0 ? (
            <div className="relative pl-4 space-y-4 text-left border-l border-slate-200 dark:border-slate-800 py-1">
              {sortedEvents.map((evt, idx) => (
                <div key={idx} className="relative space-y-1">
                  {/* Dot connector */}
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-burgundy dark:bg-gold border border-white dark:border-slate-900" />
                  
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                    {evt.message}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(evt.time).toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
              <Inbox size={28} />
              <p className="text-xs">No recent events logged</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
