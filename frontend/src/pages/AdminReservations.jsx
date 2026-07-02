import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import adminApi from '../api/adminApi';
import PageHeader from '../components/common/PageHeader';
import SearchInput from '../components/common/SearchInput';
import FilterBar from '../components/common/FilterBar';
import Toolbar from '../components/common/Toolbar';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import Drawer from '../components/common/Drawer';
import ConfirmModal from '../components/common/ConfirmModal';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Calendar, Users, Clock, AlertTriangle, ArrowRightLeft, FileText, Check, X, ShieldAlert } from 'lucide-react';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search & Filter parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [guestCountFilter, setGuestCountFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('startTime');
  const [sortOrder, setSortOrder] = useState('desc');

  // Multi-select bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Drawer state
  const [activeReservation, setActiveReservation] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newTableId, setNewTableId] = useState('');

  // Confirmation Modals state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', desc: '', action: null });
  const [actionLoading, setActionLoading] = useState(false);

  // 1) Debounce search term changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset page
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const params = {
        search: debouncedSearch,
        status: statusFilter,
        date: dateFilter,
        guestCount: guestCountFilter,
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder
      };
      
      const response = await adminApi.getReservations(params);
      if (response.success && response.data) {
        setReservations(response.data.reservations || []);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      const response = await adminApi.getTables();
      if (response.success && response.data.tables) {
        setTables(response.data.tables);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [debouncedSearch, statusFilter, dateFilter, guestCountFilter, currentPage, sortBy, sortOrder]);

  useEffect(() => {
    loadTables();
  }, []);

  const triggerConfirmation = (title, desc, action) => {
    setConfirmConfig({ title, desc, action });
    setConfirmModalOpen(true);
  };

  const executeAction = async () => {
    try {
      setActionLoading(true);
      await confirmConfig.action();
      setConfirmModalOpen(false);
      setSelectedIds([]);
      loadReservations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Status Change trigger
  const handleUpdateStatus = (id, newStatus) => {
    triggerConfirmation(
      'Update Reservation Status?',
      `Are you sure you want to change the status of this reservation to ${newStatus}?`,
      async () => {
        const response = await adminApi.updateReservationStatus(id, newStatus);
        if (response.success) {
          toast.success('Status updated successfully');
          if (activeReservation && activeReservation._id === id) {
            setActiveReservation(response.data.reservation);
          }
        }
      }
    );
  };

  // Bulk Status changes
  const handleBulkUpdateStatus = (newStatus) => {
    triggerConfirmation(
      `Bulk Update Status to ${newStatus}?`,
      `Are you sure you want to update ${selectedIds.length} selected reservations to ${newStatus}?`,
      async () => {
        const response = await adminApi.bulkUpdateReservationStatus(selectedIds, newStatus);
        if (response.success) {
          toast.success(`Successfully processed bulk action for reservations.`);
        }
      }
    );
  };

  // Table Reassignment
  const handleReassignTable = () => {
    if (!newTableId) {
      toast.warn('Please select a target table first');
      return;
    }
    const selectedTable = tables.find((t) => t._id === newTableId);
    triggerConfirmation(
      'Reassign Table Seat?',
      `Confirm shifting reservation to Table ${selectedTable?.tableNumber}?`,
      async () => {
        const response = await adminApi.reassignReservationTable(activeReservation._id, newTableId);
        if (response.success) {
          toast.success('Table reassigned successfully');
          setActiveReservation(response.data.reservation);
          setNewTableId('');
        }
      }
    );
  };

  // Table candidate options for reassignment
  const candidateTables = tables.filter(
    (t) =>
      t.status === 'AVAILABLE' &&
      activeReservation &&
      t.capacity >= activeReservation.guestCount &&
      t._id !== activeReservation.table?._id
  );

  // Column definitions for DataTable
  const columns = [
    {
      header: 'Reservation ID',
      key: '_id',
      render: (val) => <span className="font-mono text-xs font-semibold">#{val.substring(val.length - 8)}</span>
    },
    {
      header: 'Customer',
      key: 'customer',
      render: (val) => (
        <div className="text-left space-y-0.5">
          <p className="font-bold text-slate-900 dark:text-white">{val?.fullName || 'Walk-in'}</p>
          <p className="text-xs text-slate-400">{val?.email || 'No email'}</p>
        </div>
      )
    },
    {
      header: 'Assigned Table',
      key: 'table',
      render: (val) => <span className="font-bold text-indigo-600 dark:text-indigo-400">Table {val?.tableNumber || 'Assigned'}</span>
    },
    {
      header: 'Guest Count',
      key: 'guestCount',
      render: (val) => <span>{val} Pax</span>
    },
    {
      header: 'Date & Time',
      key: 'startTime',
      render: (val, row) => {
        const dateStr = new Date(row.reservationDate).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric'
        });
        const timeStr = `${new Date(row.startTime).toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit'
        })} - ${new Date(row.endTime).toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit'
        })}`;

        return (
          <div className="text-left">
            <p className="font-semibold text-slate-800 dark:text-slate-200">{dateStr}</p>
            <p className="text-xs text-slate-400 mt-0.5">{timeStr}</p>
          </div>
        );
      }
    },
    {
      header: 'Status',
      key: 'reservationStatus',
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Actions',
      key: '_id',
      align: 'right',
      render: (val, row) => (
        <div className="space-x-2">
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setActiveReservation(row);
              setDrawerOpen(true);
            }}
          >
            Details
          </Button>
        </div>
      )
    }
  ];

  const filterOptions = [
    {
      type: 'select',
      value: statusFilter,
      onChange: (val) => { setStatusFilter(val); setCurrentPage(1); },
      options: [
        { value: 'PENDING', label: 'Pending' },
        { value: 'CONFIRMED', label: 'Confirmed' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'NO_SHOW', label: 'No Show' }
      ],
      label: 'All Statuses'
    },
    {
      type: 'date',
      value: dateFilter,
      onChange: (val) => { setDateFilter(val); setCurrentPage(1); }
    },
    {
      type: 'select',
      value: guestCountFilter,
      onChange: (val) => { setGuestCountFilter(val); setCurrentPage(1); },
      options: Array.from({ length: 20 }, (_, i) => ({ value: (i + 1).toString(), label: `${i + 1} guests` })),
      label: 'Guest count'
    }
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Reservations Management"
        description="Verify reservation listings, modify scheduling status, or reassign seating allocations."
      />

      {/* Toolbar containing filters & bulk actions */}
      <Toolbar>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search Customer, ID, Email..."
          className="max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <FilterBar filters={filterOptions} />
          
          {/* Sorting controls */}
          <div className="flex items-center gap-2">
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split(':');
                setSortBy(by);
                setSortOrder(order);
              }}
              className="block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white cursor-pointer"
            >
              <option value="startTime:desc">Time (Newest First)</option>
              <option value="startTime:asc">Time (Oldest First)</option>
              <option value="guestCount:desc">Guests Size (High)</option>
              <option value="guestCount:asc">Guests Size (Low)</option>
            </select>
          </div>
        </div>
      </Toolbar>

      {/* Bulk Action Panel if rows selected */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 text-sm text-indigo-800 dark:text-indigo-400">
            <ShieldAlert size={18} />
            <span>
              <span className="font-bold">{selectedIds.length}</span> items selected for bulk actions
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleBulkUpdateStatus('CANCELLED')}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/20"
            >
              Bulk Cancel
            </Button>
            <Button
              variant="primary"
              size="xs"
              onClick={() => handleBulkUpdateStatus('CONFIRMED')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Bulk Confirm
            </Button>
          </div>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={reservations}
        loading={loading}
        selectable={true}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
      />

      {/* Pagination controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={10}
        onPageChange={setCurrentPage}
      />

      {/* Details Slide-out Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setActiveReservation(null);
          setNewTableId('');
        }}
        title="Reservation Overview"
      >
        {activeReservation && (
          <div className="space-y-6">
            {/* Header info card */}
            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800/40 space-y-4">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-800 text-sm">
                <span className="text-slate-400 font-medium">Guest Name</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {activeReservation.customer?.fullName || 'Walk-in'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-800 text-sm">
                <span className="text-slate-400 font-medium">Email Address</span>
                <span className="font-mono text-slate-800 dark:text-white text-xs">
                  {activeReservation.customer?.email || 'No email'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-800 text-sm">
                <span className="text-slate-400 font-medium">Current Status</span>
                <StatusBadge status={activeReservation.reservationStatus} />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Audit logs</span>
                <span className="text-xs text-slate-400">
                  Last update: {new Date(activeReservation.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Timings card */}
            <div className="space-y-3.5 text-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Seating Parameters</h4>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4.5 w-4.5 text-slate-400" />
                <span>
                  {new Date(activeReservation.reservationDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4.5 w-4.5 text-slate-400" />
                <span>
                  {new Date(activeReservation.startTime).toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}{' '}
                  -{' '}
                  {new Date(activeReservation.endTime).toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-4.5 w-4.5 text-slate-400" />
                <span>{activeReservation.guestCount} pax group size</span>
              </div>
            </div>

            {/* Special notes */}
            <div className="space-y-2 text-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Special Notes</h4>
              <p className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 italic text-xs text-slate-600 dark:text-slate-400">
                {activeReservation.notes || 'No notes submitted.'}
              </p>
            </div>

            {/* Reassign Table Widget */}
            {['PENDING', 'CONFIRMED'].includes(activeReservation.reservationStatus) && (
              <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-5 text-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ArrowRightLeft size={14} />
                  Reassign Table
                </h4>
                <div className="flex gap-2">
                  <select
                    value={newTableId}
                    onChange={(e) => setNewTableId(e.target.value)}
                    className="block flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="">Choose vacant table...</option>
                    {candidateTables.map((t) => (
                      <option key={t._id} value={t._id}>
                        Table {t.tableNumber} (Capacity: {t.capacity})
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReassignTable}
                    disabled={!newTableId}
                  >
                    Reassign
                  </Button>
                </div>
              </div>
            )}

            {/* Action buttons footer */}
            <div className="flex flex-col gap-2.5 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                {['PENDING'].includes(activeReservation.reservationStatus) && (
                  <Button
                    variant="primary"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleUpdateStatus(activeReservation._id, 'CONFIRMED')}
                    icon={Check}
                  >
                    Confirm Booking
                  </Button>
                )}
                {['CONFIRMED'].includes(activeReservation.reservationStatus) && (
                  <Button
                    variant="outline"
                    className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950/20"
                    onClick={() => handleUpdateStatus(activeReservation._id, 'COMPLETED')}
                    icon={Check}
                  >
                    Mark Arrived
                  </Button>
                )}
                {['PENDING', 'CONFIRMED'].includes(activeReservation.reservationStatus) && (
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => handleUpdateStatus(activeReservation._id, 'CANCELLED')}
                    icon={X}
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Confirmation Dialog overlay */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title={confirmConfig.title}
        description={confirmConfig.desc}
        confirmLabel="Confirm Action"
        onConfirm={executeAction}
        onCancel={() => setConfirmModalOpen(false)}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AdminReservations;
