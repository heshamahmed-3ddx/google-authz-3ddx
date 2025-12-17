/**
 * @fileoverview Middleware for automatic logging of report access and usage
 * @module middleware/reportLogging
 * @description Tracks all report access events including views, exports, and API requests.
 *              Logs comprehensive details: user, timing, query parameters, response status,
 *              and metadata for audit trails and usage analytics.
 * @author InsightHub Development Team
 * @created 2025-01-XX
 * @version 1.2.0
 * @copyright 2025 InsightHub. All rights reserved.
 * @requires ../services/reportLogging.service
 * @requires ../services/logger
 */

import reportLoggingService from '../services/reportLogging.service.js';
import { createContextLogger } from '../services/logger.js';

const logger = createContextLogger('reportLogging.js');

/**
 * Extract report ID from request path
 * 
 * Parses the URL path to identify which report is being accessed.
 * Used for categorizing report access logs.
 * 
 * @private
 * @param {string} path - Request URL path (e.g., '/api/reports/surgical_guide')
 * @returns {string} Report ID (e.g., 'surgical_guide') or 'unknown' if not found
 * 
 * @example
 * extractReportId('/api/reports/surgical_guide/export');
 * // Returns: 'surgical_guide'
 * 
 * @example
 * extractReportId('/api/reports/powerbi');
 * // Returns: 'powerbi'
 */
function extractReportId(path) {
  // Extract report ID from path like /api/reports/surgical_guide
  const match = path.match(/\/reports\/([^/]+)/);
  return match ? match[1] : 'unknown';
}

/**
 * Get human-readable report name from report ID
 * 
 * Maps internal report IDs to user-friendly display names for logging
 * and reporting purposes.
 * 
 * @private
 * @param {string} reportId - Internal report identifier
 * @returns {string} Human-readable report name
 * 
 * @example
 * getReportName('surgical_guide');
 * // Returns: 'Surgical Guide Report'
 * 
 * @example
 * getReportName('unknown_report');
 * // Returns: 'unknown_report' (fallback to ID)
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
 * Determine access type from request characteristics
 * 
 * Categorizes report access by analyzing request properties (path, query params).
 * Categories: 'scheduled' (automated), 'export' (CSV/file download), 
 * 'api' (programmatic), or 'manual' (user-initiated).
 * 
 * @private
 * @param {Object} req - Express request object
 * @returns {('scheduled'|'export'|'api'|'manual')} Access type category
 * 
 * @example
 * // Export request
 * determineAccessType({ path: '/api/reports/surgical_guide/export', query: {} });
 * // Returns: 'export'
 * 
 * @example
 * // Scheduled report
 * determineAccessType({ path: '/api/reports/data', query: { scheduled: 'true' } });
 * // Returns: 'scheduled'
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
 * Middleware factory for automatic report access logging
 * 
 * Creates Express middleware that captures comprehensive report access information including:
 * - User identity (email, username)
 * - Request timing and duration
 * - Query parameters and filters applied
 * - Response status and record counts
 * - IP address and user agent
 * - Access type categorization
 * 
 * The middleware intercepts response methods (send/json) to capture response data
 * and logs asynchronously after response is sent to avoid blocking.
 * 
 * **Important**: Must be placed AFTER authentication middleware to capture user info.
 * Only processes requests matching '/reports/' path pattern.
 * 
 * @returns {Function} Express middleware function (req, res, next) => Promise<void>
 * 
 * @example
 * // Register middleware in Express app
 * import { reportAccessLogger } from './middleware/reportLogging.js';
 * 
 * app.use('/api/reports', requireAuth, reportAccessLogger());
 * 
 * @example
 * // Middleware chain
 * router.get('/surgical_guide', 
 *   requireAuth,           // 1. Authenticate user first
 *   reportAccessLogger(),  // 2. Enable logging
 *   controller.getData     // 3. Handle request
 * );
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

