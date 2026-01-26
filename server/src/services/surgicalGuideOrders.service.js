/**
 * @file surgicalGuideOrders.service.js
 * @description Business logic service for surgical guide reports
 * @author InsightHub Development Team
 * @created 2025-10-27
 * @version 1.0.0
 * @copyright 2025 InsightHub. All rights reserved.
 */

import surgicalGuideOrdersModel from '../models/surgicalGuideOrders.model.js';
import { createContextLogger } from './logger.js';

// For Jest compatibility, use a static string for filename context
const logger = createContextLogger('/server/src/services/surgicalGuideOrders.service.js', 'SurgicalGuideOrdersService');

/**
 * Surgical Guide Report Service
 * Handles business logic for surgical guide reporting
 */
class SurgicalGuideOrdersService {
  /**
   * Get paginated surgical guide report data
   * 
   * @param {Object} params - Request parameters
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.sortBy='date'] - Sort field
   * @param {string} [params.sortOrder='desc'] - Sort order
   * @param {string} [params.searchQuery=''] - Search query for ID, patient name, doctor, or scan center
   * @returns {Promise<Object>} Report data with metadata
   * @throws {Error} If parameters are invalid or query fails
   */
  async getReport(params) {
    try {
      logger.info('Processing report request', {
        startDate: params.startDate,
        endDate: params.endDate,
        page: params.page,
        limit: params.limit,
        searchQuery: params.searchQuery
      });

      // Validate date range
         try {
           surgicalGuideOrdersModel.validateDateRange(params.startDate, params.endDate);
         } catch (err) {
           // Return a validation error object for controller to handle
           err.isValidationError = true;
           throw err;
         }

      // Validate pagination parameters
      const page = Math.max(1, parseInt(params.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 10)); // Max 100 per page, default 10

      // Replace with actual user context if available
      const userEmail = params.userEmail || 'unknown';
      const userUsername = params.userUsername || 'unknown';

      // Instrument DB query timing
      const dbStart = process.hrtime();
      const result = await surgicalGuideOrdersModel.getReportData({
        startDate: params.startDate,
        endDate: params.endDate,
        page,
        limit,
        sortBy: params.sortBy || 'date',
        sortOrder: params.sortOrder || 'desc',
        searchQuery: params.searchQuery || '',
        orderTypeFilter: params.orderTypeFilter || 'all'
      });
      const dbDuration = process.hrtime(dbStart);
      const dbSeconds = dbDuration[0] + dbDuration[1] / 1e9;
      
      // Track DB query duration
      if (global.dbQueryDuration) {
        global.dbQueryDuration.labels(userEmail, userUsername).observe(dbSeconds);
      }

      // Instrument processing time (data formatting, pagination metadata, etc.)
      const processStart = process.hrtime();
      
      // Processing logic (already done by model, but track the time anyway)
      // In a real scenario, you might do additional formatting here
      const processedResult = result; // Placeholder for any additional processing
      
      const processDuration = process.hrtime(processStart);
      const processSeconds = processDuration[0] + processDuration[1] / 1e9;
      
      // Track processing duration
      if (global.processingDuration) {
        global.processingDuration.labels(userEmail, userUsername, 'report_formatting').observe(processSeconds);
      }

      logger.info('Report processed successfully', {
        recordCount: result.data.length,
        total: result.pagination.total
      });

      return processedResult;
    } catch (error) {
      // Track database errors
      const userEmail = params.userEmail || 'unknown';
      const userUsername = params.userUsername || 'unknown';
      
      // Determine error type
      let errorType = 'unknown';
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
        errorType = 'timeout';
        // Track timeout
        if (global.queryTimeoutTotal) {
          global.queryTimeoutTotal.labels(userEmail, userUsername).inc();
        }
      } else if (error.code && error.code.startsWith('ER_')) {
        errorType = 'db_error';
      } else if (error.isValidationError) {
        errorType = 'validation';
      }
      
      // Track DB errors
      if (errorType !== 'validation' && global.dbErrorTotal) {
        global.dbErrorTotal.labels(userEmail, userUsername, errorType).inc();
      }

      // Log detailed error information
      logger.error('Failed to process report request', {
        error: error.message,
        errorCode: error.code,
        errorName: error.name,
        errorType,
        params,
        stack: error.stack,
        isValidationError: error.isValidationError,
        // Include database error details if available
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      throw error;
    }
  }

  /**
   * Get report summary statistics
   * 
   * Retrieves aggregated statistics for the specified date range including:
   * total orders, postpaid orders, fully prepaid orders, free orders, rush orders,
   * on-hold orders, confirmed orders, and active orders.
   * 
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Summary statistics object
   * @returns {number} returns.totalOrders - Total number of orders
   * @returns {number} returns.postpaidOrders - Number of postpaid orders
   * @returns {number} returns.fullyPrepaidOrders - Number of fully prepaid orders
   * @returns {number} returns.freeOrders - Number of free orders
   * @returns {number} returns.rushOrders - Number of rush orders
   * @returns {number} returns.onHoldOrders - Number of on-hold orders
   * @returns {number} returns.confirmedOrders - Number of confirmed orders
   * @returns {number} returns.activeOrders - Number of active orders
   * @throws {Error} If dates are invalid or query fails
   * @throws {Error} If date range validation fails
   */
  async getSummary(startDate, endDate) {
    try {
      logger.info('Processing summary request', { startDate, endDate });

      // Validate date range
      try {
        surgicalGuideOrdersModel.validateDateRange(startDate, endDate);
      } catch (err) {
        // Return a validation error object for controller to handle
        err.isValidationError = true;
        throw err;
      }

      // Fetch summary data
      const summary = await surgicalGuideOrdersModel.getSummary(startDate, endDate);

      logger.info('Summary processed successfully', {
        totalCases: summary.totalOrders || summary.totalCases
      });

      return summary;
    } catch (error) {
      // Log detailed error information
      logger.error('Failed to process summary request', {
        error: error.message,
        errorCode: error.code,
        errorName: error.name,
        startDate,
        endDate,
        stack: error.stack,
        isValidationError: error.isValidationError,
        isDatabaseError: error.isDatabaseError,
        // Include database error details if available
        sqlState: error.sqlState || error.originalError?.sqlState,
        sqlMessage: error.sqlMessage || error.originalError?.sqlMessage,
        originalError: error.originalError?.message
      });
      throw error;
    }
  }

  /**
   * Get complete report with all data (main report + summary)
   * 
   * Fetches both paginated report data and summary statistics in parallel
   * for optimal performance. Returns a combined object with all report information.
   * 
   * @param {Object} params - Request parameters
   * @param {string} params.startDate - Start date in YYYY-MM-DD format
   * @param {string} params.endDate - End date in YYYY-MM-DD format
   * @param {number} [params.page=1] - Page number for pagination
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.sortBy='date'] - Field to sort by
   * @param {string} [params.sortOrder='desc'] - Sort order (asc/desc)
   * @param {string} [params.searchQuery=''] - Search query string
   * @param {string} [params.orderTypeFilter='all'] - Filter by order type
   * @returns {Promise<Object>} Complete report object
   * @returns {Array} returns.data - Paginated report data
   * @returns {Object} returns.pagination - Pagination metadata
   * @returns {Object} returns.summary - Summary statistics
   * @returns {string} returns.generatedAt - ISO timestamp of report generation
   * @returns {Object} returns.dateRange - Date range used for the report
   * @throws {Error} If parameters are invalid or query fails
   */
  async getCompleteReport(params) {
    try {
      logger.info('Processing complete report request', {
        startDate: params.startDate,
        endDate: params.endDate
      });

      // Validate date range
  surgicalGuideOrdersModel.validateDateRange(params.startDate, params.endDate);

      // Fetch all data in parallel (optimized without doctor breakdown)
      const [reportData, summary] = await Promise.all([
        this.getReport(params),
        this.getSummary(params.startDate, params.endDate)
      ]);

      const completeReport = {
        ...reportData,
        summary,
        generatedAt: new Date().toISOString(),
        dateRange: {
          startDate: params.startDate,
          endDate: params.endDate
        }
      };

      logger.info('Complete report processed successfully', {
        recordCount: reportData.data.length,
        totalCases: summary.totalCases
      });

      return completeReport;
    } catch (error) {
      logger.error('Failed to process complete report request', {
        error: error.message,
        params,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Export report to CSV format
   * 
   * Generates a CSV file containing all report data for the specified date range.
   * Includes all order details, payment information, status, and timestamps.
   * 
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @param {Object} userContext - User context for metrics
   * @returns {Promise<string>} CSV formatted string with headers and data
   * @throws {Error} If dates are invalid or export fails
   * @throws {Error} If date range validation fails
   * @example
   * const csv = await service.exportToCSV('2024-01-01', '2024-12-31', { userEmail, userUsername });
   * // Returns: "ID,Cost,Amount Paid,...\n1,100.00,50.00,...\n..."
   */
  async exportToCSV(startDate, endDate, userContext = {}) {
    try {
      logger.info('Processing CSV export request', { startDate, endDate });

      // Validate date range
      surgicalGuideOrdersModel.validateDateRange(startDate, endDate);

      const userEmail = userContext.userEmail || 'unknown';
      const userUsername = userContext.userUsername || 'unknown';

      // Track export request
      if (global.exportRequests) {
        global.exportRequests.labels(userEmail, userUsername, 'csv').inc();
      }

      // Instrument export duration
      const exportStart = process.hrtime();
      
      // Export data
      const csv = await surgicalGuideOrdersModel.exportToCSV(startDate, endDate);
      
      const exportDuration = process.hrtime(exportStart);
      const exportSeconds = exportDuration[0] + exportDuration[1] / 1e9;
      
      // Track export duration
      if (global.exportDuration) {
        global.exportDuration.labels(userEmail, userUsername, 'csv').observe(exportSeconds);
      }

      logger.info('CSV export processed successfully', {
        duration: exportSeconds,
        sizeBytes: csv.length
      });

      return csv;
    } catch (error) {
      logger.error('Failed to process CSV export request', {
        error: error.message,
        startDate,
        endDate,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Validate report access permissions
   * Currently checks for Finance22 group membership via Casbin
   * 
   * @param {Array<string>} userGroups - User's groups from Casbin
   * @returns {boolean} Access granted or denied
   */
  hasReportAccess(userGroups) {
    // Finance22 has access to surgical guide report
    // Admin also has access
    const allowedGroups = ['Finance22', 'admin'];
    
    const hasAccess = userGroups.some(group => 
      allowedGroups.includes(group)
    );

    logger.debug('Report access check', {
      userGroups,
      hasAccess
    });

    return hasAccess;
  }

  /**
   * Check if user can access Swagger documentation
   * Only Developers22 group members can see Swagger docs link
   * 
   * @param {Array<string>} userGroups - User's groups from Casbin
   * @returns {boolean} Swagger access granted or denied
   */
  hasSwaggerAccess(userGroups) {
    // Developers22 can see Swagger docs link
    // Admin also has access
    const allowedGroups = ['Developers22', 'admin', 'SWD', 'developers'];
    
    const hasAccess = userGroups.some(group => 
      allowedGroups.includes(group)
    );

    logger.debug('Swagger access check', {
      userGroups,
      hasAccess
    });

    return hasAccess;
  }
}

// Export singleton instance
export default new SurgicalGuideOrdersService();
