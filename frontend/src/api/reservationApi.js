import axiosClient from './axiosClient';

const reservationApi = {
  /**
   * Book a new reservation with auto-table allocation.
   * @param {Object} reservationData - Date, times, guestCount, notes
   */
  createReservation: async (reservationData) => {
    const response = await axiosClient.post('/reservations', reservationData);
    return response.data;
  },

  /**
   * Fetch current authenticated user's reservations.
   */
  getMyReservations: async () => {
    const response = await axiosClient.get('/reservations/me');
    return response.data;
  },

  /**
   * Cancel (soft delete) reservation.
   * @param {string} id - Reservation ID
   */
  cancelReservation: async (id) => {
    const response = await axiosClient.delete(`/reservations/${id}`);
    return response.data;
  }
};

export default reservationApi;
