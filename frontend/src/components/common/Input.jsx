import React, { forwardRef } from 'react';

/**
 * Reusable form input component.
 * Integrates cleanly with react-hook-form.
 */
const Input = forwardRef(({
  label,
  name,
  type = 'text',
  error,
  className = '',
  placeholder,
  ...props
}, ref) => {
  return (
    <div className={`w-full space-y-1.5 text-left ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2
          ${error 
            ? 'border-red-300 dark:border-red-900/50 bg-red-50/20 focus:border-red-500 focus:ring-red-500/20' 
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20'
          }
          placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white`}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
