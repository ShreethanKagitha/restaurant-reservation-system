import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import reservationApi from '../api/reservationApi';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import ConfirmModal from '../components/common/ConfirmModal';
import ReservationCard from '../components/cards/ReservationCard';
import ReservationTable from '../components/tables/ReservationTable';
import EmptyState from '../components/common/EmptyState';
import SkeletonLoader from '../components/common/SkeletonLoader';
import Button from '../components/common/Button';
import { Plus, CalendarX } from 'lucide-react';

const Reservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Cancellation Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationApi.getMyReservations();
      if (response.success && response.data.reservations) {
        setReservations(response.data.reservations);
      }
    } catch (error) {
      console.error('Failed to load reservations list:', error);
      toast.error('Failed to retrieve your reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Filter and Search effect
  useEffect(() => {
    let result = [...reservations];

    // Filter by status tab
    if (statusFilter) {
      if (statusFilter === 'UPCOMING') {
        result = result.filter(
          (r) =>
            ['PENDING', 'CONFIRMED'].includes(r.reservationStatus) &&
            new Date(r.startTime) >= new Date()
        );
      } else if (statusFilter === 'COMPLETED') {
        result = result.filter(
          (r) =>
            r.reservationStatus === 'COMPLETED' ||
            (['PENDING', 'CONFIRMED'].includes(r.reservationStatus) &&
              new Date(r.endTime) < new Date())
        );
      } else if (statusFilter === 'CANCELLED') {
        result = result.filter((r) => r.reservationStatus === 'CANCELLED');
      }
    }

    // Search term check
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r._id.toLowerCase().includes(term) ||
          r.notes?.toLowerCase().includes(term) ||
          r.table?.tableNumber?.toLowerCase().includes(term)
      );
    }

    // Sort: Newest First
    result.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    setFilteredReservations(result);
    setCurrentPage(1); // Reset page on filter
  }, [reservations, searchTerm, statusFilter]);

  // Pagination bounds
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  const handleCancelClick = (id) => {
    setCancelingId(id);
    setModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelingId) return;
    try {
      setCancelLoading(true);
      const response = await reservationApi.cancelReservation(cancelingId);
      if (response.success) {
        toast.success(response.message || 'Reservation cancelled successfully.');
        setModalOpen(false);
        setCancelingId(null);
        fetchReservations(); // Refresh list
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel reservation';
      toast.error(message);
    } finally {
      setCancelLoading(false);
    }
  };

  const filterOptions = [
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Reservations"
        description="Inspect details, track historical occupancy logs, or cancel active bookings."
      >
        <Link to="/reservations/new">
          <Button variant="primary" icon={Plus}>
            New Booking
          </Button>
        </Link>
      </PageHeader>

      {/* Filter Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search ID, notes, tables..."
        />
        <FilterDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={filterOptions}
          label="All Bookings"
        />
      </div>

      {/* List Body */}
      {loading ? (
        <div className="space-y-4">
          <div className="hidden md:block">
            <SkeletonLoader variant="table" count={5} />
          </div>
          <div className="md:hidden grid grid-cols-1 gap-4">
            <SkeletonLoader variant="card" count={3} />
          </div>
        </div>
      ) : currentItems.length > 0 ? (
        <div className="space-y-5">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <ReservationTable
              reservations={currentItems}
              onCancelClick={handleCancelClick}
            />
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {currentItems.map((res) => (
              <ReservationCard
                key={res._id}
                reservation={res}
                onCancelClick={handleCancelClick}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-400">
                    Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-semibold">
                      {Math.min(indexOfLastItem, filteredReservations.length)}
                    </span>{' '}
                    of <span className="font-semibold">{filteredReservations.length}</span> results
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="inline-flex items-center px-4 py-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={CalendarX}
          title="No reservations match filter"
          description="Try broadening your search term or selecting a different status filter tab."
          actionLabel="Clear Filters"
          onActionClick={() => {
            setSearchTerm('');
            setStatusFilter('');
          }}
        />
      )}

      {/* Verification modal for cancellation */}
      <ConfirmModal
        isOpen={modalOpen}
        title="Cancel Reservation?"
        description="Are you sure you want to cancel this reservation? The table allocation will be returned back to the available seating pool immediately."
        confirmLabel="Cancel Booking"
        onConfirm={handleCancelConfirm}
        onCancel={() => {
          setModalOpen(false);
          setCancelingId(null);
        }}
        isLoading={cancelLoading}
      />
    </div>
  );
};

export default Reservations;
