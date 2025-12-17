/**
 * @file logger.js
 * @description Enhanced logging system with file/line tracking and specific format
 * @author InsightHub Development Team
 * @created 2025-10-20
 * @version 1.2.0
 * @copyright 2025 InsightHub. All rights reserved.
 */

import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Enhanced logger configuration with specific format: [timestamp] LEVEL: |line|[file]|message|key=value pairs
 */
/**
 * Custom log format matching exact specification: [SERVER]|timestamp|LEVEL|[filename:line]|message
 */
const logFormat = format.printf(({ timestamp, level, message, filename, lineNumber, ...meta }) => {
  const file = filename || 'unknown';
  const line = lineNumber || '0';
  
  // Server format: [SERVER]|timestamp|LEVEL|[filename:line]|message
  return `[SERVER]|${timestamp}|${level.toUpperCase()}|[${file}.js:${line}]|${message}`;
});

/**
 * Colored log format for console output with colored [SERVER] prefix
 */
const coloredLogFormat = format.printf(({ timestamp, level, message, filename, lineNumber, ...meta }) => {
  const file = filename || 'unknown';
  const line = lineNumber || '0';
  
  // Color coding based on level
  const levelColors = {
    ERROR: '\x1b[31m',   // Red
    WARN: '\x1b[33m',    // Yellow
    INFO: '\x1b[36m',    // Cyan
    DEBUG: '\x1b[35m',   // Magenta
    VERBOSE: '\x1b[37m'  // White
  };
  
  // Server prefix color (Green)
  const serverColor = '\x1b[32m';
  const reset = '\x1b[0m';
  const levelColor = levelColors[level.toUpperCase()] || levelColors.INFO;
  
  // Colored format: [SERVER]|timestamp|LEVEL|[filename:line]|message
  return `${serverColor}[SERVER]${reset}|${timestamp}|${levelColor}${level.toUpperCase()}${reset}|[${file}.js:${line}]|${message}`;
});

/**
 * Create enhanced logger instance
 */
export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  defaultMeta: { service: '3ddx-auth-service' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        coloredLogFormat
      )
    }),
    new transports.File({
  filename: './logs/error.log',
      level: 'error',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      )
    }),
    new transports.File({
  filename: './logs/combined.log',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      )
    })
  ]
});

/**
 * Create a context-aware logger instance with automatic file/line tracking
 * 
 * This function creates a logger wrapper that automatically includes filename and line number
 * information in log entries. It filters non-critical info-level logs to reduce noise.
 * 
 * @param {string} filename - Full path or filename for logging context
 * @param {string|null} [functionName=null] - Optional function name for additional context
 * @returns {Object} Logger object with info, warn, error, and debug methods
 * @returns {Function} returns.info - Log info-level messages (filtered for critical events only)
 * @returns {Function} returns.warn - Log warning messages
 * @returns {Function} returns.error - Log error messages with stack trace
 * @returns {Function} returns.debug - Log debug messages (development only)
 * 
 * @example
 * const logger = createContextLogger(__filename, 'myFunction');
 * logger.info('System initialized'); // Only logs if message contains critical keywords
 * logger.error('Operation failed', { error: err.message });
 */
