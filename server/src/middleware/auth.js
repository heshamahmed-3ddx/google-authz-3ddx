/**
 * @file auth.js
 * @description Authentication middleware for protected routes
 * @author 3D Diagnostix Development Team
 * @created 2025-10-27
 * @version 1.0.0
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
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
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware
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
 * Creates a middleware that checks if user belongs to any of the specified groups
 *
 * @param {string[]} allowedGroups - Array of group names that have access
 * @returns {Function} Express middleware function
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
