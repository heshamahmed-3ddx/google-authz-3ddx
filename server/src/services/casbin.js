/**
 * @file casbin.js
 * @description Casbin authorization service for policy-based access control with enhanced logging
 * @author InsightHub Development Team
 * @created 2025-10-07
 * @version 1.2.0
 * @copyright 2025 InsightHub. All rights reserved.
 */


import { newEnforcer } from 'casbin';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';
import { createContextLogger, logSystemInit, logExternalService, logSecurityEvent } from './logger.js';
import { CONFIG } from '../config/config.js';
import MySQLAdapter from '../adapters/casbin-mysql-adapter.js';
import MySQLAdapterEnhanced from '../adapters/casbin-mysql-adapter-enhanced.js';
import databaseService from './database.js';

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
    this.storageType = 'database'; // Database storage only
    this.adapter = null;
  }

  /**
   * Initialize Casbin enforcer with model and database storage
   * Uses MySQL adapter for policy storage with caching and performance optimizations
   * @returns {Promise<boolean>} - True if initialization successful
   * @throws {Error} - When model file or database connection fails
   * @example
   * await casbinService.initialize();
   */
  async initialize() {
    try {
      const modelPath = CONFIG.casbin.modelPath;
      const usersPath = CONFIG.casbin.usersPath;
      this.storageType = 'database'; // Database storage only

      // Model file is always required
      if (!fs.existsSync(modelPath)) {
        logger.error('Casbin model file not found', { modelPath });
        throw new Error(`Casbin model file not found: ${modelPath}`);
      }

      // Users file is always required (for now)
      if (!fs.existsSync(usersPath)) {
        logger.error('Users data file not found', { usersPath });
        throw new Error(`Users data file not found: ${usersPath}`);
      }

      logger.info('Casbin initialization started (database storage)', {
        modelPath,
        usersPath
      });

      // Check if database is initialized
      try {
        const pool = databaseService.getPool();
        logger.debug('Database pool available for Casbin', {
          poolExists: !!pool
        });
      } catch (error) {
        logger.error('Database not initialized - cannot start Casbin', {
          error: error.message,
          stack: error.stack
        });
        throw new Error('Database must be initialized before Casbin can start');
      }

      // Use enhanced MySQL adapter with caching and performance optimizations
      const useEnhanced = CONFIG.casbin.useEnhancedAdapter !== false; // Default: true
      
      if (useEnhanced) {
        this.adapter = new MySQLAdapterEnhanced(
          CONFIG.casbin.tableName || 'casbin_rule',
          {
            enableCache: CONFIG.casbin.cache?.enabled !== false, // Default: true
            cacheTTL: CONFIG.casbin.cache?.ttl || 60000, // 1 minute default
            batchSize: CONFIG.casbin.batchSize || 100,
            maxRetries: CONFIG.casbin.maxRetries || 3
          }
        );
        logger.info('Casbin enforcer initialized with enhanced MySQL adapter (caching enabled)');
      } else {
        this.adapter = new MySQLAdapter(CONFIG.casbin.tableName || 'casbin_rule');
        logger.info('Casbin enforcer initialized with MySQL adapter');
      }
      
      this.enforcer = await newEnforcer(modelPath, this.adapter);

      // Load and count policies
      const allPolicies = await this.enforcer.getPolicy();
      const allGroupings = await this.enforcer.getGroupingPolicy();

      logger.info('Casbin enforcer initialized successfully', {
        storageType: this.storageType,
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
        storageType: this.storageType,
        modelPath,
        usersPath,
        policyCount: (await this.enforcer.getPolicy()).length,
        userCount: this.usersData.users.length
      });

      return true;
    } catch (error) {
      logger.error('Failed to initialize Casbin enforcer', {
        error: error.message,
        stack: error.stack,
        storageType: this.storageType
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
      
      // Only log in non-production or if explicitly enabled
      if (process.env.NODE_ENV !== 'production' || process.env.CASBIN_DEBUG === 'true') {
        logger.info('Authorization check started', { userEmail, resource, action });
      }
      
      // Check authorization
      const allowed = await this.enforcer.enforce(userEmail, resource, action);
      
      const duration = Date.now() - startTime;
      
      // Get user groups for audit logging (only if needed)
      const userInfo = this.getUserInfo(userEmail);
      const userGroups = userInfo ? userInfo.groups : [];
      
      // OPTIMIZED: Removed expensive getPolicy() call - only log if taking too long
      // The matchingPolicies count was only for audit logging and is not critical
      if (duration > 100) {
        logger.warn('Slow authorization check detected', {
          userEmail,
          resource,
          action,
          duration: `${duration}ms`
        });
      }

      // Log authorization result (only if denied or slow)
      if (!allowed) {
        logger.warn('Authorization denied', {
          userEmail,
          resource,
          action,
          duration: `${duration}ms`,
          userGroups: userGroups.join(', ') || 'none'
        });
      }

      const result = {
        allowed,
        userEmail,
        resource,
        action,
        userGroups,
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

    const startTime = Date.now();

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

    // OPTIMIZED: Use getRolesForUser to check existing roles (more efficient than loading all groupings)
    let existingUserRoles = [];
    try {
      existingUserRoles = await this.enforcer.getRolesForUser(userEmail);
    } catch (error) {
      logger.debug('Error getting existing roles, will add all groups', { userEmail, error: error.message });
    }

    // Only add missing group/role memberships (don't modify enforcer state unnecessarily)
    if (userInfo.groups && Array.isArray(userInfo.groups)) {
      for (const group of userInfo.groups) {
        if (!existingUserRoles || !existingUserRoles.includes(group)) {
          await this.enforcer.addGroupingPolicy(userEmail, group);
        }
      }
    }
    if (userInfo.roles && Array.isArray(userInfo.roles)) {
      for (const role of userInfo.roles) {
        if (!existingUserRoles || !existingUserRoles.includes(role)) {
          await this.enforcer.addGroupingPolicy(userEmail, role);
        }
      }
    }

    // OPTIMIZED: Use getPermissionsForUser which handles RBAC evaluation efficiently
    // This method automatically evaluates all roles/groups the user belongs to
    const resourcePermissions = {};
    
    try {
      // getPermissionsForUser handles RBAC and returns all permissions for user + their roles
      const allPermissions = await this.enforcer.getPermissionsForUser(userEmail);
      
      for (const perm of allPermissions) {
        const [, resource, action] = perm;
        if (resource && action) {
          if (!resourcePermissions[resource]) {
            resourcePermissions[resource] = new Set();
          }
          resourcePermissions[resource].add(action);
        }
      }
    } catch (error) {
      logger.warn('Error getting permissions, falling back to policy loading', { 
        userEmail, 
        error: error.message 
      });
      
      // Fallback: Load policies only for user's groups/roles (still better than all policies)
      const allUserSubjects = [userEmail, ...(userInfo.groups || []), ...(userInfo.roles || [])];
      const allPolicies = await this.enforcer.getPolicy();
      const relevantPolicies = allPolicies.filter(policy => {
        const [subject] = policy;
        return allUserSubjects.includes(subject);
      });

      for (const policy of relevantPolicies) {
        const [, resource, action] = policy;
        if (resource && action) {
          if (!resourcePermissions[resource]) {
            resourcePermissions[resource] = new Set();
          }
          resourcePermissions[resource].add(action);
        }
      }
    }

    const rightsArr = Object.entries(resourcePermissions).map(([resource, actions]) => ({
      resource,
      actions: Array.from(actions).sort()
    }));

    const duration = Date.now() - startTime;
    
    // Log slow operations
    if (duration > 500) {
      logger.warn('Slow user rights retrieval detected', {
        userEmail,
        duration: `${duration}ms`,
        rightsCount: rightsArr.length
      });
    }

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
    
    // Auto-save if enabled and using database
    if (CONFIG.casbin.autoSave && this.storageType === 'database') {
      await this.enforcer.savePolicy();
    }
    
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
    
    // Auto-save if enabled and using database
    if (CONFIG.casbin.autoSave && this.storageType === 'database') {
      await this.enforcer.savePolicy();
    }
    
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
    // OPTIMIZED: Use getRolesForUser which is more efficient than loading all groupings
    // This returns both direct and inherited roles/groups
    try {
      const roles = await this.enforcer.getRolesForUser(userEmail);
      return roles || [];
    } catch (error) {
      // Fallback to grouping policy method if getRolesForUser fails
      logger.debug('getRolesForUser failed, using fallback method', { userEmail, error: error.message });
      const allGroupings = await this.enforcer.getGroupingPolicy();
      const userGroups = allGroupings
        .filter(grouping => grouping[0] === userEmail)
        .map(grouping => grouping[1]); // Extract the group/role name
      return userGroups;
    }
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
    
    // Auto-save if enabled and using database
    if (CONFIG.casbin.autoSave && this.storageType === 'database') {
      await this.enforcer.savePolicy();
    }
    
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
    
    // Auto-save if enabled and using database
    if (CONFIG.casbin.autoSave && this.storageType === 'database') {
      await this.enforcer.savePolicy();
    }
    
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

      // Temporarily disable auto-save to batch operations and save once at the end
      // This prevents multiple full policy saves during sync (performance optimization)
      const originalAutoSave = CONFIG.casbin.autoSave;
      CONFIG.casbin.autoSave = false;

      try {
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
            // Use direct enforcer method to avoid auto-save
            await this.enforcer.removeGroupingPolicy(userEmail, group);
            logger.info('Removed user from group', { userEmail, group });
          }
        }

        // Add user to new Google groups
        if (googleData.groups && Array.isArray(googleData.groups)) {
          for (const group of googleData.groups) {
            if (group) {
              // Use direct enforcer method to avoid auto-save
              await this.enforcer.addGroupingPolicy(userEmail, group);
              logger.info('Added user to group', { userEmail, group });
            }
          }
        }

        // Save all changes once at the end (only if using database storage)
        // Wrap in try-catch to prevent login failure if policy save fails
        if (this.storageType === 'database') {
          try {
            await this.enforcer.savePolicy();
            logger.debug('Policies saved to database after sync', { userEmail });
          } catch (saveError) {
            // Log error but don't fail the sync - policies are still in memory
            logger.error('Failed to save policies to database during sync (non-blocking)', {
              userEmail,
              error: saveError.message,
              errorCode: saveError.code,
              sqlState: saveError.sqlState,
              note: 'User sync completed successfully, but policies were not persisted to database. Policies are still active in memory.'
            });
            // Don't throw - allow login to succeed even if database save fails
          }
        }
      } finally {
        // Restore original auto-save setting
        CONFIG.casbin.autoSave = originalAutoSave;
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

  /**
   * Get performance metrics (if using enhanced adapter)
   * @returns {Object|null} Metrics object or null if not available
   */
  getMetrics() {
    if (this.adapter && typeof this.adapter.getMetrics === 'function') {
      return this.adapter.getMetrics();
    }
    return null;
  }

  /**
   * Reset performance metrics (if using enhanced adapter)
   */
  resetMetrics() {
    if (this.adapter && typeof this.adapter.resetMetrics === 'function') {
      this.adapter.resetMetrics();
      logger.info('Casbin performance metrics reset');
    }
  }

  /**
   * Invalidate policy cache (if using enhanced adapter)
   */
  invalidateCache() {
    if (this.adapter && typeof this.adapter.invalidateCache === 'function') {
      this.adapter.invalidateCache();
      logger.info('Casbin policy cache invalidated');
    }
  }

}

// Create singleton instance
const casbinService = new CasbinService();

/**
 * Exported singleton instance of CasbinService.
 * @type {CasbinService}
 */
export default casbinService;