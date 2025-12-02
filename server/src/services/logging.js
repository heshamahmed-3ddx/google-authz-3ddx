/**
 * @file logging.js
 * @description Structured logging service with pino for audit trails and compliance
 * @author InsightHub Development Team
 * @created 2025-10-07
 * @copyright 2025 InsightHub. All rights reserved.
 */

import pino from 'pino';

/**
 * Create logger instance with structured format
 * Format: timestamp|level|[file:line]|message|requestId|userEmail
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      messageFormat: '{timestamp}|{level}|[{name}:{line}]|{msg}|requestId={requestId}|userEmail={userEmail}',
      ignore: 'pid,hostname'
    }
  },
  base: {
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'localhost'
  }
});

/**
 * Create a child logger with additional context fields.
 *
 * Purpose: return a pino child logger pre-populated with request-scoped
 * metadata (for example requestId and userEmail) so subsequent log calls
 * automatically include that context.
 *
 * @param {Object} [context={}] - Contextual fields to attach to the child logger
 * @param {string} [context.requestId] - Optional request identifier
 * @param {string} [context.userEmail] - Optional user email for correlation
 * @returns {import('pino').Logger} Child logger instance
 * @throws {TypeError} If context is not an object
 */
export const createLogger = (context = {}) => {
  if (context && typeof context !== 'object') {
    throw new TypeError('createLogger: context must be an object')
  }
  return logger.child(context);
};

/**
 * Log authentication lifecycle events (attempt, success, failure).
 *
 * @param {'attempt'|'success'|'failure'} event - One of the supported event types
 * @param {Object} data - Event-specific data
 * @param {string} [data.requestId] - Request identifier for correlation
 * @param {string} [data.userEmail] - User email (if known)
 * @param {string} [data.provider] - Auth provider (default: 'google')
 * @param {string} [data.ip] - Client IP address
 * @param {string} [data.sessionId] - Session id on success
 * @param {string} [data.reason] - Failure reason on failure
 * @returns {void}
 */
export const logAuth = (event, data = {}) => {
  const context = {
    requestId: data.requestId || 'unknown',
    userEmail: data.userEmail || 'anonymous',
    event: `auth.${event}`
  };
  
  const childLogger = createLogger(context);
  
  switch (event) {
    case 'attempt':
      childLogger.info({
        provider: data.provider || 'google',
        ip: data.ip
      }, `Authentication attempt`);
      break;
    case 'success':
      childLogger.info({
        provider: data.provider || 'google',
        ip: data.ip,
        sessionId: data.sessionId
      }, `Authentication successful`);
      break;
    case 'failure':
      childLogger.warn({
        provider: data.provider || 'google',
        ip: data.ip,
        reason: data.reason
      }, `Authentication failed`);
      break;
    default:
      childLogger.error(`Unknown auth event: ${event}`);
  }
};

/**
 * Log authorization evaluation results from Casbin or other policy engines.
 *
 * @param {Object} authResult - Authorization result object
 * @param {string} authResult.requestId - Request identifier
 * @param {string} authResult.userEmail - User performing the action
 * @param {string} authResult.resource - Protected resource
 * @param {string} authResult.action - Action attempted on the resource
 * @param {boolean} authResult.allowed - Whether access was granted
 * @param {Array} [authResult.userGroups] - Groups the user belongs to
 * @param {Array} [authResult.matchingPolicies] - Policies that matched
 * @param {number} [authResult.evaluationTime] - Time taken to evaluate (ms)
 * @returns {void}
 */
export const logAuthz = (authResult) => {
  const context = {
    requestId: authResult.requestId || 'unknown',
    userEmail: authResult.userEmail,
    event: 'authz.evaluation'
  };
  
  const childLogger = createLogger(context);
  
  childLogger.info({
    resource: authResult.resource,
    action: authResult.action,
    decision: authResult.allowed ? 'GRANTED' : 'DENIED',
    userGroups: authResult.userGroups,
    matchedPolicies: authResult.matchingPolicies?.length || 0,
    evaluationTime: authResult.evaluationTime
  }, `Authorization decision: ${authResult.allowed ? 'GRANTED' : 'DENIED'}`);
};

/**
 * Log that a user accessed a specific API endpoint.
 *
 * @param {string} endpoint - API endpoint path (for example '/api/profile')
 * @param {Object} data - Request metadata
 * @param {string} [data.requestId] - Request identifier
 * @param {string} [data.userEmail] - User email
 * @param {string} [data.ip] - Client IP address
 * @param {string} [data.userAgent] - User-Agent header
 * @returns {void}
 */
export const logUserAccess = (endpoint, data = {}) => {
  const context = {
    requestId: data.requestId || 'unknown',
    userEmail: data.userEmail || 'anonymous',
    event: `user.${endpoint}.view`
  };
  
  const childLogger = createLogger(context);
  childLogger.info({
    endpoint,
    ip: data.ip,
    userAgent: data.userAgent
  }, `User data accessed: ${endpoint}`);
};

/**
 * Log a high-level page view for analytics and audit.
 *
 * @param {string} route - Frontend route or server-side route accessed
 * @param {Object} data - Request metadata
 * @param {string} [data.requestId]
 * @param {string} [data.userEmail]
 * @param {string} [data.ip]
 * @param {string} [data.userAgent]
 * @returns {void}
 */
export const logPageView = (route, data = {}) => {
  const context = {
    requestId: data.requestId || 'unknown',
    userEmail: data.userEmail || 'anonymous',
    event: 'page.view'
  };
  
  const childLogger = createLogger(context);
  childLogger.info({
    route,
    ip: data.ip,
    userAgent: data.userAgent,
    authenticated: !!data.userEmail
  }, `Page view: ${route}`);
};

/**
 * Log an error with optional contextual metadata. This helper will include
 * the error message, stack, and any passed context to aid debugging and
 * auditing.
 *
 * @param {Error} error - Error instance to log
 * @param {Object} [context={}] - Additional metadata (requestId, userEmail, route)
 * @param {string} [context.requestId]
 * @param {string} [context.userEmail]
 * @returns {void}
 * @throws {TypeError} If the first argument is not an Error
 */
export const logError = (error, context = {}) => {
  if (!(error instanceof Error)) {
    throw new TypeError('logError: first argument must be an Error')
  }
  const errorContext = {
    requestId: context.requestId || 'unknown',
    userEmail: context.userEmail || 'anonymous',
    event: 'error'
  };
  
  const childLogger = createLogger(errorContext);
  childLogger.error({
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code || 'UNKNOWN'
    },
    route: context.route,
    method: context.method,
    ip: context.ip
  }, `Error occurred: ${error.message}`);
};

export default logger;