import React from 'react';

/**
 * Reusable Skeleton loader for SaaS card, table, or stat placeholders.
 * @param {string} variant - 'card' | 'table' | 'stat' | 'text' | 'circle'
 * @param {number} count - number of elements to draw
 */
const SkeletonLoader = ({ variant = 'text', count = 1, className = '' }) => {
  const items = Array.from({ length: count });

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
            <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-lg pt-2"></div>
          </div>
        );
      case 'stat':
        return (
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse">
            <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
            <div className="space-y-2 flex-1">
              <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="w-full space-y-4 animate-pulse">
            <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            {items.map((_, idx) => (
              <div key={idx} className="flex gap-4 items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-1/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-1/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-1/12 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-1/6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
              </div>
            ))}
          </div>
        );
      case 'circle':
        return <div className={`rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse ${className}`}></div>;
      case 'text':
      default:
        return <div className={`h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse ${className}`}></div>;
    }
  };

  return (
    <>
      {items.map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
};

export default SkeletonLoader;
