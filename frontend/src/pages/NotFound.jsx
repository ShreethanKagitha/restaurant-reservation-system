import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400">
            <Compass size={36} className="animate-spin-slow" />
          </div>
          <h1 className="mt-6 text-7xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
            404
          </h1>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            The page you are looking for doesn't exist or has been relocated.
          </p>
        </div>

        <div className="flex justify-center">
          <Link to="/">
            <Button variant="primary" icon={ArrowLeft}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
