/**
 * @file security.js
 * @description Security middleware for protecting documentation and admin endpoints
 * @author 3D Diagnostix Development Team
 * @created 2025-10-20
 * @version 1.2.0
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
 */

import { createContextLogger } from './logger.js';
import { createErrorResponse } from './messages.js';
import CONFIG from '../config/config.js';
import casbinService from './casbin.js';

// For Jest compatibility, use a static string for filename context
const logger = createContextLogger('/server/src/services/security.js');

/**
 * Middleware to protect documentation endpoints (Swagger, JSDoc)
 */
export async function protectDocumentation(req, res, next) {
  // Check if documentation is enabled
  if (!CONFIG.documentation.swagger.enabled && !CONFIG.documentation.jsdoc.enabled) {
    logger.warn('Documentation access attempted but disabled', {
      path: req.path,
      ip: req.ip
    });
    
    const errorResponse = await createErrorResponse('forbidden', 'Documentation is disabled', req.requestId);
    return res.status(403).json(errorResponse);
  }

  // Check if authentication is required
  if (CONFIG.documentation.swagger.requireAuth || CONFIG.documentation.jsdoc.requireAuth) {
    if (!req.session?.user) {
      logger.warn('Unauthenticated documentation access attempt', {
        path: req.path,
        ip: req.ip
      });
      
      const errorResponse = await createErrorResponse('auth_required', 'Authentication required for documentation access', req.requestId);
      return res.status(401).json(errorResponse);
    }

    // Check user roles
    const userEmail = req.session.user.email;
    const authorizedRoles = CONFIG.documentation.swagger.authorizedRoles;
    
    try {
      const userRights = await casbinService.getUserRights(userEmail);
      const hasAuthorizedRole = userRights.roles?.some(role => authorizedRoles.includes(role));
      const isAdmin = casbinService.isUserAdmin(userEmail);
      
      if (!hasAuthorizedRole && !isAdmin) {
        logger.warn('Unauthorized documentation access attempt', {
          userEmail,
          userRoles: userRights.roles,
          authorizedRoles,
          path: req.path
        });
        
        const errorResponse = await createErrorResponse('forbidden', 'Insufficient privileges for documentation access', req.requestId);
        return res.status(403).json(errorResponse);
      }
      
      logger.info('Authorized documentation access', {
        userEmail,
        path: req.path
      });
      
    } catch (error) {
      logger.error('Error checking documentation access permissions', {
        userEmail,
        error: error.message
      });
      
      const errorResponse = await createErrorResponse('internal_error', 'Error checking permissions', req.requestId);
      return res.status(500).json(errorResponse);
    }
  }

  next();
}

/**
 * Middleware to protect admin endpoints
 */
export async function requireAdmin(req, res, next) {
  if (!req.session?.user) {
    logger.warn('Admin access attempt without authentication', {
      path: req.path,
      ip: req.ip
    });
    
    const errorResponse = await createErrorResponse('unauthorized', null, req.requestId);
    return res.status(401).json(errorResponse);
  }

  const userEmail = req.session.user.email;
  
  try {
    const isAdmin = casbinService.isUserAdmin(userEmail);

    if (!isAdmin) {
      logger.warn('Non-admin user attempted admin access', {
        userEmail,
        path: req.path,
        ip: req.ip
      });
      
      const errorResponse = await createErrorResponse('forbidden', null, req.requestId);
      return res.status(403).json(errorResponse);
    }

    logger.info('Admin access granted', {
      userEmail,
      path: req.path
    });

    next();
    
  } catch (error) {
    logger.error('Error checking admin privileges', {
      userEmail,
      error: error.message
    });
    
    const errorResponse = await createErrorResponse('internal_error', 'Error checking admin privileges', req.requestId);
    return res.status(500).json(errorResponse);
  }
}

/**
 * Rate limiting middleware
 */
export function createRateLimiter() {
  const requests = new Map();
  const { windowMs, max } = CONFIG.api.rateLimit;

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key).filter(time => time > windowStart);
    
    if (userRequests.length >= max) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        requestCount: userRequests.length,
        limit: max,
        windowMs
      });
      
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          http: 429,
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil(windowMs / 1000)
        },
        requestId: req.requestId || 'unknown'
      });
      return;
    }

    userRequests.push(now);
    requests.set(key, userRequests);
    
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': max - userRequests.length,
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });

    next();
  };
}

export default {
  protectDocumentation,
  requireAdmin,
  createRateLimiter
};