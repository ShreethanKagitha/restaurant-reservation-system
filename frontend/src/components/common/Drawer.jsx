import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable slide-out Drawer from the right.
 */
const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md' // 'sm' | 'md' | 'lg'
}) => {
  // Lock scroll when drawer is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className={`pointer-events-auto w-screen ${sizeClasses[size] || sizeClasses.md} transform bg-white shadow-2xl dark:bg-slate-900 transition-transform duration-300 ease-in-out`}>
          <div className="flex h-full flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md text-slate-400 hover:text-slate-600 focus:outline-none dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="relative flex-1 p-6 text-left">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
