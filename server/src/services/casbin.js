/**
 * @file casbin.js
 * @description Casbin authorization service for policy-based access control with enhanced logging
 * @author 3D Diagnostix Development Team
 * @created 2025-10-07
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
 */


import { newEnforcer } from 'casbin';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';
import { createContextLogger, logSystemInit, logExternalService, logSecurityEvent } from './logger.js';
import { CONFIG } from '../config/config.js';

const logger = createContextLogger(__filename, 'CasbinService');

/**
 * CasbinService
 *
 * Singleton service that wraps Casbin enforcer initialization and provides
 * helper methods for authorization checks, policy management, and user
 * rights lookup. Consumers should import the default exported instance.
 *
 * @module CasbinService
 */
class CasbinService {
  constructor() {
    this.enforcer = null;
    this.usersData = null;
  }

  /**
   * Initialize Casbin enforcer with model and policies
   * Loads RBAC model configuration, policy rules, and user data from files
   * @returns {Promise<boolean>} - True if initialization successful
   * @throws {Error} - When model, policy, or user files cannot be loaded
   * @example
   * await casbinService.initialize();
   */
  async initialize() {
    try {
      const modelPath = CONFIG.casbin.modelPath;
      const policyPath = CONFIG.casbin.policyPath;
      const usersPath = CONFIG.casbin.usersPath;

      // Verify files exist
      if (!fs.existsSync(modelPath)) {
        logger.error('Casbin model file not found', { modelPath });
        throw new Error(`Casbin model file not found: ${modelPath}`);
      }
      if (!fs.existsSync(policyPath)) {
        logger.error('Casbin policy file not found', { policyPath });
        throw new Error(`Casbin policy file not found: ${policyPath}`);
      }
      if (!fs.existsSync(usersPath)) {
        logger.error('Users data file not found', { usersPath });
        throw new Error(`Users data file not found: ${usersPath}`);
      }

      logger.info('Casbin initialization started', { modelPath, policyPath, usersPath });

      // Initialize enforcer
      this.enforcer = await newEnforcer(modelPath, policyPath);

      // Load and count policies
      const allPolicies = await this.enforcer.getPolicy();
      const allGroupings = await this.enforcer.getGroupingPolicy();

      logger.info('Casbin enforcer initialized successfully', {
        policiesCount: allPolicies.length,
        groupingsCount: allGroupings.length
      });

      // Test authorization functionality (configurable)
      if (CONFIG.casbin.test && CONFIG.casbin.test.email && CONFIG.casbin.test.resource && CONFIG.casbin.test.action) {
        const testEmail = CONFIG.casbin.test.email;
        const testResource = CONFIG.casbin.test.resource;
        const testAction = CONFIG.casbin.test.action;
        const allowed = await this.enforcer.enforce(testEmail, testResource, testAction);
        logger.info('Casbin authorization test completed', {
          testSubject: testEmail,
          testResource,
          testAction,
          result: allowed
        });
      }

      // Load users data
      const usersFileContent = fs.readFileSync(usersPath, 'utf8');
      this.usersData = JSON.parse(usersFileContent);

      // Log system initialization completion
      logSystemInit('Casbin Enforcer', 'initialized successfully', {
        modelPath,
        policyPath,
        usersPath,
        policyCount: (await this.enforcer.getPolicy()).length,
        userCount: this.usersData.users.length
      });

      return true;
    } catch (error) {
      logger.error('Failed to initialize Casbin enforcer', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get user information from the mock users data
   * @param {string} email - User email address to look up
   * @returns {Object|null} User object with groups, roles, and org info, or null if not found
   * @example
   * const user = casbinService.getUserInfo('john@3ddiagnostix.com');
   * // Returns: { email: 'john@...', fullName: 'John Doe', groups: ['Engineering'], ... }
   */
  /**
   * Get user info from session (Google data) if available, fallback to users.json
   * @param {string} email - User email address
   * @param {Object} [sessionUser] - Optional user object from session
   * @returns {Object|null} User info
   */
  getUserInfo(email, sessionUser = null) {
    if (sessionUser && sessionUser.email === email) {
      return sessionUser;
    }
    if (!this.usersData || !this.usersData.users) {
      return null;
    }
    return this.usersData.users.find(user => user.email === email) || null;
  }

  /**
   * Check if user has permission to perform action on resource
   * Evaluates authorization using Casbin RBAC policies and logs the decision
   * @param {string} userEmail - User's email address for authorization check
   * @param {string} resource - Resource identifier (e.g., 'patient_data', 'financial_reports')
   * @param {string} action - Action to perform (e.g., 'read', 'write', 'delete')
   * @returns {Promise<Object>} Authorization result with decision, timing, and audit details
   * @throws {Error} When Casbin enforcer is not initialized or evaluation fails
   * @example
   * const result = await casbinService.authorize('john@3ddiagnostix.com', 'patient_data', 'read');
   * // Returns: { allowed: true, userEmail: '...', resource: '...', action: '...', ... }
   */
  async authorize(userEmail, resource, action) {
    if (!this.enforcer) {
      logger.error('Authorization failed - Casbin enforcer not initialized', { userEmail, resource, action });
      throw new Error('Casbin enforcer not initialized');
    }

    try {
      const startTime = Date.now();
      
      logger.info('Authorization check started', { userEmail, resource, action });
      
      // Check authorization
      const allowed = await this.enforcer.enforce(userEmail, resource, action);
      
      const duration = Date.now() - startTime;
      
      // Get user groups for audit logging
      const userInfo = this.getUserInfo(userEmail);
      const userGroups = userInfo ? userInfo.groups : [];
      
      // Get matching policies for audit trail
      const allPolicies = await this.enforcer.getPolicy();
      const matchingPolicies = allPolicies.filter(policy => {
        const [, subject, obj, act] = policy;
        return userGroups.includes(subject) && obj === resource && act === action;
      });

      // Log authorization result
      const logLevel = allowed ? 'info' : 'warn';
      logger[logLevel](`Authorization ${allowed ? 'granted' : 'denied'}`, {
        userEmail,
        resource,
        action,
        result: allowed,
        duration: `${duration}ms`,
        userGroups,
        matchingPolicies: matchingPolicies.length
      });

      const result = {
        allowed,
        userEmail,
        resource,
        action,
        userGroups,
        matchingPolicies,
        evaluationTime: duration,
        timestamp: new Date().toISOString(),
        requestId: 'unknown' // Will be set by calling function
      };

      return result;
    } catch (error) {
      logger.error('Authorization error', {
        error: error.message,
        userEmail,
        resource,
        action,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get all permissions for a user across all resources
   * Evaluates user's complete access rights based on group memberships and RBAC policies
   * @param {string} userEmail - User's email address for rights evaluation
   * @returns {Promise<Object>} Complete user rights object with resources, actions, and metadata
   * @throws {Error} When Casbin enforcer is not initialized
   * @example
   * const rights = await casbinService.getUserRights('john@3ddiagnostix.com');
   * // Returns: {
   * //   userEmail: '...', found: true, groups: ['Engineering'], 
   * //   rights: [{ resource: 'patient_data', actions: ['read', 'write'] }]
   * // }
   */
  /**
   * Get all permissions for a user across all resources using live Google data
   * @param {string} userEmail - User's email address
   * @param {Object} [sessionUser] - Optional user object from session (Google)
   * @returns {Promise<Object>} User rights object
   */
  async getUserRights(userEmail, sessionUser = null) {
    if (!this.enforcer) {
      logger.error('Get user rights failed - Casbin enforcer not initialized', { userEmail });
      throw new Error('Casbin enforcer not initialized');
    }

    if (process.env.NODE_ENV !== 'production') {
      logger.info('User rights retrieval started', { 
        userEmail, 
        hasSessionUser: !!sessionUser,
        sessionGroups: sessionUser?.groups?.length || 0
      });
    }

    // Use Google session data if available
    const userInfo = this.getUserInfo(userEmail, sessionUser);
    if (!userInfo) {
      logger.warn('User not found in system', { userEmail });
      return {
        userEmail,
        found: false,
        rights: [],
        groups: [],
        roles: []
      };
    }

    // Dynamically assign Casbin group memberships for this session
    if (userInfo.groups && Array.isArray(userInfo.groups)) {
      for (const group of userInfo.groups) {
        await this.enforcer.addGroupingPolicy(userEmail, group);
      }
    }
    if (userInfo.roles && Array.isArray(userInfo.roles)) {
      for (const role of userInfo.roles) {
        await this.enforcer.addGroupingPolicy(userEmail, role);
      }
    }

    // Evaluate all policies for this user
    const allPolicies = await this.enforcer.getPolicy();

    // Get all subjects (groups/roles) the user belongs to
    const allUserSubjects = [
      userEmail,
      ...(userInfo.groups || []),
      ...(userInfo.roles || [])
    ];

    // Filter policies that apply to the user's subjects
    const relevantPolicies = allPolicies.filter(policy => {
      const [subject] = policy;  // First element is the subject
      return allUserSubjects.includes(subject);
    });

    const resourcePermissions = {};
    for (const policy of relevantPolicies) {
      const [subject, resource, action] = policy;  // Correct order
      if (!resourcePermissions[resource]) {
        resourcePermissions[resource] = new Set();
      }
      resourcePermissions[resource].add(action);
    }

    const rightsArr = Object.entries(resourcePermissions).map(([resource, actions]) => ({
      resource,
      actions: Array.from(actions).sort()
    }));

    return {
      userEmail,
      found: true,
      fullName: userInfo.name || userInfo.fullName,
      groups: userInfo.groups || [],
      roles: userInfo.roles || [],
      orgUnit: userInfo.orgUnit,
      department: userInfo.department,
      twoStepEnabled: userInfo.twoStepEnabled,
      rights: rightsArr.sort((a, b) => a.resource.localeCompare(b.resource)),
      googleRaw: userInfo.googleRaw || undefined
    };
  }

  /**
   * Add a new policy rule
   * @param {string} subject - Subject (user/group/role)
   * @param {string} object - Object/resource
   * @param {string} action - Action
   * @returns {Promise<boolean>} - True if policy was added
   */
  async addPolicy(subject, object, action) {
    if (!this.enforcer) {
      throw new Error('Casbin enforcer not initialized');
    }

    const added = await this.enforcer.addPolicy(subject, object, action);
    return added;
  }

  /**
   * Remove a policy rule
   * @param {string} subject - Subject (user/group/role)
   * @param {string} object - Object/resource
   * @param {string} action - Action
   * @returns {Promise<boolean>} - True if policy was removed
   */
  async removePolicy(subject, object, action) {
    if (!this.enforcer) {
      throw new Error('Casbin enforcer not initialized');
    }

    const removed = await this.enforcer.removePolicy(subject, object, action);
    return removed;
  }

  /**
   * Get all policies for debugging/admin purposes
   * @returns {Promise<Array>} - All policy rules
   */
  async getAllPolicies() {
    if (!this.enforcer) {
      throw new Error('Casbin enforcer not initialized');
    }

    return await this.enforcer.getPolicy();
  }

  /**
   * Reload policies from file
   * @returns {Promise<void>}
   */
  async reloadPolicies() {
    if (!this.enforcer) {
      throw new Error('Casbin enforcer not initialized');
    }

    await this.enforcer.loadPolicy();
  }

  /**
   * Get all users for admin management
   * @returns {Array} - All users from users.json
   */
  getAllUsers() {
    if (!this.usersData || !this.usersData.users) {
      return [];
    }
    return this.usersData.users;
  }

  /**
   * Get all groups from users.json
   * @returns {Array} - All groups
   */
  getAllGroups() {
    if (!this.usersData || !this.usersData.groups) {
      return [];
    }
    return this.usersData.groups;
  }

  /**
   * Get all roles from users.json
   * @returns {Array} - All roles
   */
  getAllRoles() {
    if (!this.usersData || !this.usersData.roles) {
      return [];
    }
    return this.usersData.roles;
  }

  /**
   * Get user groups for admin management
   * @param {string} _userEmail - User email (unused, gets all groupings)
   * @returns {Promise<Array>} - User's group assignments
   */

  async getUserGroups(userEmail) {
    if (!this.enforcer) {
      throw new Error('Casbin enforcer not initialized');
    }
    // In our RBAC model, groups are often represented as roles
    // Get all grouping policies and filter for this user
    const allGroupings = await this.enforcer.getGroupingPolicy();
    const userGroups = allGroupings
      .filter(grouping => grouping[0] === userEmail)
      .map(grouping => grouping[1]); // Extract the group/role name
    return userGroups;
  }

  /**
   * Get roles for a user (direct and indirect)
   * @param {string} userEmail
   * @returns {Promise<Array>} - List of roles
   */
  async getUserRoles(userEmail) {
    if (!this.enforcer) throw new Error('Casbin enforcer not initialized');
    // Casbin getRolesForUser returns direct and inherited roles
    return await this.enforcer.getRolesForUser(userEmail);
  }

  /**
   * Get permissions for a user (resource/action pairs)
   * @param {string} userEmail
   * @returns {Promise<Array<{resource: string, action: string}>>}
   */
  async getUserPermissions(userEmail) {
    if (!this.enforcer) throw new Error('Casbin enforcer not initialized');
    // Casbin getPermissionsForUser returns [sub, obj, act] arrays
    const perms = await this.enforcer.getPermissionsForUser(userEmail);
    // Map to { resource, action }
    return perms.map(p => ({ resource: p[1], action: p[2] }));
  }

  /**
   * Add user to group (role assignment)
   * @param {string} userEmail - User email
   * @param {string} group - Group name
   * @returns {Promise<boolean>} - True if assignment was added
   */
  async addUserToGroup(userEmail, group) {
    if (!this.enforcer) {
      throw new Error('Casbin enforcer not initialized');
    }

    const added = await this.enforcer.addGroupingPolicy(userEmail, group);
    return added;
  }

  /**
   * Remove user from group
   * @param {string} userEmail - User email
   * @param {string} group - Group name
   * @returns {Promise<boolean>} - True if assignment was removed
   */
  async removeUserFromGroup(userEmail, group) {
    if (!this.enforcer) {
      throw new Error('Casbin enforcer not initialized');
    }

    const removed = await this.enforcer.removeGroupingPolicy(userEmail, group);
    return removed;
  }

  /**
   * Sync user data from Google to Casbin
   * Updates user groups and roles based on Google Directory information
   * @param {string} userEmail - User email
   * @param {Object} googleData - Google user data
   * @param {string} googleData.fullName - User's full name
   * @param {Array} googleData.groups - Google groups
   * @param {Array} googleData.roles - Google roles
   * @param {string} googleData.orgUnit - Organizational unit
   * @param {string} googleData.department - Department
   * @param {Array} googleData.userGroupRoles - Detailed group roles
   * @returns {Promise<Object>} - Sync result
   */
  async syncUserFromGoogle(userEmail, googleData) {
    if (!this.enforcer) {
      throw new Error('Casbin enforcer not initialized');
    }

    try {
      logger.info('Starting Google to Casbin sync', { 
        userEmail, 
        groups: googleData.groups?.length || 0,
        roles: googleData.roles?.length || 0
      });


      // Get all current group assignments for this user
      const allGroupings = await this.enforcer.getGroupingPolicy();
      // Only consider group assignments for this user
      const currentGroups = allGroupings
        .filter(([user, group]) => user === userEmail)
        .map(([user, group]) => group);

      // Local-only groups that should NOT be removed by Google sync
      // These are used for development, testing, or manual assignments
      const localOnlyGroups = ['Finance22', 'Developers22', 'admin', 'engineering', 'developer'];

      // Remove user from groups that are NOT in the new Google group list
      // BUT preserve local-only groups that were manually added
      const googleGroups = Array.isArray(googleData.groups) ? googleData.groups : [];
      for (const group of currentGroups) {
        // Skip removal if this is a local-only group
        if (localOnlyGroups.includes(group)) {
          logger.debug('Preserving local-only group during sync', { userEmail, group });
          continue;
        }
        
        if (!googleGroups.includes(group)) {
          await this.removeUserFromGroup(userEmail, group);
          logger.info('Removed user from group', { userEmail, group });
        }
      }

      // Add user to new Google groups
      if (googleData.groups && Array.isArray(googleData.groups)) {
        for (const group of googleData.groups) {
          if (group) {
            await this.addUserToGroup(userEmail, group);
            logger.info('Added user to group', { userEmail, group });
          }
        }
      }

      // Update user info in memory (if using users.json)
      if (this.usersData && this.usersData.users) {
        const userIndex = this.usersData.users.findIndex(u => u.email === userEmail);
        const userData = {
          email: userEmail,
          name: googleData.fullName,
          groups: googleData.groups || [],
          roles: googleData.roles || [],
          orgUnit: googleData.orgUnit || '',
          department: googleData.department || ''
        };

        if (userIndex >= 0) {
          this.usersData.users[userIndex] = userData;
        } else {
          this.usersData.users.push(userData);
        }
      }

      logger.info('Google to Casbin sync completed successfully', { 
        userEmail,
        syncedGroups: googleData.groups?.length || 0,
        syncedRoles: googleData.roles?.length || 0
      });

      return {
        success: true,
        userEmail,
        syncedGroups: googleData.groups || [],
        syncedRoles: googleData.roles || [],
        orgUnit: googleData.orgUnit
      };

    } catch (error) {
      logger.error('Google to Casbin sync failed', { 
        userEmail, 
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Check if current user is admin
   * @param {string} userEmail - User email to check
   * @returns {boolean} - True if user is admin
   */
  isUserAdmin(userEmail) {
    const userInfo = this.getUserInfo(userEmail);
    if (!userInfo) return false;
    
    return userInfo.groups?.includes('admin') || 
           userInfo.roles?.includes('admin') || 
           userInfo.roles?.includes('system-admin');
  }
}

// Create singleton instance
const casbinService = new CasbinService();

/**
 * Exported singleton instance of CasbinService.
 * @type {CasbinService}
 */
export default casbinService;