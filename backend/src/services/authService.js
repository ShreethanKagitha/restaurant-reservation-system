const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/appError');
const { HTTP_STATUS, ROLES } = require('../config/constants');
const env = require('../config/environment');

class AuthService {
  /**
   * Register a new Customer.
   * Admin users cannot register through public registration.
   * @param {Object} userData - User details (name, email, password)
   */
  async registerUser({ name, email, password }) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email address is already in use.', HTTP_STATUS.CONFLICT);
    }

    // Force role to CUSTOMER
    const newUser = await userRepository.create({
      fullName: name,
      email,
      password,
      role: ROLES.CUSTOMER
    });

    // Return formatted response
    return this.formatAuthResponse(newUser);
  }

  /**
   * Authenticate a user by email and password.
   * @param {Object} loginData - Login credentials (email, password)
   */
  async loginUser({ email, password }) {
    // Find user and explicitly select password field
    const userObj = await userRepository.findByEmailWithPassword(email);
    if (!userObj) {
      // Use generic failure message for security
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    // Verify password
    const isPasswordCorrect = await userObj.comparePassword(password, userObj.password);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    // Return formatted response
    return this.formatAuthResponse(userObj);
  }

  /**
   * Helper function to format the user document and append a new JWT token.
   * @param {Object} userDoc - Mongoose User Document
   */
  formatAuthResponse(userDoc) {
    const user = userDoc.toObject();
    const token = this.generateToken(user._id);
    return { user, token };
  }

  /**
   * Generate JWT token for user ID.
   * @param {string} userId - Mongoose User ID
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn
    });
  }
}

module.exports = new AuthService();
