/**
 * @file reportLogging.service.js
 * @description Service for logging report access events
 * @author InsightHub Development Team
 * @created 2025-01-XX
 * @version 1.2.0
 * @copyright 2025 InsightHub. All rights reserved.
 */

import databaseService from './database.js';
import { createContextLogger } from './logger.js';

const logger = createContextLogger('reportLogging.service.js');

/**
 * Report Logging Service
 * Handles logging of all report access events for audit trails and troubleshooting
 */
class ReportLoggingService {
  /**
   * Log a report access event
   * @param {Object} logData - Log entry data
   * @param {string} logData.reportId - Report identifier
   * @param {string} logData.reportName - Report name
   * @param {string} logData.requesterEmail - Requester email
   * @param {string} [logData.requesterUsername] - Requester username
   * @param {string} logData.accessType - Type: manual, scheduled, export, api
   * @param {number} logData.requestDurationMs - Request duration in milliseconds
   * @param {Object} [logData.metadata] - Additional metadata
   * @returns {Promise<number|null>} Log entry ID or null if logging failed
   */
  async logReportAccess(logData) {
    try {
      const {
        reportId,
        reportName,
        requesterEmail,
        requesterUsername,
        accessType = 'manual',
        requestMethod,
        requestPath,
        queryParameters,
        requestDurationMs,
        responseStatus,
        recordsReturned,
        ipAddress,
        userAgent,
        errorMessage,
        metadata
      } = logData;

      // Validate required fields
      if (!reportId || !reportName || !requesterEmail) {
        logger.warn('Incomplete log data provided', {
          reportId: !!reportId,
          reportName: !!reportName,
          requesterEmail: !!requesterEmail
        });
        return null;
      }

      const query = `
        INSERT INTO report_access_logs (
          report_id, report_name, requester_email, requester_username,
          access_type, request_method, request_path, query_parameters,
          request_duration_ms, response_status, records_returned,
          ip_address, user_agent, error_message, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        reportId,
        reportName,
        requesterEmail,
        requesterUsername || null,
        accessType,
        requestMethod || null,
        requestPath || null,
        queryParameters ? JSON.stringify(queryParameters) : null,
        requestDurationMs || null,
        responseStatus || null,
        recordsReturned || null,
        ipAddress || null,
        userAgent || null,
        errorMessage || null,
        metadata ? JSON.stringify(metadata) : null
      ];

      const result = await databaseService.query(query, values);
      
      logger.info('Report access logged successfully', {
        logId: result.insertId,
        reportId,
        requesterEmail,
        accessType,
        requestDurationMs
      });
      
      return result.insertId;
    } catch (error) {
      logger.error('Failed to log report access', {
        error: error.message,
        reportId: logData.reportId,
        requesterEmail: logData.requesterEmail,
        stack: error.stack
      });
      // Don't throw - logging failures shouldn't break the application
      return null;
    }
  }

  /**
   * Get report access logs with filtering
   * @param {Object} filters - Filter criteria
   * @param {string} [filters.reportId] - Filter by report ID
   * @param {string} [filters.requesterEmail] - Filter by requester email
   * @param {string} [filters.accessType] - Filter by access type
   * @param {Date|string} [filters.startDate] - Filter by start date
   * @param {Date|string} [filters.endDate] - Filter by end date
   * @param {number} [limit=100] - Maximum number of logs to return
   * @returns {Promise<Array>} Array of log entries
   */
  async getReportAccessLogs(filters = {}, limit = 100) {
    try {
      let query = 'SELECT * FROM report_access_logs WHERE 1=1';
      const values = [];

      if (filters.reportId) {
        query += ' AND report_id = ?';
        values.push(filters.reportId);
      }

      if (filters.requesterEmail) {
        query += ' AND requester_email = ?';
        values.push(filters.requesterEmail);
      }

      if (filters.accessType) {
        query += ' AND access_type = ?';
        values.push(filters.accessType);
      }

      if (filters.startDate) {
        query += ' AND access_time >= ?';
        values.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND access_time <= ?';
        values.push(filters.endDate);
      }

      query += ' ORDER BY access_time DESC LIMIT ?';
      values.push(limit);

      const logs = await databaseService.query(query, values);
      
      // Parse JSON fields
      return logs.map(log => ({
        ...log,
        query_parameters: log.query_parameters ? JSON.parse(log.query_parameters) : null,
        metadata: log.metadata ? JSON.parse(log.metadata) : null
      }));
    } catch (error) {
      logger.error('Failed to get report access logs', {
        error: error.message,
        filters,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get report access statistics
   * @param {Object} filters - Filter criteria (same as getReportAccessLogs)
   * @returns {Promise<Object>} Statistics object
   */
  async getReportAccessStatistics(filters = {}) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_accesses,
          COUNT(DISTINCT requester_email) as unique_users,
          AVG(request_duration_ms) as avg_duration_ms,
          MIN(request_duration_ms) as min_duration_ms,
          MAX(request_duration_ms) as max_duration_ms,
          SUM(CASE WHEN response_status >= 400 THEN 1 ELSE 0 END) as error_count
        FROM report_access_logs
        WHERE 1=1
      `;
      const values = [];

      if (filters.reportId) {
        query += ' AND report_id = ?';
        values.push(filters.reportId);
      }

      if (filters.requesterEmail) {
        query += ' AND requester_email = ?';
        values.push(filters.requesterEmail);
      }

      if (filters.startDate) {
        query += ' AND access_time >= ?';
        values.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND access_time <= ?';
        values.push(filters.endDate);
      }

      const result = await databaseService.query(query, values);
      
      return result[0] || {
        total_accesses: 0,
        unique_users: 0,
        avg_duration_ms: 0,
        min_duration_ms: 0,
        max_duration_ms: 0,
        error_count: 0
      };
    } catch (error) {
      logger.error('Failed to get report access statistics', {
        error: error.message,
        filters,
        stack: error.stack
      });
      throw error;
    }
  }
}

export default new ReportLoggingService();

