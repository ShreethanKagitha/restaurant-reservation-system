const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/environment');
const { HTTP_STATUS } = require('./config/constants');
const requestLogger = require('./middleware/requestLogger');
const globalErrorHandler = require('./middleware/error');
const apiRouter = require('./routes');
const healthController = require('./controllers/healthController');
const { sendError } = require('./utils/apiResponse');

const app = express();

// Enable trust proxy to correctly read X-Forwarded-For headers from Render's load balancer
app.set('trust proxy', 1);

// 1) Global Security Middlewares
app.use(helmet()); // Secure HTTP headers

// CORS configuration matching client URL
app.use(
  cors({
    origin: env.clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// 2) Body parsing and parsing JSON payloads
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 3) Request Logging
app.use(requestLogger);

// 4) Rate Limiting for Auth Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    errors: [{ message: 'Too many authentication attempts. Rate limit exceeded.' }]
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
});

// Apply rate limiter to auth endpoints
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// 5) Health check endpoint at root level
app.get('/health', healthController.getHealth);

// 6) Mount Versioned API Routes
app.use('/api/v1', apiRouter);

// 7) Handle Undefined (404) Routes (Returns standardized JSON)
app.all('*', (req, res, next) => {
  return sendError(
    res,
    `Cannot find resource ${req.originalUrl} on this server`,
    [{ message: `Path ${req.originalUrl} is invalid` }],
    HTTP_STATUS.NOT_FOUND
  );
});

// 8) Mount Centralized Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
