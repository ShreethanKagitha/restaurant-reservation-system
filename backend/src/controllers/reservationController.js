const reservationService = require('../services/reservationService');
const { sendSuccess } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Automatically allocate table and book reservation.
 */
const createReservation = async (req, res, next) => {
  try {
    const { guestCount, reservationDate, startTime, endTime, notes } = req.body;
    const customerId = req.user._id; // Attached by protect middleware

    const { reservation, table } = await reservationService.createReservation({
      customerId,
      guestCount,
      reservationDate,
      startTime,
      endTime,
      notes
    });

    return sendSuccess(
      res,
      'Reservation created successfully',
      { reservation, table },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve current user's own reservations list.
 */
const getCustomerReservations = async (req, res, next) => {
  try {
    const customerId = req.user._id;
    const list = await reservationService.getCustomerReservations(customerId);

    return sendSuccess(
      res,
      'Your reservations retrieved successfully',
      { reservations: list },
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel (soft-delete) a reservation.
 */
const cancelReservation = async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user._id;
    const role = req.user.role;

    const result = await reservationService.cancelReservation(reservationId, userId, role);

    return sendSuccess(
      res,
      'Reservation cancelled successfully',
      {
        status: result.status,
        cancelledAt: result.updatedAt
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getCustomerReservations,
  cancelReservation
};
