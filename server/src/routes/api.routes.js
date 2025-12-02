
/**
 * @file api.routes.js
 * @description Express router for user data, Google OAuth, Casbin RBAC, and health endpoints with enhanced logging.
 * @author InsightHub Development Team
 * @created 2025-10-07
 * @copyright 2025 InsightHub. All rights reserved.
 *
 * This file defines all /api/* routes for the backend, including authentication, user details,
 * authorization, Google API integration, and system health. All endpoints use Zod validation and
 * standardized error responses. See Swagger spec for API contract.
 */

import { Router } from 'express'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import casbinService from '../services/casbin.js'
import { createContextLogger, logUserAccess, logSecurityEvent, logExternalService } from '../services/logger.js'
import { createErrorResponse, createApiResponse, getMessage } from '../services/messages.js'
import { VERSION } from '../config/version.js'
import CONFIG from '../config/config.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import surgicalGuideOrdersRoutes from './surgicalGuideOrders.routes.js'

// SWD-only page access middleware
const requireSWD = async (req, res, next) => {
  const userEmail = req.session.user?.email;
  if (!userEmail) {
    return res.status(401).json(createErrorResponse('auth_required', null, req.requestId));
  }
  try {
    // Enforce SWD group access to swd-page (read)
    const result = await casbinService.authorize(userEmail, 'swd-page', 'read');
    if (!result.allowed) {
      return res.status(403).json(createErrorResponse('forbidden', null, req.requestId));
    }
    next();
  } catch (error) {
    return res.status(500).json(createErrorResponse('casbin_error', error.message, req.requestId));
  }
};

const __filename = 'api.routes.js'
const __dirname = path.dirname(__filename)

