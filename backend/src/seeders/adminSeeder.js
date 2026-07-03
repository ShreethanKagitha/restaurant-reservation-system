const mongoose = require('mongoose');
const env = require('../config/environment');
const User = require('../models/User');
const { ROLES } = require('../config/constants');
const logger = require('../utils/logger');

const seedAdmin = async () => {
  try {
    logger.info('Starting Admin Seeding Process...');

    // Connect to database
    await mongoose.connect(env.mongoUri);
    logger.info('Database connected successfully.');

    const adminEmail = 'admin@reservetable.com';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      logger.info(`Admin user with email ${adminEmail} already exists. Skipping creation.`);
      logger.info(`Credentials -> Email: ${adminEmail} | Role: ${existingAdmin.role}`);
    } else {
      // Create admin user
      const newAdmin = new User({
        fullName: 'System Administrator',
        email: adminEmail,
        password: 'Admin@123',
        role: ROLES.ADMIN,
        isActive: true
      });

      await newAdmin.save();
      logger.info(`Successfully created admin user: ${adminEmail}`);
      logger.info(`Credentials -> Email: ${adminEmail} | Password: Admin@123 | Role: ADMIN`);
    }

    logger.info('Admin seeding process complete. Closing connection.');
    await mongoose.connection.close();
    logger.info('Database connection closed.');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding the admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
