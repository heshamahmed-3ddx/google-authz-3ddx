/**
 * @file security.js
 * @description Security middleware and configuration for production-ready deployment
 * @author 3D Diagnostix Development Team
 * @created 2025-10-08
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
 */

import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import csrf from 'csurf'
import { createLogger } from '../services/logging.js'

const logger = createLogger({ service: 'security' })

/**
 * Security Headers Configuration using Helmet
 * Implements OWASP security best practices
 *
 * @module securityHeaders
 * @see https://helmetjs.github.io/
 */
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Vuetify
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net'
      ],
      scriptSrc: [
        "'self'",
        'https://accounts.google.com',
        'https://apis.google.com'
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net'
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https://lh3.googleusercontent.com', // Google profile images
        'https://*.googleapis.com'
      ],
      connectSrc: [
        "'self'",
        'https://accounts.google.com',
        'https://www.googleapis.com',
        'https://oauth2.googleapis.com'
      ],
      frameSrc: [
        'https://accounts.google.com'
      ]
    }
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // X-Frame-Options
  frameguard: {
    action: 'deny'
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // X-XSS-Protection
  xssFilter: true,
  
  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // Permissions Policy (Feature Policy)
  permissionsPolicy: {
    features: {
      camera: ['none'],
      microphone: ['none'],
      geolocation: ['none'],
      payment: ['none'],
      usb: ['none']
    }
  }
})

/**
 * Rate Limiting Configuration
 * Prevents brute force attacks and API abuse
 */

// General API rate limiting
/**
 * General API rate limiter middleware
 * Limits requests per IP to prevent abuse and brute-force attacks.
 *
 * @name generalRateLimit
 * @type {import('express').RequestHandler}
 * @example
 * // Mount as global middleware
 * app.use(generalRateLimit)
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      http: 429,
      message: 'Too many requests from this IP, please try again later'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn({
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      limit: options.max,
      windowMs: options.windowMs
    }, 'Rate limit exceeded')
    
    res.status(options.statusCode).json(options.message)
  }
})

// Strict rate limiting for authentication endpoints
/**
 * Authentication-specific rate limiter
 * Applies stricter limits to authentication endpoints to slow credential
 * stuffing and brute force attempts.
 *
 * @name authRateLimit
 * @type {import('express').RequestHandler}
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      http: 429,
      message: 'Too many authentication attempts, please try again later'
    }
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res, next, options) => {
    logger.warn({
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      type: 'authentication_rate_limit'
    }, 'Authentication rate limit exceeded')
    
    res.status(options.statusCode).json(options.message)
  }
})

// Progressive delay for repeated requests
/**
 * Progressive slowdown middleware
 * Introduces incremental delays for repetitive requests from the same IP.
 *
 * @name speedLimiter
 * @type {import('express').RequestHandler}
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per windowMs without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  onLimitReached: (req, res, options) => {
    logger.info({
      ip: req.ip,
      path: req.path,
      delay: options.delayMs
    }, 'Speed limiter applied')
  }
})

/**
 * CSRF protection middleware factory
 * Configured to store CSRF tokens in an httpOnly cookie and to accept
 * tokens from common locations (body, query, headers).
 *
 * @name csrfProtection
 * @type {import('express').RequestHandler}
 * @throws {Error} When csurf cannot initialize (rare)
 */
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'], // Don't require CSRF for safe methods
  value: (req) => {
    // Check multiple possible locations for CSRF token
    return req.body._csrf || 
           req.query._csrf || 
           req.headers['x-csrf-token'] ||
           req.headers['x-xsrf-token']
  }
})

/**
 * Request validation middleware
 * Performs lightweight checks for common malicious patterns (XSS, SQLi,
 * path traversal) and logs the request metadata. If a suspicious pattern is
 * detected, this middleware responds with HTTP 400 and a structured error.
 *
 * @name requestValidation
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware function
 * @returns {void}
 */
export const requestValidation = (req, res, next) => {
  // Log security-relevant request information
  logger.info({
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    origin: req.get('Origin'),
    requestId: req.requestId
  }, 'Request received')
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,              // Path traversal
    /<script/i,          // XSS attempts
    /union.*select/i,    // SQL injection
    /javascript:/i,      // JavaScript protocol
    /data:.*base64/i     // Data URI attacks
  ]
  
  const requestStr = `${req.path} ${req.query} ${JSON.stringify(req.body)}`
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestStr)) {
      logger.warn({
        ip: req.ip,
        path: req.path,
        pattern: pattern.toString(),
        requestId: req.requestId
      }, 'Suspicious request pattern detected')
      
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          http: 400,
          message: 'Invalid request format'
        },
        requestId: req.requestId
      })
    }
  }
  
  next()
}

