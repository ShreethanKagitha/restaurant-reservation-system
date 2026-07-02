import React from 'react';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';

/**
 * Reusable DataTable with skeleton loading and bulk selection checkbars.
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectChange,
  emptyState: EmptyComponent,
  keyField = '_id'
}) => {
  const handleSelectAll = (e) => {
    if (!onSelectChange) return;
    if (e.target.checked) {
      onSelectChange(data.map((row) => row[keyField]));
    } else {
      onSelectChange([]);
    }
  };

  const handleSelectRow = (rowId, checked) => {
    if (!onSelectChange) return;
    if (checked) {
      onSelectChange([...selectedIds, rowId]);
    } else {
      onSelectChange(selectedIds.filter((id) => id !== rowId));
    }
  };

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
            <tr>
              {selectable && (
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => el && (el.indeterminate = someSelected)}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-8">
                  <SkeletonLoader variant="table" count={5} />
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((row) => {
                const rowId = row[keyField];
                const isSelected = selectedIds.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors
                      ${isSelected ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}
                  >
                    {selectable && (
                      <td className="px-6 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col, idx) => (
                      <td
                        key={idx}
                        className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : ''}`}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12">
                  {EmptyComponent ? (
                    EmptyComponent
                  ) : (
                    <EmptyState
                      title="No records found"
                      description="No data entries are currently matching the parameters."
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
