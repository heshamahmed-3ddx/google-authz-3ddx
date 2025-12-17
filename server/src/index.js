import express from 'express'
import cors from 'cors'
import session from 'express-session'
import dotenv from 'dotenv';

// Load environment-specific .env file
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📂 Loading config from: ${envFile}`);
console.log(`🔗 Google Redirect URI: ${process.env.GOOGLE_REDIRECT_URI}`);

import authRoutes from './routes/auth.routes.js'
import apiRoutes from './routes/api.routes.js'
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
const logger = createContextLogger('ServerMain', 'ServerMain')

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

// Security headers (must be first)
app.use(securityHeaders)

// CORS with secure configuration
app.use(cors(corsOptions))
        // Populate req.user from session for metrics and downstream middleware
        app.use((req, res, next) => {
          if (req.session && req.session.user) {
            req.user = req.user || {};
            req.user.email = req.session.user.email;
            req.user.username = req.session.user.username || req.session.user.name || 'unknown';
          }
          next();
        });

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
register.registerMetric(dbQueryDuration)
register.registerMetric(apiFulfillmentDuration)

// Expose dbQueryDuration globally for service instrumentation
global.dbQueryDuration = dbQueryDuration;

// Export metrics for use in controllers if needed
export { dbQueryDuration, apiFulfillmentDuration, register };

// Instrument API fulfillment timing for surgical guide report endpoints only
// This middleware tracks end-to-end latency for report API requests
app.use((req, res, next) => {
  // Only track metrics for surgical guide report endpoints
  if (req.path.startsWith('/api/reports/surgical_guide')) {
    const start = process.hrtime();
    res.on('finish', () => {
      const duration = process.hrtime(start);
      const seconds = duration[0] + duration[1] / 1e9;
      // Get user context from session (set by auth middleware)
      const userEmail = req.session?.user?.email || req.user?.email || 'unknown';
      const userUsername = req.session?.user?.name || req.session?.user?.username || req.user?.username || 'unknown';
      apiFulfillmentDuration.labels(userEmail, userUsername).observe(seconds);
    });
  }
  next();
});

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

// Start server
const server = app.listen(PORT, async () => {
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
})

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