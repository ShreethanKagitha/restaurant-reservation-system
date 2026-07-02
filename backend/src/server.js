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
connectDB();

// Start Server
const server = app.listen(env.port, () => {
  logger.info(`Server is running in ${env.nodeEnv} mode on port ${env.port}`);
});

// Catch Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
  logger.error(err.message, err);
  server.close(() => {
    process.exit(1);
  });
});
