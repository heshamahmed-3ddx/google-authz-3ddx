/**
 * @file surgicalGuideOrders.controller.js
 * @description HTTP request handlers for surgical guide report endpoints
 * @author 3D Diagnostix Development Team
 * @created 2025-10-27
 * @version 1.0.0
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
 */

import surgicalGuideOrdersService from '../services/surgicalGuideOrders.service.js';
import casbinService from '../services/casbin.js';
import { createContextLogger } from '../services/logger.js';

// For Jest compatibility, use a static string for filename context
const logger = createContextLogger('/server/src/controllers/surgicalGuideOrders.controller.js', 'SurgicalGuideOrdersController');

/**
 * Surgical Guide Report Controller
 * Handles HTTP requests for surgical guide reporting
 */
class SurgicalGuideOrdersController {
  /**
   * Get surgical guide report data
   * GET /api/reports/surgical_guide
   * 
   * @param {import('express').Request} req - Express request
   * @param {import('express').Response} res - Express response
   * @returns {Promise<void>}
   */
  async getReport(req, res) {
    try {
      const userEmail = req.session?.user?.email;
      
      if (!userEmail) {
        logger.warn('Unauthorized report access attempt');
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            http: 401,
            message: 'Authentication required'
          },
          requestId: req.requestId
        });
      }
          const { dbQueryDuration, apiFulfillmentDuration } = await import('../index.js')

      // Check user permissions via Casbin
      const userGroups = await casbinService.getUserGroups(userEmail);
      
  if (!surgicalGuideOrdersService.hasReportAccess(userGroups)) {
        logger.warn('Access denied to surgical guide report', {
          userEmail,
          userGroups
        });
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            http: 403,
            message: 'Access denied. Finance22 group membership required.'
          },
          requestId: req.requestId
        });
      }

      // Extract and validate query parameters
      const {
        startDate,
        endDate,
        page = 1,
        limit = 50,
        sortBy = 'date',
        sortOrder = 'desc',
        searchQuery = '',
        orderTypeFilter = 'all'
      } = req.query;

      // Validate required parameters
      if (!startDate || !endDate) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            http: 400,
            message: 'startDate and endDate query parameters are required',
            details: {
              required: ['startDate (YYYY-MM-DD)', 'endDate (YYYY-MM-DD)']
            }
          },
          requestId: req.requestId
        });
      }

      logger.info('Processing surgical guide report request', {
        userEmail,
        startDate,
        endDate,
        page,
        limit,
        searchQuery,
        orderTypeFilter,
        requestId: req.requestId
      });

      // Fetch report data
  const result = await surgicalGuideOrdersService.getReport({
        startDate,
        endDate,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        searchQuery,
        orderTypeFilter,
        sortOrder
      });

      logger.info('Report delivered successfully', {
        userEmail,
        recordCount: result.data.length,
        requestId: req.requestId
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        sort: result.sort,
        dateRange: {
          startDate,
          endDate
        },
        requestId: req.requestId
      });
    } catch (error) {
      logger.error('Failed to process report request', {
        error: error.message,
        stack: error.stack,
        requestId: req.requestId
      });

      // Handle specific error types
      if (error.message.includes('Invalid date') || error.message.includes('Date range')) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            http: 400,
            message: error.message
          },
          requestId: req.requestId
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          http: 500,
          message: 'Failed to fetch report data'
        },
        requestId: req.requestId
      });
    }
  }

  /**
   * Get report summary statistics
   * GET /api/reports/surgical_guide/summary
   * 
   * @param {import('express').Request} req - Express request
   * @param {import('express').Response} res - Express response
   * @returns {Promise<void>}
   */
  async getSummary(req, res) {
    try {
      const userEmail = req.session?.user?.email;
      
      if (!userEmail) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            http: 401,
            message: 'Authentication required'
          },
          requestId: req.requestId
        });
      }

      // Check user permissions
      const userGroups = await casbinService.getUserGroups(userEmail);
      
  if (!surgicalGuideOrdersService.hasReportAccess(userGroups)) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            http: 403,
            message: 'Access denied. Finance22 group membership required.'
          },
          requestId: req.requestId
        });
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            http: 400,
            message: 'startDate and endDate query parameters are required'
          },
          requestId: req.requestId
        });
      }

  const summary = await surgicalGuideOrdersService.getSummary(startDate, endDate);

      res.json({
        success: true,
        data: summary,
        dateRange: {
          startDate,
          endDate
        },
        requestId: req.requestId
      });
    } catch (error) {
      logger.error('Failed to fetch report summary', {
        error: error.message,
        requestId: req.requestId
      });

      if (error.message.includes('Invalid date') || error.message.includes('Date range')) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            http: 400,
            message: error.message
          },
          requestId: req.requestId
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          http: 500,
          message: 'Failed to fetch summary data'
        },
        requestId: req.requestId
      });
    }
  }

  /**
   * Export report to CSV
   * GET /api/reports/surgical_guide/export
   * 
   * @param {import('express').Request} req - Express request
   * @param {import('express').Response} res - Express response
   * @returns {Promise<void>}
   */
  async exportCSV(req, res) {
    try {
      const userEmail = req.session?.user?.email;
      
      if (!userEmail) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            http: 401,
            message: 'Authentication required'
          },
          requestId: req.requestId
        });
      }

      // Check user permissions
      const userGroups = await casbinService.getUserGroups(userEmail);
      
  if (!surgicalGuideOrdersService.hasReportAccess(userGroups)) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            http: 403,
            message: 'Access denied. Finance22 group membership required.'
          },
          requestId: req.requestId
        });
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            http: 400,
            message: 'startDate and endDate query parameters are required'
          },
          requestId: req.requestId
        });
      }

  const csv = await surgicalGuideOrdersService.exportToCSV(startDate, endDate);

      // Generate filename in format: OSG_YYYYMMDD.csv
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `OSG_${today}.csv`;

      // Set CSV headers
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Add BOM for proper Excel UTF-8 support
      res.send('\uFEFF' + csv);
    } catch (error) {
      logger.error('Failed to export CSV', {
        error: error.message,
        requestId: req.requestId
      });

      if (error.message.includes('Invalid date') || error.message.includes('Date range')) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            http: 400,
            message: error.message
          },
          requestId: req.requestId
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          http: 500,
          message: 'Failed to export CSV'
        },
        requestId: req.requestId
      });
    }
  }

  /**
   * Check user access to report features
   * GET /api/reports/surgical_guide/access
   * 
   * @param {import('express').Request} req - Express request
   * @param {import('express').Response} res - Express response
   * @returns {Promise<void>}
   */
  async checkAccess(req, res) {
    try {
      const userEmail = req.session?.user?.email;
      
      if (!userEmail) {
        return res.json({
          success: true,
          data: {
            hasReportAccess: false,
            hasSwaggerAccess: false,
            userGroups: []
          },
          requestId: req.requestId
        });
      }

      const userGroups = await casbinService.getUserGroups(userEmail);
      
      res.json({
        success: true,
        data: {
          hasReportAccess: surgicalGuideOrdersService.hasReportAccess(userGroups),
          hasSwaggerAccess: surgicalGuideOrdersService.hasSwaggerAccess(userGroups),
          userGroups
        },
        requestId: req.requestId
      });
    } catch (error) {
      logger.error('Failed to check access', {
        error: error.message,
        requestId: req.requestId
      });

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          http: 500,
          message: 'Failed to check access permissions'
        },
        requestId: req.requestId
      });
    }
  }
}

// Export singleton instance
export default new SurgicalGuideOrdersController();
