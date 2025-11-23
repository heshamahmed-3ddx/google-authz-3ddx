/**
 * @file casbin-mysql-adapter-enhanced.js
 * @description Enhanced MySQL adapter for Casbin with caching, batch operations, and performance optimizations
 * @author 3D Diagnostix Development Team
 * @created 2025-01-XX
 * @version 2.0.0
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
 */

import databaseService from '../services/database.js';
import { createContextLogger } from '../services/logger.js';

const logger = createContextLogger('CasbinMySQLAdapter', 'CasbinMySQLAdapterEnhanced');

/**
 * Enhanced MySQL Adapter for Casbin
 * Features:
 * - Policy caching to reduce database queries
 * - Batch operations for bulk updates
 * - Connection health checks
 * - Performance monitoring
 * - Optimized bulk inserts
 * - Retry logic for transient failures
 */
class MySQLAdapterEnhanced {
  /**
   * @param {string} tableName - Name of the casbin_rule table (default: 'casbin_rule')
   * @param {Object} options - Configuration options
   * @param {boolean} options.enableCache - Enable policy caching (default: true)
   * @param {number} options.cacheTTL - Cache TTL in milliseconds (default: 60000 = 1 minute)
   * @param {number} options.batchSize - Batch size for bulk operations (default: 100)
   * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
   */
  constructor(tableName = 'casbin_rule', options = {}) {
    this.tableName = tableName;
    this.filtered = false;
    
    // Configuration
    this.enableCache = options.enableCache !== false; // Default: true
    this.cacheTTL = options.cacheTTL || 60000; // 1 minute default
    this.batchSize = options.batchSize || 100;
    this.maxRetries = options.maxRetries || 3;
    
    // Cache
    this.policyCache = null;
    this.cacheTimestamp = null;
    
    // Performance metrics
    this.metrics = {
      loadPolicyCount: 0,
      savePolicyCount: 0,
      addPolicyCount: 0,
      removePolicyCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      queryTime: {
        total: 0,
        count: 0
      }
    };
  }

  /**
   * Load all policy rules from database into Casbin model
   * Uses caching to reduce database queries
   * @param {Object} model - Casbin model instance
   * @returns {Promise<void>}
   */
  async loadPolicy(model) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      if (this.enableCache && this.isCacheValid()) {
        logger.debug('Loading policies from cache', { 
          cacheAge: Date.now() - this.cacheTimestamp 
        });
        this.metrics.cacheHits++;
        this.loadPoliciesFromCache(model);
        return;
      }

      this.metrics.cacheMisses++;
      logger.debug('Loading policies from database', { tableName: this.tableName });

      // Load from database
      const query = `SELECT ptype, v0, v1, v2, v3, v4, v5 FROM ${this.tableName} ORDER BY id`;
      const rows = await this.executeWithRetry(() => databaseService.query(query));

      // Update cache
      if (this.enableCache) {
        this.policyCache = rows;
        this.cacheTimestamp = Date.now();
      }

      // Load into model
      for (const row of rows) {
        this.loadPolicyLine(row, model);
      }

      const duration = Date.now() - startTime;
      this.updateMetrics('loadPolicy', duration);
      
      logger.info('Policies loaded from database', { 
        count: rows.length,
        duration: `${duration}ms`,
        fromCache: false
      });
      
