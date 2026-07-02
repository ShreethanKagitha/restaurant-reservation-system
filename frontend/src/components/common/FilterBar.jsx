import React from 'react';
import FilterDropdown from './FilterDropdown';

/**
 * Reusable FilterBar row containing multiple selectors.
 */
const FilterBar = ({
  filters = [], // Array of { value, onChange, options, label, type: 'select' | 'date' }
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-3 w-full sm:w-auto ${className}`}>
      {filters.map((filter, idx) => {
        if (filter.type === 'date') {
          return (
            <div key={idx} className="relative w-full sm:max-w-xs">
              <input
                type="date"
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white cursor-pointer"
              />
            </div>
          );
        }

        return (
          <FilterDropdown
            key={idx}
            value={filter.value}
            onChange={filter.onChange}
            options={filter.options}
            label={filter.label}
          />
        );
      })}
    </div>
  );
};

export default FilterBar;
