/**
 * @file reportScheduleLog.model.js
 * @description Database operations for schedule execution logs
 * @author InsightHub Development Team
 * @created 2026-01-24
 * @version 1.0.0
 * @copyright 2026 InsightHub. All rights reserved.
 */

import databaseService from '../services/database.js';
import { createContextLogger } from '../services/logger.js';

const logger = createContextLogger('reportScheduleLog.model.js');

/**
 * Report Schedule Log Model
 * Handles all database operations for schedule execution logs
 */
class ReportScheduleLogModel {
  /**
   * Create log entry for schedule execution
   * @param {Object} logData - Log entry data
   * @param {number} logData.scheduleId - Schedule ID
   * @param {number} logData.recipientsCount - Number of recipients
   * @param {string} logData.triggeredBy - How execution was triggered
   * @param {string} logData.timezone - Timezone of execution
   * @returns {Promise<number>} Created log ID
   */
  async create(logData) {
    try {
      const query = `
        INSERT INTO report_schedule_logs (
          schedule_id, status, started_at, email_recipients
        ) VALUES (?, ?, NOW(), ?)
      `;

      const values = [
        logData.scheduleId,
        'pending',
        logData.recipients ? JSON.stringify(logData.recipients) : null
      ];

      const result = await databaseService.query(query, values);
      logger.info('Schedule log created', { 
        logId: result.insertId,
        scheduleId: logData.scheduleId
      });
      
      return result.insertId;
    } catch (error) {
      logger.error('Failed to create schedule log', {
        error: error.message,
        scheduleId: logData.scheduleId
      });
      throw error;
    }
  }

  /**
   * Update log entry with execution results
   * @param {number} logId - Log entry ID
   * @param {Object} updates - Update data
   * @param {string} updates.status - Execution status
   * @param {number} updates.durationMs - Duration in milliseconds
   * @param {number} updates.recipientsSent - Successfully sent count
   * @param {number} updates.recipientsFailed - Failed count
   * @param {number} updates.fileSizeBytes - Generated file size
   * @param {number} updates.recordsInReport - Record count
   * @param {string} updates.errorMessage - Error message if failed
   * @param {string} updates.errorCode - Error code if failed
   * @param {Object} updates.metadata - Additional metadata
   * @returns {Promise<void>}
   */
  async update(logId, updates) {
    try {
      const query = `
        UPDATE report_schedule_logs
        SET 
          status = ?,
          completed_at = NOW(),
          duration_ms = ?,
          recipients_sent = ?,
          recipients_failed = ?,
          file_size_bytes = ?,
          records_in_report = ?,
          error_message = ?,
          error_code = ?,
          metadata = ?
        WHERE id = ?
      `;

      const values = [
        updates.status,
        updates.durationMs,
        updates.recipientsSent || 0,
        updates.recipientsFailed || 0,
        updates.fileSizeBytes,
        updates.recordsInReport,
        updates.errorMessage,
        updates.errorCode,
        updates.metadata ? JSON.stringify(updates.metadata) : null,
        logId
      ];

      await databaseService.query(query, values);
      logger.info('Schedule log updated', { 
        logId,
        status: updates.status
      });
    } catch (error) {
      logger.error('Failed to update schedule log', {
        error: error.message,
        logId
      });
      throw error;
    }
  }

  /**
   * Increment retry count for a log entry
   * @param {number} logId - Log entry ID
   * @returns {Promise<void>}
   */
  async incrementRetry(logId) {
    try {
      const query = `
        UPDATE report_schedule_logs
        SET retry_count = retry_count + 1
        WHERE id = ?
      `;
      
      await databaseService.query(query, [logId]);
      logger.info('Retry count incremented', { logId });
    } catch (error) {
      logger.error('Failed to increment retry count', {
        error: error.message,
        logId
      });
      throw error;
    }
  }

  /**
   * Get logs for a specific schedule
   * @param {number} scheduleId - Schedule ID
   * @param {number} limit - Maximum number of logs to return
   * @returns {Promise<Array<Object>>} Array of log entries
   */
  async getByScheduleId(scheduleId, limit = 50) {
    try {
      // Ensure limit is an integer and safe for SQL injection
      const safeLimit = Math.max(1, Math.min(parseInt(limit) || 50, 1000));
      
      const query = `
        SELECT * FROM report_schedule_logs
        WHERE schedule_id = ?
        ORDER BY started_at DESC
        LIMIT ${safeLimit}
      `;
      
      const rows = await databaseService.query(query, [parseInt(scheduleId)]);
      
      // Handle empty results
      if (!rows || rows.length === 0) {
        return [];
      }
      
      // Parse each row safely
      return rows.map((row, index) => {
        try {
          return this._parseLog(row);
        } catch (parseError) {
          logger.error('Failed to parse log row', {
            error: parseError.message,
            rowIndex: index,
            logId: row?.id
          });
          // Return raw row if parsing fails
          return row;
        }
      });
    } catch (error) {
      console.error('=== DETAILED ERROR in getByScheduleId ===');
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      console.error('Error stack:', error.stack);
      console.error('Schedule ID:', scheduleId);
      console.error('Limit:', limit);
      console.error('=========================================');
      
      logger.error('Failed to get logs by schedule ID', {
        error: error.message,
        stack: error.stack,
        scheduleId
      });
      throw error;
    }
  }

