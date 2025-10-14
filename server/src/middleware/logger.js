/**
 * @file logger.js
 * @description HTTP request logging middleware using pino
 * @author 3D Diagnostix Development Team
 * @created 2025-10-07
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
 */

import { createLogger, logPageView } from '../services/logging.js';

/**
 * HTTP request logging middleware
 *
 * Attaches a request-scoped logger to `req.logger`, logs the incoming
 * request and the response when it finishes. Also forwards high-level page
 * view events to the logging service for analytics.
 *
 * Side effects:
 * - Sets `req.logger` (pino logger)
 * - Calls `logPageView` for non-API GET requests
 *
 * @name httpLoggerMiddleware
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware
 * @returns {void}
 */
export const httpLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Create request-specific logger
  const logger = createLogger({
    requestId: req.requestId,
    userEmail: req.userEmail
  });
  
  // Store logger on request for use in routes
  req.logger = logger;
  
  // Log incoming request
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    authenticated: !!req.userEmail
  }, `${req.method} ${req.url}`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: duration,
      contentLength: res.get('content-length') || 0
    }, `${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    
    // Log page views for frontend routes
    if (req.method === 'GET' && !req.url.startsWith('/api/')) {
      logPageView(req.url, {
        requestId: req.requestId,
        userEmail: req.userEmail,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

export default httpLoggerMiddleware;