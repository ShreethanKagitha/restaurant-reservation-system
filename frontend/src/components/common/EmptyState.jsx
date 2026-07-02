import React from 'react';
import { CalendarOff } from 'lucide-react';
import Button from './Button';

/**
 * Reusable EmptyState component.
 */
const EmptyState = ({
  icon: Icon = CalendarOff,
  title = 'No records found',
  description = 'You currently have no reservation items listed.',
  actionLabel = '',
  onActionClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white p-8 text-center dark:bg-slate-900 md:p-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {actionLabel && onActionClick && (
        <div className="mt-6">
          <Button onClick={onActionClick} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
