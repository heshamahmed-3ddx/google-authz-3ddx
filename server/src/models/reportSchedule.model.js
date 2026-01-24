/**
 * @file reportSchedule.model.js
 * @description Database operations for report schedules
 * @author InsightHub Development Team
 * @created 2026-01-24
 * @version 1.0.0
 * @copyright 2026 InsightHub. All rights reserved.
 */

import databaseService from '../services/database.js';
import { createContextLogger } from '../services/logger.js';

const logger = createContextLogger('reportSchedule.model.js');

/**
 * Report Schedule Model
 * Handles all database operations for report schedules
 */
class ReportScheduleModel {
  /**
   * Create a new schedule
   * @param {Object} scheduleData - Schedule details
   * @param {string} scheduleData.userId - User email
   * @param {string} scheduleData.userName - User full name
   * @param {string} scheduleData.reportType - Report type identifier
   * @param {string} scheduleData.reportName - Human-readable report name
   * @param {string} scheduleData.frequency - Schedule frequency
   * @param {string} scheduleData.time - Time of day (HH:MM:SS)
   * @param {string} scheduleData.timezone - Timezone (e.g., 'America/New_York')
   * @param {Array<string>} scheduleData.days - Days for weekly/monthly
   * @param {Array<string>} scheduleData.recipients - Email addresses
   * @param {string} scheduleData.format - Output format (pdf, excel, html)
   * @param {Object} scheduleData.filters - Report filters
   * @param {Date} scheduleData.nextRunAt - Next execution time
   * @returns {Promise<number>} Created schedule ID
   */
  async create(scheduleData) {
    try {
      const query = `
        INSERT INTO report_schedules (
          user_id, user_name, report_type, report_name,
          schedule_frequency, schedule_time, schedule_timezone, schedule_days,
          recipients, format, filters, next_run_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        scheduleData.userId,
        scheduleData.userName,
        scheduleData.reportType,
        scheduleData.reportName,
        scheduleData.frequency,
        scheduleData.time,
        scheduleData.timezone || 'UTC',
        scheduleData.days ? JSON.stringify(scheduleData.days) : null,
        JSON.stringify(scheduleData.recipients),
        scheduleData.format || 'pdf',
        scheduleData.filters ? JSON.stringify(scheduleData.filters) : null,
        scheduleData.nextRunAt,
        scheduleData.userId
      ];

      const result = await databaseService.query(query, values);
      logger.info('Schedule created', { 
        scheduleId: result.insertId,
        userId: scheduleData.userId,
        reportType: scheduleData.reportType
      });
      
      return result.insertId;
    } catch (error) {
      logger.error('Failed to create schedule', {
        error: error.message,
        userId: scheduleData.userId
      });
      throw error;
    }
  }

  /**
   * Get schedule by ID
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise<Object|null>} Schedule data or null if not found
   */
  async getById(scheduleId) {
    try {
      const query = `
        SELECT * FROM report_schedules WHERE id = ?
      `;
      const rows = await databaseService.query(query, [scheduleId]);
      
      if (rows.length === 0) {
        logger.warn('Schedule not found', { scheduleId });
        return null;
      }
      
      return this._parseSchedule(rows[0]);
    } catch (error) {
      logger.error('Failed to get schedule by ID', {
        error: error.message,
        scheduleId
      });
      throw error;
    }
  }

  /**
   * Get all schedules for a user
   * @param {string} userId - User email
   * @param {Object} options - Query options
   * @param {boolean} options.activeOnly - Only return active schedules
   * @returns {Promise<Array<Object>>} Array of schedules
   */
  async getByUser(userId, options = {}) {
    try {
      let query = `
        SELECT * FROM report_schedules 
        WHERE user_id = ?
      `;
      
      const params = [userId];
      
      if (options.activeOnly) {
        query += ` AND is_active = TRUE`;
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const rows = await databaseService.query(query, params);
      return rows.map(row => this._parseSchedule(row));
    } catch (error) {
      logger.error('Failed to get schedules by user', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  /**
   * Get pending schedules (due to run)
   * @param {number} limit - Maximum number of schedules to return
   * @returns {Promise<Array<Object>>} Array of pending schedules
   */
  async getPendingSchedules(limit = 100) {
    try {
      const query = `
        SELECT * FROM report_schedules
        WHERE is_active = TRUE
          AND is_processing = FALSE
          AND next_run_at <= NOW()
        ORDER BY next_run_at ASC
        LIMIT ?
      `;
      
      const rows = await databaseService.query(query, [limit]);
      logger.info('Retrieved pending schedules', { count: rows.length });
      
      return rows.map(row => this._parseSchedule(row));
    } catch (error) {
      logger.error('Failed to get pending schedules', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Update schedule
   * @param {number} scheduleId - Schedule ID
   * @param {Object} updates - Fields to update
   * @param {string} userId - User making the update
   * @returns {Promise<void>}
   */
  async update(scheduleId, updates, userId) {
    try {
      const allowedFields = [
        'schedule_frequency', 'schedule_time', 'schedule_timezone', 'schedule_days',
        'recipients', 'format', 'filters', 'is_active', 'next_run_at', 'report_name'
      ];
      
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = ?`);
          if (['recipients', 'filters', 'schedule_days'].includes(key) && typeof value === 'object') {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }
      
      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      fields.push('updated_by = ?', 'updated_at = NOW()');
      values.push(userId, scheduleId);
      
      const query = `
        UPDATE report_schedules
        SET ${fields.join(', ')}
        WHERE id = ?
      `;
      
      await databaseService.query(query, values);
      logger.info('Schedule updated', { scheduleId, userId, fields: Object.keys(updates) });
    } catch (error) {
      logger.error('Failed to update schedule', {
        error: error.message,
        scheduleId,
        userId
      });
      throw error;
    }
  }

  /**
   * Mark schedule as processing
   * @param {number} scheduleId - Schedule ID
   * @param {boolean} isProcessing - Processing state
   * @returns {Promise<void>}
   */
  async markProcessing(scheduleId, isProcessing) {
    try {
      const query = `
        UPDATE report_schedules
        SET is_processing = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      await databaseService.query(query, [isProcessing, scheduleId]);
      logger.info('Schedule processing status updated', { scheduleId, isProcessing });
    } catch (error) {
      logger.error('Failed to mark schedule as processing', {
        error: error.message,
        scheduleId
      });
      throw error;
    }
  }

  /**
   * Update execution status after run
   * @param {number} scheduleId - Schedule ID
   * @param {string} status - Execution status (success, failed, partial)
   * @param {string|null} errorMessage - Error message if failed
   * @returns {Promise<void>}
   */
  async updateExecutionStatus(scheduleId, status, errorMessage = null) {
    try {
      const query = `
        UPDATE report_schedules
        SET 
          last_run_at = NOW(),
          last_run_status = ?,
          last_error_message = ?,
          execution_count = CASE WHEN ? = 'success' THEN execution_count + 1 ELSE execution_count END,
          failure_count = CASE WHEN ? = 'failed' THEN failure_count + 1 ELSE failure_count END,
          is_processing = FALSE,
          updated_at = NOW()
        WHERE id = ?
      `;
      
      await databaseService.query(query, [
        status,
        errorMessage,
        status,
        status,
        scheduleId
      ]);
      
      logger.info('Schedule execution status updated', { scheduleId, status });
    } catch (error) {
      logger.error('Failed to update execution status', {
        error: error.message,
        scheduleId
      });
      throw error;
    }
  }

  /**
   * Calculate next run time based on frequency
   * @param {Object} schedule - Schedule object
   * @returns {Date} Next run time
   */
  calculateNextRun(schedule) {
    const now = new Date();
    const [hours, minutes, seconds = '0'] = schedule.schedule_time.split(':');
    
    let next = new Date(now);
    next.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds), 0);
    
    // If the time has passed today, start from tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    switch (schedule.schedule_frequency) {
      case 'daily':
        // Already set to next occurrence
        break;
        
      case 'weekly':
        if (schedule.days && schedule.days.length > 0) {
          // Find next matching day
          const daysMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
          const targetDays = schedule.days.map(d => daysMap[d]).sort((a, b) => a - b);
          const currentDay = next.getDay();
          
          let nextDay = targetDays.find(d => d > currentDay);
          if (!nextDay) {
            nextDay = targetDays[0];
            next.setDate(next.getDate() + (7 - currentDay + nextDay));
          } else {
            next.setDate(next.getDate() + (nextDay - currentDay));
          }
        } else {
          // Default to weekly (7 days)
          next.setDate(next.getDate() + 7);
        }
        break;
        
      case 'monthly':
        if (schedule.days && schedule.days.length > 0) {
          // Schedule runs on specific days of month
          const targetDays = schedule.days.map(d => parseInt(d)).sort((a, b) => a - b);
          const currentDay = next.getDate();
          
          let nextDay = targetDays.find(d => d > currentDay);
          if (!nextDay) {
            // Move to next month, first target day
            next.setMonth(next.getMonth() + 1);
            next.setDate(targetDays[0]);
          } else {
            next.setDate(nextDay);
          }
        } else {
          // Default to monthly (same day next month)
          next.setMonth(next.getMonth() + 1);
        }
        break;
        
      case 'custom':
        // For custom, don't auto-calculate (must be set manually)
        break;
    }
    
    return next;
  }

  /**
   * Update next run time for a schedule
   * @param {number} scheduleId - Schedule ID
   * @param {Date} nextRunAt - Next run time
   * @returns {Promise<void>}
   */
  async updateNextRun(scheduleId, nextRunAt) {
    try {
      const query = `
        UPDATE report_schedules
        SET next_run_at = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      await databaseService.query(query, [nextRunAt, scheduleId]);
      logger.info('Next run time updated', { scheduleId, nextRunAt });
    } catch (error) {
      logger.error('Failed to update next run time', {
        error: error.message,
        scheduleId
      });
      throw error;
    }
  }

  /**
   * Toggle schedule active status
   * @param {number} scheduleId - Schedule ID
   * @param {boolean} isActive - Active status
   * @param {string} userId - User making the change
   * @returns {Promise<void>}
   */
  async toggleActive(scheduleId, isActive, userId) {
    try {
      const query = `
        UPDATE report_schedules
        SET is_active = ?, updated_by = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      await databaseService.query(query, [isActive, userId, scheduleId]);
      logger.info('Schedule active status toggled', { scheduleId, isActive, userId });
    } catch (error) {
      logger.error('Failed to toggle schedule active status', {
        error: error.message,
        scheduleId
      });
      throw error;
    }
  }

  /**
   * Delete schedule
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise<void>}
   */
  async delete(scheduleId) {
    try {
      const query = `DELETE FROM report_schedules WHERE id = ?`;
      await databaseService.query(query, [scheduleId]);
      logger.info('Schedule deleted', { scheduleId });
    } catch (error) {
      logger.error('Failed to delete schedule', {
        error: error.message,
        scheduleId
      });
      throw error;
    }
  }

  /**
   * Get schedule statistics
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics(scheduleId) {
    try {
      const query = `
        SELECT 
          execution_count,
          failure_count,
          last_run_at,
          last_run_status,
          created_at
        FROM report_schedules
        WHERE id = ?
      `;
      
      const rows = await databaseService.query(query, [scheduleId]);
      return rows[0] || null;
    } catch (error) {
      logger.error('Failed to get schedule statistics', {
        error: error.message,
        scheduleId
      });
      throw error;
    }
  }

  /**
   * Parse schedule row (convert JSON fields)
   * @private
   * @param {Object} row - Database row
   * @returns {Object} Parsed schedule object
   */
  _parseSchedule(row) {
    try {
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
        recipients: row.recipients ? (typeof row.recipients === 'object' ? row.recipients : JSON.parse(row.recipients)) : [],
        filters: parseJsonField(row.filters),
        schedule_days: parseJsonField(row.schedule_days),
        is_active: Boolean(row.is_active),
        is_processing: Boolean(row.is_processing)
      };
    } catch (error) {
      logger.error('Failed to parse schedule row', { error: error.message, row });
      throw error;
    }
  }
}

export default new ReportScheduleModel();
