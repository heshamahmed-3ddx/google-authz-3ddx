/**
 * @file surgicalGuideOrders.controller.js
 * @description HTTP request handlers for surgical guide report endpoints
 * @author InsightHub Development Team
 * @created 2025-10-27
 * @version 1.0.0
 * @copyright 2025 InsightHub. All rights reserved.
 */

import surgicalGuideOrdersService from '../services/surgicalGuideOrders.service.js';
import casbinService from '../services/casbin.js';
import { createContextLogger } from '../services/logger.js';
import reportLoggingService from '../services/reportLogging.service.js';

// For Jest compatibility, use a static string for filename context
const logger = createContextLogger('/server/src/controllers/surgicalGuideOrders.controller.js', 'SurgicalGuideOrdersController');

/**
 * Surgical Guide Report Controller
 * Handles HTTP requests for surgical guide reporting
 */
class SurgicalGuideOrdersController {
  /**
   * Get surgical guide report data
   * 
   * Retrieves paginated surgical guide report data with filtering, sorting, and search capabilities.
   * Requires authentication and Finance22 group membership for access.
   * 
   * Route: GET /api/reports/surgical_guide
   * 
   * Query Parameters:
   * - startDate (required): Start date in YYYY-MM-DD format
   * - endDate (required): End date in YYYY-MM-DD format
   * - page (optional): Page number (default: 1)
   * - limit (optional): Items per page (default: 10, max: 100)
   * - sortBy (optional): Field to sort by (default: 'date')
   * - sortOrder (optional): Sort order 'asc' or 'desc' (default: 'desc')
   * - searchQuery (optional): Search term for ID, patient name, doctor, or scan center
   * - orderTypeFilter (optional): Filter by order type (all, free, postpaid, fullyPrepaid, etc.)
   * 
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.startDate - Start date (YYYY-MM-DD)
   * @param {string} req.query.endDate - End date (YYYY-MM-DD)
   * @param {number} [req.query.page=1] - Page number
   * @param {number} [req.query.limit=10] - Items per page
   * @param {string} [req.query.sortBy='date'] - Sort field
   * @param {string} [req.query.sortOrder='desc'] - Sort order
   * @param {string} [req.query.searchQuery=''] - Search query
   * @param {string} [req.query.orderTypeFilter='all'] - Order type filter
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends JSON response with report data
   * 
   * @throws {401} If user is not authenticated
   * @throws {403} If user doesn't have Finance22 group membership
   * @throws {400} If required parameters are missing or invalid
   * @throws {503} If database service is unavailable
   * @throws {500} If an internal error occurs
   * 
   * @example
   * // Request: GET /api/reports/surgical_guide?startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10
   * // Response: { success: true, data: [...], pagination: {...}, sort: {...}, dateRange: {...} }
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
        limit = 10,
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

      // Get user context for metrics
      const userUsername = req.session?.user?.name || req.session?.user?.username || 'unknown';
      
      // Fetch report data with user context for metrics
      const result = await surgicalGuideOrdersService.getReport({
        startDate,
        endDate,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        searchQuery,
        orderTypeFilter,
        sortOrder,
        userEmail,
        userUsername
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

      // Handle validation errors
      if (error.isValidationError || error.message.includes('Invalid date') || error.message.includes('Date range')) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            http: 400,
            message: error.message
          },
          requestId: req.requestId
        });
      }

      // Handle database connection errors
      if (error.isDatabaseError || error.message.includes('Database') || error.message.includes('pool not initialized')) {
        logger.error('Database error in report endpoint', {
          error: error.message,
          originalError: error.originalError?.message,
          requestId: req.requestId
        });
        return res.status(503).json({
          error: {
            code: 'SERVICE_UNAVAILABLE',
            http: 503,
            message: 'Database service is currently unavailable. Please check database connection.',
            details: error.message
          },
          requestId: req.requestId
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          http: 500,
          message: 'Failed to fetch report data',
          details: error.message
        },
        requestId: req.requestId
      });
    }
  }

  /**
   * Get report summary statistics
   * 
   * Retrieves aggregated statistics for the specified date range including total orders,
   * postpaid orders, fully prepaid orders, free orders, rush orders, on-hold orders,
   * confirmed orders, and active orders.
   * 
   * Route: GET /api/reports/surgical_guide/summary
   * 
   * Query Parameters:
   * - startDate (required): Start date in YYYY-MM-DD format
   * - endDate (required): End date in YYYY-MM-DD format
   * 
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.startDate - Start date (YYYY-MM-DD)
   * @param {string} req.query.endDate - End date (YYYY-MM-DD)
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends JSON response with summary statistics
   * 
   * @throws {401} If user is not authenticated
   * @throws {403} If user doesn't have Finance22 group membership
   * @throws {400} If required parameters are missing or invalid
   * @throws {503} If database service is unavailable
   * @throws {500} If an internal error occurs
   * 
   * @example
   * // Request: GET /api/reports/surgical_guide/summary?startDate=2024-01-01&endDate=2024-12-31
   * // Response: { success: true, data: { totalOrders: 100, postpaidOrders: 50, ... }, dateRange: {...} }
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

      // Handle validation errors
      if (error.isValidationError || error.message.includes('Invalid date') || error.message.includes('Date range')) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            http: 400,
            message: error.message
          },
          requestId: req.requestId
        });
      }

      // Handle database connection errors
      if (error.isDatabaseError || error.message.includes('Database') || error.message.includes('pool not initialized')) {
        logger.error('Database error in summary endpoint', {
          error: error.message,
          originalError: error.originalError?.message,
          requestId: req.requestId
        });
        return res.status(503).json({
          error: {
            code: 'SERVICE_UNAVAILABLE',
            http: 503,
            message: 'Database service is currently unavailable. Please check database connection.',
            details: error.message
          },
          requestId: req.requestId
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          http: 500,
          message: 'Failed to fetch summary data',
          details: error.message
        },
        requestId: req.requestId
      });
    }
  }

  /**
   * Export report to CSV format
   * 
   * Generates and downloads a CSV file containing all report data for the specified date range.
   * The CSV includes all order details, payment information, status, and timestamps.
   * File is named in format: OSG_YYYYMMDD.csv with UTF-8 BOM for Excel compatibility.
   * 
   * Route: GET /api/reports/surgical_guide/export
   * 
   * Query Parameters:
   * - startDate (required): Start date in YYYY-MM-DD format
   * - endDate (required): End date in YYYY-MM-DD format
   * 
   * @param {import('express').Request} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} req.query.startDate - Start date (YYYY-MM-DD)
   * @param {string} req.query.endDate - End date (YYYY-MM-DD)
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends CSV file as download
   * 
   * @throws {401} If user is not authenticated
   * @throws {403} If user doesn't have Finance22 group membership
   * @throws {400} If required parameters are missing or invalid
   * @throws {500} If export fails
   * 
   * @example
   * // Request: GET /api/reports/surgical_guide/export?startDate=2024-01-01&endDate=2024-12-31
   * // Response: CSV file download with Content-Type: text/csv; charset=utf-8
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

      const exportStartTime = Date.now();
      const csv = await surgicalGuideOrdersService.exportToCSV(startDate, endDate);
      const exportDuration = Date.now() - exportStartTime;

      // Generate filename in format: OSG_YYYYMMDD.csv
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `OSG_${today}.csv`;
      const fileSizeBytes = Buffer.byteLength(csv, 'utf8');

      // Log export access (middleware will also log, but this captures export-specific details)
      const csvWithBOM = '\uFEFF' + csv;
      reportLoggingService.logReportAccess({
        reportId: 'surgical_guide',
        reportName: 'Surgical Guide Report',
        requesterEmail: userEmail,
        requesterUsername: req.session?.user?.name || req.session?.user?.fullName || null,
        accessType: 'export',
        requestMethod: req.method,
        requestPath: req.path,
        queryParameters: req.query,
        requestDurationMs: exportDuration,
        responseStatus: 200,
        recordsReturned: null, // Will be calculated if available
        ipAddress: req.ip || req.connection?.remoteAddress || null,
        userAgent: req.get('user-agent') || null,
        metadata: {
          exportFormat: 'CSV',
          filename,
          fileSizeBytes,
          dateRange: { start: startDate, end: endDate }
        }
      }).catch(err => {
        // Don't fail export if logging fails
        logger.warn('Failed to log export access', { error: err.message });
      });

      // Set CSV headers
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Add BOM for proper Excel UTF-8 support
      res.send(csvWithBOM);
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
   * 
   * Returns the user's access permissions for report features and Swagger documentation.
   * This endpoint is safe to call even if the user is not authenticated (returns false for all permissions).
   * 
   * Route: GET /api/reports/surgical_guide/access
   * 
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @returns {Promise<void>} Sends JSON response with access permissions
   * 
   * Response Format:
   * {
   *   success: true,
   *   data: {
   *     hasReportAccess: boolean,  // True if user has Finance22 or admin group
   *     hasSwaggerAccess: boolean, // True if user has Developers22, admin, SWD, or developers group
   *     userGroups: string[]       // Array of user's group names
   *   }
   * }
   * 
   * @throws {500} If an internal error occurs (rare, as this endpoint is designed to be safe)
   * 
   * @example
   * // Request: GET /api/reports/surgical_guide/access
   * // Response: { success: true, data: { hasReportAccess: true, hasSwaggerAccess: false, userGroups: ['Finance22'] } }
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

      // Get user groups with error handling
      let userGroups = [];
      try {
        userGroups = await casbinService.getUserGroups(userEmail);
      } catch (casbinError) {
        // If Casbin fails, log but don't fail the request - return empty groups
        logger.warn('Failed to get user groups from Casbin, returning empty groups', {
          error: casbinError.message,
          errorCode: casbinError.code,
          userEmail,
          requestId: req.requestId
        });
        userGroups = [];
      }
      
      // Ensure userGroups is an array
      if (!Array.isArray(userGroups)) {
        logger.warn('User groups is not an array, defaulting to empty array', {
          userGroups,
          userEmail,
          requestId: req.requestId
        });
        userGroups = [];
      }
      
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
        errorCode: error.code,
        errorName: error.name,
        stack: error.stack,
        userEmail: req.session?.user?.email,
        requestId: req.requestId
      });

      // Return a safe response even on error
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          http: 500,
          message: 'Failed to check access permissions',
          details: error.message
        },
        requestId: req.requestId
      });
    }
  }
}

// Export singleton instance
export default new SurgicalGuideOrdersController();
