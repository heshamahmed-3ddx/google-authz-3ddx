/**
 * @file reportScheduler.service.js
 * @description Cron-based scheduler for automated report generation and delivery
 * @author InsightHub Development Team
 * @created 2026-01-24
 * @version 1.0.0
 * @copyright 2026 InsightHub. All rights reserved.
 */

import cron from 'node-cron';
import { CONFIG } from '../config/config.js';
import reportScheduleModel from '../models/reportSchedule.model.js';
import reportScheduleLogModel from '../models/reportScheduleLog.model.js';
import reportGeneratorService from './reportGenerator.service.js';
import emailService from './emailService.js';
import { createContextLogger } from './logger.js';

const logger = createContextLogger('reportScheduler.service.js');

/**
 * Report Scheduler Service
 * Manages automated execution of scheduled reports
 */
class ReportSchedulerService {
  constructor() {
    this.cronJob = null;
    this.isRunning = false;
    this.currentlyProcessing = new Set();
    this.stats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      lastCheck: null,
      startedAt: null
    };
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.cronJob) {
      logger.warn('Scheduler already running');
      return;
    }

    if (!CONFIG.scheduling.enabled) {
      logger.info('Scheduling is disabled in configuration');
      return;
    }

    try {
      logger.info('Starting report scheduler', {
        interval: CONFIG.scheduling.checkInterval,
        maxConcurrent: CONFIG.scheduling.maxConcurrentJobs
      });

      // Create cron job
      this.cronJob = cron.schedule(CONFIG.scheduling.checkInterval, async () => {
        await this._checkAndExecutePendingSchedules();
      });

      this.isRunning = true;
      this.stats.startedAt = new Date();

      logger.info('Report scheduler started successfully');

      // Run cleanup on startup
      this._performCleanup();

      // Schedule periodic cleanup (daily at 2 AM)
      cron.schedule('0 2 * * *', async () => {
        await this._performCleanup();
      });

    } catch (error) {
      logger.error('Failed to start scheduler', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (!this.cronJob) {
      logger.warn('Scheduler is not running');
      return;
    }

    logger.info('Stopping report scheduler');
    this.cronJob.stop();
    this.cronJob = null;
    this.isRunning = false;
    
    logger.info('Report scheduler stopped');
  }

  /**
   * Check for and execute pending schedules
   * @private
   */
  async _checkAndExecutePendingSchedules() {
    if (this.currentlyProcessing.size >= CONFIG.scheduling.maxConcurrentJobs) {
      logger.debug('Max concurrent jobs reached, skipping this check', {
        current: this.currentlyProcessing.size,
        max: CONFIG.scheduling.maxConcurrentJobs
      });
      return;
    }

    this.stats.lastCheck = new Date();

    try {
      // Get pending schedules
      const pendingSchedules = await reportScheduleModel.getPendingSchedules(
        CONFIG.scheduling.maxConcurrentJobs - this.currentlyProcessing.size
      );

      if (pendingSchedules.length === 0) {
        logger.debug('No pending schedules found');
        return;
      }

      logger.info('Found pending schedules', { count: pendingSchedules.length });

      // Execute each schedule
      for (const schedule of pendingSchedules) {
        if (this.currentlyProcessing.size >= CONFIG.scheduling.maxConcurrentJobs) {
          break;
        }

        // Execute in background (don't await)
        this._executeSchedule(schedule).catch(error => {
          logger.error('Unhandled error in schedule execution', {
            scheduleId: schedule.id,
            error: error.message
          });
        });
      }

    } catch (error) {
      logger.error('Error checking pending schedules', {
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Execute a single schedule
   * @private
   * @param {Object} schedule - Schedule configuration
   */
  async _executeSchedule(schedule) {
    const scheduleId = schedule.id;
    
    if (this.currentlyProcessing.has(scheduleId)) {
      logger.warn('Schedule already being processed', { scheduleId });
      return;
    }

    this.currentlyProcessing.add(scheduleId);
    this.stats.totalExecutions++;

    let logId = null;
    const startTime = Date.now();

    try {
      logger.info('Executing schedule', {
        scheduleId,
        reportType: schedule.report_type,
        format: schedule.format,
        recipients: schedule.recipients.length
      });

      // Mark as processing
      await reportScheduleModel.markProcessing(scheduleId, true);

      // Create log entry
      logId = await reportScheduleLogModel.create({
        scheduleId,
        recipientsCount: schedule.recipients.length,
        triggeredBy: 'scheduled',
        timezone: schedule.schedule_timezone
      });

      // Generate report
      const reportFile = await reportGeneratorService.generateReport(schedule);

      // Send emails
      const emailResults = await emailService.sendScheduledReport(schedule, reportFile);

      const duration = Date.now() - startTime;
      const status = emailResults.failed === 0 ? 'success' : 
                    emailResults.sent === 0 ? 'failed' : 'partial';

      // Update log with success
      await reportScheduleLogModel.update(logId, {
        status,
        durationMs: duration,
        recipientsSent: emailResults.sent,
        recipientsFailed: emailResults.failed,
        fileSizeBytes: reportFile.fileSize,
        recordsInReport: reportFile.recordsCount,
        errorMessage: emailResults.errors.length > 0 ? 
          JSON.stringify(emailResults.errors) : null,
        metadata: {
          reportDuration: reportFile.duration,
          emailErrors: emailResults.errors
        }
      });

      // Update schedule execution status
      await reportScheduleModel.updateExecutionStatus(
        scheduleId,
        status,
        emailResults.errors.length > 0 ? 
          `${emailResults.failed} email(s) failed` : null
      );

      // Calculate and update next run time
      const nextRun = reportScheduleModel.calculateNextRun(schedule);
      await reportScheduleModel.updateNextRun(scheduleId, nextRun);

      // Clean up generated file
      await reportGeneratorService.deleteFile(reportFile.filePath);

      this.stats.successfulExecutions++;

      logger.info('Schedule executed successfully', {
        scheduleId,
        duration,
        status,
        emailsSent: emailResults.sent,
        emailsFailed: emailResults.failed,
        nextRun
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.stats.failedExecutions++;

      logger.error('Schedule execution failed', {
        scheduleId,
        error: error.message,
        stack: error.stack,
        duration
      });

      // Update log with failure
      if (logId) {
        try {
          await reportScheduleLogModel.update(logId, {
            status: 'failed',
            durationMs: duration,
            errorMessage: error.message,
            errorCode: error.code || 'EXECUTION_ERROR',
            metadata: {
              errorStack: error.stack
            }
          });
        } catch (logError) {
          logger.error('Failed to update log with error', {
            logId,
            error: logError.message
          });
        }
      }

      // Update schedule with failure
      try {
        await reportScheduleModel.updateExecutionStatus(
          scheduleId,
          'failed',
          error.message
        );
      } catch (updateError) {
        logger.error('Failed to update schedule status', {
          scheduleId,
          error: updateError.message
        });
      }

      // Check if we should retry
      if (this._shouldRetry(schedule, error)) {
        await this._scheduleRetry(schedule, logId);
      } else {
        // Calculate next regular run
        try {
          const nextRun = reportScheduleModel.calculateNextRun(schedule);
          await reportScheduleModel.updateNextRun(scheduleId, nextRun);
        } catch (nextRunError) {
          logger.error('Failed to calculate next run', {
            scheduleId,
            error: nextRunError.message
          });
        }
      }

    } finally {
      // Always mark as not processing and remove from set
      try {
        await reportScheduleModel.markProcessing(scheduleId, false);
      } catch (error) {
        logger.error('Failed to unmark processing', {
          scheduleId,
          error: error.message
        });
      }
      
      this.currentlyProcessing.delete(scheduleId);
    }
  }

  /**
   * Check if schedule should be retried
   * @private
   */
  _shouldRetry(schedule, error) {
    // Don't retry validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return false;
    }

    // Check failure count
    const failureCount = schedule.failure_count || 0;
    return failureCount < CONFIG.scheduling.maxRetries;
  }

  /**
   * Schedule a retry
   * @private
   */
  async _scheduleRetry(schedule, logId) {
    try {
      const retryDelay = CONFIG.scheduling.retryDelay;
      const nextRun = new Date(Date.now() + retryDelay);
      
      await reportScheduleModel.updateNextRun(schedule.id, nextRun);
      
      if (logId) {
        await reportScheduleLogModel.incrementRetry(logId);
      }
      
      logger.info('Scheduled retry', {
        scheduleId: schedule.id,
        nextRun,
        retryIn: `${retryDelay / 1000 / 60} minutes`
      });
    } catch (error) {
      logger.error('Failed to schedule retry', {
        scheduleId: schedule.id,
        error: error.message
      });
    }
  }

  /**
   * Perform cleanup tasks
   * @private
   */
  async _performCleanup() {
    logger.info('Starting scheduled cleanup');

    try {
      // Clean up old report files
      const filesDeleted = await reportGeneratorService.cleanupOldFiles();
      
      // Clean up old logs (keep 90 days)
      const logsDeleted = await reportScheduleLogModel.cleanupOldLogs(90);
      
      logger.info('Cleanup completed', { filesDeleted, logsDeleted });
    } catch (error) {
      logger.error('Cleanup failed', {
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Manually trigger a schedule execution
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise<void>}
   */
  async triggerManual(scheduleId) {
    try {
      const schedule = await reportScheduleModel.getById(scheduleId);
      
      if (!schedule) {
        throw new Error(`Schedule ${scheduleId} not found`);
      }

      if (!schedule.is_active) {
        throw new Error(`Schedule ${scheduleId} is not active`);
      }

      logger.info('Manually triggering schedule', { scheduleId });

      // Execute the schedule (but don't update next_run_at)
      await this._executeSchedule(schedule);

    } catch (error) {
      logger.error('Manual trigger failed', {
        scheduleId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get scheduler statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      currentlyProcessing: this.currentlyProcessing.size,
      uptime: this.stats.startedAt ? 
        Date.now() - this.stats.startedAt.getTime() : 0
    };
  }

  /**
   * Get currently processing schedules
   * @returns {Array<number>} Schedule IDs
   */
  getCurrentlyProcessing() {
    return Array.from(this.currentlyProcessing);
  }

  /**
   * Check if scheduler is healthy
   * @returns {boolean}
   */
  isHealthy() {
    if (!this.isRunning) return false;
    
    // Check if last check was recent (within 2 intervals)
    if (this.stats.lastCheck) {
      const timeSinceLastCheck = Date.now() - this.stats.lastCheck.getTime();
      const intervalMs = 2 * 60 * 1000; // 2 minutes (assuming 1 min interval)
      
      if (timeSinceLastCheck > intervalMs) {
        logger.warn('Scheduler may be stuck', {
          timeSinceLastCheck: `${timeSinceLastCheck / 1000}s`,
          threshold: `${intervalMs / 1000}s`
        });
        return false;
      }
    }
    
    return true;
  }
}

// Export singleton instance
export default new ReportSchedulerService();
