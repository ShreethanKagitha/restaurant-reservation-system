const BaseRepository = require('./baseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find a user by email address.
   * @param {string} email
   */
  async findByEmail(email) {
    return await this.findOne({ email: email.toLowerCase().trim() });
  }

  /**
   * Find a user by email and explicitly select the password field.
   * Useful for login/authentication processes.
   * @param {string} email
   */
  async findByEmailWithPassword(email) {
    return await this.model
      .findOne({ email: email.toLowerCase().trim() })
      .select('+password');
  }
}

module.exports = new UserRepository();