      this.metrics.loadPolicyCount++;
    } catch (error) {
      logger.error('Failed to load policies from database', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Load policies from cache into model
   * @param {Object} model - Casbin model instance
   */
  loadPoliciesFromCache(model) {
    if (!this.policyCache) return;
    
    for (const row of this.policyCache) {
      this.loadPolicyLine(row, model);
    }
  }

  /**
   * Check if cache is valid
   * @returns {boolean}
   */
  isCacheValid() {
    if (!this.policyCache || !this.cacheTimestamp) return false;
    return (Date.now() - this.cacheTimestamp) < this.cacheTTL;
  }

  /**
   * Invalidate cache
   */
  invalidateCache() {
    this.policyCache = null;
    this.cacheTimestamp = null;
    logger.debug('Policy cache invalidated');
  }

  /**
   * Convert database row to Casbin policy line and load into model
   * @param {Object} row - Database row
   * @param {Object} model - Casbin model
   */
  loadPolicyLine(row, model) {
    const line = [];
    
    // Build rule array with non-null values
    if (row.v0 !== null && row.v0 !== undefined) line.push(row.v0);
    if (row.v1 !== null && row.v1 !== undefined) line.push(row.v1);
    if (row.v2 !== null && row.v2 !== undefined) line.push(row.v2);
    if (row.v3 !== null && row.v3 !== undefined) line.push(row.v3);
    if (row.v4 !== null && row.v4 !== undefined) line.push(row.v4);
    if (row.v5 !== null && row.v5 !== undefined) line.push(row.v5);
    
    // Load into model based on ptype
    if (row.ptype === 'p') {
      model.addPolicy('p', 'p', line);
    } else if (row.ptype === 'g') {
      model.addPolicy('g', 'g', line);
    } else if (row.ptype === 'g2') {
      model.addPolicy('g', 'g2', line);
    }
  }

  /**
   * Save all policies from model to database
   * Uses batch inserts for better performance
   * @param {Object} model - Casbin model instance
   * @returns {Promise<boolean>} Success status
   */
  async savePolicy(model) {
    const startTime = Date.now();
    
    try {
      logger.debug('Saving all policies to database', { tableName: this.tableName });

      // Use transaction for atomicity
      await databaseService.transaction(async (connection) => {
        // Clear existing policies
        await connection.execute(`DELETE FROM ${this.tableName}`);

        // Get all policies from model
        const policies = [];
        
        // Get 'p' policies
        const pPolicies = model.model.get('p')?.get('p')?.policy || [];
        for (const policy of pPolicies) {
          policies.push({ ptype: 'p', rule: policy });
        }

        // Get 'g' policies (groupings)
        const gPolicies = model.model.get('g')?.get('g')?.policy || [];
        for (const policy of gPolicies) {
          policies.push({ ptype: 'g', rule: policy });
        }

        // Get 'g2' policies if they exist
        const g2Policies = model.model.get('g')?.get('g2')?.policy || [];
        for (const policy of g2Policies) {
          policies.push({ ptype: 'g2', rule: policy });
        }

        // Batch insert for better performance
        if (policies.length > 0) {
          await this.batchInsert(connection, policies);
        }
      });

      // Invalidate cache after save
      this.invalidateCache();

      const duration = Date.now() - startTime;
      this.updateMetrics('savePolicy', duration);
      
      logger.info('Policies saved to database successfully', { 
        count: policies.length,
        duration: `${duration}ms`
      });
      
      this.metrics.savePolicyCount++;
      return true;
    } catch (error) {
      logger.error('Failed to save policies to database', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Batch insert policies for better performance
   * @param {Object} connection - Database connection
   * @param {Array} policies - Array of policy objects
   */
  async batchInsert(connection, policies) {
    const insertQuery = `
      INSERT INTO ${this.tableName} (ptype, v0, v1, v2, v3, v4, v5)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Process in batches
    for (let i = 0; i < policies.length; i += this.batchSize) {
      const batch = policies.slice(i, i + this.batchSize);
      
      // Use prepared statement for batch
      const values = batch.map(({ ptype, rule }) => [
        ptype,
        rule[0] || null,
        rule[1] || null,
        rule[2] || null,
        rule[3] || null,
        rule[4] || null,
        rule[5] || null
      ]);

      // Execute batch insert
      for (const valueSet of values) {
        await connection.execute(insertQuery, valueSet);
      }
    }

    logger.debug('Batch insert completed', { 
      total: policies.length,
      batches: Math.ceil(policies.length / this.batchSize)
    });
  }

  /**
   * Add a policy rule
   * Invalidates cache after addition
   * @param {string} sec - Section ('p' or 'g')
   * @param {string} ptype - Policy type
   * @param {Array<string>} rule - Policy rule
   * @returns {Promise<boolean>} Success status
   */
  async addPolicy(sec, ptype, rule) {
    const startTime = Date.now();
    
    try {
      logger.debug('Adding policy', { sec, ptype, rule });

      const values = [
        ptype,
        rule[0] || null,
        rule[1] || null,
        rule[2] || null,
        rule[3] || null,
        rule[4] || null,
        rule[5] || null
      ];
      
      const query = `
        INSERT INTO ${this.tableName} (ptype, v0, v1, v2, v3, v4, v5)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
      `;

      await this.executeWithRetry(() => databaseService.query(query, values));
      
      // Invalidate cache
      this.invalidateCache();

      const duration = Date.now() - startTime;
      this.updateMetrics('addPolicy', duration);
      
      logger.debug('Policy added successfully', { sec, ptype, rule, duration: `${duration}ms` });
      this.metrics.addPolicyCount++;
      return true;
    } catch (error) {
      logger.error('Failed to add policy', {
        error: error.message,
        sec,
        ptype,
        rule,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Remove a policy rule
   * Invalidates cache after removal
   * @param {string} sec - Section ('p' or 'g')
   * @param {string} ptype - Policy type
   * @param {Array<string>} rule - Policy rule
   * @returns {Promise<boolean>} Success status
   */
  async removePolicy(sec, ptype, rule) {
    const startTime = Date.now();
    
    try {
      logger.debug('Removing policy', { sec, ptype, rule });

      const conditions = ['ptype = ?'];
      const params = [ptype];

      for (let i = 0; i < rule.length; i++) {
        conditions.push(`v${i} = ?`);
        params.push(rule[i]);
      }

      // Also check that remaining v fields are NULL
      for (let i = rule.length; i < 6; i++) {
        conditions.push(`v${i} IS NULL`);
      }

      const query = `DELETE FROM ${this.tableName} WHERE ${conditions.join(' AND ')}`;
      const result = await this.executeWithRetry(() => databaseService.query(query, params));

      // Invalidate cache
      this.invalidateCache();

      const duration = Date.now() - startTime;
      this.updateMetrics('removePolicy', duration);

      logger.debug('Policy removed', { 
        sec, 
        ptype, 
        rule, 
        affected: result.affectedRows || 0,
        duration: `${duration}ms`
      });
      
      this.metrics.removePolicyCount++;
      return true;
    } catch (error) {
      logger.error('Failed to remove policy', {
        error: error.message,
        sec,
        ptype,
        rule,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Remove filtered policies
   * @param {string} sec - Section
   * @param {string} ptype - Policy type
   * @param {number} fieldIndex - Field index
   * @param {string} fieldValue - Field value
   * @returns {Promise<boolean>} Success status
   */
  async removeFilteredPolicy(sec, ptype, fieldIndex, ...fieldValues) {
    const startTime = Date.now();
    
    try {
      logger.debug('Removing filtered policies', { sec, ptype, fieldIndex, fieldValues });

      const conditions = ['ptype = ?'];
      const params = [ptype];

      for (let i = 0; i < fieldValues.length; i++) {
        if (fieldValues[i] !== null && fieldValues[i] !== undefined) {
          conditions.push(`v${fieldIndex + i} = ?`);
          params.push(fieldValues[i]);
        }
      }

      const query = `DELETE FROM ${this.tableName} WHERE ${conditions.join(' AND ')}`;
      const result = await this.executeWithRetry(() => databaseService.query(query, params));

      // Invalidate cache
      this.invalidateCache();

      const duration = Date.now() - startTime;
      this.updateMetrics('removeFilteredPolicy', duration);

      logger.debug('Filtered policies removed', {
        sec,
        ptype,
        count: result.affectedRows || 0,
        duration: `${duration}ms`
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to remove filtered policies', {
        error: error.message,
        sec,
        ptype,
        fieldIndex,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Execute query with retry logic for transient failures
   * @param {Function} queryFn - Function that returns a promise
   * @param {number} attempt - Current attempt number
   * @returns {Promise<any>}
   */
  async executeWithRetry(queryFn, attempt = 1) {
    try {
      const startTime = Date.now();
      const result = await queryFn();
      const duration = Date.now() - startTime;
      this.updateMetrics('query', duration);
      return result;
    } catch (error) {
      // Retry on transient errors
      const isTransient = this.isTransientError(error);
      
      if (isTransient && attempt < this.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
        logger.warn(`Retrying query (attempt ${attempt}/${this.maxRetries})`, {
          error: error.message,
          delay: `${delay}ms`
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(queryFn, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Check if error is transient (can be retried)
   * @param {Error} error - Error object
   * @returns {boolean}
   */
  isTransientError(error) {
    const transientCodes = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'PROTOCOL_CONNECTION_LOST',
      'ER_LOCK_WAIT_TIMEOUT',
      'ER_LOCK_DEADLOCK'
    ];
    
    return transientCodes.some(code => 
      error.code === code || error.message.includes(code)
    );
  }

  /**
   * Update performance metrics
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in milliseconds
   */
  updateMetrics(operation, duration) {
    this.metrics.queryTime.total += duration;
    this.metrics.queryTime.count++;
  }

  /**
   * Get performance metrics
   * @returns {Object} Metrics object
   */
  getMetrics() {
    const avgQueryTime = this.metrics.queryTime.count > 0
      ? this.metrics.queryTime.total / this.metrics.queryTime.count
      : 0;
    
    return {
      ...this.metrics,
      averageQueryTime: `${avgQueryTime.toFixed(2)}ms`,
      cacheHitRate: this.metrics.cacheHits + this.metrics.cacheMisses > 0
        ? `${((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100).toFixed(2)}%`
        : '0%'
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      loadPolicyCount: 0,
      savePolicyCount: 0,
      addPolicyCount: 0,
      removePolicyCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      queryTime: {
        total: 0,
        count: 0
      }
    };
  }

  /**
   * Check if adapter is filtered (not used in our implementation)
   * @returns {boolean}
   */
  isFiltered() {
    return this.filtered;
  }
}

export default MySQLAdapterEnhanced;