  /**
   * Get recent logs across all schedules
   * @param {number} limit - Maximum number of logs to return
   * @param {string} status - Filter by status (optional)
   * @returns {Promise<Array<Object>>} Array of log entries
   */
  async getRecent(limit = 100, status = null) {
    try {
      let query = `
        SELECT l.*, s.report_name, s.user_id
        FROM report_schedule_logs l
        JOIN report_schedules s ON l.schedule_id = s.id
      `;
      
      const params = [];
      
      if (status) {
        query += ` WHERE l.status = ?`;
        params.push(status);
      }
      
      query += ` ORDER BY l.started_at DESC LIMIT ?`;
      params.push(limit);
      
      const rows = await databaseService.query(query, params);
      return rows.map(row => this._parseLog(row));
    } catch (error) {
      logger.error('Failed to get recent logs', {
        error: error.message,
        status
      });
      throw error;
    }
  }

  /**
   * Get execution statistics for a schedule
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics(scheduleId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_executions,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          0 as partial,
          AVG(duration_ms) as avg_duration_ms,
          MAX(duration_ms) as max_duration_ms,
          MIN(duration_ms) as min_duration_ms,
          MAX(started_at) as last_execution,
          SUM(CASE WHEN email_sent = 1 THEN 1 ELSE 0 END) as total_recipients_sent,
          SUM(CASE WHEN email_sent = 0 THEN 1 ELSE 0 END) as total_recipients_failed,
          AVG(file_size) as avg_file_size_bytes
        FROM report_schedule_logs
        WHERE schedule_id = ?
      `;
      
      const rows = await databaseService.query(query, [scheduleId]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Failed to get execution statistics', {
        error: error.message,
        scheduleId
      });
      throw error;
    }
  }

  /**
   * Get overall system statistics
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @returns {Promise<Object>} System statistics
   */
  async getSystemStatistics(options = {}) {
    try {
      let query = `
        SELECT 
          COUNT(DISTINCT schedule_id) as active_schedules,
          COUNT(*) as total_executions,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_executions,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_executions,
          AVG(duration_ms) as avg_duration_ms,
          SUM(recipients_sent) as total_emails_sent,
          SUM(file_size_bytes) as total_data_generated
        FROM report_schedule_logs
        WHERE 1=1
      `;
      
      const params = [];
      
      if (options.startDate) {
        query += ` AND started_at >= ?`;
        params.push(options.startDate);
      }
      
      if (options.endDate) {
        query += ` AND started_at <= ?`;
        params.push(options.endDate);
      }
      
      const rows = await databaseService.query(query, params);
      return rows[0] || null;
    } catch (error) {
      logger.error('Failed to get system statistics', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Delete old logs (cleanup)
   * @param {number} daysToKeep - Number of days of logs to retain
   * @returns {Promise<number>} Number of deleted logs
   */
  async cleanupOldLogs(daysToKeep = 90) {
    try {
      const query = `
        DELETE FROM report_schedule_logs
        WHERE started_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `;
      
      const result = await databaseService.query(query, [daysToKeep]);
      logger.info('Old logs cleaned up', { 
        deletedCount: result.affectedRows,
        daysToKeep
      });
      
      return result.affectedRows;
    } catch (error) {
      logger.error('Failed to cleanup old logs', {
        error: error.message,
        daysToKeep
      });
      throw error;
    }
  }

  /**
   * Parse log row (convert JSON fields)
   * @private
   * @param {Object} row - Database row
   * @returns {Object} Parsed log object
   */
  _parseLog(row) {
    // Helper to parse JSON fields - handles both string and already-parsed objects
    const parseJsonField = (field) => {
      if (!field) return null;
      if (typeof field === 'object') return field;
      try {
        return JSON.parse(field);
      } catch {
        return null;
      }
    };

    return {
      ...row,
      email_recipients: parseJsonField(row.email_recipients)
    };
  }
}

export default new ReportScheduleLogModel();
