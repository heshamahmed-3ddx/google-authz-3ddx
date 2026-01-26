import express from 'express'
import cors from 'cors'
import session from 'express-session'
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import authRoutes from './routes/auth.routes.js'
import apiRoutes from './routes/api.routes.js'
import adminRoutes from './routes/admin.routes.js'
import surgicalGuideOrdersService from './services/surgicalGuideOrders.service.js'
import { errorHandler } from './middleware/errorHandler.js'
import casbinService from './services/casbin.js'
import databaseService from './services/database.js'
import requestIdMiddleware from './middleware/requestId.js'
import { createContextLogger, logSystemInit, requestLogger } from './services/logger.js'
import { preloadMessages } from './services/messages.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './swagger.cjs'

// Import comprehensive security middleware
import {
  securityHeaders,
  generalRateLimit,
  authRateLimit,
  speedLimiter,
  requestValidation,
  sessionSecurity,
  corsOptions,
  sanitizeInput,
  apiSecurityHeaders,
  securityErrorHandler
} from './middleware/security.js'


const app = express()
const PORT = process.env.PORT || 3000
const logger = createContextLogger('index', 'ServerMain')

// Log environment configuration
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`, { 
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI 
});

/**
 * Initialize system components during server startup
 * 
 * Performs critical initialization tasks in sequence:
 * 1. Logs server startup event
 * 2. Preloads i18n message system
 * 3. Initializes security middleware
 * 
 * Any failure during initialization will throw an error and prevent server start.
 * 
 * @async
 * @throws {Error} If any initialization step fails
 * @returns {Promise<boolean>} Returns true on successful initialization
 * 
 * @example
 * // Called during server startup
 * try {
 *   await initializeSystem();
 *   console.log('System initialized successfully');
 * } catch (error) {
 *   console.error('Initialization failed:', error);
 *   process.exit(1);
 * }
 */
async function initializeSystem() {
  try {
    logSystemInit('Server Startup', 'started', { port: PORT });
    
    // Preload message system
    await preloadMessages();
    logSystemInit('Message System', 'initialized');
    
    // Initializing security middleware
    logSystemInit('Security Middleware', 'loading');
    
    return true;
  } catch (error) {
    logger.error('System initialization failed', { 
      error: error.message, 
      stack: error.stack 
    });
    throw error;
  }
}

// Trust proxy (for sessions behind Nginx/reverse proxy)
app.set('trust proxy', 1)

// Security headers (must be first)
app.use(securityHeaders)

// CORS with secure configuration
app.use(cors(corsOptions))

import promClient from 'prom-client'
// Prometheus metrics registry
const register = new promClient.Registry()
promClient.collectDefaultMetrics({ register })

// Phase 1 metrics
const dbQueryDuration = new promClient.Histogram({
  name: 'sg_report_db_query_duration_seconds',
  help: 'Time spent only on database query execution',
  labelNames: ['user_email', 'user_username']
})
const apiFulfillmentDuration = new promClient.Histogram({
  name: 'sg_report_api_fulfillment_duration_seconds',
  help: 'End-to-end API latency, including DB time, processing, and response generation',
  labelNames: ['user_email', 'user_username']
})

// Phase 2 metrics - Performance & Efficiency
const processingDuration = new promClient.Histogram({
  name: 'sg_report_processing_duration_seconds',
  help: 'Time spent on non-DB backend logic (data formatting, aggregation)',
  labelNames: ['user_email', 'user_username', 'operation']
})
const exportDuration = new promClient.Histogram({
  name: 'sg_report_export_duration_seconds',
  help: 'Time to generate CSV/PDF exports',
  labelNames: ['user_email', 'user_username', 'format']
})
const queryTimeoutTotal = new promClient.Counter({
  name: 'sg_report_query_timeout_total',
  help: 'Count of report queries that timed out',
  labelNames: ['user_email', 'user_username']
})
const dbErrorTotal = new promClient.Counter({
  name: 'sg_report_db_error_total',
  help: 'Number of DB query failures or connection errors',
  labelNames: ['user_email', 'user_username', 'error_type']
})

// Phase 2 metrics - Usage & User Behavior
const requestsTotal = new promClient.Counter({
  name: 'sg_report_requests_total',
  help: 'Total count of report requests',
  labelNames: ['user_email', 'user_username', 'status_code', 'user_group', 'endpoint']
})
const requestsByGroup = new promClient.Counter({
  name: 'sg_report_requests_by_group_total',
  help: 'Total requests grouped by user group',
  labelNames: ['user_group']
})
const uniqueUsers = new promClient.Gauge({
  name: 'sg_report_unique_users_total',
  help: 'Unique users accessing the report (for adoption tracking)',
  labelNames: []
})
const exportRequests = new promClient.Counter({
  name: 'sg_report_export_requests_total',
  help: 'Number of export-to-CSV/PDF requests',
  labelNames: ['user_email', 'user_username', 'format']
})

// Register all metrics
register.registerMetric(dbQueryDuration)
register.registerMetric(apiFulfillmentDuration)
register.registerMetric(processingDuration)
register.registerMetric(exportDuration)
register.registerMetric(queryTimeoutTotal)
register.registerMetric(dbErrorTotal)
register.registerMetric(requestsTotal)
register.registerMetric(requestsByGroup)
register.registerMetric(uniqueUsers)
register.registerMetric(exportRequests)

// Expose metrics globally for service instrumentation
global.dbQueryDuration = dbQueryDuration;
global.processingDuration = processingDuration;
global.exportDuration = exportDuration;
global.queryTimeoutTotal = queryTimeoutTotal;
global.dbErrorTotal = dbErrorTotal;
global.requestsTotal = requestsTotal;
global.requestsByGroup = requestsByGroup;
global.uniqueUsers = uniqueUsers;
global.exportRequests = exportRequests;

// Track unique users
const uniqueUsersSet = new Set();
global.trackUniqueUser = (userEmail) => {
  if (userEmail && userEmail !== 'unknown') {
    uniqueUsersSet.add(userEmail);
    uniqueUsers.set(uniqueUsersSet.size);
  }
};

// Export metrics for use in controllers if needed
export { 
  dbQueryDuration, 
  apiFulfillmentDuration, 
  processingDuration,
  exportDuration,
  queryTimeoutTotal,
  dbErrorTotal,
  requestsTotal,
  requestsByGroup,
  uniqueUsers,
  exportRequests,
  register 
};



// /metrics endpoint
app.get('/metrics', async (req, res) => {
  // Optional: Add authentication for production
  if (process.env.PROMETHEUS_BEARER_TOKEN) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.PROMETHEUS_BEARER_TOKEN}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})

// Request ID middleware (early in chain for logging)
app.use(requestIdMiddleware)

// Rate limiting and speed control
app.use(speedLimiter)
app.use(generalRateLimit)

// Request validation and sanitization
app.use(requestValidation)
app.use(sanitizeInput)

// Session with enhanced security
app.use(session(sessionSecurity))

// Populate req.user from session for metrics and downstream middleware
app.use((req, res, next) => {
  // Debug: show session presence and user mapping
  try {
    if (req.session && req.session.user) {
      req.user = req.user || {};
      req.user.email = req.session.user.email;
      req.user.username = req.session.user.username || req.session.user.name || 'unknown';
    }
  } catch (err) {
    // silence debug in production
  }
  next();
});

// Instrument API fulfillment timing for surgical guide report endpoints only
// This middleware tracks end-to-end latency for report API requests
app.use((req, res, next) => {
  // Only track metrics for surgical guide report endpoints
  if (req.path.startsWith('/api/reports/surgical_guide')) {
    const start = process.hrtime();

    // Track unique users
    const userEmail = req.session?.user?.email || req.user?.email || 'unknown';
    if (typeof global.trackUniqueUser === 'function') {
      global.trackUniqueUser(userEmail);
    }

    res.on('finish', () => {
      const duration = process.hrtime(start);
      const seconds = duration[0] + duration[1] / 1e9;
      // Get user context from session (set by auth middleware)
      const userUsername = req.session?.user?.name || req.session?.user?.username || req.user?.username || 'unknown';
      const userGroup = req.session?.user?.groups?.[0] || req.user?.groups?.[0] || 'unknown';
      const statusCode = res.statusCode.toString();

      // Track API fulfillment duration
      apiFulfillmentDuration.labels(userEmail, userUsername).observe(seconds);

      // Track total requests with labels
      if (typeof global.requestsTotal !== 'undefined') {
        global.requestsTotal.labels(userEmail, userUsername, statusCode, userGroup, req.path).inc();
      }

      // Track requests by group
      if (typeof global.requestsByGroup !== 'undefined') {
        global.requestsByGroup.labels(userGroup).inc();
      }
    });
  }
  next();
});

// Enhanced request logging middleware
app.use(requestLogger)

// API security headers
app.use(apiSecurityHeaders)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes with appropriate rate limiting
app.use('/auth', authRateLimit, authRoutes) // Stricter rate limit for auth
app.use('/api', apiRoutes)
app.use('/admin', authRateLimit, adminRoutes) // Admin routes with stricter rate limit

// Development-only helper to trigger surgical guide export (increments metrics)
if (process.env.NODE_ENV !== 'production') {
  app.get('/dev/trigger-sg-export', async (req, res) => {
    try {
      const startDate = req.query.startDate || '2014-01-01'
      const endDate = req.query.endDate || '2020-12-31'
      const userEmail = req.query.userEmail || 'dev@local'
      const userUsername = req.query.userUsername || 'dev'
      const csv = await surgicalGuideOrdersService.exportToCSV(startDate, endDate, { userEmail, userUsername })
      return res.json({ ok: true, bytes: csv.length })
    } catch (err) {
      console.error('Dev export trigger failed', err)
      return res.status(500).json({ ok: false, error: err.message })
    }
  })
}
import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, 'api-spec.yaml'), 'utf8'))

// Swagger UI (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  
  // Serve JSDoc documentation
  app.use('/jsdoc', express.static('../client/docs/jsdoc'))
}

// Health check endpoint (before error handlers)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    casbin: casbinService.enforcer ? 'initialized' : 'not_initialized',
    security: {
      headers: 'enabled',
      rateLimiting: 'enabled',
      cors: 'configured',
      csrf: 'available'
    }
  })
})

// Security error handling (before general error handler)
app.use(securityErrorHandler)

// General error handling middleware
app.use(errorHandler)

// 404 handler (must be last)
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      http: 404,
      message: 'Route not found'
    },
    path: req.originalUrl,
    requestId: req.requestId
  })
})

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Close server
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Close database connections
    try {
      await databaseService.close();
      logger.info('Database connections closed');
    } catch (error) {
      logger.error('Error closing database', { error: error.message });
    }
    
    logger.info('Cleanup completed. Exiting process.');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Force shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Log DB env variables for diagnosis

// Start server (only if not in test environment)
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, async () => {
    try {
      // Initialize system components
      await initializeSystem();
      
      logger.info('3D Diagnostix Authorization System started', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      });
      
      logSystemInit('Security Features', 'enabled', {
        features: [
          'Security headers (Helmet)',
          'Rate limiting & speed control',
          'Request validation & sanitization',
          'CORS protection',
          'Session security',
          'Error handling'
        ]
      });
      
      // Initialize MySQL database connection FIRST (if configured)
      // This must happen before Casbin if using database storage mode
      if (process.env.DB_HOST && process.env.DB_NAME) {
      try {
        await databaseService.initialize();
        logSystemInit('MySQL Database', 'connected', {
          host: process.env.DB_HOST,
          database: process.env.DB_NAME
        });
      } catch (error) {
        logger.warn('Database initialization failed - surgical guide reports and Casbin database mode will not be available', {
          error: error.message,
          stack: error.stack
        });
        logSystemInit('MySQL Database', 'failed', {
          error: error.message
        });
      }
    } else {
      logger.info('Database not configured - surgical guide reports disabled', {
        hint: 'Set DB_HOST and DB_NAME environment variables to enable'
      });
    }
    
    // Initialize Casbin authorization system (after database if using database mode)
    try {
      await casbinService.initialize()
      logSystemInit('Casbin Authorization System', 'ready', {
        component: 'RBAC',
        policies: 'loaded'
      });
    } catch (error) {
      logger.error('Casbin initialization failed', {
        error: error.message,
        stack: error.stack
      });
      logSystemInit('Casbin Authorization System', 'failed', {
        error: error.message
      });
    }
    
    logger.info('System ready for requests', {
      apiEndpoint: `http://localhost:${PORT}`,
      healthCheck: `http://localhost:${PORT}/health`,
      documentation: 'docs/api-reference.md'
    });
    
  } catch (initError) {
    logger.error('Server initialization failed', {
      error: initError.message,
      stack: initError.stack
    });
    process.exit(1);
  }
});
}

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  // Uncaught Exception
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  // Unhandled Rejection
  process.exit(1)
})

export default app
export { server }