import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reusable Password Input component.
 * Includes inline Toggle Password Visibility button and wraps input fields.
 */
const PasswordInput = forwardRef(({
  label,
  name,
  error,
  className = '',
  placeholder = '••••••••',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

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
      <div className="relative rounded-lg shadow-sm">
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          name={name}
          id={name}
          placeholder={placeholder}
          className={`block w-full rounded-lg border pl-3 pr-10 py-2 text-sm transition-colors duration-150 focus:outline-none focus:ring-2
            ${error 
              ? 'border-red-300 dark:border-red-900/50 bg-red-50/20 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20'
            }
            placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white`}
          {...props}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
          tabIndex="-1"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
