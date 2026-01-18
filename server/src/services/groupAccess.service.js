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
 * Get all allowed groups from Casbin enforcer
 * @returns {Promise<Array>}
 */
export async function getAllowedGroups() {
  try {
    const casbinService = await getCasbinService();
    
    // Get all policies where object='application' and action='access'
    const policies = await casbinService.enforcer.getFilteredPolicy(1, 'application', 'access');
    
    // Extract unique group names (v0 from each policy)
    const groups = policies.map(policy => ({
      groupName: policy[0],
      createdAt: null, // Not available from Casbin enforcer
      updatedAt: null
    }));
    
    logger.debug('Fetched allowed groups from Casbin', { count: groups.length, groups: groups.map(g => g.groupName) });
    
    return groups;
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
    const added = await casbinService.enforcer.addPolicy(groupName, 'application', 'access');
    
    if (!added) {
      throw new Error('Failed to add policy to Casbin enforcer');
    }
    
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
    
    // Check if policy exists first
    const existingPolicies = await casbinService.enforcer.getFilteredPolicy(0, groupName, 'application', 'access');
    
    if (existingPolicies.length === 0) {
      logger.warn('Group not found in allowed list', { groupName });
      return false;
    }
    
    // Remove policy from Casbin enforcer
    const removed = await casbinService.enforcer.removePolicy(groupName, 'application', 'access');
    
    if (removed) {
      logger.info('Group removed from allowed list via Casbin', { groupName });
    } else {
      logger.warn('Failed to remove group policy', { groupName });
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
 * Check if user is the super admin using Google Workspace groups
 * Super admin is anyone in the SUPER_ADMIN_GROUP (from environment variable)
 * @param {string|Object} userEmailOrGroups - User's email address OR array of user's groups
 * @returns {Promise<boolean>|boolean}
 */
export async function isSuperAdmin(userEmailOrGroups) {
  try {
    if (!userEmailOrGroups) {
      return false;
    }
    
    const { CONFIG } = await import('../config/config.js');
    const superAdminGroup = CONFIG.auth.superAdminGroup || 'SWD';
    
    // If passed an array of groups directly (for performance)
    if (Array.isArray(userEmailOrGroups)) {
      const userGroups = userEmailOrGroups;
      const isSuperAdmin = userGroups.includes(superAdminGroup);
      
      logger.debug('Super admin check via direct groups', {
        userGroups,
        superAdminGroup,
        isSuperAdmin
      });
      
      return isSuperAdmin;
    }
    
    // If passed email, get groups from Casbin
    const userEmail = userEmailOrGroups;
    const casbinService = await getCasbinService();
    
    // Get user info which includes groups
    const userInfo = casbinService.getUserInfo(userEmail);
    if (userInfo && userInfo.groups) {
      const isSuperAdmin = userInfo.groups.includes(superAdminGroup);
      
      logger.debug('Super admin check via Casbin user info', {
        userEmail,
        userGroups: userInfo.groups,
        superAdminGroup,
        isSuperAdmin
      });
      
      return isSuperAdmin;
    }
    
    // Fallback: Use Casbin authorize (legacy)
    const result = await casbinService.authorize(userEmail, 'admin-resource', 'manage');
    
    logger.debug('Super admin check via Casbin authorize (fallback)', {
      userEmail,
      isSuperAdmin: result.allowed
    });
    
    return result.allowed;
  } catch (error) {
    logger.error('Error checking super admin status', {
      userEmailOrGroups,
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
