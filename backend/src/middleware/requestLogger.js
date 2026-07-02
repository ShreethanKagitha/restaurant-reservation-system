const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  // Log on response completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const contentLength = res.get('Content-Length') || 0;
    const logMsg = `${method} ${originalUrl} ${statusCode} - ${contentLength} bytes - ${duration}ms | IP: ${ip}`;

    if (statusCode >= 500) {
      logger.error(logMsg);
    } else if (statusCode >= 400) {
      logger.warn(logMsg);
    } else {
      logger.info(logMsg);
    }
  });

  next();
};

module.exports = requestLogger;
