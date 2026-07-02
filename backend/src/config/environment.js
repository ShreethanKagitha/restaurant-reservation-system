const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'CLIENT_URL'
];

function validateEnv() {
  const missing = [];
  const invalid = [];

  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    }
  }

  // Validate Port if present
  if (process.env.PORT && isNaN(Number(process.env.PORT))) {
    invalid.push('PORT must be a number');
  }

  // Validate client URL format
  if (process.env.CLIENT_URL) {
    try {
      new URL(process.env.CLIENT_URL);
    } catch (e) {
      invalid.push('CLIENT_URL must be a valid URL');
    }
  }

  if (missing.length > 0 || invalid.length > 0) {
    console.error('====================================================');
    console.error('FATAL SYSTEM CONFIGURATION ERROR');
    console.error('====================================================');
    if (missing.length > 0) {
      console.error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    if (invalid.length > 0) {
      console.error(`Invalid environment variables configuration:\n - ${invalid.join('\n - ')}`);
    }
    console.error('====================================================');
    console.error('Failing fast. Server is shutting down.');
    process.exit(1);
  }
}

// Execute validation
validateEnv();

module.exports = {
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  clientUrl: process.env.CLIENT_URL
};
