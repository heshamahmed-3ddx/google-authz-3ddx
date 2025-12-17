/**
 * @file requestId.js
 * @description Request ID middleware for correlating requests across frontend/backend
 * @author InsightHub Development Team
 * @created 2025-10-07
 * @copyright 2025 InsightHub. All rights reserved.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to generate a unique request ID for each incoming request.
 * Adds `requestId` to the request object and sets the `X-Request-ID`
 * response header so frontend telemetry and logs can be correlated.
 * Also copies the authenticated user's email into `req.userEmail` when
 * available to simplify logging context.
 *
 * @name requestIdMiddleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {void}
 */
export const requestIdMiddleware = (req, res, next) => {
  // Generate unique request ID
  const requestId = uuidv4();
  
  // Add to request object for use in other middleware/routes
  req.requestId = requestId;
  
  // Add to response headers for frontend correlation
  res.setHeader('X-Request-ID', requestId);
  
  // Add user email if available for logging context
  req.userEmail = req.session?.user?.email || null;
  
  next();
};

export default requestIdMiddleware;