export function createContextLogger(filename, functionName = null) {
  // Use static string for Jest compatibility
  const getFileName = (file) => {
    if (file.startsWith('file://')) {
      // ES module URL - convert to path and extract basename
      const filePath = fileURLToPath(file);
      return path.basename(filePath, '.js');
    }
    // CommonJS __filename - extract basename directly
    return path.basename(file, '.js');
  };

  const getCallerInfo = () => {
    // Only collect stack info in development or for error-level logs to
    // avoid the cost of creating and parsing an Error stack on every call.
    if (process.env.NODE_ENV !== 'development') return '0';
    const error = new Error();
    const stack = (error.stack || '').split('\n');
    const callerLine = stack[3] || '';
    const lineMatch = callerLine.match(/:(\d+):\d+/);
    return lineMatch ? lineMatch[1] : '0';
  };

  return {
    // Critical system events only
    info: (message, meta = {}) => {
      // Only log critical system events, authentication, and business logic
      if (!isCriticalLog(message, 'info')) return;
      // Use precomputed filename and avoid stack parsing for info-level logs
      logger.info(message, {
        filename: getFileName(filename),
        lineNumber: '0',
        functionName,
        ...meta
      });
    },
    
    // Important warnings and system alerts
    warn: (message, meta = {}) => {
      // Warnings use a lightweight code path (no stack parsing)
      logger.warn(message, {
        filename: getFileName(filename),
        lineNumber: '0',
        functionName,
        ...meta
      });
    },
    
    // Always log errors
    error: (message, meta = {}) => {
      // For errors we capture caller line number (more expensive) to help debugging
      logger.error(message, {
        filename: getFileName(filename),
        lineNumber: getCallerInfo(),
        functionName,
        ...meta
      });
    },

    // Debug logs for development only
    debug: (message, meta = {}) => {
      if (process.env.NODE_ENV !== 'development') return;
      // Only in development: include caller info (stack parsing allowed)
      logger.debug(message, {
        filename: path.basename(filename, '.js'),
        lineNumber: getCallerInfo(),
        functionName,
        ...meta
      });
    }
  };
}

/**
 * Determine if a log message is critical/important enough to show at info level
 * 
 * Filters out non-critical info-level logs to reduce log noise. Only messages
 * containing critical keywords related to system events, authentication, security,
 * or business logic are logged at info level.
 * 
 * @param {string} message - Log message to check
 * @param {string} level - Log level (currently only 'info' is filtered)
 * @returns {boolean} True if message should be logged, false otherwise
 * @private
 */
function isCriticalLog(message, level) {
  const criticalKeywords = [
    'initialized', 'startup', 'shutdown', 'authentication', 'authorization',
    'login', 'logout', 'error', 'failed', 'success', 'denied', 'granted',
    'policy', 'security', 'middleware', 'database', 'api', 'server',
    'casbin', 'oauth', 'session', 'user', 'sync', 'role', 'group',
    'query', 'executed', 'duration', 'performance', 'slow'
  ];
  
  const lowerMessage = message.toLowerCase();
  return criticalKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Express middleware for HTTP request logging with enhanced details
 * 
 * Logs HTTP requests with method, URL, status code, duration, and user context.
 * Only logs critical requests (auth, API, admin) to reduce log volume.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * app.use(requestLogger);
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Lightweight logging path: avoid creating a contextLogger per request to
  // cut down on allocations. We use the base `logger` instance and attach a
  // minimal filename/line metadata (no stack parsing) for performance.
  if (isCriticalRequest(req.url)) {
    const startMessage = `HTTP Request Started: ${req.method} ${req.url}`;
    logger.info(startMessage, {
      filename: 'requestLogger',
      lineNumber: '0',
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      requestId: req.requestId,
      userEmail: req.session?.user?.email
    });
  }

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const isApiRequest = req.url.startsWith('/api/');
    const isSlowRequest = duration > 1000; // Log slow requests (>1s)
    const shouldLog = isCriticalRequest(req.url) || res.statusCode >= 400 || (isApiRequest && isSlowRequest);
    
    if (shouldLog) {
      const logLevel = res.statusCode >= 400 ? 'error' : (isSlowRequest ? 'warn' : 'info');
      const statusInfo = res.statusCode >= 400 ? 'FAILED' : (isSlowRequest ? 'SLOW' : 'OK');
      const userContext = req.session?.user?.email ? ` (${req.session.user.email})` : '';
      const completedMessage = `HTTP Request ${statusInfo}: ${req.method} ${req.url} [${res.statusCode}] ${duration}ms${userContext}`;
      
      logger[logLevel](completedMessage, {
        filename: 'requestLogger',
        lineNumber: '0',
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        requestId: req.requestId,
        userEmail: req.session?.user?.email,
        isSlow: isSlowRequest
      });
    }
  });

  next();
}

