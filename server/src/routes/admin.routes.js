import express from 'express';
import groupAccessService from '../services/groupAccess.service.js';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

/**
 * Middleware to check if user is super admin (member of SUPER_ADMIN_GROUP from .env)
 * Checks user's live Google Workspace groups from their session
 */
const requireSuperAdmin = async (req, res, next) => {
  const logger = req.logger;
  
  try {
    // Check if user is authenticated
    if (!req.session?.user?.email) {
      logger?.warn('Unauthorized admin access attempt - no session');
      return res.status(401).json({
        error: 'unauthorized',
        message: 'You must be logged in to access this resource'
      });
    }

    const userEmail = req.session.user.email;

    // Try to get user's Google Workspace groups from session first
    let userGroups = [];
    
    // Option 1: Groups already cached in session
    if (req.session.user.groups && Array.isArray(req.session.user.groups)) {
      userGroups = req.session.user.groups;
      logger?.debug('Using cached groups from session', { userEmail, groups: userGroups });
    } 
    // Option 2: Fetch from Google Directory API (live check)
    else if (req.session.tokens) {
      try {
        const client = new OAuth2Client();
        client.setCredentials(req.session.tokens);
        const admin = google.admin({ version: 'directory_v1', auth: client });
        const groupsRes = await admin.groups.list({ userKey: userEmail });
        userGroups = (groupsRes.data.groups || []).map(g => g.name);
        
        // Cache groups in session for next time
        req.session.user.groups = userGroups;
        
        logger?.debug('Fetched groups from Google Directory API', { userEmail, groups: userGroups });
      } catch (googleError) {
        logger?.warn('Failed to fetch groups from Google API', { 
          userEmail, 
          error: googleError.message 
        });
      }
    }
    
    // Check if user is super admin using their Google groups
    const isSuperAdmin = await groupAccessService.isSuperAdmin(userGroups.length > 0 ? userGroups : userEmail);
    
    if (!isSuperAdmin) {
      logger?.warn('Forbidden admin access attempt - not in super admin group', { 
        userEmail,
        userGroups,
        requiredGroup: process.env.SUPER_ADMIN_GROUP || 'SWD'
      });
      return res.status(403).json({
        error: 'forbidden',
        message: 'You must be a super admin to access this resource'
      });
    }

    // User is super admin, proceed
    logger?.debug('Super admin access granted', { userEmail, userGroups });
    next();
  } catch (error) {
    logger?.error('Error in super admin middleware', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      error: 'server_error',
      message: 'An error occurred while checking permissions'
    });
  }
};

/**
 * GET /admin/groups/allowed
 * 
 * Get list of allowed groups that can access the application.
 * Only super admin can access this endpoint.
 * 
 * Query Parameters:
 * - status: Filter by status (active/inactive) - optional
 * 
 * Response:
 * - 200: { success: true, groups: [...] }
 * - 401: { error: 'unauthorized', message: '...' }
 * - 403: { error: 'forbidden', message: '...' }
 * - 500: { error: 'server_error', message: '...' }
 */
router.get('/groups/allowed', requireSuperAdmin, async (req, res) => {
  const logger = req.logger;
  const { status } = req.query;

  try {
    const groups = await groupAccessService.getAllowedGroups(status);

    return res.json({
      success: true,
      groups
    });
  } catch (error) {
    logger?.error('Error fetching allowed groups', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      error: 'server_error',
      message: 'Failed to fetch allowed groups'
    });
  }
});

/**
 * POST /admin/groups/allowed
 * 
 * Add a new group to the allowed list.
 * Only super admin can access this endpoint.
 * 
 * Body:
 * - groupName: Name of the Google group (required)
 * 
 * Response:
 * - 200: { success: true, group: {...} }
 * - 400: { error: 'validation_error', message: '...' }
 * - 401: { error: 'unauthorized', message: '...' }
 * - 403: { error: 'forbidden', message: '...' }
 * - 409: { error: 'duplicate_error', message: '...' }
 * - 500: { error: 'server_error', message: '...' }
 */
router.post('/groups/allowed', requireSuperAdmin, async (req, res) => {
  const logger = req.logger;
  const { groupName } = req.body;
  const userEmail = req.session.user.email;

  // Validate required fields
  if (!groupName) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'Group name is required'
    });
  }

  try {
    const group = await groupAccessService.addAllowedGroup(
      groupName,
      userEmail
    );

    logger?.info('Group added to allowed list', {
      groupName,
      addedBy: userEmail
    });

    return res.json({
      success: true,
      group
    });
  } catch (error) {
    logger?.error('Error adding allowed group', {
      message: error.message,
      stack: error.stack,
      groupName
    });

    // Check if it's a duplicate error
    if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
      return res.status(409).json({
        error: 'duplicate_error',
        message: 'This group is already in the allowed list'
      });
    }

    return res.status(500).json({
      error: 'server_error',
      message: 'Failed to add group to allowed list'
    });
  }
});

