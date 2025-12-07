/**
 * @file reportLogging.js
 * @description Middleware for logging report access events
 * @author InsightHub Development Team
 * @created 2025-01-XX
 * @version 1.2.0
 * @copyright 2025 InsightHub. All rights reserved.
 */

import reportLoggingService from '../services/reportLogging.service.js';
import { createContextLogger } from '../services/logger.js';

const logger = createContextLogger('reportLogging.js');

/**
 * Extract report ID from request path
 * @param {string} path - Request path
 * @returns {string} Report ID
 */
function extractReportId(path) {
  // Extract report ID from path like /api/reports/surgical_guide
  const match = path.match(/\/reports\/([^/]+)/);
  return match ? match[1] : 'unknown';
}

/**
 * Get human-readable report name from report ID
 * @param {string} reportId - Report identifier
 * @returns {string} Report name
 */
function getReportName(reportId) {
  const reportNames = {
    'surgical_guide': 'Surgical Guide Report',
    'powerbi': 'PowerBI Dashboard',
    'grafana': 'Grafana Monitoring'
  };
  return reportNames[reportId] || reportId;
}

/**
 * Determine access type from request
 * @param {Object} req - Express request object
 * @returns {string} Access type
 */
function determineAccessType(req) {
  if (req.query.scheduled === 'true') {
    return 'scheduled';
  }
  if (req.path.includes('/export')) {
    return 'export';
  }
  if (req.path.includes('/api/')) {
    return 'api';
  }
  return 'manual';
}

/**
 * Middleware to log report access events
 * Should be placed after authentication middleware
 * Only logs report-related endpoints
 * 
 * @returns {Function} Express middleware function
 */
export function reportAccessLogger() {
  return async (req, res, next) => {
    // Only log report-related endpoints
    if (!req.path.includes('/reports/')) {
      return next();
    }

    const startTime = Date.now();
    const originalSend = res.send;
    const originalJson = res.json;
    let responseData = null;
    let responseStatus = null;

    // Capture response data and status
    res.send = function(body) {
      responseData = body;
      responseStatus = res.statusCode;
      return originalSend.call(this, body);
    };

    res.json = function(body) {
      responseData = body;
      responseStatus = res.statusCode;
      return originalJson.call(this, body);
    };

    // Log after response is sent
    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        const reportId = extractReportId(req.path);
        const reportName = getReportName(reportId);
        const accessType = determineAccessType(req);

        // Parse response to get record count
        let recordsReturned = null;
        try {
          if (responseData) {
            const parsed = typeof responseData === 'string' 
              ? JSON.parse(responseData) 
              : responseData;
            if (parsed.data && Array.isArray(parsed.data)) {
              recordsReturned = parsed.data.length;
            } else if (parsed.pagination && parsed.pagination.total !== undefined) {
              recordsReturned = parsed.pagination.total;
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }

        await reportLoggingService.logReportAccess({
          reportId,
          reportName,
          requesterEmail: req.session?.user?.email || 'unknown',
          requesterUsername: req.session?.user?.name || req.session?.user?.fullName || null,
          accessType,
          requestMethod: req.method,
          requestPath: req.path,
          queryParameters: req.query,
          requestDurationMs: duration,
          responseStatus: responseStatus || res.statusCode,
          recordsReturned,
          ipAddress: req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || null,
          userAgent: req.get('user-agent') || null,
          errorMessage: (responseStatus || res.statusCode) >= 400 
            ? `HTTP ${responseStatus || res.statusCode}` 
            : null,
          metadata: {
            dateRange: req.query.startDate && req.query.endDate 
              ? { start: req.query.startDate, end: req.query.endDate }
              : null,
            filters: {
              searchQuery: req.query.searchQuery || null,
              orderTypeFilter: req.query.orderTypeFilter || null,
              sortBy: req.query.sortBy || null,
              sortOrder: req.query.sortOrder || null,
              page: req.query.page || null,
              limit: req.query.limit || null
            }
          }
        });
      } catch (error) {
        logger.error('Error in report access logger', {
          error: error.message,
          path: req.path,
          stack: error.stack
        });
        // Don't throw - logging errors shouldn't affect the request
      }
    });

    next();
  };
}

