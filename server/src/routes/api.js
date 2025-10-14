
/**
 * @file api.js
 * @description Express router for user data, Google OAuth, Casbin RBAC, and health endpoints.
 * @author 3D Diagnostix Development Team
 * @created 2025-10-07
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
 *
 * This file defines all /api/* routes for the backend, including authentication, user details,
 * authorization, Google API integration, and system health. All endpoints use Zod validation and
 * standardized error responses. See Swagger spec for API contract.
 */

import { Router } from 'express'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import casbinService from '../services/casbin.js'
import { logUserAccess } from '../services/logging.js'

const router = Router()

/**
 * Authentication guard middleware
 * Ensures a valid user session is present. If the session is missing or
 * does not contain user information the middleware responds with HTTP 401
 * and does not call `next()`.
 *
 * @name requireAuth
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware
 * @returns {void}
 */
const requireAuth = (req, res, next) => {
  // Why: Prevents access to protected endpoints if user is not authenticated or session is missing tokens.
  if (!req.session.user || !req.session.tokens) {
    return res.status(401).json({ 
      error: {
        code: 'AUTH_REQUIRED',
        http: 401,
        message: 'Authentication required'
      },
      requestId: req.requestId || 'unknown'
    })
  }
  next()
}

/**
 * Get user profile from Google API
 * @route GET /api/profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} User profile data from Google API
 * @example
 * GET /api/profile
 * Response: { "profile": { "id": "123", "name": "John Doe", "email": "john@example.com" }, "source": "Google API" }
 */
router.get('/profile', requireAuth, async (req, res) => {
/**
 * @function GET /api/profile
 * @description Returns the authenticated user's Google profile using OAuth tokens in session.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Object} JSON with Google profile and source
 * @throws {400} If session tokens are invalid
 * @throws {500} On Google API or server error
 */
  try {
    // Validate session tokens
    const { z } = await import('zod')
    const tokensSchema = z.object({
      access_token: z.string().min(1),
      id_token: z.string().min(1)
    })
    const parseResult = tokensSchema.safeParse(req.session.tokens)
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          http: 400,
          message: 'Invalid session tokens',
          details: parseResult.error.errors.map(e => e.message).join(', ')
        },
        requestId: req.requestId || 'unknown'
      })
    }
    const client = new OAuth2Client()
    client.setCredentials(req.session.tokens)
    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const { data } = await oauth2.userinfo.get()
    res.json({
      profile: data,
      source: 'Google API'
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

/**
 * Get authenticated user details including groups, roles, and organization

/**
 * Get Google Sheets list
 * @route GET /api/google/sheets/list
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} List of Google Sheets
 */
router.get('/google/sheets/list', requireAuth, async (req, res) => {
/**
 * @function GET /api/google/sheets/list
 * @description Lists Google Sheets for the authenticated user. Requires Google Drive scope.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Object} JSON with array of sheets and nextPageToken
 * @throws {400} If session tokens are invalid
 * @throws {403} If Google Drive scope is missing
 * @throws {500} On Google API or server error
 */
  try {
    // Validate session tokens
    const { z } = await import('zod')
    const tokensSchema = z.object({
      access_token: z.string().min(1),
      id_token: z.string().min(1)
    })
    const parseResult = tokensSchema.safeParse(req.session.tokens)
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          http: 400,
          message: 'Invalid session tokens',
          details: parseResult.error.errors.map(e => e.message).join(', ')
        },
        requestId: req.requestId || 'unknown'
      })
    }
    const client = new OAuth2Client()
    client.setCredentials(req.session.tokens)
    const drive = google.drive({ version: 'v3', auth: client })
    const { data } = await drive.files.list({
      pageSize: 10,
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)'
    })
    res.json({
      sheets: data.files || [],
      nextPageToken: data.nextPageToken
    })
  } catch (error) {
    // Check if it's an OAuth scope issue
    if (error.code === 403 || error.message?.includes('scope')) {
      return res.status(403).json({ 
        error: {
          code: 'INSUFFICIENT_SCOPE',
          http: 403,
          message: 'Insufficient permissions. Google Drive scope required for Sheets access.',
          details: 'The application needs Google Drive permissions to list your Google Sheets.'
        },
        requestId: req.requestId || 'unknown'
      })
    }
    res.status(500).json({ 
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to fetch Google Sheets',
        details: error.message
      },
      requestId: req.requestId || 'unknown'
    })
  }
})

