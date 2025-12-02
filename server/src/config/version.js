/**
 * @file version.js
 * @description Application version management and tracking
 * @author InsightHub Development Team
 * @created 2025-10-20
 * @version 1.2.0
 * @copyright 2025 InsightHub. All rights reserved.
 */

/**
 * Application version information
 * Increment with every meaningful change:
 * - MAJOR: Breaking changes, API incompatibility
 * - MINOR: New features, backwards compatible
 * - PATCH: Bug fixes, minor improvements
 */
export const VERSION = {
  major: 1,
  minor: 2,
  patch: 0,
  build: Date.now(),
  toString() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },
  toFullString() {
    return `${this.major}.${this.minor}.${this.patch}+${this.build}`;
  }
};

/**
 * Release notes for current version
 */
export const RELEASE_NOTES = {
  '1.2.0': {
    date: '2025-10-20',
    features: [
      'Enhanced Google Groups integration with role extraction',
      'Improved Casbin synchronization',
      'Added comprehensive logging system',
      'Implemented version tracking'
    ],
    fixes: [
      'Fixed user details endpoint stability',
      'Resolved group role fetching issues'
    ],
    breaking: []
  }
};

/**
 * API compatibility information
 */
export const API_COMPATIBILITY = {
  minimumClientVersion: '1.0.0',
  deprecatedEndpoints: [],
  supportedVersions: ['1.0.0', '1.1.0', '1.2.0']
};