import React from 'react';

/**
 * Reusable header wrapper for main page layouts.
 */
const PageHeader = ({ title, description, children, className = '' }) => {
  return (
    <div className={`flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="text-left space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-3 sm:flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
