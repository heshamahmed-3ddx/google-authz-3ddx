/**
 * @file groupAccess.service.js
 * @description Service for managing Google group-based access control using Casbin
 * 
 * Uses Casbin enforcer for all authorization checks:
 * - Allowed groups: p, allowed_group, <group_name>, access
 * - Super admin checks: uses Casbin authorize() for 'admin-resource'
 * - Group membership: stored in Casbin via syncUserFromGoogle()
 */

import databaseService from './database.js';
import CONFIG from '../config/config.js';
import { createContextLogger } from './logger.js';

const logger = createContextLogger('groupAccess.service.js');

// Lazy load casbin service to avoid circular dependency
let _casbinService = null;
async function getCasbinService() {
  if (!_casbinService) {
    const module = await import('./casbin.js');
    _casbinService = module.default;
  }
  return _casbinService;
}

/**
 * Check if user has access to the application using Casbin
 * @param {string} userEmail - User's email address
 * @returns {Promise<boolean>}
 */
export async function hasAccess(userEmail) {
  try {
    if (!userEmail) {
      logger.warn('No user email provided');
      return false;
    }

    const casbinService = await getCasbinService();
    
    // Use Casbin to check if user can access 'application'
    // This will check if user is in any allowed group through Casbin's group mappings
    const result = await casbinService.authorize(userEmail, 'application', 'access');
    
    logger.debug('Application access check via Casbin', {
      userEmail,
      allowed: result.allowed
    });
    
    return result.allowed;
  } catch (error) {
    logger.error('Error checking application access via Casbin', {
      userEmail,
      message: error.message,
      stack: error.stack
    });
    // Fail closed - deny access on error
    return false;
  }
}

/**
 * Get all allowed groups
 * @returns {Promise<Array>}
 */
export async function getAllowedGroups() {
  try {
    const query = `
      SELECT v1 as group_name, created_at, updated_at
      FROM casbin_rule
      WHERE ptype = 'p' 
      AND v0 = 'allowed_group'
      AND v2 = 'access'
      ORDER BY v1
    `;
    
    const groups = await databaseService.query(query);
    return groups.map(g => ({
      groupName: g.group_name,
      createdAt: g.created_at,
      updatedAt: g.updated_at
    }));
  } catch (error) {
    logger.error('Error fetching allowed groups', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Add a group to the allowed list using Casbin
 * @param {string} groupName - Name of the Google group
 * @param {string} addedBy - Email of admin who added the group
 * @returns {Promise<Object>}
 */
export async function addAllowedGroup(groupName, addedBy) {
  if (!groupName) {
    throw new Error('Group name is required');
  }

  try {
    const casbinService = await getCasbinService();
    
    // Check if group already has application access policy
    const existingPolicies = await casbinService.enforcer.getFilteredPolicy(0, groupName, 'application', 'access');
    
    if (existingPolicies.length > 0) {
      throw new Error('Group already exists in allowed list');
    }

    // Add policy: group can access application
    await casbinService.enforcer.addPolicy(groupName, 'application', 'access');
    
    // Also store in database with metadata for tracking
    const insertQuery = `
      INSERT INTO casbin_rule (ptype, v0, v1, v2)
      VALUES ('p', 'allowed_group', ?, 'access')
    `;
    
    await databaseService.query(insertQuery, [groupName]);
    
    logger.info('Group added to allowed list via Casbin', { groupName, addedBy });
    
    return {
      groupName,
      addedBy,
      addedAt: new Date()
    };
  } catch (error) {
    logger.error('Error adding allowed group via Casbin', {
      message: error.message,
      stack: error.stack,
      groupName
    });
    throw error;
  }
}

/**
 * Remove a group from the allowed list using Casbin
 * @param {string} groupName - Name of the group to remove
 * @returns {Promise<boolean>}
 */
export async function removeAllowedGroup(groupName) {
  if (!groupName) {
    throw new Error('Group name is required');
  }

  try {
    const casbinService = await getCasbinService();
    
    // Remove policy from Casbin enforcer
    const removed = await casbinService.enforcer.removePolicy(groupName, 'application', 'access');
    
    // Also remove from metadata table
    const deleteQuery = `
      DELETE FROM casbin_rule
      WHERE ptype = 'p' 
      AND v0 = 'allowed_group'
      AND v1 = ?
      AND v2 = 'access'
    `;
    
    await databaseService.query(deleteQuery, [groupName]);
    
    if (removed) {
      logger.info('Group removed from allowed list via Casbin', { groupName });
    } else {
      logger.warn('Group not found in allowed list', { groupName });
    }
    
    return removed;
  } catch (error) {
    logger.error('Error removing allowed group via Casbin', {
      message: error.message,
      stack: error.stack,
      groupName
    });
    throw error;
  }
}

/**
 * Check if user is the super admin using Casbin
 * Super admin is anyone who can access 'admin-resource'
 * @param {string} userEmail - User's email address
 * @returns {Promise<boolean>}
 */
export async function isSuperAdmin(userEmail) {
  try {
    if (!userEmail) {
      return false;
    }
    
    const casbinService = await getCasbinService();
    
    // Use Casbin to check if user can access admin resources
    const result = await casbinService.authorize(userEmail, 'admin-resource', 'manage');
    
    logger.debug('Super admin check via Casbin', {
      userEmail,
      isSuperAdmin: result.allowed
    });
    
    return result.allowed;
  } catch (error) {
    logger.error('Error checking super admin status via Casbin', {
      userEmail,
      message: error.message
    });
    return false;
  }
}

export default {
  hasAccess,
  getAllowedGroups,
  addAllowedGroup,
  removeAllowedGroup,
  isSuperAdmin
};
