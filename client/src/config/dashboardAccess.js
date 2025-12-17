/**
 * Dashboard Access Control Configuration
 *
 * This file defines which user groups have access to different dashboard sections.
 *
 * Special values:
 * - '*' : All authenticated users have access
 * - ['group1', 'group2'] : Only users in these groups have access
 *
 * To modify access:
 * 1. Add/remove group names from the arrays
 * 2. Use '*' to allow all users
 * 3. Use empty array [] to deny all users
 *
 * @example
 * // Allow only admin group
 * userRights: ['admin']
 *
 * // Allow multiple groups
 * technicalInfo: ['SWD', 'admin', 'developers']
 *
 * // Allow all users
 * userDetails: ['*']
 */

export const DASHBOARD_ACCESS_CONFIG = {
  // ========================================
  // BASIC USER INFORMATION
  // ========================================

  /**
   * User Details & Organization section
   * Displays basic user information, account status, and organization details
   */
  userDetails: ["*"],

  /**
   * Employee Information section
   * Shows employee ID, job title, department, manager, etc.
   */
  employeeInfo: ["*"],

  /**
   * Contact Information section
   * Displays phone numbers, secondary emails, and addresses
   */
  contactInfo: ["*"],

  /**
   * Groups section
   * Shows Google Workspace groups the user belongs to
   */
  groups: ["*"],

  // ========================================
  // ADVANCED FEATURES (RESTRICTED)
  // ========================================

  /**
   * User Rights & Permissions section
   * Shows Casbin authorization policies and user rights
   * Allows testing authorization for different resources/actions
   */
  userRights: ["SWD", "admin", "developers"],

  /**
   * Technical Information section
   * Displays raw user data JSON and field descriptions
   * Contains sensitive technical details
   */
  technicalInfo: ["SWD", "admin", "developers"],

  /**
   * API Documentation section
   * Links to Swagger API docs and JSDoc documentation
   * Provides access to technical API references
   */
  apiDocumentation: ["SWD", "admin", "developers"],

  // ========================================
  // FUTURE SECTIONS (ADD AS NEEDED)
  // ========================================

  /**
   * Admin Panel (if implemented)
   * Full administrative controls
   */
  // adminPanel: ['admin'],

  /**
   * Analytics Dashboard (if implemented)
   * Usage statistics and analytics
   */
  // analytics: ['SWD', 'admin', 'managers'],

  /**
   * Audit Logs (if implemented)
   * System audit trail and logs
   */
  // auditLogs: ['admin', 'security-team'],
};

/**
 * Get unique list of groups that can access any restricted dashboard features
 * 
 * Aggregates all group names from restricted sections (those not using wildcard '*'),
 * providing a complete list of groups with special dashboard access privileges.
 * Useful for admin interfaces showing which groups have elevated permissions.
 * 
 * @returns {string[]} Array of unique group names (excludes '*' wildcard)
 * 
 * @example
 * const restrictedGroups = getRequiredGroupsForRestrictedAccess();
 * // Returns: ['admin', 'SWD', 'developers', 'Finance22', ...]
 * 
 * @example
 * // Use to display in admin panel
 * const groups = getRequiredGroupsForRestrictedAccess();
 * console.log(`Groups with special access: ${groups.join(', ')}`);
 */
export function getRequiredGroupsForRestrictedAccess() {
  const allGroups = new Set();

  Object.entries(DASHBOARD_ACCESS_CONFIG).forEach(([, groups]) => {
    // Only include restricted sections (not '*')
    if (!groups.includes("*")) {
      groups.forEach((group) => allGroups.add(group));
    }
  });

  return Array.from(allGroups);
}

/**
 * Check if a dashboard section is restricted (not open to all users)
 * 
 * Determines whether a section requires specific group membership by checking
 * if its access configuration includes the '*' wildcard. Sections with '*'
 * are accessible to all authenticated users.
 * 
 * @param {string} section - Section name from DASHBOARD_ACCESS_CONFIG keys
 * @returns {boolean} True if section requires specific groups, false if open to all
 * 
 * @example
 * // Check if developer documentation is restricted
 * const restricted = isSectionRestricted('developerDocumentation');
 * // Returns: true (requires specific groups)
 * 
 * @example
 * // Check if general reports are restricted
 * const restricted = isSectionRestricted('generalReports');
 * // Returns: false (if config includes '*')
 */
export function isSectionRestricted(section) {
  const config = DASHBOARD_ACCESS_CONFIG[section];
  return config && !config.includes("*");
}

/**
 * Get all dashboard section names that have access restrictions
 * 
 * Returns a filtered list of dashboard sections that require specific group
 * membership (i.e., not open to all users via '*'). Useful for generating
 * reports on restricted features or admin interfaces.
 * 
 * @returns {string[]} Array of restricted section names
 * 
 * @example
 * const restricted = getRestrictedSections();
 * // Returns: ['developerDocumentation', 'surgicalGuideReport', 'adminPanel', ...]
 * 
 * @example
 * // Display restricted sections
 * getRestrictedSections().forEach(section => {
 *   console.log(`${section} requires specific group access`);
 * });
 */
export function getRestrictedSections() {
  return Object.keys(DASHBOARD_ACCESS_CONFIG).filter((section) =>
    isSectionRestricted(section),
  );
}

export default DASHBOARD_ACCESS_CONFIG;
