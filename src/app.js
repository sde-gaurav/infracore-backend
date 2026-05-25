const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');
const xssClean = require('xss-clean');

const config = require('./config');
const corsOptions = require('./config/cors');
const swaggerSpec = require('./config/swagger');
const { globalErrorHandler } = require('./middlewares/error.middleware');
const notFound = require('./middlewares/notFound.middleware');
const { globalLimiter } = require('./middlewares/rateLimiter.middleware');
const { requestId, httpLogger } = require('./middlewares/requestLogger.middleware');
const apiRouter = require('./routes');

const app = express();

// =========================================================
// SECURITY HEADERS
// =========================================================
app.use(helmet({
  contentSecurityPolicy: config.isProduction,
  crossOriginEmbedderPolicy: config.isProduction,
}));

// =========================================================
// CORS
// =========================================================
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// =========================================================
// REQUEST TRACKING
// =========================================================
app.use(requestId);
app.use(httpLogger);

// =========================================================
// BODY PARSING & COMPRESSION
// =========================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookie.secret));
app.use(compression());

// =========================================================
// SECURITY — INPUT SANITISATION
// =========================================================
app.use(mongoSanitize()); // Strip $ / . from keys — prevents NoSQL injection
app.use(xssClean()); // Sanitise HTML tags in inputs
app.use(hpp({ // Prevent HTTP Parameter Pollution
  whitelist: ['sort', 'fields', 'page', 'limit'],
}));

// =========================================================
// GLOBAL RATE LIMITER
// =========================================================
app.use('/api', globalLimiter);

// =========================================================
// API DOCS — only expose in non-production
// =========================================================
if (!config.isProduction) {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: `${config.app.name} API Docs`,
      swaggerOptions: { persistAuthorization: true },
    }),
  );

  app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
}

// =========================================================
// ROUTES
// =========================================================
app.use('/api', apiRouter);

// =========================================================
// 404 + GLOBAL ERROR HANDLER
// =========================================================
app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;
