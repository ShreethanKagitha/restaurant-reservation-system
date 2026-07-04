const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Handle user registration (Customer only).
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.registerUser({ name, email, password });

    return sendSuccess(
      res,
      'Registration successful. Welcome!',
      { user, token },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login (Step 1).
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const response = await authService.loginUser({ email, password });

    // If 2FA is required, send the intermediate response without the token
    if (response.requires2FA) {
      return sendSuccess(
        res,
        response.message,
        { requires2FA: true, email: response.email },
        HTTP_STATUS.OK
      );
    }

    return sendSuccess(
      res,
      'Login successful. Welcome back!',
      response,
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verify 2FA OTP (Step 2).
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const { user, token } = await authService.verifyOTP({ email, otp });

    return sendSuccess(
      res,
      '2FA Verification successful. Welcome back!',
      { user, token },
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated user profile.
 */
const getMe = async (req, res, next) => {
  try {
    // req.user was attached by protect middleware
    const user = req.user.toObject();
    return sendSuccess(
      res,
      'User profile retrieved successfully',
      { user },
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyOTP,
  getMe
};
