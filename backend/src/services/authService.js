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
   * Authenticate a user by email and password. Step 1 of 2FA.
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

    // --- 2FA OTP Generation ---
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const otpExpires = new Date(Date.now() + 10 * 60000);

    // Save to user (using findByIdAndUpdate to avoid triggering pre-save hooks on password if not needed, though pre-save handles it)
    await userRepository.model.findByIdAndUpdate(userObj._id, {
      otp: otp,
      otpExpires: otpExpires
    });

    // MOCK SMS/EMAIL SENDER: Log it to the console for testing
    console.log(`\n=========================================`);
    console.log(`🔐 2FA OTP for ${email}: ${otp}`);
    console.log(`=========================================\n`);

    // Return 2FA requirement instead of the token
    return { 
      requires2FA: true, 
      email: userObj.email,
      message: 'OTP sent to your registered contact method.' 
    };
  }

  /**
   * Verify the 2FA OTP. Step 2 of 2FA.
   * @param {Object} data - email and otp
   */
  async verifyOTP({ email, otp }) {
    // Find user by email and explicitly select otp fields
    const userObj = await userRepository.model.findOne({ email }).select('+otp +otpExpires');
    if (!userObj) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if OTP exists and matches
    if (!userObj.otp || userObj.otp !== otp) {
      throw new AppError('Invalid OTP', HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if OTP is expired
    if (userObj.otpExpires < new Date()) {
      throw new AppError('OTP has expired. Please log in again.', HTTP_STATUS.UNAUTHORIZED);
    }

    // Clear the OTP fields now that it has been successfully used
    await userRepository.model.findByIdAndUpdate(userObj._id, {
      $unset: { otp: 1, otpExpires: 1 }
    });

    // Return the final formatted auth response with JWT token
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
