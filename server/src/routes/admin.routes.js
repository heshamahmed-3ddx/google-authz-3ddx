import express from 'express';
import groupAccessService from '../services/groupAccess.service.js';

const router = express.Router();

/**
 * Middleware to check if user is super admin (member of SWD group)
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

    // Check if user is super admin using Casbin
    const isSuperAdmin = await groupAccessService.isSuperAdmin(userEmail);
    
    if (!isSuperAdmin) {
      logger?.warn('Forbidden admin access attempt - not authorized via Casbin', { 
        userEmail
      });
      return res.status(403).json({
        error: 'forbidden',
        message: 'You must be a super admin to access this resource'
      });
    }

    // User is super admin, proceed
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

export default router;
