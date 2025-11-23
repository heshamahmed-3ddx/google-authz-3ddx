/**
 * @file casbin-mysql-adapter.js
 * @description MySQL adapter for Casbin policy storage
 * @author 3D Diagnostix Development Team
 * @created 2025-01-XX
 * @version 1.0.0
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
 */

import databaseService from '../services/database.js';
import { createContextLogger } from '../services/logger.js';

const logger = createContextLogger('CasbinMySQLAdapter', 'CasbinMySQLAdapter');

/**
 * MySQL Adapter for Casbin
 * Implements Casbin adapter interface for MySQL database storage
 */
class MySQLAdapter {
  /**
   * @param {string} tableName - Name of the casbin_rule table (default: 'casbin_rule')
   */
  constructor(tableName = 'casbin_rule') {
    this.tableName = tableName;
    this.filtered = false;
  }

  /**
   * Load all policy rules from database into Casbin model
   * @param {Object} model - Casbin model instance
   * @returns {Promise<void>}
   */
  async loadPolicy(model) {
    try {
      logger.debug('Loading policies from database', { tableName: this.tableName });

      const query = `SELECT ptype, v0, v1, v2, v3, v4, v5 FROM ${this.tableName} ORDER BY id`;
      const rows = await databaseService.query(query);

      for (const row of rows) {
        this.loadPolicyLine(row, model);
      }

      logger.info('Policies loaded from database', { count: rows.length });
    } catch (error) {
      logger.error('Failed to load policies from database', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
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
   * @param {Object} model - Casbin model instance
   * @returns {Promise<boolean>} Success status
   */
  async savePolicy(model) {
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

        // Insert all policies using parameterized queries
        if (policies.length > 0) {
          const insertQuery = `
            INSERT INTO ${this.tableName} (ptype, v0, v1, v2, v3, v4, v5)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          for (const { ptype, rule } of policies) {
            const values = [
              ptype,
              rule[0] || null,
              rule[1] || null,
              rule[2] || null,
              rule[3] || null,
              rule[4] || null,
              rule[5] || null
            ];
            await connection.execute(insertQuery, values);
          }
        }
      });

      logger.info('Policies saved to database successfully');
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
   * Add a policy rule
   * @param {string} sec - Section ('p' or 'g')
   * @param {string} ptype - Policy type
   * @param {Array<string>} rule - Policy rule
   * @returns {Promise<boolean>} Success status
   */
  async addPolicy(sec, ptype, rule) {
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

      await databaseService.query(query, values);
      logger.debug('Policy added successfully', { sec, ptype, rule });
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
   * @param {string} sec - Section ('p' or 'g')
   * @param {string} ptype - Policy type
   * @param {Array<string>} rule - Policy rule
   * @returns {Promise<boolean>} Success status
   */
  async removePolicy(sec, ptype, rule) {
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
      const result = await databaseService.query(query, params);

      logger.debug('Policy removed', { sec, ptype, rule, affected: result.affectedRows || 0 });
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
      const result = await databaseService.query(query, params);

      logger.debug('Filtered policies removed', {
        sec,
        ptype,
        count: result.affectedRows || 0
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
   * Check if adapter is filtered (not used in our implementation)
   * @returns {boolean}
   */
  isFiltered() {
    return this.filtered;
  }
}

export default MySQLAdapter;

