import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import reservationApi from '../api/reservationApi';
import PageHeader from '../components/common/PageHeader';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Calendar, Clock, Users, FileText, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const BookReservation = () => {
  const navigate = useNavigate();
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      date: '',
      startTime: '',
      endTime: '',
      guestCount: 2,
      notes: ''
    }
  });

  const watchDate = watch('date');
  const watchStart = watch('startTime');

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      // Combine date and time values
      const startDateTime = new Date(`${data.date}T${data.startTime}`);
      const endDateTime = new Date(`${data.date}T${data.endTime}`);

      // Perform frontend validation checks
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(data.date);

      if (selectedDate < today) {
        toast.error('Reservations cannot be booked for past dates');
        return;
      }

      if (endDateTime <= startDateTime) {
        toast.error('End time must be strictly after start time');
        return;
      }

      const durationMin = (endDateTime - startDateTime) / 1000 / 60;
      if (durationMin < 30) {
        toast.error('Minimum reservation duration is 30 minutes');
        return;
      }
      if (durationMin > 240) {
        toast.error('Maximum reservation duration is 4 hours');
        return;
      }

      const startHour = startDateTime.getHours();
      const endHour = endDateTime.getHours();
      if (startHour < 11 || endHour > 23 || (endHour === 23 && endDateTime.getMinutes() > 0)) {
        toast.error('Reservations can only be booked during operating hours: 11:00 AM to 11:00 PM.');
        return;
      }

      // Send payload to backend
      const payload = {
        reservationDate: selectedDate.toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        guestCount: parseInt(data.guestCount, 10),
        notes: data.notes
      };

      const response = await reservationApi.createReservation(payload);

      if (response.success && response.data) {
        toast.success(response.message || 'Table allocated successfully!');
        setBookingSuccess(response.data);
      } else {
        toast.error(response.message || 'Allocation failed');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to allocate table. Please verify slot availability.';
      setErrorMsg(message);
      toast.error(message);
    }
  };

  // If successfully booked, render confirmation screen
  if (bookingSuccess) {
    const { reservation, table } = bookingSuccess;
    const dateFormatted = new Date(reservation.reservationDate).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const timeFormatted = `${new Date(reservation.startTime).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    })} - ${new Date(reservation.endTime).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    })}`;

    return (
      <div className="mx-auto max-w-xl text-left space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 size={36} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Table Allocated Successfully!</h2>
            <p className="text-sm text-slate-500">Your table booking has been confirmed and locked.</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800/40 text-left space-y-3.5 text-sm">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Reservation ID</span>
              <span className="font-mono font-bold text-slate-800 dark:text-white">
                #{reservation._id.substring(reservation._id.length - 8)}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Assigned Seating</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                Table {table.tableNumber} (Capacity: {table.capacity})
              </span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Status</span>
              <Badge variant="success">Confirmed</Badge>
            </div>

            <div className="flex justify-between items-start pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400 font-medium flex-shrink-0">Date & Time</span>
              <div className="text-right">
                <p className="font-bold text-slate-800 dark:text-white">{dateFormatted}</p>
                <p className="text-xs text-slate-500 mt-0.5">{timeFormatted}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Guests count</span>
              <span className="font-bold text-slate-800 dark:text-white">{reservation.guestCount} Pax</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Dashboard
              </Button>
            </Link>
            <Link to={`/reservations/${reservation._id}`} className="w-full sm:w-auto">
              <Button variant="primary" icon={ArrowRight} className="w-full">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl text-left space-y-6">
      <PageHeader
        title="Book a Table"
        description="Fill out the scheduling options. The reservation engine will automatically search and lock the optimal seating layout."
      >
        <Link to="/dashboard">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back
          </Button>
        </Link>
      </PageHeader>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-600 dark:bg-red-950/20 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Date Picker */}
          <Input
            label="Reservation Date"
            type="date"
            name="date"
            error={errors.date}
            {...register('date', {
              required: 'Reservation date is required',
              validate: (value) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (new Date(value) < today) {
                  return 'Date cannot be in the past';
                }
                return true;
              }
            })}
          />

          {/* Time Picker Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              name="startTime"
              error={errors.startTime}
              {...register('startTime', {
                required: 'Start time is required'
              })}
            />

            <Input
              label="End Time"
              type="time"
              name="endTime"
              error={errors.endTime}
              {...register('endTime', {
                required: 'End time is required',
                validate: (value) => {
                  if (watchStart && value <= watchStart) {
                    return 'End time must be after start time';
                  }
                  return true;
                }
              })}
            />
          </div>

          {/* Guest Count */}
          <Input
            label="Guest Count (Pax)"
            type="number"
            name="guestCount"
            placeholder="2"
            error={errors.guestCount}
            {...register('guestCount', {
              required: 'Guest count is required',
              valueAsNumber: true,
              min: {
                value: 1,
                message: 'Must have at least 1 guest'
              },
              max: {
                value: 20,
                message: 'Maximum online reservation size is 20 guests'
              }
            })}
          />

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Special Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              placeholder="Allergies, high chair request, window seat preference, etc."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
              {...register('notes')}
            />
          </div>

          {/* Table Allocation Info Notice */}
          <div className="rounded-lg bg-indigo-50/50 p-4 dark:bg-slate-800/40 text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
            💡 **Auto Allocation Active**: To maximize dining seating layout efficiencies, table selection is handled programmatically by our reservation matching engine.
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
          >
            Allocate Table & Book
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BookReservation;