/**
 * Get Google Calendar events
 * @route GET /api/google/calendar/events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} List of calendar events
 */
router.get('/google/calendar/events', requireAuth, async (req, res) => {
/**
 * @function GET /api/google/calendar/events
 * @description Lists calendar events for the authenticated user. Requires Google Calendar scope.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Object} JSON with array of events and nextPageToken
 * @throws {400} If session tokens are invalid
 * @throws {403} If Google Calendar scope is missing
 * @throws {500} On Google API or server error
 */
  try {
    // Validate session tokens
    const { z } = await import('zod')
    const tokensSchema = z.object({
      access_token: z.string().min(1),
      id_token: z.string().min(1)
    })
    const parseResult = tokensSchema.safeParse(req.session.tokens)
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          http: 400,
          message: 'Invalid session tokens',
          details: parseResult.error.errors.map(e => e.message).join(', ')
        },
        requestId: req.requestId || 'unknown'
      })
    }
    const client = new OAuth2Client()
    client.setCredentials(req.session.tokens)
    const calendar = google.calendar({ version: 'v3', auth: client })
    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    })
    res.json({
      events: data.items || [],
      nextPageToken: data.nextPageToken
    })
  } catch (error) {
    // Check if it's an OAuth scope issue
    if (error.code === 403 || error.message?.includes('scope')) {
      return res.status(403).json({ 
        error: {
          code: 'INSUFFICIENT_SCOPE',
          http: 403,
          message: 'Insufficient permissions. Google Calendar scope required.',
          details: 'The application needs Google Calendar permissions to access your events.'
        },
        requestId: req.requestId || 'unknown'
      })
    }
    res.status(500).json({ 
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to fetch calendar events',
        details: error.message
      },
      requestId: req.requestId || 'unknown'
    })
  }
})

/**
 * Get authenticated user details including groups, roles, and organization
 * US-003: Show Authenticated User Details
 * @route GET /api/user/details
 * @param {Object} req - Express request object with authenticated session
 * @param {Object} res - Express response object
 * @returns {Object} Comprehensive user details including organization, groups, and roles
 * @example
 * GET /api/user/details
 * Response: {
 *   "data": {
 *     "fullName": "John Doe",
 *     "email": "john@3ddiagnostix.com", 
 *     "groups": ["Engineering", "R&D"],
 *     "roles": ["engineer", "team_lead"],
 *     "orgUnit": "Software Development",
 *     "department": "Engineering",
 *     "twoStepEnabled": true
 *   }
 * }
 */
