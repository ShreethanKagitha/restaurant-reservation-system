import React from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable SearchBar input element.
 */
const SearchBar = ({ value, onChange, placeholder = 'Search reservations...', className = '' }) => {
  return (
    <div className={`relative rounded-lg shadow-sm w-full sm:max-w-xs ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
        <Search className="h-4 w-4" aria-hidden="true" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-600"
      />
    </div>
  );
};

export default SearchBar;
