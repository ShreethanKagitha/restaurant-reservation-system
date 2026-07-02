const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../config/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
    value: err.value
  }));

  return sendError(
    res,
    'Validation failed. Please correct the errors in the fields.',
    formattedErrors,
    HTTP_STATUS.BAD_REQUEST
  );
};

module.exports = validate;
