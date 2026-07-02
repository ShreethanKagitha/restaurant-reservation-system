const { body } = require('express-validator');
const validate = require('../middleware/validation');

const emailValidator = body('email')
  .notEmpty()
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Please provide a valid email address')
  .normalizeEmail();

const registerValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),

  emailValidator,

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  validate
];

const loginValidator = [
  emailValidator,

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validate
];

module.exports = {
  registerValidator,
  loginValidator
};
