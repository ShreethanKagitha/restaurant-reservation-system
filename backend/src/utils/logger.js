const env = require('../config/environment');

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const CURRENT_LEVEL = env.nodeEnv === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

function formatLog(level, message, meta) {
  const timestamp = new Date().toISOString();
  let metaStr = '';
  if (meta) {
    if (meta instanceof Error) {
      metaStr = `\n${meta.stack}`;
    } else {
      metaStr = ` | Meta: ${JSON.stringify(meta)}`;
    }
  }
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

const logger = {
  debug: (message, meta) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
      console.debug('\x1b[36m%s\x1b[0m', formatLog('DEBUG', message, meta)); // Cyan
    }
  },
  info: (message, meta) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
      console.info('\x1b[32m%s\x1b[0m', formatLog('INFO', message, meta)); // Green
    }
  },
  warn: (message, meta) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
      console.warn('\x1b[33m%s\x1b[0m', formatLog('WARN', message, meta)); // Yellow
    }
  },
  error: (message, meta) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
      console.error('\x1b[31m%s\x1b[0m', formatLog('ERROR', message, meta)); // Red
    }
  }
};

module.exports = logger;
