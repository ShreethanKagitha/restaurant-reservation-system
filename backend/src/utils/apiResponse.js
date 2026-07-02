const { HTTP_STATUS } = require('../config/constants');

/**
 * Sends a standardized success response.
 * @param {Object} res - Express response object
 * @param {string} message - Response message
 * @param {Object|Array} data - Response payload data
 * @param {number} statusCode - HTTP Status code (defaults to 200)
 */
const sendSuccess = (res, message, data = {}, statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Sends a standardized error response.
 * @param {Object} res - Express response object
 * @param {string} message - General error message
 * @param {Array|Object} errors - Detailed list of validation/operational errors
 * @param {number} statusCode - HTTP Status code (defaults to 500)
 */
const sendError = (res, message, errors = [], statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  const formattedErrors = Array.isArray(errors) ? errors : [errors];
  return res.status(statusCode).json({
    success: false,
    message,
    errors: formattedErrors
  });
};

module.exports = {
  sendSuccess,
  sendError
};
