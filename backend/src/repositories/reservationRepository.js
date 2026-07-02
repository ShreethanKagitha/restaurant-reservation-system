const BaseRepository = require('./baseRepository');
const Reservation = require('../models/Reservation');

class ReservationRepository extends BaseRepository {
  constructor() {
    super(Reservation);
  }

  /**
   * Find an active (non-soft-deleted) reservation by ID.
   * Supports optional sessions and returns null when not found or invalid ID.
   */
  async findActiveById(id, session = null) {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.model
      .findOne({ _id: id, isDeleted: false })
      .session(session);
  }

  /**
   * Find conflicting active reservations for a table in a timeslot.
   * Overlap definition: newStart < existingEnd AND newEnd > existingStart
   */
  async findConflictingReservations(tableId, startTime, endTime, session = null) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    return await this.model
      .find({
        table: tableId,
        isDeleted: false,
        reservationStatus: { $nin: ['CANCELLED', 'NO_SHOW'] },
        startTime: { $lt: end },
        endTime: { $gt: start }
      })
      .session(session)
      .lean();
  }

  /**
   * Verify if a table is available in a given time slot.
   */
  async isTableAvailable(tableId, startTime, endTime, session = null) {
    const conflicts = await this.findConflictingReservations(tableId, startTime, endTime, session);
    return conflicts.length === 0;
  }

  /**
   * Find all tables currently available (not reserved) during a timeslot.
   */
  async findAvailableTables(startTime, endTime, session = null) {
    const Table = require('../models/Table');
    const { TABLE_STATUS } = require('../config/constants');

    // 1) Find table IDs that are booked during this time
    const reservedTableIds = await this.findReservedTableIdsForTimeRange(startTime, endTime, session);

    // 2) Find active tables not in the booked list
    return await Table.find({
      status: TABLE_STATUS.AVAILABLE,
      _id: { $nin: reservedTableIds }
    })
      .session(session)
      .lean();
  }

  /**
   * Find all active reservations on a specific date.
   * @param {Date} date - Target calendar date
   */
  async findReservationsByDate(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.model
      .find({
        reservationDate: { $gte: startOfDay, $lte: endOfDay },
        isDeleted: false
      })
      .populate('customer', 'fullName email')
      .populate('table', 'tableNumber capacity')
      .lean();
  }

  /**
   * Find active reservations for a specific table on a date.
   * @param {string} tableId - Mongoose Table ID
   * @param {Date} date - Target date
   */
  async findReservationsForTable(tableId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.model
      .find({
        table: tableId,
        reservationDate: { $gte: startOfDay, $lte: endOfDay },
        isDeleted: false
      })
      .lean();
  }

  /**
   * Find IDs of tables that have overlapping bookings in a specific time slot.
   * @param {Date} startTime - Start of requested slot
   * @param {Date} endTime - End of requested slot
   */
  async findReservedTableIdsForTimeRange(startTime, endTime, session = null) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const overlappingBookings = await this.model
      .find({
        isDeleted: false,
        reservationStatus: { $nin: ['CANCELLED', 'NO_SHOW'] },
        startTime: { $lt: end },
        endTime: { $gt: start }
      })
      .session(session)
      .select('table')
      .lean();

    // Map to array of unique string IDs
    return [...new Set(overlappingBookings.map((b) => b.table.toString()))];
  }

  /**
   * Find all active reservations starting after the current moment for a user.
   * @param {string} userId - User ID
   */
  async findUpcomingReservations(userId) {
    return await this.model
      .find({
        customer: userId,
        startTime: { $gte: new Date() },
        isDeleted: false
      })
      .populate('table', 'tableNumber capacity location')
      .sort({ startTime: 1 })
      .lean();
  }

  /**
   * Find all active reservations (past and future) for a customer.
   * @param {string} customerId - User ID
   */
  async findCustomerReservations(customerId) {
    return await this.model
      .find({
        customer: customerId,
        isDeleted: false
      })
      .populate('table', 'tableNumber capacity location')
      .sort({ startTime: -1 })
      .lean();
  }

  /**
   * Soft delete a reservation by setting flags and mapping the editor.
   * @param {string} id - Reservation ID
   * @param {string} userId - Audit user performing deletion
   */
  async softDeleteReservation(id, userId) {
    return await this.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
      updatedBy: userId
    });
  }
}

module.exports = new ReservationRepository();