router.get('/user/details', requireAuth, async (req, res) => {
/**
 * @function GET /api/user/details
 * @description Returns comprehensive user details (Google + Casbin) for authenticated user.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Object} JSON with user details and requestId
 * @throws {400} If session user or tokens are invalid
 * @throws {404} If user not found in Casbin
 * @throws {500} On server error
 */
  try {
    // Validate session user and tokens
    const { z } = await import('zod')
    const userSchema = z.object({
      email: z.string().email(),
      name: z.string().min(1),
      picture: z.string().url().nullable().optional()
    })
    const tokensSchema = z.object({
      access_token: z.string().min(1),
      id_token: z.string().min(1)
    })
    const userParse = userSchema.safeParse(req.session.user)
    const tokensParse = tokensSchema.safeParse(req.session.tokens)
    if (!userParse.success || !tokensParse.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          http: 400,
          message: 'Invalid session user or tokens',
          details: [
            ...(userParse.error?.errors || []).map(e => e.message),
            ...(tokensParse.error?.errors || []).map(e => e.message)
          ].join(', ')
        },
        requestId: req.requestId || 'unknown'
      })
    }
    // Normalize email for matching
    const userEmail = (req.session.user.email || '').trim().toLowerCase();
    // Log user details access and debug
    console.log('[DEBUG] /api/user/details session email:', req.session.user.email);
    console.log('[DEBUG] /api/user/details normalized email:', userEmail);
    if (casbinService.usersData && casbinService.usersData.users) {
      console.log('[DEBUG] /api/user/details all user emails:', casbinService.usersData.users.map(u => u.email));
    }
    logUserAccess('details', {
      requestId: req.requestId,
      userEmail,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    // Get user info from Casbin service (mock data)
    let userInfo = casbinService.getUserInfo(userEmail);
    console.log('[DEBUG] /api/user/details getUserInfo result:', userInfo);
    if (!userInfo) {
      // Auto-add user with defaults
      const usersPath = require('path').join(__dirname, '../config/casbin/users.json');
      const usersData = JSON.parse(require('fs').readFileSync(usersPath, 'utf8'));
      const newUser = {
        email: userEmail,
        fullName: req.session.user.name || userEmail,
        groups: ['default'],
        orgUnit: 'General',
        roles: ['user'],
        twoStepEnabled: false,
        department: 'General'
      };
      usersData.users.push(newUser);
      require('fs').writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
      await casbinService.initialize();
      userInfo = newUser;
    }
    // Combine Google OAuth data with our user data
    const userDetails = {
      fullName: userInfo.fullName || req.session.user.name,
      email: userEmail,
      groups: userInfo.groups || [],
      orgUnit: userInfo.orgUnit || 'Unknown',
      roles: userInfo.roles || [],
      twoStepEnabled: userInfo.twoStepEnabled || false,
      department: userInfo.department || 'Unknown',
      picture: req.session.user.picture || null
    }
    console.log(`✅ User details retrieved for ${userEmail}`)
    req.logger?.info({
      userEmail,
      groups: userDetails.groups,
      orgUnit: userDetails.orgUnit
    }, 'User details retrieved successfully');
    res.json({
      data: userDetails,
      requestId: req.requestId || 'unknown'
    })
  } catch (error) {
    req.logger?.error({
      error: error.message,
      userEmail: req.session?.user?.email
    }, 'User details error');
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to fetch user details'
      },
      requestId: req.requestId || 'unknown'
    })
  }
})

/**
 * Get user permissions and rights based on Casbin policies
 * US-004: Display User Entitlements via Casbin
 * @route GET /api/user/rights
 * @param {Object} req - Express request object with authenticated session
 * @param {Object} res - Express response object
 * @returns {Object} User rights and permissions evaluated by Casbin
 * @example
 * GET /api/user/rights
 * Response: {
 *   "data": {
 *     "rights": [
 *       {"resource": "patient_data", "action": "read", "allowed": true},
 *       {"resource": "financial_reports", "action": "write", "allowed": false}
 *     ],
 *     "userEmail": "john@3ddiagnostix.com",
 *     "groups": ["Engineering"],
 *     "roles": ["engineer"],
 *     "evaluatedAt": "2025-10-08T10:00:00.000Z"
 *   }
 * }
 */
