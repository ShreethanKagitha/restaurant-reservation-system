const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const { HTTP_STATUS } = require('../config/constants');
const AppError = require('../utils/appError');
const { sendError } = require('../utils/apiResponse');
const userRepository = require('../repositories/userRepository');

/**
 * Protect routes - Authenticate user by JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1) Getting token and check if it's there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', HTTP_STATUS.UNAUTHORIZED));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, env.jwtSecret);

    // 3) Check if user still exists
    const currentUser = await userRepository.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', HTTP_STATUS.UNAUTHORIZED));
    }

    // 4) Grant access and attach user & token to request
    req.user = currentUser;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize roles - Restrict route to specific roles
 * @param {...string} roles - Permitted user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication context missing.', HTTP_STATUS.UNAUTHORIZED));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', HTTP_STATUS.FORBIDDEN)
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};