/**
 * DELETE /admin/groups/allowed/:groupName
 * 
 * Remove a group from the allowed list.
 * Only super admin can access this endpoint.
 * 
 * Response:
 * - 200: { success: true, message: '...' }
 * - 401: { error: 'unauthorized', message: '...' }
 * - 403: { error: 'forbidden', message: '...' }
 * - 404: { error: 'not_found', message: '...' }
 * - 500: { error: 'server_error', message: '...' }
 */
router.delete('/groups/allowed/:groupName', requireSuperAdmin, async (req, res) => {
  const logger = req.logger;
  const { groupName } = req.params;
  const userEmail = req.session.user.email;

  try {
    const removed = await groupAccessService.removeAllowedGroup(groupName);

    if (!removed) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Group not found in allowed list'
      });
    }

    logger?.info('Group removed from allowed list', {
      groupName,
      removedBy: userEmail
    });

    return res.json({
      success: true,
      message: 'Group removed from allowed list'
    });
  } catch (error) {
    logger?.error('Error removing allowed group', {
      message: error.message,
      stack: error.stack,
      groupName
    });
    return res.status(500).json({
      error: 'server_error',
      message: 'Failed to remove group from allowed list'
    });
  }
});

/**
 * GET /admin/check
 * 
 * Check if current user is super admin (member of SWD group).
 * This endpoint can be accessed by any authenticated user.
 * 
 * Response:
 * - 200: { isSuperAdmin: true/false, groups: [...] }
 * - 401: { error: 'unauthorized', message: '...' }
 */
router.get('/check', async (req, res) => {
  const logger = req.logger;

  try {
    // Check if user is authenticated
    if (!req.session?.user?.email) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'You must be logged in'
      });
    }

    const userEmail = req.session.user.email;
    const userGroups = req.session.user.groups || [];
    const isSuperAdmin = groupAccessService.isSuperAdmin(userGroups);

    return res.json({
      isSuperAdmin,
      groups: userGroups
    });
  } catch (error) {
    logger?.error('Error checking super admin status', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      error: 'server_error',
      message: 'Failed to check admin status'
    });
  }
});

/**
 * GET /admin/policies
 * 
 * Get all Casbin policies
 * Only super admin can access this endpoint.
 */
router.get('/policies', requireSuperAdmin, async (req, res) => {
  const logger = req.logger;

  try {
    const { default: casbinService } = await import('../services/casbin.js');
    
    // Get all policies from Casbin
    const allPolicies = await casbinService.enforcer.getPolicy();
    
    // Format policies for frontend
    const policies = allPolicies.map(policy => ({
      subject: policy[0],
      object: policy[1],
      action: policy[2]
    }));

    logger?.info('Policies fetched', { count: policies.length });

    return res.json({
      success: true,
      policies
    });
  } catch (error) {
    logger?.error('Error fetching policies', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      error: 'server_error',
      message: 'Failed to fetch policies'
    });
  }
});

/**
 * POST /admin/policies
 * 
 * Add a new Casbin policy
 * Only super admin can access this endpoint.
 */
router.post('/policies', requireSuperAdmin, async (req, res) => {
  const logger = req.logger;
  const { subject, object, action } = req.body;

  if (!subject || !object || !action) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'Subject, object, and action are required'
    });
  }

  try {
    const { default: casbinService } = await import('../services/casbin.js');
    
    // Add policy to Casbin
    const added = await casbinService.enforcer.addPolicy(subject, object, action);
    
    if (!added) {
      return res.status(409).json({
        error: 'duplicate_error',
        message: 'This policy already exists'
      });
    }

    logger?.info('Policy added', { subject, object, action, addedBy: req.session.user.email });

    return res.json({
      success: true,
      policy: { subject, object, action }
    });
  } catch (error) {
    logger?.error('Error adding policy', {
      message: error.message,
      stack: error.stack,
      subject,
      object,
      action
    });
    return res.status(500).json({
      error: 'server_error',
      message: 'Failed to add policy'
    });
  }
});

/**
 * DELETE /admin/policies
 * 
 * Remove a Casbin policy
 * Only super admin can access this endpoint.
 */
router.delete('/policies', requireSuperAdmin, async (req, res) => {
  const logger = req.logger;
  const { subject, object, action } = req.body;

  if (!subject || !object || !action) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'Subject, object, and action are required'
    });
  }

  try {
    const { default: casbinService } = await import('../services/casbin.js');
    
    // Remove policy from Casbin
    const removed = await casbinService.enforcer.removePolicy(subject, object, action);
    
    if (!removed) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Policy not found'
      });
    }

    logger?.info('Policy removed', { subject, object, action, removedBy: req.session.user.email });

    return res.json({
      success: true,
      message: 'Policy removed successfully'
    });
  } catch (error) {
    logger?.error('Error removing policy', {
      message: error.message,
      stack: error.stack,
      subject,
      object,
      action
    });
    return res.status(500).json({
      error: 'server_error',
      message: 'Failed to remove policy'
    });
  }
});

export default router;
