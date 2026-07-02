import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

/**
 * Desktop-optimized reservations table.
 */
const ReservationTable = ({ reservations, onCancelClick }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4">Reservation ID</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Time Window</th>
              <th className="px-6 py-4">Guest Count</th>
              <th className="px-6 py-4">Table</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {reservations.map((res) => {
              const formattedDate = new Date(res.reservationDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              const formattedTime = `${new Date(res.startTime).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit'
              })} - ${new Date(res.endTime).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit'
              })}`;

              const tableNumber = res.table?.tableNumber || 'Auto-Allocated';
              const isCancellable = ['PENDING', 'CONFIRMED'].includes(res.reservationStatus);

              return (
                <tr key={res._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-medium text-slate-900 dark:text-white">
                    #{res._id.substring(res._id.length - 8)}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {formattedDate}
                  </td>
                  <td className="px-6 py-4">{formattedTime}</td>
                  <td className="px-6 py-4">{res.guestCount} pax</td>
                  <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                    Table {tableNumber}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={res.reservationStatus} />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link to={`/reservations/${res._id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {isCancellable && onCancelClick && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onCancelClick(res._id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationTable;
