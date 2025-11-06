/**
 * @file surgicalGuideOrders.service.js
 * @description Business logic service for surgical guide reports
 * @author 3D Diagnostix Development Team
 * @created 2025-10-27
 * @version 1.0.0
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
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
   * @param {number} [params.limit=50] - Items per page
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
      const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 50)); // Max 100 per page

      // Instrument DB query timing
      const start = process.hrtime();
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
      const duration = process.hrtime(start);
      const seconds = duration[0] + duration[1] / 1e9;
      // Replace with actual user context if available
      const userEmail = params.userEmail || 'unknown';
      const userUsername = params.userUsername || 'unknown';
      if (typeof global.dbQueryDuration === 'function') {
        global.dbQueryDuration.labels(userEmail, userUsername).observe(seconds);
      }

      logger.info('Report processed successfully', {
        recordCount: result.data.length,
        total: result.pagination.total
      });

      return result;
    } catch (error) {
      logger.error('Failed to process report request', {
        error: error.message,
        params,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get report summary statistics
   * 
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Summary statistics
   * @throws {Error} If dates are invalid or query fails
   */
  async getSummary(startDate, endDate) {
    try {
      logger.info('Processing summary request', { startDate, endDate });

      // Validate date range
  surgicalGuideOrdersModel.validateDateRange(startDate, endDate);

      // Fetch summary data
  const summary = await surgicalGuideOrdersModel.getSummary(startDate, endDate);

      logger.info('Summary processed successfully', {
        totalCases: summary.totalCases
      });

      return summary;
    } catch (error) {
      logger.error('Failed to process summary request', {
        error: error.message,
        startDate,
        endDate,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get complete report with all data (main report + summary)
   * 
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Complete report data
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
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<string>} CSV data
   * @throws {Error} If dates are invalid or export fails
   */
  async exportToCSV(startDate, endDate) {
    try {
      logger.info('Processing CSV export request', { startDate, endDate });

      // Validate date range
  surgicalGuideOrdersModel.validateDateRange(startDate, endDate);

      // Export data
  const csv = await surgicalGuideOrdersModel.exportToCSV(startDate, endDate);

      logger.info('CSV export processed successfully');

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
