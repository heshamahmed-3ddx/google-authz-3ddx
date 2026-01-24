/**
 * @file reportSchedule.routes.js
 * @description API routes for report scheduling system
 * @author InsightHub Development Team
 * @created 2026-01-24
 * @version 1.0.0
 * @copyright 2026 InsightHub. All rights reserved.
 */

import express from 'express';
import reportScheduleController from '../controllers/reportSchedule.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ReportSchedule:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Schedule ID
 *         user_id:
 *           type: string
 *           description: User email who created the schedule
 *         report_type:
 *           type: string
 *           description: Type of report (surgical_guide, powerbi, etc)
 *         report_name:
 *           type: string
 *           description: Human-readable report name
 *         schedule_frequency:
 *           type: string
 *           enum: [daily, weekly, monthly, custom]
 *           description: How often to run the schedule
 *         schedule_time:
 *           type: string
 *           description: Time of day to run (HH:MM:SS)
 *         schedule_timezone:
 *           type: string
 *           description: Timezone (e.g., America/New_York)
 *         recipients:
 *           type: array
 *           items:
 *             type: string
 *           description: Email addresses of recipients
 *         format:
 *           type: string
 *           enum: [pdf, excel, html]
 *           description: Output format
 *         filters:
 *           type: object
 *           description: Report-specific filters
 *         is_active:
 *           type: boolean
 *           description: Whether schedule is active
 *         next_run_at:
 *           type: string
 *           format: date-time
 *           description: Next scheduled execution time
 *         last_run_at:
 *           type: string
 *           format: date-time
 *           description: Last execution time
 *         execution_count:
 *           type: integer
 *           description: Total successful executions
 *         failure_count:
 *           type: integer
 *           description: Total failed executions
 */

/**
 * @swagger
 * /api/reports/schedules:
 *   post:
 *     summary: Create a new report schedule
 *     tags: [Report Schedules]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportType
 *               - reportName
 *               - frequency
 *               - time
 *               - recipients
 *             properties:
 *               reportType:
 *                 type: string
 *                 description: Type of report
 *                 example: surgical_guide
 *               reportName:
 *                 type: string
 *                 description: Human-readable report name
 *                 example: Monthly Surgical Guide Report
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly, custom]
 *                 example: monthly
 *               time:
 *                 type: string
 *                 description: Time in HH:MM format
 *                 example: "08:00"
 *               timezone:
 *                 type: string
 *                 description: Timezone identifier
 *                 example: America/New_York
 *               days:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Days for weekly/monthly schedules
 *                 example: ["Mon", "Wed", "Fri"]
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Recipient email addresses
 *                 example: ["user1@example.com", "user2@example.com"]
 *               format:
 *                 type: string
 *                 enum: [pdf, excel, html]
 *                 example: pdf
 *               filters:
 *                 type: object
 *                 description: Report-specific filters
 *                 example: { "startDate": "2024-01-01", "endDate": "2024-12-31" }
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/schedules', requireAuth, reportScheduleController.createSchedule);

/**
 * @swagger
 * /api/reports/schedules:
 *   get:
 *     summary: Get all schedules for current user
 *     tags: [Report Schedules]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *         description: Only return active schedules
 *     responses:
 *       200:
 *         description: List of schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ReportSchedule'
 *                 count:
 *                   type: integer
 */
router.get('/schedules', requireAuth, reportScheduleController.getUserSchedules);

/**
 * @swagger
 * /api/reports/schedules/{id}:
 *   get:
 *     summary: Get schedule by ID
 *     tags: [Report Schedules]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Schedule ID
 *     responses:
 *       200:
 *         description: Schedule details
 *       403:
 *         description: Access denied
 *       404:
 *         description: Schedule not found
 */
router.get('/schedules/:id', requireAuth, reportScheduleController.getScheduleById);

/**
 * @swagger
 * /api/reports/schedules/{id}:
 *   put:
 *     summary: Update schedule
 *     tags: [Report Schedules]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schedule_frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly, custom]
 *               schedule_time:
 *                 type: string
 *               schedule_timezone:
 *                 type: string
 *               schedule_days:
 *                 type: array
 *                 items:
 *                   type: string
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *               format:
 *                 type: string
 *                 enum: [pdf, excel, html]
 *               filters:
 *                 type: object
 *               report_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Schedule not found
 */
router.put('/schedules/:id', requireAuth, reportScheduleController.updateSchedule);

/**
 * @swagger
 * /api/reports/schedules/{id}/toggle:
 *   patch:
 *     summary: Toggle schedule active status
 *     tags: [Report Schedules]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedule status toggled successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Schedule not found
 */
router.patch('/schedules/:id/toggle', requireAuth, reportScheduleController.toggleSchedule);

/**
 * @swagger
 * /api/reports/schedules/{id}:
 *   delete:
 *     summary: Delete schedule
 *     tags: [Report Schedules]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Schedule not found
 */
router.delete('/schedules/:id', requireAuth, reportScheduleController.deleteSchedule);

/**
 * @swagger
 * /api/reports/schedules/{id}/history:
 *   get:
 *     summary: Get schedule execution history
 *     tags: [Report Schedules]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of log entries to return
 *     responses:
 *       200:
 *         description: Execution history and statistics
 *       403:
 *         description: Access denied
 *       404:
 *         description: Schedule not found
 */
router.get('/schedules/:id/history', requireAuth, reportScheduleController.getScheduleHistory);

/**
 * @swagger
 * /api/reports/schedules/{id}/statistics:
 *   get:
 *     summary: Get schedule statistics
 *     tags: [Report Schedules]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedule statistics
 *       403:
 *         description: Access denied
 *       404:
 *         description: Schedule not found
 */
router.get('/schedules/:id/statistics', requireAuth, reportScheduleController.getScheduleStatistics);

/**
 * @swagger
 * /api/reports/schedules/{id}/trigger:
 *   post:
 *     summary: Manually trigger schedule execution
 *     tags: [Report Schedules]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedule triggered successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Schedule not found
 */
router.post('/schedules/:id/trigger', requireAuth, reportScheduleController.triggerSchedule);

/**
 * @swagger
 * /api/reports/schedules/system/status:
 *   get:
 *     summary: Get scheduler system status (Admin only)
 *     tags: [Report Schedules]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Scheduler status information
 *       403:
 *         description: Access denied - Admin privileges required
 */
router.get('/schedules/system/status', requireAuth, reportScheduleController.getSchedulerStatus);

/**
 * @swagger
 * /api/reports/schedules/system/test-email:
 *   post:
 *     summary: Send test email to verify configuration
 *     tags: [Report Schedules]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient
 *             properties:
 *               recipient:
 *                 type: string
 *                 format: email
 *                 description: Email address to send test email to
 *     responses:
 *       200:
 *         description: Test email sent successfully
 *       400:
 *         description: Invalid email address
 *       401:
 *         description: Unauthorized
 */
router.post('/schedules/system/test-email', requireAuth, reportScheduleController.testEmail);

export default router;
