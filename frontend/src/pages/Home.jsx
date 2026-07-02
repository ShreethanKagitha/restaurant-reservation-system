import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Calendar, Shield, Users, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative isolate overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Decorative background gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500 to-cyan-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8 text-left">
          <h1 className="mt-10 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Reserve Your Table <span className="text-indigo-600 dark:text-indigo-400">Effortlessly</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            Enjoy premium seating. Reserve tables in real time, view occupancy layouts, and manage guest experiences with absolute confidence.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" icon={ArrowRight}>
                  Go to Management Console
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg">Book a Table</Button>
                </Link>
                <Link to="/login" className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Sign In <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Highlights on right */}
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:w-[32rem]">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Real-Time Booking</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Browse table configurations, verify open time slots, and schedule reservations instantly.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">Secure Sessions</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Role-based security protects personal details and reservation records from prying eyes.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:col-span-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">SaaS Panel for Staff</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Administrators and staff can manage bookings, change table states, and track seating plans from a comprehensive dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
