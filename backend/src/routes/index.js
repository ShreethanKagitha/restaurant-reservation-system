const express = require('express');
const authRoutes = require('./authRoutes');
const healthRoutes = require('./healthRoutes');
const reservationRoutes = require('./reservationRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

// Health check mounted at the prefix level
router.use('/health', healthRoutes);

// Auth routes mounted under /auth
router.use('/auth', authRoutes);

// Reservation routes mounted under /reservations
router.use('/reservations', reservationRoutes);

// Admin routes mounted under /admin
router.use('/admin', adminRoutes);

module.exports = router;
