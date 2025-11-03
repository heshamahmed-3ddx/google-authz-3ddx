/**
 * @file errorHandler.js
 * @description Centralized error handling middleware with standardized responses
 * @author 3D Diagnostix Development Team
 * @created 2025-10-07
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
 */


/**
 * Map common errors to HTTP status codes and error codes
 */
const errorMappings = {
  'CastError': { code: 'VALIDATION_ERROR', http: 400 },
  'ValidationError': { code: 'VALIDATION_ERROR', http: 400 },
  'UnauthorizedError': { code: 'AUTH_REQUIRED', http: 401 },
  'ForbiddenError': { code: 'FORBIDDEN', http: 403 },
  'NotFoundError': { code: 'NOT_FOUND', http: 404 },
  'ConflictError': { code: 'CONFLICT', http: 409 },
  'TokenExpiredError': { code: 'AUTH_REQUIRED', http: 401 },
  'JsonWebTokenError': { code: 'AUTH_REQUIRED', http: 401 }
};

/**
 * Get error code from HTTP status
 * @param {number} status - HTTP status code
 * @returns {string} - Error code
 */
function getErrorCodeFromStatus(status) {
  const statusMappings = {
    400: 'VALIDATION_ERROR',
    401: 'AUTH_REQUIRED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMITED',
    500: 'INTERNAL_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE'
  };
  
  return statusMappings[status] || 'UNKNOWN_ERROR';
}

/**
 * Centralized error handling middleware
 *
 * This function normalizes errors thrown anywhere in the request chain into
 * a structured JSON response. It maps known error types to HTTP status
 * codes and standardized error codes, logs the error using the logging
 * service, and avoids leaking stack traces in production.
 *
 * @name errorHandler
 * @param {Error} err - The error thrown by earlier middleware or route handlers
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware
 * @returns {void}
 * @example
 * // Registered as the last middleware
 * app.use(errorHandler)
 */
export const errorHandler = (err, req, res, _next) => {
  // Accept injected logger for testability
  const logger = req.logger || {
    error: (...args) => {}
  };
  if (res.headersSent) {
    return _next(err);
  }
  logger.error('Unhandled error in middleware', {
    error: err.message,
    stack: err.stack,
    requestId: req.requestId,
    userEmail: req.userEmail,
    route: req.url,
    method: req.method,
    ip: req.ip
  });
  // ...existing code...

  // Default error response
  let errorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      http: 500,
      message: 'Internal server error'
    },
    requestId: req.requestId || 'unknown'
  };

  // Handle known error types
  if (err.name && errorMappings[err.name]) {
    const mapping = errorMappings[err.name];
    errorResponse.error = {
      code: mapping.code,
      http: mapping.http,
      message: err.message
    };
  }
  // Handle custom error codes
  else if (err.statusCode || err.status) {
    const statusCode = err.statusCode || err.status;
    errorResponse.error = {
      code: getErrorCodeFromStatus(statusCode),
      http: statusCode,
      message: err.message || 'An error occurred'
    };
  }
  // Handle Casbin errors
  else if (err.message && err.message.includes('Casbin')) {
    errorResponse.error = {
      code: 'AUTHORIZATION_ERROR',
      http: 500,
      message: 'Authorization system error'
    };
  }
  // Handle Google OAuth errors
  else if (err.message && (err.message.includes('OAuth') || err.message.includes('Google'))) {
    errorResponse.error = {
      code: 'AUTH_PROVIDER_ERROR',
      http: 502,
      message: 'Authentication provider error'
    };
  }

  // Don't expose stack traces in production
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.stack = err.stack;
  }

  // Send error response
  res.status(errorResponse.error.http).json(errorResponse);
};