router.get('/user/rights', requireAuth, async (req, res) => {
/**
 * @function GET /api/user/rights
 * @description Returns user rights and permissions as evaluated by Casbin for authenticated user.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Object} JSON with rights, groups, roles, orgUnit, and requestId
 * @throws {400} If session user or tokens are invalid
 * @throws {404} If user not found in Casbin
 * @throws {500} On server error
 */
  try {
    // Validate session user and tokens
    const { z } = await import('zod')
    const userSchema = z.object({
      email: z.string().email(),
      name: z.string().min(1),
      picture: z.string().url().nullable().optional()
    })
    const tokensSchema = z.object({
      access_token: z.string().min(1),
      id_token: z.string().min(1)
    })
    const userParse = userSchema.safeParse(req.session.user)
    const tokensParse = tokensSchema.safeParse(req.session.tokens)
    if (!userParse.success || !tokensParse.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          http: 400,
          message: 'Invalid session user or tokens',
          details: [
            ...(userParse.error?.errors || []).map(e => e.message),
            ...(tokensParse.error?.errors || []).map(e => e.message)
          ].join(', ')
        },
        requestId: req.requestId || 'unknown'
      })
    }
    // Normalize email for matching
    const userEmail = (req.session.user.email || '').trim().toLowerCase();
    // Log authorization request and debug
    console.log('[DEBUG] /api/user/rights session email:', req.session.user.email);
    logUserAccess('rights', {
      requestId: req.requestId,
      userEmail,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    // Get user rights from Casbin
    let userRights = await casbinService.getUserRights(userEmail);
    console.log('[DEBUG] /api/user/rights getUserRights result:', userRights);
    if (!userRights.found) {
      // Auto-add user with defaults
      const usersPath = require('path').join(__dirname, '../config/casbin/users.json');
      const usersData = JSON.parse(require('fs').readFileSync(usersPath, 'utf8'));
      const newUser = {
        email: userEmail,
        fullName: req.session.user.name || userEmail,
        groups: ['default'],
        orgUnit: 'General',
        roles: ['user'],
        twoStepEnabled: false,
        department: 'General'
      };
      usersData.users.push(newUser);
      require('fs').writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
      await casbinService.initialize();
      userRights = await casbinService.getUserRights(userEmail);
    }
    // Log the authorization evaluation for audit
    req.logger?.info({
      userEmail,
      groups: userRights.groups,
      resourceCount: userRights.rights.length,
      resources: userRights.rights.map(r => r.resource)
    }, 'Authorization evaluation completed');
    res.json({
      data: {
        rights: userRights.rights,
        userEmail: userRights.userEmail,
        groups: userRights.groups,
        roles: userRights.roles,
        orgUnit: userRights.orgUnit,
        evaluatedAt: new Date().toISOString()
      },
      requestId: req.requestId || 'unknown'
    })
  } catch (error) {
    req.logger?.error({
      error: error.message,
      userEmail: req.session?.user?.email
    }, 'User rights error');
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to evaluate user rights'
      },
      requestId: req.requestId || 'unknown'
    })
  }
})

/**
 * Test authorization for specific resource and action
 * @route POST /api/authorize
 * @param {Object} req - Express request object with body containing resource and action
 * @param {string} req.body.resource - Resource identifier to check access for
 * @param {string} req.body.action - Action to check (read, write, delete, etc.)
 * @param {Object} res - Express response object
 * @returns {Object} Authorization result with decision and context
 * @example
 * POST /api/authorize
 * Body: { "resource": "patient_data", "action": "read" }
 * Response: {
 *   "data": {
 *     "allowed": true,
 *     "resource": "patient_data",
 *     "action": "read",
 *     "userEmail": "john@3ddiagnostix.com",
 *     "userGroups": ["Engineering"],
 *     "evaluatedAt": "2025-10-08T10:00:00.000Z"
 *   }
 * }
 */
router.post('/authorize', requireAuth, async (req, res) => {
/**
 * @function POST /api/authorize
 * @description Checks if authenticated user is allowed to perform an action on a resource (Casbin).
 * @param {import('express').Request} req - Express request object (body: resource, action)
 * @param {import('express').Response} res - Express response object
 * @returns {Object} JSON with authorization result and requestId
 * @throws {400} If request body is invalid
 * @throws {500} On server error
 */
  try {
    const { z } = await import('zod')
    const authorizeSchema = z.object({
      resource: z.string().min(1, 'Resource is required'),
      action: z.string().min(1, 'Action is required')
    })
    const parseResult = authorizeSchema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          http: 400,
          message: 'Invalid request parameters',
          details: parseResult.error.errors.map(e => e.message).join(', ')
        },
        requestId: req.requestId || 'unknown'
      })
    }
    const userEmail = req.session.user.email
    const { resource, action } = parseResult.data
    // Perform authorization check
    const authResult = await casbinService.authorize(userEmail, resource, action)
    res.json({
      data: {
        allowed: authResult.allowed,
        resource,
        action,
        userEmail,
        userGroups: authResult.userGroups,
        evaluatedAt: authResult.timestamp
      },
      requestId: req.requestId || 'unknown'
    })
  } catch (error) {
    console.error('❌ Authorization error:', error.message)
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to perform authorization check'
      },
      requestId: req.requestId || 'unknown'
    })
  }
})

