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
    console.log(`[AUTH DEBUG] 1. Incoming email for login: "${email}"`);
    
    // Find user and explicitly select password field
    const userObj = await userRepository.findByEmailWithPassword(email);
    console.log(`[AUTH DEBUG] 2. User document found: ${!!userObj}`);
    
    if (!userObj) {
      // Use generic failure message for security
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }
    
    console.log(`[AUTH DEBUG] 3. User _id: ${userObj._id}`);
    console.log(`[AUTH DEBUG] 4. User role: ${userObj.role}`);
    console.log(`[AUTH DEBUG] 5. Password field exists on document: ${!!userObj.password}`);
    
    if (userObj.password) {
      console.log(`[AUTH DEBUG] 6. Length of password hash: ${userObj.password.length}`);
    } else {
      console.log(`[AUTH DEBUG] 6. Length of password hash: N/A (Missing)`);
    }

    // Verify password
    const isPasswordCorrect = await userObj.comparePassword(password, userObj.password);
    console.log(`[AUTH DEBUG] 7. Result of bcrypt.compare(): ${isPasswordCorrect}`);
    
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    // Return formatted response
    try {
      const authData = this.formatAuthResponse(userObj);
      console.log(`[AUTH DEBUG] 8. JWT generation success: ${!!authData.token}`);
      return authData;
    } catch (err) {
      console.log(`[AUTH DEBUG] 8. JWT generation failed: ${err.message}`);
      throw err;
    }
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
