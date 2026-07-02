const { body } = require('express-validator');
const validate = require('../middleware/validation');

const createReservationValidator = [
  body('reservationDate')
    .notEmpty()
    .withMessage('Reservation date is required')
    .isISO8601()
    .withMessage('Reservation date must be a valid ISO8601 date format')
    .custom((value) => {
      const selected = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        throw new Error('Reservations cannot be booked for past dates');
      }
      return true;
    }),

  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid ISO8601 date format'),

  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid ISO8601 date format')
    .custom((value, { req }) => {
      const start = new Date(req.body.startTime);
      const end = new Date(value);
      if (isNaN(start.getTime())) {
        throw new Error('Valid start time must be provided before end time validation');
      }
      if (end <= start) {
        throw new Error('End time must be strictly after start time');
      }
      const durationMs = end - start;
      if (durationMs < 30 * 60 * 1000) {
        throw new Error('Minimum reservation duration is 30 minutes');
      }
      if (durationMs > 4 * 60 * 60 * 1000) {
        throw new Error('Maximum reservation duration is 4 hours');
      }
      return true;
    }),

  body('guestCount')
    .notEmpty()
    .withMessage('Guest count is required')
    .isInt({ min: 1, max: 20 })
    .withMessage('Guest count must be an integer between 1 and 20'),

  validate
];

module.exports = {
  createReservationValidator
};
