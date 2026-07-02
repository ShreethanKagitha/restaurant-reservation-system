import React, { Component } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <AlertOctagon size={36} />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                An unexpected runtime error occurred. Our team has been notified.
              </p>
            </div>
            
            <div className="rounded-lg bg-slate-100 p-4 text-left dark:bg-slate-900">
              <p className="font-mono text-xs text-red-600 dark:text-red-400 break-words">
                {this.state.error?.toString() || 'Unknown Error'}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer transition-colors"
              >
                <RotateCcw size={16} />
                Try Again
              </button>
              <a
                href="/"
                className="flex items-center justify-center gap-2 rounded-md bg-white border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 cursor-pointer transition-colors"
              >
                <Home size={16} />
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
