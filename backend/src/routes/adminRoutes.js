const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Enforce role-based access control for administrative console
router.use(protect, authorize('ADMIN'));

// Reservation Management API Endpoints
router.get('/reservations', adminController.getAllReservations);
router.patch('/reservations/bulk-status', adminController.bulkUpdateReservationStatus);
router.patch('/reservations/:id/status', adminController.updateReservationStatus);
router.patch('/reservations/:id/table', adminController.reassignReservationTable);

// Table Lifecycle Management API Endpoints
router.get('/tables', adminController.getAllTables);
router.post('/tables', adminController.createTable);
router.put('/tables/:id', adminController.updateTable);
router.patch('/tables/:id/status', adminController.updateTableStatus);

module.exports = router;
