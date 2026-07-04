import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Utensils } from 'lucide-react';
import Button from '../components/common/Button';

/**
 * Public Main Layout with top navigation header and footer.
 */
const MainLayout = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Unique Floating Capsule Header */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 animate-slide-up">
        <div className="pointer-events-auto flex h-14 items-center justify-between gap-8 rounded-full bg-white/60 dark:bg-[#121212]/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-6 sm:px-8 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy dark:bg-gold text-white dark:text-slate-900 shadow-md group-hover:scale-105 transition-transform">
              <Utensils className="h-4 w-4" />
            </div>
            <span className="text-base font-elegant font-bold tracking-wide text-slate-900 dark:text-white group-hover:text-burgundy dark:group-hover:text-gold transition-colors hidden sm:block">
              ReserveTable
            </span>
          </Link>
          
          <nav className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-burgundy dark:text-slate-300 dark:hover:text-gold transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-burgundy dark:after:bg-gold hover:after:w-full after:transition-all after:duration-300">
                  Console
                </Link>
                <button 
                  onClick={logout}
                  className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-burgundy dark:text-slate-300 dark:hover:text-gold transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-burgundy dark:after:bg-gold hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-burgundy dark:text-slate-300 dark:hover:text-gold transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-burgundy dark:after:bg-gold hover:after:w-full after:transition-all after:duration-300">
                  Sign In
                </Link>
                <Link to="/register">
                  <Button size="sm" className="rounded-full bg-burgundy hover:bg-[#601420] text-white px-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 text-[10px] uppercase tracking-wider font-bold h-9">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 dark:text-slate-400 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} ReserveTable. All rights reserved. Elegant dining reservations.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