/**
 * Get current session scopes and token info
 * @route GET /api/session/info
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Current session and token information
 */
router.get('/session/info', requireAuth, async (req, res) => {
/**
 * @function GET /api/session/info
 * @description Returns current session and token info for authenticated user.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Object} JSON with user, tokenInfo, sessionId, timestamp
 * @throws {500} On server error
 */
  try {
    const client = new OAuth2Client()
    client.setCredentials(req.session.tokens)

    // Try to get token info from Google
    let tokenInfo = null
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: client })
      const { data } = await oauth2.tokeninfo()
      tokenInfo = data
    } catch (error) {
      console.warn('Could not fetch token info:', error.message)
    }

    res.json({
      user: req.session.user,
      hasTokens: !!req.session.tokens,
      tokenInfo,
      sessionId: req.sessionID,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Session info error:', error)
    res.status(500).json({ 
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to fetch session info'
      },
      requestId: req.requestId || 'unknown'
    })
  }
})

/**
 * Health check endpoint for monitoring and status verification
 * @route GET /api/health
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} System health status and component information
 */
router.get('/health', async (req, res) => {
/**
 * @function GET /api/health
 * @description Returns system health status and metrics for monitoring.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Object} JSON with status, timestamp, uptime, memoryUsage, cpuUsage, requestId
 * @throws {500} On server error
 */
  try {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      requestId: req.requestId || 'unknown'
    })
  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({ 
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to perform health check'
      },
      requestId: req.requestId || 'unknown'
    })
  }
})

/**
 * Test endpoint for checking API status
 * @route GET /api/test
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Test message and server time
 */
router.get('/test', (req, res) => {
/**
 * @function GET /api/test
 * @description Returns a test message and server time for API status checks.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Object} JSON with message, timestamp, authenticated
 */
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    authenticated: !!req.session.user
  })
})

// =============================================================================
// ADMIN ENDPOINTS - Policy and User Management
// =============================================================================

console.log('🔧 Admin API routes loaded')

/**
 * Admin authentication middleware
 * Ensures the current user has admin privileges
 */
const requireAdmin = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        http: 401,
        message: 'Authentication required'
      },
      requestId: req.requestId || 'unknown'
    });
  }

  const userEmail = req.session.user.email;
  const isAdmin = casbinService.isUserAdmin(userEmail);

  if (!isAdmin) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN', 
        http: 403,
        message: 'Admin privileges required'
      },
      requestId: req.requestId || 'unknown'
    });
  }

  next();
};

/**
 * Get all users for admin management
 * @route GET /api/admin/users
 */
router.get('/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = casbinService.getAllUsers();
    const groups = casbinService.getAllGroups();
    const roles = casbinService.getAllRoles();

    logUserAccess('admin-users', {
      requestId: req.requestId,
      userEmail: req.session.user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      data: {
        users,
        groups,
        roles,
        totalUsers: users.length
      },
      requestId: req.requestId || 'unknown'
    });
  } catch (error) {
    req.logger?.error({
      error: error.message,
      userEmail: req.session?.user?.email
    }, 'Admin users fetch error');
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to fetch users'
      },
      requestId: req.requestId || 'unknown'
    });
  }
});

/**
 * Get all policies for admin management
 * @route GET /api/admin/policies
 */
router.get('/admin/policies', requireAuth, requireAdmin, async (req, res) => {
  try {
    const policies = await casbinService.getAllPolicies();
    const groupings = await casbinService.getUserGroups();

    logUserAccess('admin-policies', {
      requestId: req.requestId,
      userEmail: req.session.user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      data: {
        policies: policies.map(p => ({
          type: 'policy',
          subject: p[1],
          object: p[2], 
          action: p[3]
        })),
        groupings: groupings.map(g => ({
          type: 'grouping',
          user: g[0],
          group: g[1]
        })),
        totalPolicies: policies.length
      },
      requestId: req.requestId || 'unknown'
    });
  } catch (error) {
    req.logger?.error({
      error: error.message,
      userEmail: req.session?.user?.email
    }, 'Admin policies fetch error');
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to fetch policies'
      },
      requestId: req.requestId || 'unknown'
    });
  }
});