/**
 * Session configuration object for express-session
 * This object is intended to be passed directly to express-session and
 * documents the cookie policy and session behavior used by the application.
 *
 * @name sessionSecurity
 * @type {object}
 * @property {string} name - Custom session cookie name
 * @property {string|Buffer} secret - Session secret (from env in prod)
 * @property {boolean} resave
 * @property {boolean} saveUninitialized
 * @property {boolean} rolling
 * @property {object} cookie - Cookie configuration (secure, maxAge, sameSite)
 */
export const sessionSecurity = {
  name: '3ddiagnostix.sid', // Custom session name
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // Allow cross-origin in dev
  }
}

/**
 * CORS options used by cors() middleware
 * The origin function performs a whitelist check and logs rejected
 * origins for auditing.
 *
 * @name corsOptions
 * @type {object}
 * @property {function} origin - Origin validation function
 * @property {boolean} credentials - Whether to allow cookies
 */
export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      'http://localhost:5173', // Development frontend
      'http://localhost:3000', // Development backend
      'https://app.3ddiagnostix.com', // Production frontend
      'https://api.3ddiagnostix.com'  // Production backend
    ]
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      logger.warn({
        origin,
        type: 'cors_violation'
      }, 'CORS origin not allowed')
      
      callback(new Error('Not allowed by CORS'), false)
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'X-XSRF-Token'
  ],
  exposedHeaders: ['X-CSRF-Token']
}

/**
 * Input sanitization middleware
 * Recursively HTML-encodes string inputs on req.body and req.query to
 * reduce risk of reflected XSS. IMPORTANT: this middleware intentionally
 * skips the OAuth callback path (/auth/google/callback) because the
 * authorization code must not be modified (it may contain characters like
 * '/'). Modifying it previously led to invalid_grant errors during token
 * exchange.
 *
 * @name sanitizeInput
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware
 * @returns {void}
 */
export const sanitizeInput = (req, res, next) => {
  // Don't sanitize the OAuth callback query parameters - they include the
  // authorization code which must not be altered (contains '/'). Sanitizing
  // here previously converted '/' to '&#x2F;' and broke the token exchange
  // (invalid_grant / Malformed auth code).
  if (req.path && req.path.startsWith('/auth/google/callback')) {
    return next()
  }
  // Basic HTML entity encoding for string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  }
  
  // Recursively sanitize object properties
  const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return typeof obj === 'string' ? sanitizeString(obj) : obj
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject)
    }
    
    const sanitized = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value)
    }
    return sanitized
  }
  
  // Sanitize request body and query parameters
  if (req.body) {
    req.body = sanitizeObject(req.body)
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query)
  }
  
  next()
}

/**
 * Adds lightweight security headers and metadata for API responses
 * Intended to be applied on API routes to expose version, request id and
 * prevent aggressive caching.
 *
 * @name apiSecurityHeaders
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware
 * @returns {void}
 */
export const apiSecurityHeaders = (req, res, next) => {
  // Add custom security headers
  res.setHeader('X-API-Version', '1.0.0')
  res.setHeader('X-Response-Time', Date.now() - req.startTime)
  res.setHeader('X-Request-ID', req.requestId)
  
  // Cache control for API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  
  next()
}

/**
 * Error handler for security-related middleware
 * Detects common security error shapes (CSRF failures, rate-limit hits)
 * and returns structured JSON responses. Unexpected errors are logged and
 * passed along to the next error handler.
 *
 * @name securityErrorHandler
 * @param {Error} err - The error thrown by previous middleware
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware
 * @returns {void}
 */
export const securityErrorHandler = (err, req, res, next) => {
  // Log security-related errors
  if (err.code === 'EBADCSRFTOKEN') {
    logger.warn({
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
      error: 'CSRF token mismatch'
    }, 'CSRF protection triggered')
    
    return res.status(403).json({
      error: {
        code: 'CSRF_TOKEN_MISMATCH',
        http: 403,
        message: 'Invalid CSRF token'
      },
      requestId: req.requestId
    })
  }
  
  // Rate limiting errors
  if (err.status === 429) {
    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        http: 429,
        message: 'Too many requests'
      },
      requestId: req.requestId
    })
  }
  
  // Log unexpected security errors
  logger.error({
    error: err.message,
    stack: err.stack,
    ip: req.ip,
    path: req.path
  }, 'Security error occurred')
  
  next(err)
}

export default {
  securityHeaders,
  generalRateLimit,
  authRateLimit,
  speedLimiter,
  csrfProtection,
  requestValidation,
  sessionSecurity,
  corsOptions,
  sanitizeInput,
  apiSecurityHeaders,
  securityErrorHandler
}