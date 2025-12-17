/**
 * @file auth.js
 * @description Authentication middleware for protected routes
 * @author InsightHub Development Team
 * @created 2025-10-27
 * @version 1.0.0
 * @copyright 2025 InsightHub. All rights reserved.
 */

import { createContextLogger } from '../services/logger.js';
import { createErrorResponse } from '../services/messages.js';

// For Jest compatibility, use a static string for filename context
const logger = createContextLogger('/server/src/middleware/auth.js', 'AuthMiddleware');

/**
 * Authentication guard middleware
 * Ensures a valid user session is present. If the session is missing or
 * does not contain user information, the middleware responds with HTTP 401
 * and does not call `next()`.
 *
 * @name requireAuth
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 * @returns {Promise<void>}
 */
export const requireAuth = async (req, res, next) => {
  // Prevents access to protected endpoints if user is not authenticated or session is missing tokens
  if (!req.session.user || !req.session.tokens) {
    logger.warn('Authentication required - missing user or tokens', {
      sessionId: req.sessionID,
      hasUser: !!req.session.user,
      hasTokens: !!req.session.tokens,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      path: req.path
    });
    
    const errorResponse = await createErrorResponse('auth_required', null, req.requestId);
    return res.status(401).json(errorResponse);
  }
  
  logger.debug('Authentication successful', {
    userEmail: req.session.user.email,
    sessionId: req.sessionID,
    path: req.path
  });
  
  next();
};

/**
 * Group-based authorization middleware factory
 * 
 * Creates a middleware function that checks if the authenticated user belongs to
 * any of the specified groups. If the user is not in any of the allowed groups,
 * the middleware responds with HTTP 403 and does not call `next()`.
 * 
 * @param {string[]} allowedGroups - Array of group names that have access to the route
 * @returns {Function} Express middleware function
 * @returns {Function} returns.middleware - Express middleware (req, res, next)
 * 
 * @example
 * // Protect a route to only allow Finance22 and admin groups
 * router.get('/reports', requireGroups(['Finance22', 'admin']), getReports);
 * 
 * @example
 * // Protect a route to only allow Developers22 group
 * router.get('/api-docs', requireGroups(['Developers22', 'admin']), showApiDocs);
 */
export const requireGroups = (allowedGroups) => {
  return async (req, res, next) => {
    const userEmail = req.session?.user?.email;
    
    if (!userEmail) {
      logger.warn('Group authorization failed - no user email', {
        sessionId: req.sessionID,
        path: req.path
      });
      
      const errorResponse = await createErrorResponse('auth_required', null, req.requestId);
      return res.status(401).json(errorResponse);
    }

    try {
      // Import casbinService dynamically to avoid circular dependencies
      const { default: casbinService } = await import('../services/casbin.js');
      const userGroups = await casbinService.getUserGroups(userEmail);
      
      const hasAccess = userGroups.some(group => allowedGroups.includes(group));
      
      if (!hasAccess) {
        logger.warn('Group authorization failed - insufficient permissions', {
          userEmail,
          userGroups,
          requiredGroups: allowedGroups,
          path: req.path
        });
        
        const errorResponse = await createErrorResponse(
          'forbidden',
          `Access denied. Required groups: ${allowedGroups.join(', ')}`,
          req.requestId
        );
        return res.status(403).json(errorResponse);
      }
      
      logger.debug('Group authorization successful', {
        userEmail,
        userGroups,
        path: req.path
      });
      
      next();
    } catch (error) {
      logger.error('Group authorization error', {
        error: error.message,
        userEmail,
        stack: error.stack
      });
      
      const errorResponse = await createErrorResponse('internal_error', error.message, req.requestId);
      return res.status(500).json(errorResponse);
    }
  };
};

export default { requireAuth, requireGroups };
