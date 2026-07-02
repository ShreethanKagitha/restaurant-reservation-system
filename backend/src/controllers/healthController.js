const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Health check endpoint verifying backend and database connection states.
 */
const getHealth = (req, res) => {
  const dbState = mongoose.connection.readyState;
  let dbStatus = 'DOWN';
  
  // Mongoose readyState values: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (dbState === 1) {
    dbStatus = 'UP';
  } else if (dbState === 2) {
    dbStatus = 'CONNECTING';
  }

  const healthInfo = {
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      connectionCode: dbState
    },
    system: {
      memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      nodeVersion: process.version,
      platform: process.platform
    }
  };

  if (dbStatus === 'UP') {
    return sendSuccess(res, 'System is healthy', healthInfo, HTTP_STATUS.OK);
  } else {
    return sendError(
      res,
      'System is degraded or database is down',
      [healthInfo],
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = {
  getHealth
};
