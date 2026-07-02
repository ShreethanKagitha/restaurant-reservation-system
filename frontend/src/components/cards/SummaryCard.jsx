import React from 'react';

/**
 * Reusable Summary / Stat Card.
 */
const SummaryCard = ({ name, value, icon: Icon, color = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' }) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all duration-200 hover:shadow-md">
      <div className={`rounded-xl p-3 ${color} flex-shrink-0`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-left min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
          {name}
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 leading-none">
          {value}
        </p>
      </div>
    </div>
  );
};

export default SummaryCard;
