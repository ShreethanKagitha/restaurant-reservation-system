import React from 'react';

/**
 * Reusable Toolbar container.
 */
const Toolbar = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export default Toolbar;
