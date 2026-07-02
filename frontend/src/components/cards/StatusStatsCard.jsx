import React from 'react';

const StatusStatsCard = ({ name, value, icon: Icon, color = '' }) => {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {name}
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatusStatsCard;
