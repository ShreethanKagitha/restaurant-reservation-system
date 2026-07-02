const mongoose = require('mongoose');
const env = require('../config/environment');
const Table = require('../models/Table');
const logger = require('../utils/logger');

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

const seedDB = async () => {
  try {
    logger.info('Starting Database Seeding Process...');

    // Connect to database
    await mongoose.connect(env.mongoUri);
    logger.info('Database connected successfully for seeding.');

    // Clear existing tables
    await Table.deleteMany({});
    logger.warn('Deleted existing Table documents.');

    // Insert table data
    const insertedTables = await Table.insertMany(tablesData);
    logger.info(`Successfully seeded ${insertedTables.length} tables!`);

    logger.info('Seeding process complete. Closing connection.');
    await mongoose.connection.close();
    logger.info('Database connection closed.');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding the database:', error);
    process.exit(1);
  }
};

seedDB();
