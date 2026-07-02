const { HTTP_STATUS } = require('../config/constants');
const AppError = require('../utils/appError');
const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const env = require('../config/environment');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: "${value}". Please use another value for field: ${field}.`;
  return new AppError(message, HTTP_STATUS.CONFLICT);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', HTTP_STATUS.UNAUTHORIZED);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', HTTP_STATUS.UNAUTHORIZED);
};

const sendErrorDev = (err, res) => {
  logger.error(`[Dev Error] Name: ${err.name} | Message: ${err.message}`, err);
  return sendError(
    res,
    err.message,
    [
      {
        message: err.message,
        stack: err.stack,
        error: err
      }
    ],
    err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return sendError(
      res,
      err.message,
      [{ message: err.message }],
      err.statusCode
    );
  }
  
  // Programming or other unknown error: don't leak error details
  logger.error('ERROR 💥', err);
  return sendError(
    res,
    'Something went wrong on the server',
    [{ message: 'An internal server error occurred' }],
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  if (env.nodeEnv === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
    error.message = err.message;
    error.stack = err.stack;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
