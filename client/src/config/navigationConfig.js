/**
 * Navigation Configuration - Oracle Fusion Inspired
 *
 * This configuration defines the sidebar navigation structure with:
 * - Hierarchical menu organization
 * - Role-based access control
 * - Icons and labels
 * - Route mappings
 *
 * Structure inspired by Oracle Fusion's navigation patterns
 */

/**
 * Navigation Item Structure:
 * {
 *   id: string - Unique identifier
 *   title: string - Display name
 *   icon: string - Material Design Icon name
 *   route: string - Vue Router path (optional for groups)
 *   permissions: string[] - Required groups/roles (* for public)
 *   children: array - Nested navigation items
 *   badge: object - Optional badge configuration { text, color }
 *   divider: boolean - Show divider after item
 * }
 */

export const NAVIGATION_CONFIG = [
  // ========================================
  // HOME SECTION
  // ========================================
  {
    id: "home",
    title: "Home",
    icon: "mdi-home",
    route: "/home",
    permissions: ["*"], // Available to all authenticated users
  },

  // ========================================
  // DASHBOARD
  // ========================================
  {
    id: "dashboard",
    title: "Dashboard", // Uses translation key: navigation.dashboard
    icon: "mdi-view-dashboard",
    route: "/dashboard",
    permissions: ["*"], // Available to all authenticated users
  },

  // ========================================
  // REPORTS & ANALYTICS (Live Pages Only)
  // ========================================
  {
    id: "reportsAnalytics",
    title: "Reports & Analytics",
    icon: "mdi-chart-box",
    permissions: ["admin", "SWD", "finance"],
    children: [
      {
        id: "surgical-guide-report",
        title: "Surgical Guide Report",
        icon: "mdi-file-chart",
        route: "/finance/surgical-guide-report",
        permissions: ["admin", "Finance22"],
      },
      {
        id: "powerbi-reporting",
        title: "PowerBI Reporting",
        icon: "mdi-chart-box-outline",
        route: "/reports/powerbi",
        permissions: ["*"],
      },
      {
        id: "grafana-monitoring",
        title: "Grafana Monitoring",
        icon: "mdi-chart-timeline-variant",
        route: "/reports/grafana",
        permissions: ["admin", "SWD"],
      },
      {
        id: "report-scheduling",
        titleKey: "navigation.report-scheduling",
        icon: "mdi-calendar-clock",
        route: "/reports/scheduling",
        permissions: ["admin", "SWD"],
      },
    ],
  },

  // ========================================
  // ADMIN SETTINGS
  // ========================================
  {
    id: "admin-settings",
    title: "Admin Settings",
    icon: "mdi-shield-account",
    route: "/admin/settings",
    permissions: ["SWD", "SWDD", "SW"], // Support all super admin group variants
  },
];

/**
 * Get required groups for restricted navigation access
 * 
 * Returns the list of user groups that have access to restricted/developer-only
 * navigation items throughout the application.
 * 
 * @returns {string[]} Array of group names: ['admin', 'SWD', 'developers']
 * 
 * @example
 * const restrictedGroups = getRequiredGroupsForNavigation();
 * // Returns: ['admin', 'SWD', 'developers']
 */
export function getRequiredGroupsForNavigation() {
  return ["admin", "SWD", "developers"];
}

/**
 * Check if a navigation item is accessible based on user groups
 * 
 * Determines whether a user has permission to access a specific navigation item
 * by comparing the item's required permissions against the user's groups.
 * Special case: '*' permission grants access to all users.
 * 
 * @param {string[]} itemPermissions - Required permissions/groups for the navigation item
 * @param {string[]} userGroups - Current user's group memberships
 * @returns {boolean} True if user can access the item, false otherwise
 * 
 * @example
 * // Check if user can access admin menu
 * const canAccess = hasNavigationAccess(['admin'], ['admin', 'user']);
 * // Returns: true
 * 
 * @example
 * // Check wildcard permission (accessible to all)
 * const canAccess = hasNavigationAccess(['*'], []);
 * // Returns: true
 * 
 * @example
 * // User without required permissions
 * const canAccess = hasNavigationAccess(['admin'], ['user']);
 * // Returns: false
 */
