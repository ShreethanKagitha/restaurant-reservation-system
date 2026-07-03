const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const { HTTP_STATUS, RESERVATION_STATUS, TABLE_STATUS } = require('../config/constants');
const reservationRepository = require('../repositories/reservationRepository');
const tableRepository = require('../repositories/tableRepository');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');
const User = require('../models/User');

class AdminService {
  /**
   * Search, filter, sort, and paginate all active reservations.
   */
  async getAllReservations({ search, status, date, guestCount, page = 1, limit = 10, sortBy = 'startTime', sortOrder = 'asc' }) {
    await reservationRepository.autoTransitionCompletedReservations();
    const query = { isDeleted: false };

    // 1) Handle search by Name, Email, or Reservation ID
    if (search) {
      const term = search.trim();
      const isMongoId = mongoose.Types.ObjectId.isValid(term);

      if (isMongoId) {
        query.$or = [{ _id: term }];
      } else {
        // Find users matching name or email
        const users = await User.find({
          $or: [
            { fullName: { $regex: term, $options: 'i' } },
            { email: { $regex: term, $options: 'i' } }
          ]
        }).select('_id');

        const userIds = users.map((u) => u._id);
        query.customer = { $in: userIds };
      }
    }

    // 2) Handle status filtering
    if (status) {
      query.reservationStatus = status;
    }

    // 3) Handle date filtering (reservation date match)
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.reservationDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // 4) Handle guest count filtering
    if (guestCount) {
      const count = parseInt(guestCount, 10);
      if (!isNaN(count)) {
        query.guestCount = count;
      }
    }

    // 5) Perform DB queries
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const total = await reservationRepository.model.countDocuments(query);
    const reservations = await reservationRepository.model
      .find(query)
      .populate('customer', 'fullName email')
      .populate('table', 'tableNumber capacity location')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(take)
      .lean();

    return {
      reservations,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / take)
    };
  }

  /**
   * Update status of a single reservation and log audit trail.
   */
  async updateReservationStatus(id, newStatus, userId) {
    if (!Object.values(RESERVATION_STATUS).includes(newStatus)) {
      throw new AppError('Invalid reservation status', HTTP_STATUS.BAD_REQUEST);
    }

    const reservation = await reservationRepository.findActiveById(id);
    if (!reservation) {
      throw new AppError('Reservation not found', HTTP_STATUS.NOT_FOUND);
    }

    const previousStatus = reservation.reservationStatus;
    
    // Update booking parameters
    const updated = await reservationRepository.update(id, {
      reservationStatus: newStatus,
      updatedBy: userId,
      updatedAt: new Date()
    });

    // Write audit trail log
    logger.info(
      `ADMIN AUDIT: Reservation ${id} status updated | Actor: ${userId} | Prev: ${previousStatus} | New: ${newStatus}`
    );

    return updated;
  }

  /**
   * Bulk update status of multiple reservations and log audit trail.
   */
  async bulkUpdateReservationStatus(ids, newStatus, userId) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('No reservation IDs provided for bulk action', HTTP_STATUS.BAD_REQUEST);
    }

    if (!Object.values(RESERVATION_STATUS).includes(newStatus)) {
      throw new AppError('Invalid status target for bulk action', HTTP_STATUS.BAD_REQUEST);
    }

    const results = [];
    for (const id of ids) {
      try {
        const updated = await this.updateReservationStatus(id, newStatus, userId);
        results.push({ id, success: true, status: updated.reservationStatus });
      } catch (err) {
        logger.error(`Bulk Action Failure on reservation ${id}: ${err.message}`);
        results.push({ id, success: false, error: err.message });
      }
    }

    return results;
  }

  /**
   * Reassign a reservation to another table, verifying vacancy and size bounds.
   */
  async reassignReservationTable(id, newTableId, userId) {
    const reservation = await reservationRepository.findActiveById(id);
    if (!reservation) {
      throw new AppError('Reservation not found', HTTP_STATUS.NOT_FOUND);
    }

    const newTable = await tableRepository.findById(newTableId);
    if (!newTable) {
      throw new AppError('New table reference not found', HTTP_STATUS.NOT_FOUND);
    }

    if (newTable.status !== TABLE_STATUS.AVAILABLE) {
      throw new AppError('The requested table is currently not available (disabled or in maintenance)', HTTP_STATUS.BAD_REQUEST);
    }

    if (newTable.capacity < reservation.guestCount) {
      throw new AppError(`The selected table has a capacity of ${newTable.capacity}, which cannot accommodate the guest size of ${reservation.guestCount}`, HTTP_STATUS.BAD_REQUEST);
    }

    // Check if new table has schedule overlaps (excluding this reservation itself!)
    const conflicts = await reservationRepository.model.find({
      table: newTableId,
      _id: { $ne: id },
      isDeleted: false,
      reservationStatus: { $nin: ['CANCELLED', 'NO_SHOW'] },
      startTime: { $lt: reservation.endTime },
      endTime: { $gt: reservation.startTime }
    });

    if (conflicts.length > 0) {
      throw new AppError('The selected table has an overlapping booking slot in this timeframe', HTTP_STATUS.CONFLICT);
    }

    const prevTableId = reservation.table;

    // Persist reassignment
    const updated = await reservationRepository.update(id, {
      table: newTableId,
      updatedBy: userId,
      updatedAt: new Date()
    });

    logger.info(
      `ADMIN AUDIT: Reservation ${id} table reassigned | Actor: ${userId} | Prev Table: ${prevTableId} | New Table: ${newTableId}`
    );

    return updated;
  }

  /**
   * Retrieve all tables.
   */
  async getAllTables() {
    return await tableRepository.find({}, '', { tableNumber: 1 });
  }

  /**
   * Create a new table.
   */
  async createTable({ tableNumber, capacity, location }, userId) {
    if (!tableNumber) {
      throw new AppError('Table number is required', HTTP_STATUS.BAD_REQUEST);
    }

    const count = parseInt(capacity, 10);
    if (isNaN(count) || count < 1) {
      throw new AppError('Table capacity must be at least 1', HTTP_STATUS.BAD_REQUEST);
    }

    // Verify duplicate table numbers
    const duplicate = await tableRepository.findByTableNumber(tableNumber.trim());
    if (duplicate) {
      throw new AppError(`Table number "${tableNumber}" already exists`, HTTP_STATUS.BAD_REQUEST);
    }

    const created = await tableRepository.create({
      tableNumber: tableNumber.trim(),
      capacity: count,
      location: location || '',
      status: TABLE_STATUS.AVAILABLE
    });

    logger.info(`ADMIN AUDIT: Table created: ${created.tableNumber} | Actor: ${userId}`);
    return created;
  }

  /**
   * Update table specifications (size/location/number).
   */
  async updateTable(id, { tableNumber, capacity, location }, userId) {
    const table = await tableRepository.findById(id);
    if (!table) {
      throw new AppError('Table not found', HTTP_STATUS.NOT_FOUND);
    }

    const count = parseInt(capacity, 10);
    if (isNaN(count) || count < 1) {
      throw new AppError('Table capacity must be at least 1', HTTP_STATUS.BAD_REQUEST);
    }

    if (tableNumber) {
      const duplicate = await tableRepository.findByTableNumber(tableNumber.trim());
      if (duplicate && duplicate._id.toString() !== id) {
        throw new AppError(`Table number "${tableNumber}" is already in use by another table`, HTTP_STATUS.BAD_REQUEST);
      }
    }

    const updated = await tableRepository.update(id, {
      tableNumber: tableNumber ? tableNumber.trim() : table.tableNumber,
      capacity: count,
      location: location !== undefined ? location : table.location
    });

    logger.info(`ADMIN AUDIT: Table details updated: ${id} | Actor: ${userId}`);
    return updated;
  }

  /**
   * Toggle table lifecycle states (Activate/Disable/Maintenance).
   */
  async updateTableStatus(id, newStatus, userId) {
    if (!Object.values(TABLE_STATUS).includes(newStatus)) {
      throw new AppError('Invalid table status target', HTTP_STATUS.BAD_REQUEST);
    }

    const table = await tableRepository.findById(id);
    if (!table) {
      throw new AppError('Table not found', HTTP_STATUS.NOT_FOUND);
    }

    const prevStatus = table.status;

    const updated = await tableRepository.update(id, {
      status: newStatus
    });

    logger.info(
      `ADMIN AUDIT: Table ${id} status updated | Actor: ${userId} | Prev: ${prevStatus} | New: ${newStatus}`
    );

    return updated;
  }
}

module.exports = new AdminService();