/**
 * Determine if a request URL is critical enough to log at info level
 * 
 * Filters requests to only log those related to authentication, authorization,
 * admin operations, or system health checks.
 * 
 * @param {string} url - Request URL to check
 * @returns {boolean} True if request should be logged, false otherwise
 * @private
 */
function isCriticalRequest(url) {
  const criticalPaths = [
    '/auth/', '/api/user/', '/api/admin/', '/api/authorize',
    '/health', '/api/session', '/api/rights'
  ];
  
  return criticalPaths.some(path => url.includes(path));
}

/**
 * Log user access events for audit trail
 * 
 * Records user actions such as login, logout, resource access, etc.
 * for compliance and security auditing purposes.
 * 
 * @param {string} action - Action performed (e.g., 'login', 'logout', 'resource_access')
 * @param {Object} [userInfo={}] - User information object
 * @param {string} [userInfo.email] - User email address
 * @param {string} [userInfo.id] - User ID
 * @param {string} [userInfo.username] - Username
 * @param {Object} [metadata={}] - Additional metadata for the event
 * @returns {void}
 * 
 * @example
 * logUserAccess('login', { email: 'user@example.com' }, { ip: '192.168.1.1' });
 */
export function logUserAccess(action, userInfo = {}, metadata = {}) {
  const contextLogger = createContextLogger('logUserAccess', 'logUserAccess');
  
  contextLogger.info(`User Access: ${action}`, {
    action,
    timestamp: new Date().toISOString(),
    ...userInfo,
    ...metadata
  });
}

/**
 * Log security-related events for monitoring and alerting
 * 
 * Records security events such as failed authentication attempts,
 * authorization denials, rate limit violations, etc.
 * 
 * @param {string} event - Security event type (e.g., 'auth_failed', 'rate_limit', 'unauthorized_access')
 * @param {Object} [details={}] - Event details
 * @param {string} [details.ip] - Client IP address
 * @param {string} [details.userEmail] - User email (if applicable)
 * @param {string} [details.reason] - Reason for the security event
 * @param {Object} [details.metadata] - Additional event metadata
 * @returns {void}
 * 
 * @example
 * logSecurityEvent('auth_failed', { ip: '192.168.1.1', reason: 'Invalid credentials' });
 */
export function logSecurityEvent(event, details = {}) {
  const contextLogger = createContextLogger('logSecurityEvent', 'logSecurityEvent');
  
  contextLogger.warn(`Security Event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    severity: 'high',
    ...details
  });
}

/**
 * Log system initialization events
 * 
 * Records component initialization status during application startup.
 * 
 * @param {string} component - Component name being initialized
 * @param {string} status - Initialization status ('started', 'initialized', 'failed', etc.)
 * @param {Object} [details={}] - Additional initialization details
 * @returns {void}
 * 
 * @example
 * logSystemInit('Database', 'initialized', { host: 'localhost', port: 3306 });
 */
export function logSystemInit(component, status, details = {}) {
  const contextLogger = createContextLogger('logSystemInit', 'logSystemInit');
  
  contextLogger.info(`System Initialization: ${component} ${status}`, {
    component,
    status,
    timestamp: new Date().toISOString(),
    ...details
  });
}

/**
 * Log external service interactions
 * 
 * Records interactions with external services (APIs, databases, etc.)
 * for monitoring and debugging purposes.
 * 
 * @param {string} service - External service name (e.g., 'Google API', 'Database')
 * @param {string} operation - Operation performed (e.g., 'getUser', 'query')
 * @param {string} status - Operation status ('success', 'failed', 'timeout')
 * @param {Object} [details={}] - Additional operation details
 * @param {number} [details.duration] - Operation duration in milliseconds
 * @param {string} [details.error] - Error message if operation failed
 * @returns {void}
 * 
 * @example
 * logExternalService('Google API', 'getUser', 'success', { duration: 150 });
 */
export function logExternalService(service, operation, status, details = {}) {
  const contextLogger = createContextLogger('logExternalService', 'logExternalService');
  
  contextLogger.info(`External Service: ${service} ${operation} ${status}`, {
    service,
    operation,
    status,
    timestamp: new Date().toISOString(),
    ...details
  });
}

export default logger;