/**
 * Add a new policy
 * @route POST /api/admin/policies
 */
router.post('/admin/policies', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { subject, object, action } = req.body;

    if (!subject || !object || !action) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          http: 400,
          message: 'subject, object, and action are required'
        },
        requestId: req.requestId || 'unknown'
      });
    }

    const added = await casbinService.addPolicy(subject, object, action);

    logUserAccess('admin-policy-add', {
      requestId: req.requestId,
      userEmail: req.session.user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      policyAdded: { subject, object, action, success: added }
    });

    res.json({
      data: {
        added,
        policy: { subject, object, action }
      },
      requestId: req.requestId || 'unknown'
    });
  } catch (error) {
    req.logger?.error({
      error: error.message,
      userEmail: req.session?.user?.email
    }, 'Admin policy add error');
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to add policy'
      },
      requestId: req.requestId || 'unknown'
    });
  }
});

/**
 * Remove a policy
 * @route DELETE /api/admin/policies
 */
router.delete('/admin/policies', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { subject, object, action } = req.body;

    if (!subject || !object || !action) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          http: 400,
          message: 'subject, object, and action are required'
        },
        requestId: req.requestId || 'unknown'
      });
    }

    const removed = await casbinService.removePolicy(subject, object, action);

    logUserAccess('admin-policy-remove', {
      requestId: req.requestId,
      userEmail: req.session.user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      policyRemoved: { subject, object, action, success: removed }
    });

    res.json({
      data: {
        removed,
        policy: { subject, object, action }
      },
      requestId: req.requestId || 'unknown'
    });
  } catch (error) {
    req.logger?.error({
      error: error.message,
      userEmail: req.session?.user?.email
    }, 'Admin policy remove error');
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to remove policy'
      },
      requestId: req.requestId || 'unknown'
    });
  }
});

/**
 * Assign user to group
 * @route POST /api/admin/user-groups
 */
router.post('/admin/user-groups', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userEmail, group } = req.body;

    if (!userEmail || !group) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          http: 400,
          message: 'userEmail and group are required'
        },
        requestId: req.requestId || 'unknown'
      });
    }

    const added = await casbinService.addUserToGroup(userEmail, group);

    logUserAccess('admin-user-group-add', {
      requestId: req.requestId,
      userEmail: req.session.user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      assignment: { userEmail, group, success: added }
    });

    res.json({
      data: {
        added,
        assignment: { userEmail, group }
      },
      requestId: req.requestId || 'unknown'
    });
  } catch (error) {
    req.logger?.error({
      error: error.message,
      userEmail: req.session?.user?.email
    }, 'Admin user group assignment error');
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to assign user to group'
      },
      requestId: req.requestId || 'unknown'
    });
  }
});

/**
 * Remove user from group
 * @route DELETE /api/admin/user-groups
 */
router.delete('/admin/user-groups', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userEmail, group } = req.body;

    if (!userEmail || !group) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          http: 400,
          message: 'userEmail and group are required'
        },
        requestId: req.requestId || 'unknown'
      });
    }

    const removed = await casbinService.removeUserFromGroup(userEmail, group);

    logUserAccess('admin-user-group-remove', {
      requestId: req.requestId,
      userEmail: req.session.user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      assignment: { userEmail, group, success: removed }
    });

    res.json({
      data: {
        removed,
        assignment: { userEmail, group }
      },
      requestId: req.requestId || 'unknown'
    });
  } catch (error) {
    req.logger?.error({
      error: error.message,
      userEmail: req.session?.user?.email
    }, 'Admin user group removal error');
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to remove user from group'
      },
      requestId: req.requestId || 'unknown'
    });
  }
});

export default router

/**
 * Module: API routes
 * Exposes application API endpoints under /api/* and should be mounted by
 * the main Express app, e.g. app.use('/api', apiRouter)
 */
