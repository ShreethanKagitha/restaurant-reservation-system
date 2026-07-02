const adminService = require('../services/adminService');
const { sendSuccess } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Get all active reservations with search, filter, sort, and pagination.
 */
const getAllReservations = async (req, res, next) => {
  try {
    const result = await adminService.getAllReservations(req.query);
    return sendSuccess(res, 'Reservations retrieved successfully', result, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

/**
 * Update the status of a reservation.
 */
const updateReservationStatus = async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const { status } = req.body;
    const userId = req.user._id;

    const result = await adminService.updateReservationStatus(reservationId, status, userId);
    return sendSuccess(res, 'Reservation status updated successfully', { reservation: result }, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update statuses.
 */
const bulkUpdateReservationStatus = async (req, res, next) => {
  try {
    const { ids, status } = req.body;
    const userId = req.user._id;

    const result = await adminService.bulkUpdateReservationStatus(ids, status, userId);
    return sendSuccess(res, 'Bulk reservation statuses updated', { results: result }, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

/**
 * Reassign the table for a reservation.
 */
const reassignReservationTable = async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const { tableId } = req.body;
    const userId = req.user._id;

    const result = await adminService.reassignReservationTable(reservationId, tableId, userId);
    return sendSuccess(res, 'Reservation table reassigned successfully', { reservation: result }, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tables.
 */
const getAllTables = async (req, res, next) => {
  try {
    const result = await adminService.getAllTables();
    return sendSuccess(res, 'Tables retrieved successfully', { tables: result }, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new table.
 */
const createTable = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = await adminService.createTable(req.body, userId);
    return sendSuccess(res, 'Table created successfully', { table: result }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

/**
 * Edit table details.
 */
const updateTable = async (req, res, next) => {
  try {
    const tableId = req.params.id;
    const userId = req.user._id;
    const result = await adminService.updateTable(tableId, req.body, userId);
    return sendSuccess(res, 'Table updated successfully', { table: result }, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle table status (lifecycle action).
 */
const updateTableStatus = async (req, res, next) => {
  try {
    const tableId = req.params.id;
    const { status } = req.body;
    const userId = req.user._id;

    const result = await adminService.updateTableStatus(tableId, status, userId);
    return sendSuccess(res, 'Table status updated successfully', { table: result }, HTTP_STATUS.OK);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReservations,
  updateReservationStatus,
  bulkUpdateReservationStatus,
  reassignReservationTable,
  getAllTables,
  createTable,
  updateTable,
  updateTableStatus
};
