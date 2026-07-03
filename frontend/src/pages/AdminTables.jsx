import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import adminApi from '../api/adminApi';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Drawer from '../components/common/Drawer';
import ConfirmModal from '../components/common/ConfirmModal';
import Badge from '../components/common/Badge';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Plus, Settings2, ShieldCheck, Hammer, HelpCircle } from 'lucide-react';

const AdminTables = () => {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drawer overlays
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null); // null means "Create mode"
  const [errorMsg, setErrorMsg] = useState('');

  // Confirmation overlay
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', desc: '', action: null });
  const [actionLoading, setActionLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      tableNumber: '',
      capacity: 2,
      location: ''
    }
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const tablesRes = await adminApi.getTables();
      const reservationsRes = await adminApi.getReservations({ limit: 1000 });

      if (tablesRes.success && tablesRes.data.tables) {
        setTables(tablesRes.data.tables);
      }
      if (reservationsRes.success && reservationsRes.data.reservations) {
        setReservations(reservationsRes.data.reservations);
      }
    } catch (err) {
      toast.error('Failed to load table list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateDrawer = () => {
    setEditingTable(null);
    reset({
      tableNumber: '',
      capacity: 2,
      location: ''
    });
    setErrorMsg('');
    setDrawerOpen(true);
  };

  const openEditDrawer = (table) => {
    setEditingTable(table);
    setValue('tableNumber', table.tableNumber);
    setValue('capacity', table.capacity);
    setValue('location', table.location);
    setErrorMsg('');
    setDrawerOpen(true);
  };

  const onSubmitForm = async (data) => {
    setErrorMsg('');
    try {
      if (editingTable) {
        // Edit Mode
        const response = await adminApi.updateTable(editingTable._id, {
          tableNumber: data.tableNumber.trim(),
          capacity: parseInt(data.capacity, 10),
          location: data.location
        });
        if (response.success) {
          toast.success(`Table updated successfully`);
          setDrawerOpen(false);
          loadData();
        }
      } else {
        // Create Mode
        const response = await adminApi.createTable({
          tableNumber: data.tableNumber.trim(),
          capacity: parseInt(data.capacity, 10),
          location: data.location
        });
        if (response.success) {
          toast.success(`Table created successfully`);
          setDrawerOpen(false);
          loadData();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const handleStatusChange = (id, newStatus, tableNumber) => {
    setConfirmConfig({
      title: 'Update Seating State?',
      desc: `Confirm marking Table ${tableNumber} status as ${newStatus}?`,
      action: async () => {
        const response = await adminApi.updateTableStatus(id, newStatus);
        if (response.success) {
          toast.success(`Table ${tableNumber} updated successfully`);
          loadData();
        }
      }
    });
    setConfirmOpen(true);
  };

  const executeAction = async () => {
    try {
      setActionLoading(true);
      await confirmConfig.action();
      setConfirmOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Find active occupancies right now
  const now = new Date();
  const occupiedTableIds = new Set(
    reservations
      .filter(
        (r) =>
          ['PENDING', 'CONFIRMED'].includes(r.reservationStatus) &&
          new Date(r.startTime) <= now &&
          new Date(r.endTime) >= now
      )
      .map((r) => r.table?._id?.toString())
      .filter(Boolean)
  );

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Table Layout Settings"
        description="Add new dining capacities, edit location settings, and trigger table states."
      >
        <Button variant="primary" icon={Plus} onClick={openCreateDrawer}>
          Create Table
        </Button>
      </PageHeader>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <SkeletonLoader variant="card" count={4} />
        </div>
      ) : tables.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tables.map((t) => {
            const isOccupied = occupiedTableIds.has(t._id.toString());
            const isMaintenance = t.status === 'MAINTENANCE';
            const isDisabled = t.status === 'DISABLED';
            
            // Indicators
            let borderClass = 'border-slate-200 dark:border-slate-800';
            let indicatorColor = 'bg-slate-300 dark:bg-slate-700'; // vacant default
            let badgeVariant = 'default';
            let statusText = 'Available';
            let bgOverride = '';
            
            if (isOccupied) {
              borderClass = 'border-burgundy/30 dark:border-gold/30 shadow-sm';
              indicatorColor = 'bg-burgundy dark:bg-gold animate-pulse';
              badgeVariant = 'info';
              statusText = 'Occupied';
              bgOverride = 'bg-burgundy/5 dark:bg-gold/5';
            } else if (isMaintenance) {
              borderClass = 'border-soft-orange/40';
              indicatorColor = 'bg-soft-orange';
              badgeVariant = 'warning';
              statusText = 'Maintenance';
              bgOverride = 'bg-soft-orange/5';
            } else if (isDisabled) {
              borderClass = 'border-red-200 dark:border-red-950/40';
              indicatorColor = 'bg-red-500';
              badgeVariant = 'danger';
              statusText = 'Disabled';
              bgOverride = 'bg-red-50 dark:bg-red-950/10';
            }

            return (
              <div
                key={t._id}
                className={`rounded-2xl border p-5 flex flex-col justify-between min-h-[10rem] bg-white dark:bg-slate-900 text-left transition-all hover-lift glassmorphism ${borderClass} ${bgOverride}`}
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono text-slate-400">ID: {t._id.substring(t._id.length - 8)}</span>
                      <h4 className="font-bold text-slate-900 dark:text-white">Table {t.tableNumber}</h4>
                    </div>
                    {/* Visual occupancy indicators */}
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${indicatorColor}`} />
                      <Badge variant={badgeVariant}>{statusText}</Badge>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p>Capacity: <span className="font-bold text-slate-800 dark:text-slate-200">{t.capacity} Guests</span></p>
                    <p>Location: <span className="font-medium text-slate-800 dark:text-slate-200">{t.location || 'Main Hall'}</span></p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Status switches actions buttons */}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => openEditDrawer(t)}
                      icon={Settings2}
                    >
                      Edit
                    </Button>
                    
                    {/* Lifecycle Status changes */}
                    {isMaintenance && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleStatusChange(t._id, 'AVAILABLE', t.tableNumber)}
                        icon={ShieldCheck}
                        className="text-fresh-green border-fresh-green/50 hover:bg-fresh-green/10 dark:border-fresh-green/30 dark:hover:bg-fresh-green/20"
                      >
                        Activate
                      </Button>
                    )}

                    {isDisabled && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleStatusChange(t._id, 'AVAILABLE', t.tableNumber)}
                        icon={ShieldCheck}
                        className="text-emerald-600 border-emerald-100 hover:bg-emerald-50 dark:border-emerald-950 dark:hover:bg-emerald-950/20"
                      >
                        Activate
                      </Button>
                    )}

                    {t.status === 'AVAILABLE' && !isOccupied && (
                      <>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleStatusChange(t._id, 'MAINTENANCE', t.tableNumber)}
                          icon={Hammer}
                          className="text-soft-orange border-soft-orange/50 hover:bg-soft-orange/10 dark:border-soft-orange/30 dark:hover:bg-soft-orange/20"
                        >
                          Maintain
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleStatusChange(t._id, 'DISABLED', t.tableNumber)}
                          icon={HelpCircle}
                          className="text-red-600 border-red-100 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/20"
                        >
                          Disable
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-burgundy/20 p-12 text-center text-slate-400 glassmorphism">
          No table records configured in system. Add a new seating capacity to start.
        </div>
      )}

      {/* Creation/Edit Form Slide-out Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingTable ? `Edit Table ${editingTable.tableNumber}` : 'Create New Table'}
      >
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-3.5 text-xs font-semibold text-red-600 dark:bg-red-950/20">
              {errorMsg}
            </div>
          )}

          <Input
            label="Table Number / Identifier"
            type="text"
            name="tableNumber"
            placeholder="T1"
            error={errors.tableNumber}
            {...register('tableNumber', {
              required: 'Table number identifier is required'
            })}
          />

          <Input
            label="Capacity (Seating Size)"
            type="number"
            name="capacity"
            placeholder="4"
            error={errors.capacity}
            {...register('capacity', {
              required: 'Table seating capacity size is required',
              valueAsNumber: true,
              min: {
                value: 1,
                message: 'Capacity must be at least 1 guest'
              }
            })}
          />

          <Input
            label="Table Location Description"
            type="text"
            name="location"
            placeholder="Patio, Window side, Main Hall..."
            error={errors.location}
            {...register('location')}
          />

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              {editingTable ? 'Save Details' : 'Create Table'}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Confirmation Overlay Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        title={confirmConfig.title}
        description={confirmConfig.desc}
        confirmLabel="Proceed"
        onConfirm={executeAction}
        onCancel={() => setConfirmOpen(false)}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AdminTables;
