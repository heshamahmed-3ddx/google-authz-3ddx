/**
 * @file reportSchedule.controller.js
 * @description HTTP request handlers for report scheduling endpoints
 * @author InsightHub Development Team
 * @created 2026-01-24
 * @version 1.0.0
 * @copyright 2026 InsightHub. All rights reserved.
 */

import reportScheduleModel from '../models/reportSchedule.model.js';
import reportScheduleLogModel from '../models/reportScheduleLog.model.js';
import reportSchedulerService from '../services/reportScheduler.service.js';
import emailService from '../services/emailService.js';
import casbinService from '../services/casbin.js';
import { createContextLogger } from '../services/logger.js';

const logger = createContextLogger('reportSchedule.controller.js');

/**
 * Report Schedule Controller
 * Handles HTTP requests for schedule management
 */
class ReportScheduleController {
  /**
   * Create a new schedule
   * POST /api/reports/schedules
   */
  async createSchedule(req, res) {
    try {
      const userId = req.session?.user?.email || req.user?.email;
      const userName = req.session?.user?.name || req.user?.name;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated'
        });
      }

      const {
        reportType,
        reportName,
        frequency,
        time,
        timezone,
        days,
        recipients,
        format,
        filters
      } = req.body;

      // Validation
      if (!reportType || !reportName || !frequency || !time || !recipients) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: reportType, reportName, frequency, time, recipients'
        });
      }

      if (!Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Recipients must be a non-empty array of email addresses'
        });
      }

      // Validate email addresses
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const email of recipients) {
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            error: `Invalid email address: ${email}`
          });
        }
      }

      // Validate frequency
      const validFrequencies = ['daily', 'weekly', 'monthly', 'custom'];
      if (!validFrequencies.includes(frequency)) {
        return res.status(400).json({
          success: false,
          error: `Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`
        });
      }

      // Validate format
      const validFormats = ['pdf', 'excel', 'html'];
      if (format && !validFormats.includes(format)) {
        return res.status(400).json({
          success: false,
          error: `Invalid format. Must be one of: ${validFormats.join(', ')}`
        });
      }

      // Calculate initial next run time
      const schedule = {
        userId,
        userName,
        reportType,
        reportName,
        frequency,
        time,
        timezone: timezone || 'UTC',
        days,
        recipients,
        format: format || 'pdf',
        filters,
        schedule_frequency: frequency,
        schedule_time: time,
        schedule_timezone: timezone || 'UTC'
      };

      const nextRunAt = reportScheduleModel.calculateNextRun(schedule);
      schedule.nextRunAt = nextRunAt;

      // Create schedule
      const scheduleId = await reportScheduleModel.create(schedule);

      // Fetch the created schedule
      const createdSchedule = await reportScheduleModel.getById(scheduleId);

      logger.info('Schedule created', {
        scheduleId,
        userId,
        reportType,
        frequency
      });

      res.status(201).json({
        success: true,
        data: createdSchedule,
        message: 'Schedule created successfully'
      });

    } catch (error) {
      logger.error('Failed to create schedule', {
        error: error.message,
        stack: error.stack,
        userId: req.session?.user?.email
      });

      res.status(500).json({
        success: false,
        error: 'Failed to create schedule',
        details: error.message
      });
    }
  }

  /**
   * Get all schedules for current user
   * GET /api/reports/schedules
   */
  async getUserSchedules(req, res) {
    try {
      const userId = req.session?.user?.email || req.user?.email;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated'
        });
      }

      const activeOnly = req.query.activeOnly === 'true';
      const schedules = await reportScheduleModel.getByUser(userId, { activeOnly });

      res.json({
        success: true,
        data: schedules,
        count: schedules.length
      });

    } catch (error) {
      logger.error('Failed to get user schedules', {
        error: error.message,
        userId: req.session?.user?.email
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve schedules',
        details: error.message
      });
    }
  }

  /**
   * Get schedule by ID
   * GET /api/reports/schedules/:id
   */
  async getScheduleById(req, res) {
    try {
      const userId = req.session?.user?.email || req.user?.email;
      const scheduleId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated'
        });
      }

      if (isNaN(scheduleId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid schedule ID'
        });
      }

      const schedule = await reportScheduleModel.getById(scheduleId);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      // Check ownership
      if (schedule.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - You do not own this schedule'
        });
      }

      res.json({
        success: true,
        data: schedule
      });

    } catch (error) {
      logger.error('Failed to get schedule', {
        error: error.message,
        scheduleId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve schedule',
        details: error.message
      });
    }
  }

  /**
   * Update schedule
   * PUT /api/reports/schedules/:id
   */
  async updateSchedule(req, res) {
    try {
      const userId = req.session?.user?.email || req.user?.email;
      const scheduleId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated'
        });
      }

      if (isNaN(scheduleId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid schedule ID'
        });
      }

      // Check ownership
      const schedule = await reportScheduleModel.getById(scheduleId);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      if (schedule.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - You do not own this schedule'
        });
      }

      // Extract updatable fields
      const updates = {};
      const allowedFields = [
        'schedule_frequency', 'schedule_time', 'schedule_timezone', 
        'schedule_days', 'recipients', 'format', 'filters', 'report_name'
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      // If frequency or time changed, recalculate next run
      if (updates.schedule_frequency || updates.schedule_time) {
        const updatedSchedule = { ...schedule, ...updates };
        const nextRunAt = reportScheduleModel.calculateNextRun(updatedSchedule);
        updates.next_run_at = nextRunAt;
      }

      await reportScheduleModel.update(scheduleId, updates, userId);

      // Fetch updated schedule
      const updatedSchedule = await reportScheduleModel.getById(scheduleId);

      logger.info('Schedule updated', { scheduleId, userId });

      res.json({
        success: true,
        data: updatedSchedule,
        message: 'Schedule updated successfully'
      });

    } catch (error) {
      logger.error('Failed to update schedule', {
        error: error.message,
        scheduleId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Failed to update schedule',
        details: error.message
      });
    }
  }

  /**
   * Toggle schedule active status
   * PATCH /api/reports/schedules/:id/toggle
   */
  async toggleSchedule(req, res) {
    try {
      const userId = req.session?.user?.email || req.user?.email;
      const scheduleId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated'
        });
      }

      if (isNaN(scheduleId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid schedule ID'
        });
      }

      // Check ownership
      const schedule = await reportScheduleModel.getById(scheduleId);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      if (schedule.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - You do not own this schedule'
        });
      }

      const newStatus = !schedule.is_active;
      await reportScheduleModel.toggleActive(scheduleId, newStatus, userId);

      logger.info('Schedule toggled', { scheduleId, userId, newStatus });

      res.json({
        success: true,
        data: { is_active: newStatus },
        message: `Schedule ${newStatus ? 'activated' : 'deactivated'} successfully`
      });

    } catch (error) {
      logger.error('Failed to toggle schedule', {
        error: error.message,
        scheduleId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Failed to toggle schedule',
        details: error.message
      });
    }
  }

  /**
   * Delete schedule
   * DELETE /api/reports/schedules/:id
   */
  async deleteSchedule(req, res) {
    try {
      const userId = req.session?.user?.email || req.user?.email;
      const scheduleId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated'
        });
      }

      if (isNaN(scheduleId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid schedule ID'
        });
      }

      // Check ownership
      const schedule = await reportScheduleModel.getById(scheduleId);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      if (schedule.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - You do not own this schedule'
        });
      }

      await reportScheduleModel.delete(scheduleId);

      logger.info('Schedule deleted', { scheduleId, userId });

      res.json({
        success: true,
        message: 'Schedule deleted successfully'
      });

    } catch (error) {
      logger.error('Failed to delete schedule', {
        error: error.message,
        scheduleId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Failed to delete schedule',
        details: error.message
      });
    }
  }

  /**
   * Get schedule execution history
   * GET /api/reports/schedules/:id/history
   */
  async getScheduleHistory(req, res) {
    try {
      const userId = req.session?.user?.email || req.user?.email;
      const scheduleId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit) || 50;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated'
        });
      }

      if (isNaN(scheduleId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid schedule ID'
        });
      }

      // Check ownership
      const schedule = await reportScheduleModel.getById(scheduleId);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      if (schedule.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - You do not own this schedule'
        });
      }

      const logs = await reportScheduleLogModel.getByScheduleId(scheduleId, limit);
      logger.info('Logs retrieved successfully', { scheduleId, logCount: logs.length });
      
      const stats = await reportScheduleLogModel.getStatistics(scheduleId);
      logger.info('Statistics retrieved successfully', { scheduleId });

      res.json({
        success: true,
        data: {
          logs,
          statistics: stats
        }
      });

    } catch (error) {
      logger.error('Failed to get schedule history', {
        error: error.message,
        scheduleId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve schedule history',
        details: error.message
      });
    }
  }

  /**
   * Get schedule statistics
   * GET /api/reports/schedules/:id/statistics
   */
  async getScheduleStatistics(req, res) {
    try {
      const userId = req.session?.user?.email || req.user?.email;
      const scheduleId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated'
        });
      }

      if (isNaN(scheduleId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid schedule ID'
        });
      }

      // Check ownership
      const schedule = await reportScheduleModel.getById(scheduleId);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      if (schedule.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - You do not own this schedule'
        });
      }

      const scheduleStats = await reportScheduleModel.getStatistics(scheduleId);
      const executionStats = await reportScheduleLogModel.getStatistics(scheduleId);

      res.json({
        success: true,
        data: {
          schedule: scheduleStats,
          executions: executionStats
        }
      });

    } catch (error) {
      logger.error('Failed to get schedule statistics', {
        error: error.message,
        scheduleId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve schedule statistics',
        details: error.message
      });
    }
  }

  /**
   * Manually trigger schedule execution
   * POST /api/reports/schedules/:id/trigger
   */
  async triggerSchedule(req, res) {
    try {
      const userId = req.session?.user?.email || req.user?.email;
      const scheduleId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated'
        });
      }

      if (isNaN(scheduleId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid schedule ID'
        });
      }

      // Check ownership
      const schedule = await reportScheduleModel.getById(scheduleId);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      if (schedule.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - You do not own this schedule'
        });
      }

      // Trigger execution (async)
      reportSchedulerService.triggerManual(scheduleId).catch(error => {
        logger.error('Manual trigger execution failed', {
          scheduleId,
          error: error.message
        });
      });

      logger.info('Schedule manually triggered', { scheduleId, userId });

      res.json({
        success: true,
        message: 'Schedule triggered successfully. Report generation has started.',
        data: { scheduleId }
      });

    } catch (error) {
      logger.error('Failed to trigger schedule', {
        error: error.message,
        scheduleId: req.params.id
      });

      res.status(500).json({
        success: false,
        error: 'Failed to trigger schedule',
        details: error.message
      });
    }
  }

  /**
   * Get scheduler status (admin only)
   * GET /api/reports/schedules/system/status
   */
  async getSchedulerStatus(req, res) {
    try {
      const userId = req.session?.user?.email || req.user?.email;

      // Check if user is admin (has access to Developers22 group)
      const hasAccess = await casbinService.enforce(userId, 'admin', 'read');
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - Admin privileges required'
        });
      }

      const stats = reportSchedulerService.getStats();
      const currentlyProcessing = reportSchedulerService.getCurrentlyProcessing();
      const isHealthy = reportSchedulerService.isHealthy();
      const emailConfigured = emailService.isConfigured();

      res.json({
        success: true,
        data: {
          scheduler: {
            ...stats,
            isHealthy,
            currentlyProcessing
          },
          email: {
            configured: emailConfigured,
            provider: emailConfigured ? 'configured' : 'not configured'
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get scheduler status', {
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve scheduler status',
        details: error.message
      });
    }
  }

  /**
   * Test email configuration
   * POST /api/reports/schedules/system/test-email
   */
  async testEmail(req, res) {
    try {
      const userId = req.session?.user?.email || req.user?.email;
      const { recipient } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated'
        });
      }

      if (!recipient) {
        return res.status(400).json({
          success: false,
          error: 'Recipient email address is required'
        });
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email address'
        });
      }

      await emailService.sendTestEmail(recipient);

      logger.info('Test email sent', { userId, recipient });

      res.json({
        success: true,
        message: `Test email sent successfully to ${recipient}`
      });

    } catch (error) {
      logger.error('Failed to send test email', {
        error: error.message,
        recipient: req.body.recipient
      });

      res.status(500).json({
        success: false,
        error: 'Failed to send test email',
        details: error.message
      });
    }
  }
}

export default new ReportScheduleController();
