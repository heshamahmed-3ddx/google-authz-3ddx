/**
 * @file logger.js
 * @description Enhanced logging system with file/line tracking and specific format
 * @author 3D Diagnostix Development Team
 * @created 2025-10-20
 * @version 1.2.0
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
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
 * Enhanced logging function with automatic file/line detection and critical/important filtering
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
    const error = new Error();
    const stack = error.stack.split('\n');
    const callerLine = stack[3]; // Get caller's line (adjusted for wrapper)
    const lineMatch = callerLine.match(/:(\d+):\d+/);
    return lineMatch ? lineMatch[1] : 'unknown';
  };

  return {
    // Critical system events only
    info: (message, meta = {}) => {
      // Only log critical system events, authentication, and business logic
      if (isCriticalLog(message, 'info')) {
        logger.info(message, {
          filename: getFileName(filename),
          lineNumber: getCallerInfo(),
          functionName,
          ...meta
        });
      }
    },
    
    // Important warnings and system alerts
    warn: (message, meta = {}) => {
      logger.warn(message, {
        filename: getFileName(filename),
        lineNumber: getCallerInfo(),
        functionName,
        ...meta
      });
    },
    
    // Always log errors
    error: (message, meta = {}) => {
      logger.error(message, {
        filename: getFileName(filename),
        lineNumber: getCallerInfo(),
        functionName,
        ...meta
      });
    },

    // Debug logs for development only
    debug: (message, meta = {}) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug(message, {
          filename: path.basename(filename, '.js'),
          lineNumber: getCallerInfo(),
          functionName,
          ...meta
        });
      }
    }
  };
}

/**
 * Determine if a log message is critical/important enough to show
 */
function isCriticalLog(message, level) {
  const criticalKeywords = [
    'initialized', 'startup', 'shutdown', 'authentication', 'authorization',
    'login', 'logout', 'error', 'failed', 'success', 'denied', 'granted',
    'policy', 'security', 'middleware', 'database', 'api', 'server',
    'casbin', 'oauth', 'session', 'user', 'sync', 'role', 'group'
  ];
  
  const lowerMessage = message.toLowerCase();
  return criticalKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Request logging middleware with enhanced details
 */
export function requestLogger(req, res, next) {
  const contextLogger = createContextLogger('requestLogger', 'requestLogger');
  const startTime = Date.now();
  
  // Only log critical API calls
  if (isCriticalRequest(req.url)) {
    contextLogger.info('HTTP Request Started', {
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
    if (isCriticalRequest(req.url) || res.statusCode >= 400) {
      contextLogger.info('HTTP Request Completed', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        requestId: req.requestId,
        userEmail: req.session?.user?.email
      });
    }
  });
  
  next();
}

/**
 * Determine if a request is critical enough to log
 */
function isCriticalRequest(url) {
  const criticalPaths = [
    '/auth/', '/api/user/', '/api/admin/', '/api/authorize',
    '/health', '/api/session', '/api/rights'
  ];
  
  return criticalPaths.some(path => url.includes(path));
}

/**
 * User access logging for audit trail
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
 * Security event logging
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
 * System initialization logging
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
 * Database/External service logging
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