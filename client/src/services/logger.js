/**
 * @fileoverview Client-side logging system (currently disabled for performance)
 * @module services/logger
 * @description Provides a consistent logging interface for client-side code.
 *              All logging is currently disabled to reduce client-side overhead.
 *              Use browser DevTools console for debugging during development.
 * @author InsightHub Development Team
 * @created 2025-10-20
 * @version 1.1.0
 * @copyright 2025 InsightHub. All rights reserved.
 */

/**
 * Create a client logger with disabled logging methods
 *
 * This function returns a logger object with standard logging methods (info, warn, error, debug)
 * but all methods are no-ops to reduce client-side overhead. Server-side logging is used for
 * production monitoring and debugging.
 *
 * @returns {Object} Logger object with disabled logging methods
 * @returns {Function} returns.info - Info level logging (disabled)
 * @returns {Function} returns.warn - Warning level logging (disabled)
 * @returns {Function} returns.error - Error level logging (disabled)
 * @returns {Function} returns.debug - Debug level logging (disabled)
 *
 * @example
 * import { createClientLogger } from '@/services/logger';
 * const logger = createClientLogger();
 * logger.info('This will not log anything');
 * logger.error('Errors are logged server-side instead');
 */
export function createClientLogger() {
  return {
    /**
     * Log info messages (only critical ones)
     */
    info: () => {
      // Client-side logging disabled
    },

    /**
     * Log warning messages
     */
    warn: () => {
      // Client-side logging disabled
    },

    /**
     * Log error messages
     */
    error: () => {
      // Client-side logging disabled
    },

    /**
     * Log debug messages (only in development)
     */
    debug: () => {
      // Client-side logging disabled
    },
  };
}

/**
 * Default logger instance for general application logging
 * @constant
 * @type {Object}
 * @property {Function} info - Info level logging (disabled)
 * @property {Function} warn - Warning level logging (disabled)
 * @property {Function} error - Error level logging (disabled)
 * @property {Function} debug - Debug level logging (disabled)
 *
 * @example
 * import { logger } from '@/services/logger';
 * logger.error('Something went wrong'); // No-op in production
 */
export const logger = createClientLogger("App");

/**
 * Log API call information (disabled for client-side)
 *
 * Server-side API logging is handled by the backend request logger middleware.
 * This function exists for API compatibility but performs no action.
 *
 * @returns {void}
 * @deprecated Use server-side logging instead
 * @example
 * logApiCall(); // No-op
 */
export function logApiCall() {
  // Client-side logging disabled
}

/**
 * Log API request details (disabled for client-side)
 *
 * Server-side API request logging is handled by the backend middleware.
 * This function exists for API compatibility but performs no action.
 *
 * @returns {void}
 * @deprecated Use server-side logging instead
 * @example
 * logApiRequest(); // No-op
 */
export function logApiRequest() {
  // Client-side logging disabled
}

/**
 * Log navigation events (disabled for client-side)
 *
 * Vue Router navigation can be tracked using router guards if needed.
 * This function exists for API compatibility but performs no action.
 *
 * @returns {void}
 * @deprecated Use Vue Router navigation guards for tracking
 * @example
 * logNavigation(); // No-op
 */
export function logNavigation() {
  // Client-side logging disabled
}

/**
 * Log authentication events (disabled for client-side)
 *
 * Authentication events are logged server-side via the auth middleware and services.
 * This function exists for API compatibility but performs no action.
 *
 * @returns {void}
 * @deprecated Use server-side auth logging
 * @example
 * logAuth(); // No-op
 */
export function logAuth() {
  // Client-side logging disabled
}

export default logger;
