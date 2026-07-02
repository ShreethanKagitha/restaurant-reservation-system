import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const Forbidden = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400">
            <ShieldAlert size={36} />
          </div>
          <h1 className="mt-6 text-7xl font-extrabold tracking-tight text-red-600 dark:text-red-400">
            403
          </h1>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Access Forbidden
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            You do not possess the required credentials to access this administrative scope.
          </p>
        </div>

        <div className="flex justify-center">
          <Link to="/dashboard">
            <Button variant="primary" icon={ArrowLeft}>
              Back to Console
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
