const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const { HTTP_STATUS, RESERVATION_STATUS } = require('../config/constants');
const reservationRepository = require('../repositories/reservationRepository');
const tableRepository = require('../repositories/tableRepository');
const logger = require('../utils/logger');

let transactionsSupported = null;

class ReservationService {
  /**
   * Validate that the reservation date is not in the past.
   * @param {Date|string} dateInput - Selected reservation date
   */
  validateReservationDate(dateInput) {
    const reservationDate = new Date(dateInput);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(reservationDate.getTime())) {
      logger.warn(`Validation Failure: Invalid reservation date format "${dateInput}"`);
      throw new AppError('Invalid reservation date format', HTTP_STATUS.BAD_REQUEST);
    }

    if (reservationDate < today) {
      logger.warn(`Validation Failure: Attempted past date booking "${dateInput}"`);
      throw new AppError('Reservations cannot be made for past dates', HTTP_STATUS.BAD_REQUEST);
    }

    return true;
  }

  /**
   * Validate the number of guests.
   * @param {number} guestCount - Number of guests
   */
  validateGuestCount(guestCount) {
    const count = parseInt(guestCount, 10);
    if (isNaN(count) || count < 1) {
      logger.warn(`Validation Failure: Invalid guest count value "${guestCount}"`);
      throw new AppError('Guest count must be at least 1', HTTP_STATUS.BAD_REQUEST);
    }
    if (count > 20) {
      logger.warn(`Validation Failure: Guest count ${count} exceeds limit`);
      throw new AppError('Online reservations are limited to a maximum of 20 guests. Please contact us directly for larger group bookings.', HTTP_STATUS.BAD_REQUEST);
    }
    return true;
  }

  /**
   * Validate the reservation time window (duration and operating hours).
   * @param {Date|string} startTimeInput
   * @param {Date|string} endTimeInput
   */
  validateReservationWindow(startTimeInput, endTimeInput) {
    const start = new Date(startTimeInput);
    const end = new Date(endTimeInput);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      logger.warn('Validation Failure: Invalid time window input');
      throw new AppError('Invalid time window format', HTTP_STATUS.BAD_REQUEST);
    }

    if (start >= end) {
      logger.warn(`Validation Failure: End time ${end.toISOString()} is not after start time ${start.toISOString()}`);
      throw new AppError('End time must be strictly after start time', HTTP_STATUS.BAD_REQUEST);
    }

    // Check duration boundaries
    const durationMs = end - start;
    if (durationMs < 30 * 60 * 1000) {
      logger.warn(`Validation Failure: Duration of ${durationMs / 1000 / 60}m is too short`);
      throw new AppError('Minimum reservation duration is 30 minutes', HTTP_STATUS.BAD_REQUEST);
    }
    if (durationMs > 4 * 60 * 60 * 1000) {
      logger.warn(`Validation Failure: Duration of ${durationMs / 1000 / 60 / 60}h is too long`);
      throw new AppError('Maximum reservation duration is 4 hours', HTTP_STATUS.BAD_REQUEST);
    }

    // Operating hours check (11:00 AM to 11:00 PM) in UTC to ensure consistency in production
    const startHour = start.getUTCHours();
    const endHour = end.getUTCHours();

    if (startHour < 11 || (endHour > 23 || (endHour === 23 && end.getUTCMinutes() > 0))) {
      logger.warn(`Validation Failure: Booking window ${start.toISOString()} - ${end.toISOString()} outside operating hours`);
      throw new AppError('Reservations can only be booked during operating hours: 11:00 AM to 11:00 PM.', HTTP_STATUS.BAD_REQUEST);
    }

    return true;
  }

  /**
   * Fetch all tables that are available (not booked/occupied) during a specified timeslot.
   * @param {Date|string} startTime
   * @param {Date|string} endTime
   * @param {Object} [session] - Optional Mongoose session
   */
  async getAvailableTables(startTime, endTime, session = null) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate time window
    this.validateReservationWindow(start, end);

    // Return active available tables directly from repository passing session
    return await reservationRepository.findAvailableTables(start, end, session);
  }

  /**
   * Calculate suitable tables for the guest size, sorted optimally:
   * 1) Smallest capacity that fits the group (prevents wasted seats)
   * 2) Alphanumeric order of Table Number as a tie-breaker.
   * @param {number} guestCount
   * @param {Date|string} startTime
   * @param {Date|string} endTime
   * @param {Object} [session] - Optional Mongoose session
   */
  async calculateSuitableTables(guestCount, startTime, endTime, session = null) {
    this.validateGuestCount(guestCount);

    const availableTables = await this.getAvailableTables(startTime, endTime, session);
    
    logger.info(`Found ${availableTables.length} available tables before capacity filter for guests: ${guestCount}`);
    
    availableTables.forEach(t => {
       logger.info(`Candidate Table: ${t.tableNumber}, Capacity: ${t.capacity}, Status: ${t.status}`);
    });

    // Filter tables that fit the guest size, sort by capacity and number
    const suitable = availableTables
      .filter((table) => table.capacity >= guestCount)
      .sort((a, b) => {
        if (a.capacity !== b.capacity) {
          return a.capacity - b.capacity;
        }
        return a.tableNumber.localeCompare(b.tableNumber, undefined, {
          numeric: true,
          sensitivity: 'base'
        });
      });
      
    logger.info(`Found ${suitable.length} suitable tables after capacity filter`);
    return suitable;
  }

  /**
   * Automatically allocate a table and create a confirmed reservation.
   * Leverages MongoDB transaction sessions where supported.
   */
  async createReservation({ customerId, guestCount, reservationDate, startTime, endTime, notes }) {
    // 1) Business Rules Validation
    this.validateReservationDate(reservationDate);
    this.validateGuestCount(guestCount);
    this.validateReservationWindow(startTime, endTime);

    const start = new Date(startTime);
    const end = new Date(endTime);
    const resDate = new Date(reservationDate);

    // Dynamically detect transaction support on first reservation attempt
    if (transactionsSupported === null) {
      try {
        const hello = await mongoose.connection.db.admin().command({ hello: 1 });
        transactionsSupported = !!(hello.setName || hello.msg === 'isdbgrid');
        
        if (!transactionsSupported) {
          logger.info('MongoDB transaction support is unavailable (standalone mode is active). Allocation will proceed atomically without transaction wrappers.');
        } else {
          logger.info(`MongoDB transaction support is available. Replica set: ${hello.setName || 'Sharded cluster'}.`);
        }
      } catch (err) {
        logger.warn(`Failed to probe MongoDB topology features: ${err.message}. Falling back to standalone mode.`);
        transactionsSupported = false;
      }
    } else if (transactionsSupported === false) {
      logger.info('Running reservation allocation in standalone mode (transaction support is unavailable).');
    }

    // Start database transaction session if supported
    let session = null;
    if (transactionsSupported) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
      } catch (sessionError) {
        logger.error(`Failed to initiate transaction session: ${sessionError.message}. Falling back to standalone mode.`);
        if (session) {
          session.endSession();
          session = null;
        }
      }
    }

    try {
      // 2) Run allocation logic inside session
      const suitableTables = await this.calculateSuitableTables(guestCount, start, end, session);
      
      if (suitableTables.length === 0) {
        logger.warn(`Allocation Failure: No suitable table available for guest size ${guestCount} between ${start.toISOString()} - ${end.toISOString()}`);
        throw new AppError('No suitable table is available for the requested group size and timeslot.', HTTP_STATUS.CONFLICT);
      }

      // Pick first optimal table (smallest capacity, lowest table number)
      const allocatedTable = suitableTables[0];

      // Double-check availability (even in standalone mode) to prevent race conditions
      const isAvailable = await reservationRepository.isTableAvailable(allocatedTable._id, start, end, session);
      if (!isAvailable) {
        logger.warn(`Allocation Conflict: Concurrent race condition detected on Table ${allocatedTable.tableNumber}`);
        throw new AppError('The allocated table was booked by another request. Please try again.', HTTP_STATUS.CONFLICT);
      }

      // 3) Save Reservation
      const reservationDoc = await reservationRepository.create(
        {
          customer: customerId,
          table: allocatedTable._id,
          reservationDate: resDate,
          startTime: start,
          endTime: end,
          guestCount,
          notes,
          reservationStatus: RESERVATION_STATUS.CONFIRMED,
          createdBy: customerId,
          updatedBy: customerId
        },
        session ? { session } : {}
      );

      // Commit transaction
      if (session) {
        await session.commitTransaction();
        session.endSession();
      }

      // Populate references for client response
      const reservation = await reservationRepository.findById(reservationDoc._id, 'table customer');

      logger.info(`Reservation Created: ID ${reservation._id} | Table ${allocatedTable.tableNumber} | Customer ID ${customerId}`);
      return { reservation, table: allocatedTable };
    } catch (error) {
      // Rollback database updates
      if (session) {
        try {
          await session.abortTransaction();
        } catch (abortError) {
          logger.error(`Failed to abort Mongoose transaction: ${abortError.message}`);
        }
        session.endSession();
      }
      throw error;
    }
  }

  /**
   * List active reservations belonging to the current customer.
   * @param {string} customerId
   */
  async getCustomerReservations(customerId) {
    await reservationRepository.autoTransitionCompletedReservations();
    return await reservationRepository.findCustomerReservations(customerId);
  }

  /**
   * Cancel (soft delete) a reservation.
   * @param {string} reservationId - Reservation ID
   * @param {string} userId - ID of user requesting cancellation
   * @param {string} role - Role of user requesting cancellation
   */
  async cancelReservation(reservationId, userId, role) {
    const reservation = await reservationRepository.findActiveById(reservationId);

    if (!reservation) {
      logger.warn(`Cancellation Failure: Reservation not found or already deleted: ID ${reservationId}`);
      throw new AppError('Reservation not found', HTTP_STATUS.NOT_FOUND);
    }

    // Role Guard: Customers can only cancel their own reservations
    if (role === 'CUSTOMER' && reservation.customer.toString() !== userId) {
      logger.warn(`Cancellation Forbidden: Customer ${userId} unauthorized to delete reservation ${reservationId}`);
      throw new AppError('You do not have permission to cancel this reservation', HTTP_STATUS.FORBIDDEN);
    }

    // Update reservation status and perform soft delete
    const updatedReservation = await reservationRepository.update(reservationId, {
      reservationStatus: RESERVATION_STATUS.CANCELLED,
      isDeleted: true,
      deletedAt: new Date(),
      updatedBy: userId
    });

    logger.info(`Reservation Cancelled: ID ${reservationId} | Cancelled by user ${userId}`);

    return {
      status: updatedReservation.reservationStatus,
      updatedAt: updatedReservation.updatedAt
    };
  }
}

module.exports = new ReservationService();
