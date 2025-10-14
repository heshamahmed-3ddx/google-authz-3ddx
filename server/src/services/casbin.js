/**
 * @file casbin.js
 * @description Casbin authorization service for policy-based access control
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
import { createLogger, logAuthz } from './logging.js';
// Use Node.js globals for __dirname and __filename (Jest/Babel compatible)

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
    this.logger = createLogger({ service: 'casbin' });
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
      const modelPath = path.join(__dirname, '../config/casbin/model.conf');
      const policyPath = path.join(__dirname, '../config/casbin/policy.csv');
      const usersPath = path.join(__dirname, '../config/casbin/users.json');

      // Verify files exist
      if (!fs.existsSync(modelPath)) {
        throw new Error(`Casbin model file not found: ${modelPath}`);
      }
      if (!fs.existsSync(policyPath)) {
        throw new Error(`Casbin policy file not found: ${policyPath}`);
      }
      if (!fs.existsSync(usersPath)) {
        throw new Error(`Users data file not found: ${usersPath}`);
      }

      // Initialize enforcer
      this.enforcer = await newEnforcer(modelPath, policyPath);
      
      // Load users data
      const usersFileContent = fs.readFileSync(usersPath, 'utf8');
      this.usersData = JSON.parse(usersFileContent);

      this.logger.info({
        modelPath,
        policyPath,
        usersPath,
        policyCount: await this.enforcer.getPolicy().length,
        userCount: this.usersData.users.length
      }, 'Casbin enforcer initialized successfully');
      
      return true;
    } catch (error) {
      this.logger.error({
        error: error.message,
        stack: error.stack
      }, 'Failed to initialize Casbin enforcer');
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
  getUserInfo(email) {
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
      throw new Error('Casbin enforcer not initialized');
    }

    try {
      const startTime = Date.now();
      
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

      // Log authorization decision using structured logging
      logAuthz(result);

      return result;
    } catch (error) {
      this.logger.error({
        error: error.message,
        userEmail,
        resource,
        action
      }, 'Authorization error');
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
  async getUserRights(userEmail) {
    if (!this.enforcer) {
      throw new Error('Casbin enforcer not initialized');
    }

    try {
      const userInfo = this.getUserInfo(userEmail);
      if (!userInfo) {
        return {
          userEmail,
          found: false,
          rights: [],
          groups: [],
          roles: []
        };
      }

      const userGroups = userInfo.groups || [];
      const userRoles = userInfo.roles || [];
      
      // Get all policies
      const allPolicies = await this.enforcer.getPolicy();
      
      // Group permissions by resource
      const resourcePermissions = {};
      
      for (const policy of allPolicies) {
        const [, subject, resource, action] = policy;
        
        // Check if user belongs to this policy's subject (group/role)
        if (userGroups.includes(subject)) {
          if (!resourcePermissions[resource]) {
            resourcePermissions[resource] = new Set();
          }
          resourcePermissions[resource].add(action);
        }
      }

      // Convert to array format
      const rights = Object.entries(resourcePermissions).map(([resource, actions]) => ({
        resource,
        actions: Array.from(actions).sort()
      }));

      const result = {
        userEmail,
        found: true,
        fullName: userInfo.fullName,
        groups: userGroups,
        roles: userRoles,
        orgUnit: userInfo.orgUnit,
        department: userInfo.department,
        twoStepEnabled: userInfo.twoStepEnabled,
        rights: rights.sort((a, b) => a.resource.localeCompare(b.resource))
      };

      this.logger.info({
        userEmail,
        resourceCount: rights.length,
        groups: userGroups,
        roles: userRoles
      }, `Retrieved rights for user: ${userEmail}`);
      
      return result;
    } catch (error) {
      console.error('❌ Error getting user rights:', error.message);
      throw error;
    }
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

    try {
      const added = await this.enforcer.addPolicy(subject, object, action);
      console.log(`📋 Policy ${added ? 'added' : 'already exists'}: ${subject}, ${object}, ${action}`);
      return added;
    } catch (error) {
      console.error('❌ Error adding policy:', error.message);
      throw error;
    }
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

    try {
      const removed = await this.enforcer.removePolicy(subject, object, action);
      console.log(`📋 Policy ${removed ? 'removed' : 'not found'}: ${subject}, ${object}, ${action}`);
      return removed;
    } catch (error) {
      console.error('❌ Error removing policy:', error.message);
      throw error;
    }
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

    try {
      await this.enforcer.loadPolicy();
      console.log('🔄 Casbin policies reloaded');
    } catch (error) {
      console.error('❌ Error reloading policies:', error.message);
      throw error;
    }
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
  async getUserGroups(_userEmail) {
    if (!this.enforcer) {
      throw new Error('Casbin enforcer not initialized');
    }

    try {
      return await this.enforcer.getGroupingPolicy();
    } catch (error) {
      console.error('❌ Error getting user groups:', error.message);
      throw error;
    }
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

    try {
      const added = await this.enforcer.addGroupingPolicy(userEmail, group);
      console.log(`👥 User ${added ? 'added to' : 'already in'} group: ${userEmail} -> ${group}`);
      return added;
    } catch (error) {
      console.error('❌ Error adding user to group:', error.message);
      throw error;
    }
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

    try {
      const removed = await this.enforcer.removeGroupingPolicy(userEmail, group);
      console.log(`👥 User ${removed ? 'removed from' : 'not found in'} group: ${userEmail} -> ${group}`);
      return removed;
    } catch (error) {
      console.error('❌ Error removing user from group:', error.message);
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