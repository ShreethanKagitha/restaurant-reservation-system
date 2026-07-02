import React from 'react';

/**
 * Reusable Loading Spinner component.
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} message - Optional text shown beneath spinner
 * @param {boolean} fullScreen - Overlay spinner across the entire screen
 */
const LoadingSpinner = ({ size = 'md', message = '', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-indigo-200 border-t-indigo-600`}
        role="status"
        aria-label="loading"
      />
      {message && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/75 dark:bg-slate-950/75 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