const router = Router()
const logger = createContextLogger(__filename)

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
const requireAuth = async (req, res, next) => {
  // Why: Prevents access to protected endpoints if user is not authenticated or session is missing tokens.
  if (!req.session.user || !req.session.tokens) {
    logger.warn('Authentication required - missing user or tokens', {
      sessionId: req.sessionID,
      hasUser: !!req.session.user,
      hasTokens: !!req.session.tokens,
      ip: req.ip
    });
    
    const errorResponse = await createErrorResponse('auth_required', null, req.requestId);
    return res.status(401).json(errorResponse);
  }
  
  logger.info('Authentication successful', {
    userEmail: req.session.user.email,
    sessionId: req.sessionID
  });
  
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
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile from Google API
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
    logger.error('Profile fetch error', { error: error.message, stack: error.stack });
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
 * @swagger
 * /api/google/sheets/list:
 *   get:
 *     summary: List Google Sheets for authenticated user
 *     tags: [Google]
 *     responses:
 *       200:
 *         description: List of Google Sheets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sheets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                 nextPageToken:
 *                   type: string
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
 * @swagger
 * /api/google/calendar/events:
 *   get:
 *     summary: List Google Calendar events for authenticated user
 *     tags: [Google]
 *     responses:
 *       200:
 *         description: List of calendar events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                 nextPageToken:
 *                   type: string
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
// In-memory cache for user details and rights (5 minutes TTL)
const userDetailsCache = new Map();
const userRightsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Cache for group roles to avoid repeated API calls (10 minutes TTL)
const groupRolesCache = new Map();
const GROUP_ROLES_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

router.get('/user/details', requireAuth, async (req, res) => {
/**
 * @swagger
 * /api/user/details:
 *   get:
 *     summary: Get authenticated user details
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: includeGroupRoles
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Whether to include detailed group roles (slower, requires additional API calls)
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDetails'
 */
  try {
    // Check if group roles should be included (default: true for backward compatibility)
    const includeGroupRoles = req.query.includeGroupRoles !== 'false';
    // Validate session user and tokens
    const { z } = await import('zod')
    const userSchema = z.object({
      email: z.string().email(),
      name: z.string().min(1),
      picture: z.union([z.string().url(), z.string().length(0), z.null(), z.undefined()]).optional()
    })
    const tokensSchema = z.object({
      access_token: z.string().min(1),
      id_token: z.string().min(1)
    })
    const userParse = userSchema.safeParse(req.session.user)
    const tokensParse = tokensSchema.safeParse(req.session.tokens)
    if (!userParse.success || !tokensParse.success) {
      logger.warn('Session validation failed', {
        userParseErrors: userParse.error?.errors || [],
        tokensParseErrors: tokensParse.error?.errors || [],
        hasUser: !!req.session.user,
        hasTokens: !!req.session.tokens,
        userEmail: req.session?.user?.email
      });
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
    logUserAccess('details', {
      requestId: req.requestId,
      userEmail,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Check cache first
    const cacheKey = userEmail;
    const cached = userDetailsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      logger.info('Returning cached user details', { userEmail, age: Date.now() - cached.timestamp });
      return res.json({
        data: cached.data,
        requestId: req.requestId || 'unknown',
        cached: true
      });
    }

    // Fetch user info from Google Directory API
    let googleGroups = [];
    let googleOrgUnit = '';
    let googleRoles = [];
    let userGroupRoles = []; // Declare at proper scope
    let userRes = null;
    
    try {
      logger.info('Google Directory API sync started', { userEmail });
      
      const client = new OAuth2Client();
      client.setCredentials(req.session.tokens);
      const admin = google.admin({ version: 'directory_v1', auth: client });
      
      // Get user details using admin.users.get
      // Note: This requires admin privileges or domain-wide delegation
      try {
        userRes = await admin.users.get({ userKey: userEmail });
      } catch (adminError) {
        // If Admin SDK fails (e.g., insufficient permissions), fall back to userinfo API
        if (adminError.code === 400 || adminError.message?.includes('invalid_request') || 
            adminError.code === 403 || adminError.message?.includes('insufficient')) {
          logger.warn('Admin SDK access failed, falling back to userinfo API', {
            userEmail,
            error: adminError.message,
            code: adminError.code
          });
          
          // Fallback to userinfo API
          const oauth2 = google.oauth2({ version: 'v2', auth: client });
          const userInfoRes = await oauth2.userinfo.get();
          
          // Create a minimal userRes structure compatible with the rest of the code
          userRes = {
            data: {
              primaryEmail: userInfoRes.data.email,
              name: {
                fullName: userInfoRes.data.name,
                givenName: userInfoRes.data.given_name,
                familyName: userInfoRes.data.family_name
              },
              emails: [{ address: userInfoRes.data.email, primary: true }],
              photos: userInfoRes.data.picture ? [{ value: userInfoRes.data.picture }] : [],
              orgUnitPath: '',
              suspended: false,
              archived: false
            }
          };
          
          logger.info('Using userinfo API fallback', { userEmail });
        } else {
          // Re-throw if it's a different error
          throw adminError;
        }
      }
      
      // Log the full user response to see what's available
      logger.info('Google user data retrieved', {
        userEmail,
        hasCustomSchemas: !!userRes.data.customSchemas,
        allFields: Object.keys(userRes.data),
        orgUnitPath: userRes.data.orgUnitPath
      });
      
      logExternalService('Google Directory API', 'user details fetch', 'success', {
        userEmail,
        orgUnit: userRes.data.orgUnitPath,
        userAgent: req.get('User-Agent')
      });
      
      // Strip leading slash from orgUnitPath
      const orgUnitPath = userRes.data.orgUnitPath || '';
      googleOrgUnit = orgUnitPath.startsWith('/') ? orgUnitPath.slice(1) : orgUnitPath;
      
      // Get user groups and fetch the actual role in each group
      let groupsRes;
      try {
        groupsRes = await admin.groups.list({ userKey: userEmail });
        
        logExternalService('Google Directory API', 'groups list fetch', 'success', {
          userEmail,
          groupsCount: groupsRes.data.groups?.length || 0
        });
      } catch (groupErr) {
        logger.warn('Google Directory API group fetch error', { error: groupErr.message, userEmail });
        logExternalService('Google Directory API', 'groups list fetch', 'failed', {
          userEmail,
          error: groupErr.message
        });
        groupsRes = { data: { groups: [] } };
      }
      
      // Only return group names (no roles)
      googleGroups = Array.isArray(groupsRes.data.groups) ? groupsRes.data.groups.map(g => g?.name || null).filter(Boolean) : [];
      
      // Fetch detailed group information and find current user's role in each group
      // OPTIMIZED: Fetch all group members in parallel + use caching
      // This reduces API calls from O(n) sequential to O(n) parallel
      // Can be disabled via ?includeGroupRoles=false query parameter for faster response
      if (includeGroupRoles && Array.isArray(groupsRes.data.groups) && groupsRes.data.groups.length > 0) {
        // Check cache first for group roles
        const groupRolesCacheKey = `${userEmail}:${groupsRes.data.groups.map(g => g.email).sort().join(',')}`;
        const cachedGroupRoles = groupRolesCache.get(groupRolesCacheKey);
        
        if (cachedGroupRoles && (Date.now() - cachedGroupRoles.timestamp) < GROUP_ROLES_CACHE_TTL) {
          logger.info('Using cached group roles', { 
            userEmail, 
            groupsCount: groupsRes.data.groups.length,
            rolesCount: cachedGroupRoles.data.length
          });
          userGroupRoles = cachedGroupRoles.data;
        } else {
          // Fetch all group members in parallel for better performance
          const groupMemberPromises = groupsRes.data.groups
            .filter(group => group?.email)
            .map(async (group) => {
              try {
                // Only fetch members list (we don't need group details for role lookup)
                const members = await admin.members.list({ groupKey: group.email });
                
                logger.debug('Group membership details retrieved', { 
                  userEmail,
                  groupName: group.name, 
                  groupEmail: group.email,
                  memberCount: members.data.members?.length || 0
                });
                
                // Find current logged-in user's role in this group
                if (members.data.members) {
                  const currentUserMember = members.data.members.find(member => 
                    member.email && member.email.toLowerCase() === userEmail.toLowerCase()
                  );
                  
                  if (currentUserMember) {
                    const userRole = currentUserMember.role || 'MEMBER';
                    return {
                      groupName: group.name,
                      groupEmail: group.email,
                      userRole: userRole
                    };
                  }
                }
                return null;
              } catch (groupDetailErr) {
                logger.warn('Failed to fetch group members', { 
                  groupName: group.name, 
                  groupEmail: group.email,
                  error: groupDetailErr.message 
                });
                return null;
              }
            });
          
          // Wait for all group member fetches to complete in parallel
          const groupRoleResults = await Promise.all(groupMemberPromises);
          userGroupRoles = groupRoleResults.filter(Boolean); // Remove null results
          
          // Cache the results
          groupRolesCache.set(groupRolesCacheKey, {
            data: userGroupRoles,
            timestamp: Date.now()
          });
          
          logger.info('Group roles fetched in parallel and cached', {
            userEmail,
            totalGroups: groupsRes.data.groups.length,
            rolesFound: userGroupRoles.length
          });
        }
      }
      
      // Extract roles from all groups (only if group roles were fetched)
      if (includeGroupRoles) {
        googleRoles = userGroupRoles.map(gr => gr.userRole);
        logger.info('User roles extracted from Google groups', { 
          userEmail, 
          roles: googleRoles,
          groupCount: googleGroups.length,
          roleCount: googleRoles.length
        });
      } else {
        logger.info('Group roles skipped for performance', { 
          userEmail, 
          groupCount: googleGroups.length
        });
      }
      
      // Sync with Casbin - update user's groups and roles
      try {
        logger.info('Casbin synchronization started', {
          userEmail,
          groups: googleGroups,
          roles: googleRoles,
          orgUnit: googleOrgUnit
        });
        
        await casbinService.syncUserFromGoogle(userEmail, {
          fullName: req.session.user.name,
          groups: googleGroups,
          roles: googleRoles,
          orgUnit: googleOrgUnit,
          department: userRes?.data?.department || null,
          userGroupRoles: userGroupRoles
        });
        
        logger.info('Casbin synchronization completed successfully', { 
          userEmail,
          syncedGroups: googleGroups.length,
          syncedRoles: googleRoles.length
        });
      } catch (casbinErr) {
        logger.error('Casbin synchronization failed', { 
          userEmail, 
          error: casbinErr.message,
          stack: casbinErr.stack
        });
      }
    } catch (err) {
      logger.error('Google Directory API integration failed', { 
        userEmail, 
        error: err.message,
        errorCode: err.code,
        errorDetails: err.response?.data,
        stack: err.stack
      });
      
      logExternalService('Google Directory API', 'user sync', 'failed', {
        userEmail,
        error: err.message,
        errorCode: err.code
      });
      
      // Check if it's a token expiration or authentication error
      if (err.code === 401 || err.code === 403 || err.message?.includes('invalid_grant') || 
          err.message?.includes('token') || err.message?.includes('expired') ||
          err.message?.includes('Invalid Credentials') || err.message?.includes('unauthorized')) {
        return res.status(401).json({
          error: {
            code: 'TOKEN_EXPIRED',
            http: 401,
            message: 'Authentication tokens have expired. Please sign in again.',
            details: 'Your session has expired. Please refresh the page and sign in again.'
          },
          requestId: req.requestId || 'unknown'
        });
      }
      
      // Check if it's an invalid_request error (usually means insufficient permissions or wrong request format)
      if (err.code === 400 || err.message?.includes('invalid_request')) {
        const errorDetails = err.response?.data?.error?.message || err.message;
        return res.status(400).json({
          error: {
            code: 'GOOGLE_API_ERROR',
            http: 400,
            message: 'Failed to fetch user details from Google Directory API',
            details: errorDetails || 'Invalid request. This may be due to insufficient permissions. The Admin Directory API requires admin privileges or domain-wide delegation to be configured.',
            hint: 'If you are not a Google Workspace admin, the application may need to be configured with domain-wide delegation to access user directory information.'
          },
          requestId: req.requestId || 'unknown'
        });
      }
      
      return res.status(500).json({
        error: {
          code: 'GOOGLE_API_ERROR',
          http: 500,
          message: 'Failed to fetch user details from Google Directory API',
          details: err.message || 'An unexpected error occurred while fetching user details'
        },
        requestId: req.requestId || 'unknown'
      });
    }

    // Extract all user information from Google Directory API
    const userData = userRes?.data || {};
    
    // Extract Employee ID from externalIds (organization type)
    let employeeId = null;
    if (userData.externalIds && Array.isArray(userData.externalIds)) {
      const orgId = userData.externalIds.find(id => id.type === 'organization');
      employeeId = orgId?.value || null;
      logger.info('Extracted Employee ID from externalIds', {
        userEmail,
        employeeId,
        externalIds: userData.externalIds
      });
    }
    
    // Extract Job Title and Employee Type from organizations
    let jobTitle = null;
    let employeeType = null;
    if (userData.organizations && Array.isArray(userData.organizations)) {
      const primaryOrg = userData.organizations.find(org => org.primary === true) || userData.organizations[0];
      if (primaryOrg) {
        jobTitle = primaryOrg.title || null;
        employeeType = primaryOrg.customType || primaryOrg.type || null;
        logger.info('Extracted job info from organizations', {
          userEmail,
          jobTitle,
          employeeType,
          organizations: userData.organizations
        });
      }
    }
    
    // Also check custom schemas as fallback
    let customSchemaData = {};
    if (userData.customSchemas && Object.keys(userData.customSchemas).length > 0) {
      logger.info('Custom schemas found - full structure', {
        userEmail,
        schemaKeys: Object.keys(userData.customSchemas),
        fullCustomSchemas: JSON.stringify(userData.customSchemas, null, 2)
      });
      
      // Check for "Employee information" schema
      const employeeSchema = userData.customSchemas['Employee information'] || 
                            userData.customSchemas['Employee Information'] ||
                            userData.customSchemas['employee information'];
      
      if (employeeSchema) {
        logger.info('Found Employee information schema', {
          userEmail,
          fields: Object.keys(employeeSchema)
        });
        
        // Extract all employee information fields from custom schema
        customSchemaData = {
          employeeId: employeeSchema['Employee ID'] || employeeId,
          jobTitle: employeeSchema['Job title'] || jobTitle,
          type: employeeSchema['Type of employee'] || employeeType,
          managerEmail: employeeSchema["Manager's email"] || employeeSchema['Manager email'] || null,
          department: employeeSchema['Department'] || null,
          costCenter: employeeSchema['Cost center'] || null,
          buildingId: employeeSchema['Building id'] || null,
          floorName: employeeSchema['Floor name'] || null,
          floorSection: employeeSchema['Floor section'] || null,
          ...employeeSchema
        };
        
        // Override with custom schema values if they exist
        employeeId = customSchemaData.employeeId || employeeId;
        jobTitle = customSchemaData.jobTitle || jobTitle;
        employeeType = customSchemaData.type || employeeType;
      }
    }
    
    logger.info('Final employee information extracted', {
      userEmail,
      employeeId,
      jobTitle,
      employeeType
    });
    
    // Extract contact information from Google Directory API
    let phones = [];
    let addresses = [];
    let secondaryEmails = [];
    
    if (userData.phones && Array.isArray(userData.phones)) {
      phones = userData.phones.map(phone => ({
        type: phone.type || 'unknown',
        value: phone.value || null,
        primary: phone.primary || false
      }));
      logger.info('Extracted phones', { userEmail, phones });
    }
    
    if (userData.addresses && Array.isArray(userData.addresses)) {
      addresses = userData.addresses.map(address => ({
        type: address.type || 'unknown',
        formatted: address.formatted || null,
        streetAddress: address.streetAddress || null,
        locality: address.locality || null,
        region: address.region || null,
        postalCode: address.postalCode || null,
        country: address.country || null,
        primary: address.primary || false
      }));
      logger.info('Extracted addresses', { userEmail, addresses });
    }
    
    if (userData.emails && Array.isArray(userData.emails)) {
      secondaryEmails = userData.emails
        .filter(email => !email.primary)
        .map(email => ({
          address: email.address || null,
          type: email.type || email.customType || 'unknown'
        }));
      logger.info('Extracted secondary emails', { userEmail, secondaryEmails });
    }
    
    // Build comprehensive user details with all Google Directory API fields
    const userDetails = {
      // Basic profile
      fullName: userData.name?.fullName || req.session.user.name,
      givenName: userData.name?.givenName || null,
      familyName: userData.name?.familyName || null,
      email: userEmail,
      primaryEmail: userData.primaryEmail || userEmail,
      
      // IDs
      id: userData.id || null,
      customerId: userData.customerId || null,
      
      // Status and flags
      suspended: userData.suspended || false,
      archived: userData.archived || false,
      changePasswordAtNextLogin: userData.changePasswordAtNextLogin || false,
      ipWhitelisted: userData.ipWhitelisted || false,
      isAdmin: userData.isAdmin || false,
      isDelegatedAdmin: userData.isDelegatedAdmin || false,
      isEnforcedIn2Sv: userData.isEnforcedIn2Sv || false,
      isEnrolledIn2Sv: userData.isEnrolledIn2Sv || false,
      isMailboxSetup: userData.isMailboxSetup || false,
      
      // Organizational info
      orgUnit: googleOrgUnit,
      orgUnitPath: userData.orgUnitPath || null,
      
      // Dates
      creationTime: userData.creationTime || null,
      lastLoginTime: userData.lastLoginTime || null,
      
      // Contact info
      recoveryEmail: userData.recoveryEmail || null,
      recoveryPhone: userData.recoveryPhone || null,
      
      // Additional fields
      includeInGlobalAddressList: userData.includeInGlobalAddressList !== false,
      
      // Groups
      groups: googleGroups,
      groupRoles: userGroupRoles, // Array of { groupName, groupEmail, userRole }
      
      // Custom schema data (Employee information)
      customSchemas: customSchemaData,
      
      // Employee information fields (extracted from Google Directory API and custom schemas)
      employeeId: employeeId,
      jobTitle: jobTitle,
      type: employeeType,
      managerEmail: customSchemaData.managerEmail || null,
      department: customSchemaData.department || userData.department || null,
      costCenter: customSchemaData.costCenter || null,
      buildingId: customSchemaData.buildingId || null,
      floorName: customSchemaData.floorName || null,
      floorSection: customSchemaData.floorSection || null,
      
      // Contact information (from Google Directory API standard fields)
      phones: phones,
      addresses: addresses,
      secondaryEmails: secondaryEmails,
      
      // Profile picture
      picture: req.session.user.picture || userData.thumbnailPhotoUrl || null,
      
      // All other data from Google (for completeness)
      ...userData
    };
    
    logger.info('Complete user details retrieved successfully', {
      userEmail,
      hasCustomSchemas: Object.keys(customSchemaData).length > 0,
      totalFields: Object.keys(userDetails).length,
      groups: userDetails.groups,
      orgUnit: userDetails.orgUnit,
      employeeId: userDetails.employeeId,
      jobTitle: userDetails.jobTitle,
      type: userDetails.type,
      isAdmin: userDetails.isAdmin
    });
    
    // Cache the result
    userDetailsCache.set(cacheKey, {
      data: userDetails,
      timestamp: Date.now()
    });
    
    res.json({
      data: userDetails,
      requestId: req.requestId || 'unknown'
    });
  } catch (error) {
    const userEmail = req.session?.user?.email || 'unknown';
    logger.error('User details error', {
      error: error.message,
      errorCode: error.code,
      stack: error.stack,
      userEmail,
      hasSession: !!req.session,
      hasUser: !!req.session?.user,
      hasTokens: !!req.session?.tokens,
      requestId: req.requestId || 'unknown'
    });
    
    // Check if it's a token expiration error
    if (error.code === 401 || error.message?.includes('invalid_grant') || error.message?.includes('token') || error.message?.includes('expired')) {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          http: 401,
          message: 'Authentication tokens have expired. Please sign in again.',
          details: 'Your session has expired. Please refresh the page and sign in again.'
        },
        requestId: req.requestId || 'unknown'
      });
    }
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to fetch user details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
 * @swagger
 * /api/user/rights:
 *   get:
 *     summary: Get user rights and permissions
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User rights and permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rights:
 *                   type: array
 *                   items:
 *                     type: object
 *                 userEmail:
 *                   type: string
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: string
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                 orgUnit:
 *                   type: string
 *                 evaluatedAt:
 *                   type: string
 *                   format: date-time
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
    
    // Check if force refresh is requested
    const forceRefresh = req.query.refresh === 'true';
    
    // Check cache first (unless force refresh)
    const cacheKey = userEmail;
    const cached = userRightsCache.get(cacheKey);
    // Increase cache TTL to 30 minutes
    const CACHE_TTL_OVERRIDE = 30 * 60 * 1000;
    if (!forceRefresh && cached && (Date.now() - cached.timestamp) < CACHE_TTL_OVERRIDE) {
      logger.debug('User rights served from cache', { userEmail });
      return res.json({
        data: {
          ...cached.data,
          cached: true
        },
        requestId: req.requestId || 'unknown'
      });
    }
    
    if (forceRefresh) {
      logger.info('Force refresh requested, bypassing cache', { userEmail });
    }
    
    // Log authorization request and debug
    logger.debug('User rights endpoint accessed', { userEmail: req.session.user.email });
    logUserAccess('rights', {
      requestId: req.requestId,
      userEmail,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  // Get user rights from Casbin using live Google session data
  // Only use Google-fetched groups/roles for Casbin rights
  let googleGroups = [];
  let googleRoles = [];
  try {
    const client = new OAuth2Client();
    client.setCredentials(req.session.tokens);
    const admin = google.admin({ version: 'directory_v1', auth: client });
    const groupsRes = await admin.groups.list({ userKey: userEmail });
    googleGroups = (groupsRes.data.groups || []).map(g => g.name);
    const userRes = await admin.users.get({ userKey: userEmail });
    if (userRes.data.customSchemas && userRes.data.customSchemas.Roles) {
      googleRoles = userRes.data.customSchemas.Roles.values || [];
    }
  } catch (err) {
    logger.warn('Google Directory API error during rights fetch', { userEmail, error: err.message });
  }
  // Build a Google-only user object for Casbin
  const googleUser = {
    email: userEmail,
    name: req.session.user.name,
    groups: googleGroups,
    roles: googleRoles,
    orgUnit: null,
    department: null,
    twoStepEnabled: false,
    picture: req.session.user.picture || null
  };
  let userRights = await casbinService.getUserRights(userEmail, googleUser);
    logger.debug('User rights retrieved from Casbin', { userEmail, found: userRights.found });
    if (!userRights.found) {
      // Auto-add user with defaults (async, non-blocking)
      const usersPath = path.join(__dirname, '../config/casbin/users.json');
      let googleRoles = [];
      let googleGroupsWithRoles = [];
      const newUser = {
        email: userEmail,
        fullName: req.session.user.name || userEmail,
        groups: ['default'],
        orgUnit: 'General',
        roles: ['user'],
        twoStepEnabled: false,
        department: 'General'
      };
      (async () => {
        let usersData = { users: [] };
        try {
          usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        } catch (err) {
          usersData = { users: [] };
        }
        usersData.users.push(newUser);
        fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
        await casbinService.initialize();
      })();
      // Return minimal rights for now, will be correct on next request
      userRights = { userEmail, found: false, rights: [], groups: [], roles: [] };
    }
    // Log the authorization evaluation for audit
    req.logger?.info({
      userEmail,
      groups: userRights.groups,
      resourceCount: userRights.rights.length,
      resources: userRights.rights.map(r => r.resource)
    }, 'Authorization evaluation completed');
    
    // Prepare response data
    const responseData = {
      rights: userRights.rights,
      userEmail: userRights.userEmail,
      groups: userRights.groups,
      roles: userRights.roles,
      orgUnit: userRights.orgUnit,
      evaluatedAt: new Date().toISOString()
    };
    
    // Store in cache
    userRightsCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    res.json({
      data: responseData,
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
 * @swagger
 * /api/authorize:
 *   post:
 *     summary: Check authorization for resource/action
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resource:
 *                 type: string
 *               action:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authorization result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 allowed:
 *                   type: boolean
 *                 resource:
 *                   type: string
 *                 action:
 *                   type: string
 *                 userEmail:
 *                   type: string
 *                 userGroups:
 *                   type: array
 *                   items:
 *                     type: string
 *                 evaluatedAt:
 *                   type: string
 *                   format: date-time
 */
  try {
    const { z } = await import('zod')
    const authorizeSchema = z.object({
      resource: z.string().min(1, 'Resource is required'),
      action: z.string().min(1, 'Action is required')
    })
    const parseResult = authorizeSchema.safeParse(req.body)
    if (!parseResult.success) {
      logger.warn('Authorization request validation failed', {
        userEmail: req.session.user.email,
        errors: parseResult.error.errors.map(e => e.message),
        requestBody: req.body
      });
      
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
    
    logger.info('Authorization request received', {
      userEmail,
      resource,
      action,
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Log access attempt for audit trail
    logUserAccess('authorization_check', {
      userEmail,
      resource,
      action,
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
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
    logger.error('Authorization error', { error: error.message, stack: error.stack });
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
      logger.warn('Could not fetch token info', { error: error.message });
    }

    res.json({
      user: req.session.user,
      hasTokens: !!req.session.tokens,
      tokenInfo,
      sessionId: req.sessionID,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Session info error', { error: error.message, stack: error.stack });
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
    logger.error('Health check error', { error: error.message, stack: error.stack });
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
 * Debug endpoint to see current user email (temporary)
 * @route GET /api/debug/user-email
 */
router.get('/debug/user-email', requireAuth, async (req, res) => {
  res.json({
    email: req.session.user.email,
    normalizedEmail: (req.session.user.email || '').trim().toLowerCase(),
    sessionUser: req.session.user,
    timestamp: new Date().toISOString()
  });
});

/**
 * Debug endpoint to test Casbin permissions directly
 * @route GET /api/debug/casbin-test
 */
router.get('/debug/casbin-test', requireAuth, async (req, res) => {
  try {
    const userEmail = req.session.user.email;
    
    // Test basic authorization
    const testCases = [
      { resource: 'invoices', action: 'read' },
      { resource: 'projects', action: 'read' },
      { resource: 'reports', action: 'read' },
      { resource: 'dashboard', action: 'read' }
    ];
    
    const results = [];
    for (const test of testCases) {
      try {
        const authResult = await casbinService.authorize(userEmail, test.resource, test.action);
        results.push({
          resource: test.resource,
          action: test.action,
          allowed: authResult.allowed,
          userGroups: authResult.userGroups
        });
      } catch (error) {
        results.push({
          resource: test.resource,
          action: test.action,
          error: error.message
        });
      }
    }
    
    // Also test getUserRights
    let userRights = null;
    try {
      userRights = await casbinService.getUserRights(userEmail);
    } catch (error) {
      userRights = { error: error.message };
    }
    
    res.json({
      userEmail,
      authorizationTests: results,
      userRights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Debug endpoint to clear user rights cache and reload Casbin
 * @route POST /debug/clear-cache
 */
router.post('/debug/clear-cache', async (req, res) => {
  try {
    // Clear the user rights cache
    userRightsCache.clear();
    userDetailsCache.clear();
    
    // Reload Casbin enforcer from policy.csv
    await casbinService.initialize();
    
    logger.info('Cache cleared and Casbin reloaded');
    
    res.json({
      success: true,
      message: 'Cache cleared and Casbin enforcer reloaded',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to clear cache and reload', { error: error.message });
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

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

logger.info('Admin API routes loaded');

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

/**
 * Get Casbin performance metrics
 * @route GET /api/admin/casbin/metrics
 */
router.get('/admin/casbin/metrics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const metrics = casbinService.getMetrics();
    
    if (!metrics) {
      return res.json({
        data: {
          message: 'Metrics not available (not using enhanced adapter)',
          metrics: null
        },
        requestId: req.requestId || 'unknown'
      });
    }

    res.json({
      data: {
        metrics,
        timestamp: new Date().toISOString()
      },
      requestId: req.requestId || 'unknown'
    });
  } catch (error) {
    req.logger?.error({
      error: error.message,
      userEmail: req.session?.user?.email
    }, 'Failed to get Casbin metrics');
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to get metrics'
      },
      requestId: req.requestId || 'unknown'
    });
  }
});

/**
 * Reset Casbin performance metrics
 * @route POST /api/admin/casbin/metrics/reset
 */
router.post('/admin/casbin/metrics/reset', requireAuth, requireAdmin, async (req, res) => {
  try {
    casbinService.resetMetrics();
    
    res.json({
      data: {
        message: 'Metrics reset successfully'
      },
      requestId: req.requestId || 'unknown'
    });
  } catch (error) {
    req.logger?.error({
      error: error.message,
      userEmail: req.session?.user?.email
    }, 'Failed to reset metrics');
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to reset metrics'
      },
      requestId: req.requestId || 'unknown'
    });
  }
});

/**
 * Invalidate Casbin policy cache
 * @route POST /api/admin/casbin/cache/invalidate
 */
router.post('/admin/casbin/cache/invalidate', requireAuth, requireAdmin, async (req, res) => {
  try {
    casbinService.invalidateCache();
    
    res.json({
      data: {
        message: 'Cache invalidated successfully'
      },
      requestId: req.requestId || 'unknown'
    });
  } catch (error) {
    req.logger?.error({
      error: error.message,
      userEmail: req.session?.user?.email
    }, 'Failed to invalidate cache');
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to invalidate cache'
      },
      requestId: req.requestId || 'unknown'
    });
  }
});

/**
 * Reload policies from database
 * @route POST /api/admin/casbin/reload
 */
router.post('/admin/casbin/reload', requireAuth, requireAdmin, async (req, res) => {
  try {
    await casbinService.reloadPolicies();
    
    res.json({
      data: {
        message: 'Policies reloaded successfully'
      },
      requestId: req.requestId || 'unknown'
    });
  } catch (error) {
    req.logger?.error({
      error: error.message,
      userEmail: req.session?.user?.email
    }, 'Failed to reload policies');
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        http: 500,
        message: 'Failed to reload policies'
      },
      requestId: req.requestId || 'unknown'
    });
  }
});

/**
 * Development-only endpoint to get Casbin state for debugging
 * GET /api/dev/casbin-state
 * 
 * @description Returns current Casbin state for the authenticated user, including
 * groups, roles, and permissions. Only available in development mode.
 * @access Private (requires authentication + development mode)
 * @returns {Object} Casbin state information for debugging
 */
router.get('/dev/casbin-state', requireAuth, async (req, res) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json(createErrorResponse(
        'NOT_FOUND',
        404,
        'Endpoint not available in production'
      ));
    }

    const userEmail = req.session.user.email;
    
    logger.info('Fetching Casbin state for development panel', {
      userEmail,
      requestId: req.requestId
    });

    // Get user's groups and roles from Casbin
    let userGroups = [];
    let userRoles = [];
    
    try {
      userGroups = await casbinService.getUserGroups(userEmail);
    } catch (error) {
      logger.warn('Failed to get user groups', { userEmail, error: error.message });
    }
    
    try {
      userRoles = await casbinService.getUserRoles(userEmail);
    } catch (error) {
      logger.warn('Failed to get user roles', { userEmail, error: error.message });
    }
    
    // Get permissions for common resources/actions
    const allPermissions = [];
    const resources = ['files', 'admin', 'users', 'reports']; // Common resources
    const actions = ['read', 'write', 'delete', 'admin']; // Common actions
    
    for (const resource of resources) {
      for (const action of actions) {
        try {
          const hasPermission = await casbinService.enforce(userEmail, resource, action);
          if (hasPermission) {
            allPermissions.push({ resource, action });
          }
        } catch (error) {
          logger.warn('Failed to check permission', { 
            userEmail, 
            resource, 
            action, 
            error: error.message 
          });
        }
      }
    }

    const casbinState = {
      user: userEmail,
      groups: userGroups,
      roles: userRoles,
      permissions: allPermissions,
      timestamp: new Date().toISOString()
    };

    logger.info('Casbin state retrieved successfully', {
      userEmail,
      groupCount: userGroups.length,
      roleCount: userRoles.length,
      permissionCount: allPermissions.length,
      requestId: req.requestId
    });

    res.json(createApiResponse(casbinState, 'Casbin state retrieved successfully'));

  } catch (error) {
    logger.error('Failed to fetch Casbin state', {
      error: error.message,
      stack: error.stack,
      userEmail: req.session?.user?.email,
      requestId: req.requestId
    });

    res.status(500).json(createErrorResponse(
      'INTERNAL_ERROR',
      500,
      'Failed to fetch Casbin state'
    ));
  }
});

// ========================================
// SURGICAL GUIDE REPORT ROUTES
// ========================================
// Mount surgical guide report routes at /api/reports/*
router.use('/reports', surgicalGuideOrdersRoutes);

export default router

// --- SWD-only protected endpoint example ---
// GET /api/swd-page
router.get('/swd-page', requireAuth, requireSWD, (req, res) => {
  res.json(createApiResponse({ message: 'Welcome to the SWD-only page!' }, 'Access granted'));
});

/**
 * Module: API routes
 * Exposes application API endpoints under /api/* and should be mounted by
 * the main Express app, e.g. app.use('/api', apiRouter)
 */
