import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Premium UI Button component.
 * Supports different styles, sizes, and states (loading, disabled).
 */
const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary: 'bg-burgundy hover:bg-[#601420] text-white shadow-sm focus-visible:outline-burgundy border border-transparent transition-all duration-200 active:scale-95',
    secondary: 'bg-cream/40 border border-burgundy/10 hover:bg-cream text-burgundy dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-transparent',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-sm focus-visible:outline-red-600 border border-transparent',
    outline: 'bg-transparent border border-burgundy/25 dark:border-gold/25 hover:bg-burgundy/5 dark:hover:bg-gold/5 text-burgundy dark:text-gold'
  };

  const sizes = {
    xs: 'px-2 py-1 text-[11px] gap-1',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-md gap-2.5'
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
