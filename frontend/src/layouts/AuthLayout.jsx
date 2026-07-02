import React from 'react';
import { Outlet } from 'react-router-dom';
import { Utensils } from 'lucide-react';

/**
 * Split-screen authentication layout.
 * Left side: Rich, high-end promotional graphics (hidden on mobile).
 * Right side: Centered authentication forms.
 */
const AuthLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* Visual Left Section - Desktop only */}
      <div className="relative hidden w-0 flex-1 premium-gradient lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Background Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md">
            <Utensils className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">ReserveTable</span>
        </div>

        <div className="relative z-10 space-y-6 text-white max-w-xl">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight lg:text-5xl">
            Smarter Reservations for Fine Dining.
          </h1>
          <p className="text-lg text-indigo-100/90 leading-relaxed">
            Experience the next generation of restaurant table booking. Seamless seat allocations, real-time availability checks, and complete management for staff and guests.
          </p>
        </div>

        <div className="relative z-10 text-xs text-indigo-200/60">
          © {new Date().getFullYear()} ReserveTable. All rights reserved. Designed for excellence.
        </div>
      </div>

      {/* Form Right Section - Mobile / Desktop */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-6 flex justify-center lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl premium-gradient text-white shadow-md">
              <Utensils className="h-7 w-7" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:border-transparent sm:bg-transparent sm:p-0 sm:shadow-none">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