export function hasNavigationAccess(itemPermissions, userGroups) {
  if (!itemPermissions || itemPermissions.length === 0) return false;

  // Super admin (SWD) can access everything
  if (userGroups && userGroups.includes("SWD")) return true;

  // If item allows all users
  if (itemPermissions.includes("*")) return true;

  // Check if user has any of the required permissions
  if (!userGroups || userGroups.length === 0) return false;

  return itemPermissions.some((permission) => userGroups.includes(permission));
}

/**
 * Filter navigation items based on user permissions (recursive)
 * 
 * Filters the entire navigation structure to show only items accessible to the current user.
 * Recursively processes nested children and removes parent items that have no accessible
 * children and no direct route. This ensures the navigation menu only shows relevant items.
 * 
 * @param {Array<Object>} navigationItems - Full navigation structure with nested items
 * @param {string[]} userGroups - Current user's group memberships
 * @returns {Array<Object>} Filtered navigation items with only accessible entries
 * 
 * @example
 * // Filter navigation for a regular user
 * const userNav = filterNavigationByPermissions(navigationConfig, ['user', 'viewer']);
 * 
 * @example
 * // Filter navigation for admin
 * const adminNav = filterNavigationByPermissions(navigationConfig, ['admin']);
 * // Returns all items including restricted ones
 */
export function filterNavigationByPermissions(navigationItems, userGroups) {
  return navigationItems
    .filter((item) => hasNavigationAccess(item.permissions, userGroups))
    .map((item) => {
      // If item has children, filter them recursively
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterNavigationByPermissions(
          item.children,
          userGroups,
        );

        // Only include parent if it has accessible children or its own route
        if (filteredChildren.length > 0 || item.route) {
          return {
            ...item,
            children: filteredChildren,
          };
        }
        return null;
      }
      return item;
    })
    .filter((item) => item !== null);
}

/**
 * Find navigation item by route path (recursive search)
 * 
 * Searches through the navigation structure (including nested children) to find
 * an item matching the specified route. Used for determining active navigation
 * state and breadcrumb generation.
 * 
 * @param {Array<Object>} navigationItems - Navigation structure to search
 * @param {string} route - Route path to find (e.g., '/dashboard' or '/reports/surgical-guide')
 * @returns {Object|null} Matching navigation item object, or null if not found
 * 
 * @example
 * // Find dashboard item
 * const item = findNavigationItemByRoute(navigationConfig, '/dashboard');
 * // Returns: { title: 'Dashboard', route: '/dashboard', ... }
 * 
 * @example
 * // Route not found
 * const item = findNavigationItemByRoute(navigationConfig, '/nonexistent');
 * // Returns: null
 */
export function findNavigationItemByRoute(navigationItems, route) {
  for (const item of navigationItems) {
    if (item.route === route) return item;

    if (item.children) {
      const found = findNavigationItemByRoute(item.children, route);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get breadcrumb trail for current route
 * 
 * Generates a breadcrumb trail by finding the path from root to the current route
 * through the navigation structure. Useful for displaying hierarchical navigation
 * context (e.g., Home > Reports > Surgical Guide Report).
 * 
 * @param {Array<Object>} navigationItems - Full navigation structure
 * @param {string} route - Current route path
 * @returns {Array<Object>} Array of navigation items representing the breadcrumb trail
 * 
 * @example
 * // Get breadcrumb for nested route
 * const breadcrumbs = getBreadcrumbTrail(navigationConfig, '/reports/surgical-guide');
 * // Returns: [
 * //   { title: 'Reports', route: '/reports', ... },
 * //   { title: 'Surgical Guide', route: '/reports/surgical-guide', ... }
 * // ]
 * 
 * @example
 * // Top-level route
 * const breadcrumbs = getBreadcrumbTrail(navigationConfig, '/dashboard');
 * // Returns: [{ title: 'Dashboard', route: '/dashboard', ... }]
 */
export function getBreadcrumbTrail(navigationItems, route) {
  const trail = [];

  function findTrail(items, targetRoute, currentTrail = []) {
    for (const item of items) {
      const newTrail = [...currentTrail, item];

      if (item.route === targetRoute) {
        trail.push(...newTrail);
        return true;
      }

      if (item.children) {
        if (findTrail(item.children, targetRoute, newTrail)) {
          return true;
        }
      }
    }
    return false;
  }

  findTrail(navigationItems, route);
  return trail;
}

export default NAVIGATION_CONFIG;
