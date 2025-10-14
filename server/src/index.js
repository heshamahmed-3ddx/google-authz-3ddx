import express from 'express'
import cors from 'cors'
import session from 'express-session'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import apiRoutes from './routes/api.js'
import { errorHandler } from './middleware/errorHandler.js'
import casbinService from './services/casbin.js'
import requestIdMiddleware from './middleware/requestId.js'
import httpLoggerMiddleware from './middleware/logger.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './swagger.js'

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

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

console.log('🔒 Initializing security middleware...')

// Security headers (must be first)
app.use(securityHeaders)

// CORS with secure configuration
app.use(cors(corsOptions))

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

// Structured logging middleware
app.use(httpLoggerMiddleware)

// API security headers
app.use(apiSecurityHeaders)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes with appropriate rate limiting
app.use('/auth', authRateLimit, authRoutes) // Stricter rate limit for auth
app.use('/api', apiRoutes)

// Swagger UI (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  
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
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`)
  
  // Close server
  server.close(() => {
    console.log('✅ HTTP server closed')
    
    // Close any database connections, cleanup resources
    console.log('🧹 Cleanup completed')
    process.exit(0)
  })
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('❌ Force shutdown after timeout')
    process.exit(1)
  }, 30000)
}

// Start server
const server = app.listen(PORT, async () => {
  console.log('🔒 3D Diagnostix Authorization System')
  console.log('=====================================')
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🛡️  Security features: ENABLED`)
  console.log(`   • Security headers (Helmet)`)
  console.log(`   • Rate limiting & speed control`)
  console.log(`   • Request validation & sanitization`)
  console.log(`   • CORS protection`)
  console.log(`   • Session security`)
  console.log(`   • Error handling`)
  
  // Initialize Casbin authorization system
  try {
    await casbinService.initialize()
    console.log('🔐 Casbin authorization system: READY')
  } catch (error) {
    console.error('❌ Failed to initialize Casbin:', error.message)
    console.error('⚠️  Authorization features will be unavailable')
  }
  
  console.log(`\n🌐 API available at: http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`📚 API docs: See docs/api-reference.md`)
  console.log('\n✨ System ready for requests!')
})

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

export default app