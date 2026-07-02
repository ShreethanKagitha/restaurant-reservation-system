import axiosClient from './axiosClient';

const adminApi = {
  /**
   * Fetch all active reservations with search, filter, sort, and pagination.
   * @param {Object} params - search, status, date, guestCount, page, limit, sortBy, sortOrder
   */
  getReservations: async (params = {}) => {
    const response = await axiosClient.get('/admin/reservations', { params });
    return response.data;
  },

  /**
   * Update status of a single reservation.
   * @param {string} id - Reservation ID
   * @param {string} status - PENDING | CONFIRMED | CANCELLED | COMPLETED | NO_SHOW
   */
  updateReservationStatus: async (id, status) => {
    const response = await axiosClient.patch(`/admin/reservations/${id}/status`, { status });
    return response.data;
  },

  /**
   * Bulk update statuses of multiple reservations.
   * @param {Array<string>} ids - Array of reservation IDs
   * @param {string} status - Target status
   */
  bulkUpdateReservationStatus: async (ids, status) => {
    const response = await axiosClient.patch('/admin/reservations/bulk-status', { ids, status });
    return response.data;
  },

  /**
   * Reassign a reservation to a different table.
   * @param {string} id - Reservation ID
   * @param {string} tableId - Table ID
   */
  reassignReservationTable: async (id, tableId) => {
    const response = await axiosClient.patch(`/admin/reservations/${id}/table`, { tableId });
    return response.data;
  },

  /**
   * Fetch all tables.
   */
  getTables: async () => {
    const response = await axiosClient.get('/admin/tables');
    return response.data;
  },

  /**
   * Create a new table.
   * @param {Object} tableData - tableNumber, capacity, location
   */
  createTable: async (tableData) => {
    const response = await axiosClient.post('/admin/tables', tableData);
    return response.data;
  },

  /**
   * Edit details of a table.
   * @param {string} id - Table ID
   * @param {Object} tableData - tableNumber, capacity, location
   */
  updateTable: async (id, tableData) => {
    const response = await axiosClient.put(`/admin/tables/${id}`, tableData);
    return response.data;
  },

  /**
   * Change table lifecycle state (Activate, Disable, Maintenance).
   * @param {string} id - Table ID
   * @param {string} status - AVAILABLE | MAINTENANCE | DISABLED
   */
  updateTableStatus: async (id, status) => {
    const response = await axiosClient.patch(`/admin/tables/${id}/status`, { status });
    return response.data;
  }
};

export default adminApi;
