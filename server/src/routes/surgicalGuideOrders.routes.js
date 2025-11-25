/**
 * @file surgicalGuideOrders.routes.js
 * @description Routes for surgical guide orders API endpoints with Swagger documentation
 * @author 3D Diagnostix Development Team
 * @created 2025-10-27
 * @version 1.0.0
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
 */

import express from 'express';
import surgicalGuideOrdersController from '../controllers/surgicalGuideOrders.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/reports/surgical_guide:
 *   get:
 *     tags:
 *       - Surgical Guide Reports
 *     summary: Get surgical guide report data
 *     description: |
 *       Retrieves surgical guide report data with date range filtering, pagination, and sorting.
 *       **Access:** Finance22 group members only
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: '2024-01-01'
 *         description: Start date for report (YYYY-MM-DD format)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: '2024-12-31'
 *         description: End date for report (YYYY-MM-DD format)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 10
 *         description: Number of records per page (max 100, default 10)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, dDoctor, patientName, cost, caseNumber]
 *           default: date
 *           example: date
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *           example: desc
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: Report data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1234
 *                       caseNumber:
 *                         type: string
 *                         example: 'SG-2024-001'
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: '2024-06-15'
 *                       dDoctor:
 *                         type: string
 *                         example: 'Dr. John Smith'
 *                       patientName:
 *                         type: string
 *                         example: 'Jane Doe'
 *                       cost:
 *                         type: number
 *                         format: float
 *                         example: 1500.00
 *                       procedureType:
 *                         type: string
 *                         example: 'Full Arch'
 *                       status:
 *                         type: string
 *                         example: 'Completed'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                 sort:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       example: 'date'
 *                     order:
 *                       type: string
 *                       example: 'DESC'
 *                 requestId:
 *                   type: string
 *                   example: 'req_abc123'
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied - Finance22 group membership required
 *       500:
 *         description: Internal server error
 */
router.get('/surgical_guide', requireAuth, surgicalGuideOrdersController.getReport);

/**
 * @swagger
 * /api/reports/surgical_guide/summary:
 *   get:
 *     tags:
 *       - Surgical Guide Reports
 *     summary: Get report summary statistics
 *     description: |
 *       Retrieves aggregated statistics for the surgical guide report.
 *       **Access:** Finance22 group members only
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: '2024-01-01'
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: '2024-12-31'
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Summary statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCases:
 *                       type: integer
 *                       example: 150
 *                     totalCost:
 *                       type: number
 *                       format: float
 *                       example: 225000.00
 *                     averageCost:
 *                       type: number
 *                       format: float
 *                       example: 1500.00
 *                     minCost:
 *                       type: number
 *                       format: float
 *                       example: 500.00
 *                     maxCost:
 *                       type: number
 *                       format: float
 *                       example: 5000.00
 *                     uniqueDoctors:
 *                       type: integer
 *                       example: 12
 *                     uniquePatients:
 *                       type: integer
 *                       example: 145
 *       400:
 *         description: Invalid date parameters
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get('/surgical_guide/summary', requireAuth, surgicalGuideOrdersController.getSummary);

/**
 * @swagger
 * /api/reports/surgical_guide/export:
 *   get:
 *     tags:
 *       - Surgical Guide Reports
 *     summary: Export report to CSV
 *     description: |
 *       Exports all surgical guide report data to CSV format.
 *       **Access:** Finance22 group members only
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: CSV file generated successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               example: |
 *                 Case Number,Date,Doctor Name,Patient Name,Cost,Procedure Type,Status
 *                 SG-2024-001,2024-06-15,"Dr. John Smith","Jane Doe",1500.00,"Full Arch",Completed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get('/surgical_guide/export', requireAuth, surgicalGuideOrdersController.exportCSV);

/**
 * @swagger
 * /api/reports/surgical_guide/access:
 *   get:
 *     tags:
 *       - Surgical Guide Reports
 *     summary: Check user access permissions
 *     description: |
 *       Returns the current user's access permissions for surgical guide report features.
 *       Includes report access and Swagger documentation visibility.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Access permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasReportAccess:
 *                       type: boolean
 *                       example: true
 *                       description: Can access surgical guide report
 *                     hasSwaggerAccess:
 *                       type: boolean
 *                       example: false
 *                       description: Can see Swagger documentation link
 *                     userGroups:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ['Finance22', 'users']
 *                       description: User's Casbin groups
 *       500:
 *         description: Internal server error
 */
router.get('/surgical_guide/access', requireAuth, surgicalGuideOrdersController.checkAccess);

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: 'VALIDATION_ERROR'
 *             http:
 *               type: integer
 *               example: 400
 *             message:
 *               type: string
 *               example: 'Invalid request parameters'
 *             details:
 *               type: object
 *         requestId:
 *           type: string
 *           example: 'req_abc123'
 */

export default router;
