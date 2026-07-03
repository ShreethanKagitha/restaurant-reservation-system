import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import reservationApi from '../api/reservationApi';
import PageHeader from '../components/common/PageHeader';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Calendar, Clock, Users, FileText, CheckCircle2, ArrowRight, ArrowLeft, Star, HeartHandshake } from 'lucide-react';

const BookReservation = () => {
  const navigate = useNavigate();
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Custom visual step indicators for form flow guidance
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Date & Time, Step 2: Details & Review

  const {
    register,
    handleSubmit,
    watch,
    trigger,
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
  const watchEnd = watch('endTime');
  const watchGuests = watch('guestCount');
  const watchNotes = watch('notes');

  const handleNextStep = async () => {
    // Validate step 1 fields
    const isStep1Valid = await trigger(['date', 'startTime', 'endTime']);
    if (isStep1Valid) {
      setCurrentStep(2);
    } else {
      toast.warn('Please fill in valid Date and Time inputs.');
    }
  };

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      const startDateTime = new Date(`${data.date}T${data.startTime}`);
      const endDateTime = new Date(`${data.date}T${data.endTime}`);

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

  // Confirmation view
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
      <div className="mx-auto max-w-2xl text-left space-y-6 animate-in fade-in duration-300">
        <div className="rounded-3xl border border-gold/20 bg-white p-8 shadow-xl dark:border-gold/10 dark:bg-slate-900 text-center space-y-6 relative overflow-hidden">
          {/* Gold highlight border */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-burgundy via-gold to-burgundy" />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold dark:bg-gold/5 border border-gold/25">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-elegant font-bold text-charcoal dark:text-white">Table Confirmed</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Your gourmet seating allocation has been secured by the ReserveTable engine.
            </p>
          </div>

          <div className="rounded-2xl border border-burgundy/10 bg-[#FFF8F0]/80 p-6 dark:border-gold/5 dark:bg-slate-950/40 text-left space-y-4 text-sm max-w-md mx-auto">
            <div className="flex justify-between items-center pb-2.5 border-b border-burgundy/10 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Reservation ID</span>
              <span className="font-mono font-bold text-slate-800 dark:text-white">
                #{reservation._id.substring(reservation._id.length - 8)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-burgundy/10 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Assigned Seat</span>
              <span className="font-bold text-burgundy dark:text-gold">
                Table {table.tableNumber} (Capacity: {table.capacity})
              </span>
            </div>

            <div className="flex justify-between items-start pb-2.5 border-b border-burgundy/10 dark:border-slate-800">
              <span className="text-slate-400 font-medium flex-shrink-0">Date & Time</span>
              <div className="text-right">
                <p className="font-bold text-slate-800 dark:text-white">{dateFormatted}</p>
                <p className="text-xs text-slate-500 mt-0.5">{timeFormatted}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Guests Size</span>
              <span className="font-bold text-slate-800 dark:text-white">{reservation.guestCount} Pax</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:justify-center max-w-xs mx-auto">
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Dashboard
              </Button>
            </Link>
            <Link to={`/reservations/${reservation._id}`} className="w-full sm:w-auto">
              <Button variant="primary" icon={ArrowRight} className="w-full bg-burgundy hover:bg-[#601420]">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      <PageHeader
        title="Reserve Priority Seating"
        description="Book your dining table effortlessly. Our smart allocation engine will assign the optimal layout."
      >
        <Link to="/dashboard">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back
          </Button>
        </Link>
      </PageHeader>

      {/* Split Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 bg-white dark:bg-slate-900 rounded-3xl border border-burgundy/10 dark:border-gold/10 shadow-sm overflow-hidden min-h-[500px]">
        {/* Left Side: Culinary Imagery backdrop */}
        <div
          className="lg:col-span-5 relative bg-cover bg-center min-h-[250px] lg:min-h-full"
          style={{ backgroundImage: `url('/gourmet_dish.png')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 lg:bg-gradient-to-r lg:from-black/90 lg:to-black/35" />
          
          <div className="absolute bottom-8 left-8 right-8 text-white space-y-3.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
              <Star className="h-3 w-3 fill-gold" /> Host System Lock
            </span>
            <h3 className="text-3xl font-elegant font-bold leading-tight">
              Sensory Seating
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Your table assignment is dynamically optimized based on guest sizes and operating schedules, guaranteeing optimal hospitality comfort.
            </p>
          </div>
        </div>

        {/* Right Side: Step-by-Step Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          
          {/* Step Progress Indicators */}
          <div className="flex items-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer
                ${currentStep === 1 ? 'text-burgundy dark:text-gold border-b-2 border-burgundy dark:border-gold pb-1' : 'text-slate-400'}`}
            >
              1. Date & Time
            </button>
            <span className="text-slate-300">/</span>
            <button
              type="button"
              onClick={handleNextStep}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer
                ${currentStep === 2 ? 'text-burgundy dark:text-gold border-b-2 border-burgundy dark:border-gold pb-1' : 'text-slate-400'}`}
            >
              2. Seating Details
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col justify-between">
            {errorMsg && (
              <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600 dark:bg-red-950/20">
                {errorMsg}
              </div>
            )}

            {currentStep === 1 ? (
              /* STEP 1: DATE & TIME SELECTORS */
              <div className="space-y-5">
                <Input
                  label="Select Dining Date"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Arrival Hour"
                    type="time"
                    name="startTime"
                    error={errors.startTime}
                    {...register('startTime', {
                      required: 'Arrival start time is required'
                    })}
                  />

                  <Input
                    label="Departure Hour"
                    type="time"
                    name="endTime"
                    error={errors.endTime}
                    {...register('endTime', {
                      required: 'Departure end time is required',
                      validate: (value) => {
                        if (watchStart && value <= watchStart) {
                          return 'End time must be after start time';
                        }
                        return true;
                      }
                    })}
                  />
                </div>

                <div className="pt-6">
                  <Button
                    type="button"
                    className="w-full sm:w-auto float-right bg-burgundy hover:bg-[#601420]"
                    onClick={handleNextStep}
                  >
                    Continue Seating details
                  </Button>
                </div>
              </div>
            ) : (
              /* STEP 2: DETAILS & SUBMISSIONS */
              <div className="space-y-5">
                <Input
                  label="Seating Size / Guests"
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
                      message: 'Maximum online group seating is 20 pax'
                    }
                  })}
                />

                <div className="space-y-1.5">
                  <label htmlFor="notes" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Host Instructions (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3.5"
                    placeholder="Allergies, high chair request, window seat preference, special occasions etc."
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
                    {...register('notes')}
                  />
                </div>

                {/* Live Preview Summary before submission */}
                <div className="rounded-xl border border-burgundy/10 bg-cream/35 dark:border-gold/10 dark:bg-slate-950/20 p-4 text-xs space-y-2 text-slate-600 dark:text-slate-400">
                  <h4 className="font-bold text-burgundy dark:text-gold uppercase tracking-wider">Reservation Overview</h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <p>Date: <span className="font-bold text-slate-800 dark:text-white">{watchDate}</span></p>
                    <p>Pax Size: <span className="font-bold text-slate-800 dark:text-white">{watchGuests || 2} guests</span></p>
                    <p className="col-span-2">Time: <span className="font-bold text-slate-800 dark:text-white">{watchStart} - {watchEnd}</span></p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back to timing
                  </Button>
                  <Button
                    type="submit"
                    className="bg-burgundy hover:bg-[#601420]"
                    isLoading={isSubmitting}
                  >
                    Allocate Table & Confirm
                  </Button>
                </div>
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
};

export default BookReservation;
