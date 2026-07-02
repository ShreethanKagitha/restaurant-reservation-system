const express = require('express');
const reservationController = require('../controllers/reservationController');
const { createReservationValidator } = require('../validators/reservationValidator');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All reservation routes require active session authentication
router.use(protect);

router.post('/', createReservationValidator, reservationController.createReservation);
router.get('/me', reservationController.getCustomerReservations);
router.delete('/:id', reservationController.cancelReservation);

module.exports = router;
