/**
 * @file logger.js
 * @description Client-side logging system with [CLIENT] prefix and colors
 * @author InsightHub Development Team
 * @created 2025-10-20
 * @version 1.0.0
 * @copyright 2025 InsightHub. All rights reserved.
 */

// getTimestamp, getCallerInfo, and isCriticalLog removed as unused since logging is disabled

/**
 * Create a client logger with [CLIENT] prefix and colors
 * @returns {Object} Logger object with info, warn, error methods
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
 * Default logger instance
 */
export const logger = createClientLogger("App");

/**
 * Log API requests and responses (disabled)
 */
export function logApiCall() {
  // Client-side logging disabled
}

export function logApiRequest() {
  // Client-side logging disabled
}

/**
 * Log navigation events (disabled)
 */
export function logNavigation() {
  // Client-side logging disabled
}

/**
 * Log authentication events (disabled)
 */
export function logAuth() {
  // Client-side logging disabled
}

export default logger;
