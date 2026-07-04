const logger = require('./utils/logger');

// Catch Uncaught Exceptions immediately
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down gracefully...');
  logger.error(err.message, err);
  process.exit(1);
});

// Import env config first to trigger validation and load variables
const env = require('./config/environment');
const connectDB = require('./config/db');
const app = require('./app');

// Initialize MongoDB Connection
connectDB().then(async () => {
  // Auto-seed tables in production if they don't exist
  try {
    const Table = require('./models/Table');
    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      logger.info('No tables found in database. Auto-seeding production tables...');
      const tablesData = [
        { tableNumber: 'T1', capacity: 2 },
        { tableNumber: 'T2', capacity: 2 },
        { tableNumber: 'T3', capacity: 2 },
        { tableNumber: 'T4', capacity: 2 },
        { tableNumber: 'T5', capacity: 4 },
        { tableNumber: 'T6', capacity: 4 },
        { tableNumber: 'T7', capacity: 4 },
        { tableNumber: 'T8', capacity: 6 },
        { tableNumber: 'T9', capacity: 6 },
        { tableNumber: 'T10', capacity: 8 }
      ];
      await Table.insertMany(tablesData);
      logger.info(`Successfully auto-seeded ${tablesData.length} tables.`);
    }

    // Auto-seed admin user in production if it doesn't exist
    const User = require('./models/User');
    const userRepository = require('./repositories/userRepository');
    const { ROLES } = require('./config/constants');
    
    const adminEmail = 'admin@reservetable.com';
    let adminExists = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!adminExists) {
      logger.info('Admin user not found. Auto-seeding default admin account...');
      await userRepository.create({
        fullName: 'System Administrator',
        email: adminEmail,
        password: 'Admin@123',
        role: ROLES.ADMIN,
        isActive: true
      });
      logger.info(`Successfully auto-seeded admin user: ${adminEmail}`);
    } else if (adminExists.password && !adminExists.password.startsWith('$2a$') && !adminExists.password.startsWith('$2b$')) {
      logger.warn('Admin password appears to be plaintext. Re-hashing via save hook...');
      adminExists.password = 'Admin@123';
      await adminExists.save();
      logger.info('Successfully updated admin password hash.');
    }
  } catch (seedErr) {
    logger.error('Failed to auto-seed tables:', seedErr);
  }

  // Start Server
  const server = app.listen(env.port, () => {
    logger.info(`Server is running in ${env.nodeEnv} mode on port ${env.port}`);
  });

  // Catch Unhandled Promise Rejections inside the server scope
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
    logger.error(err.message, err);
    server.close(() => {
      process.exit(1);
    });
  });
});

});
