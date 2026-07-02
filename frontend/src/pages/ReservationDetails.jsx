import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import reservationApi from '../api/reservationApi';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Calendar,
  Clock,
  Users,
  Compass,
  ArrowLeft,
  CalendarDays,
  Utensils,
  CheckCircle2,
  Trash2,
  CalendarCheck2
} from 'lucide-react';

const ReservationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await reservationApi.getMyReservations();
      if (response.success && response.data.reservations) {
        const found = response.data.reservations.find((r) => r._id === id);
        if (found) {
          setReservation(found);
        } else {
          toast.error('Reservation details not found');
          navigate('/reservations');
        }
      }
    } catch (error) {
      console.error('Failed to load reservation details:', error);
      toast.error('Failed to load reservation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCancelConfirm = async () => {
    try {
      setCancelLoading(true);
      const response = await reservationApi.cancelReservation(id);
      if (response.success) {
        toast.success(response.message || 'Reservation cancelled successfully.');
        setModalOpen(false);
        fetchDetails(); // Refresh
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel reservation';
      toast.error(message);
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="md" message="Loading reservation parameters..." />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 font-semibold">Reservation record not found.</p>
        <Link to="/reservations" className="mt-4 inline-block">
          <Button variant="outline" icon={ArrowLeft}>Back to list</Button>
        </Link>
      </div>
    );
  }

  const {
    reservationDate,
    startTime,
    endTime,
    guestCount,
    table,
    reservationStatus,
    notes,
    createdAt
  } = reservation;

  const dateFormatted = new Date(reservationDate).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const timeFormatted = `${new Date(startTime).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  })} - ${new Date(endTime).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  })}`;

  const createdFormatted = new Date(createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const isCancellable = ['PENDING', 'CONFIRMED'].includes(reservationStatus);

  // Timeline Step calculation
  const getTimelineSteps = () => {
    if (reservationStatus === 'CANCELLED') {
      return [
        { label: 'Booking Logged', active: true, done: true },
        { label: 'Cancelled', active: true, done: true, error: true }
      ];
    }
    const isConfirmed = ['CONFIRMED', 'COMPLETED'].includes(reservationStatus);
    const isCompleted = reservationStatus === 'COMPLETED';

    return [
      { label: 'Booking Logged', active: true, done: true },
      { label: 'Confirmed', active: isConfirmed, done: isConfirmed },
      { label: 'Completed', active: isCompleted, done: isCompleted }
    ];
  };

  const steps = getTimelineSteps();

  return (
    <div className="mx-auto max-w-3xl text-left space-y-8">
      <PageHeader
        title={`Reservation Details`}
        description={`Manage and track parameters for booking #${id.substring(id.length - 8)}`}
      >
        <Link to="/reservations">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Reservations
          </Button>
        </Link>
        {isCancellable && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setModalOpen(true)}
            icon={Trash2}
          >
            Cancel Booking
          </Button>
        )}
      </PageHeader>

      {/* Grid: Details Card vs Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Utensils className="h-5 w-5 text-indigo-500" />
                Allocated Seating
              </h3>
              <StatusBadge status={reservationStatus} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Table</span>
                <p className="font-bold text-slate-800 dark:text-white">
                  Table {table?.tableNumber || 'Auto-Allocated'}
                </p>
                <p className="text-xs text-slate-500">Capacity: {table?.capacity} Guests max</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Guest Size</span>
                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-slate-400" />
                  {guestCount} Pax
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reservation Date</span>
                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {dateFormatted}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Time Window</span>
                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {timeFormatted}
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Special Notes</span>
                <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3 text-xs italic">
                  {notes || 'No special requests submitted.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>Created: {createdFormatted}</span>
              <span>ID: {id}</span>
            </div>
          </div>
        </div>

        {/* Timeline Panel */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Reservation Timeline
          </h3>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="relative flex flex-col gap-6 text-left">
              {/* Vertical line connector */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800" />

              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start relative z-10">
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-150
                      ${step.error
                        ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                        : step.done
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                      }`}
                  >
                    {step.error ? (
                      <XCircleIcon className="h-4 w-4" />
                    ) : step.done ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p
                      className={`text-sm font-bold transition-colors duration-150
                        ${step.error
                          ? 'text-red-600 dark:text-red-400'
                          : step.active
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-400 dark:text-slate-600'
                        }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        title="Cancel Reservation?"
        description="Confirm to cancel your restaurant seating. The table will be immediately re-opened for new guest allocations."
        confirmLabel="Cancel Booking"
        onConfirm={handleCancelConfirm}
        onCancel={() => setModalOpen(false)}
        isLoading={cancelLoading}
      />
    </div>
  );
};

// Simple Fallback X icon
const XCircleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

export default ReservationDetails;
