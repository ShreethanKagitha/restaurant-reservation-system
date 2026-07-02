import React from 'react';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

/**
 * Mobile-optimized reservation list card.
 */
const ReservationCard = ({ reservation, onCancelClick }) => {
  const { _id, reservationDate, startTime, endTime, guestCount, table, reservationStatus } = reservation;

  const formattedDate = new Date(reservationDate).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = `${new Date(startTime).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  })} - ${new Date(endTime).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  })}`;

  const tableNumber = table?.tableNumber || 'Assigned';
  const isCancellable = ['PENDING', 'CONFIRMED'].includes(reservationStatus);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div className="text-left">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: {_id.substring(_id.length - 8)}</p>
          <h4 className="font-bold text-slate-900 dark:text-white mt-0.5">Table {tableNumber}</h4>
        </div>
        <StatusBadge status={reservationStatus} />
      </div>

      {/* Date/Guests Icons Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span>{guestCount} Guests</span>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Actions Button Bar */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Link to={`/reservations/${_id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            Details
          </Button>
        </Link>
        {isCancellable && onCancelClick && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onCancelClick(_id)}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReservationCard;
