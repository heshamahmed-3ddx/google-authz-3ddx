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
    ],
  },
];

/**
 * Get required groups for restricted navigation access
 * @returns {string[]} Array of group names that grant access to restricted features
 */
export function getRequiredGroupsForNavigation() {
  return ["admin", "SWD", "developers"];
}

/**
 * Check if a navigation item is accessible based on user groups
 * @param {string[]} itemPermissions - Required permissions for the nav item
 * @param {string[]} userGroups - User's current groups
 * @returns {boolean} Whether the item is accessible
 */
export function hasNavigationAccess(itemPermissions, userGroups) {
  if (!itemPermissions || itemPermissions.length === 0) return false;

  // If item allows all users
  if (itemPermissions.includes("*")) return true;

  // Check if user has any of the required permissions
  if (!userGroups || userGroups.length === 0) return false;

  return itemPermissions.some((permission) => userGroups.includes(permission));
}

/**
 * Filter navigation items based on user permissions
 * @param {Array} navigationItems - Full navigation structure
 * @param {string[]} userGroups - User's current groups
 * @returns {Array} Filtered navigation items
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
 * Find navigation item by route
 * @param {Array} navigationItems - Navigation structure
 * @param {string} route - Route to find
 * @returns {Object|null} Navigation item or null
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
 * Get breadcrumb trail for a route
 * @param {Array} navigationItems - Navigation structure
 * @param {string} route - Current route
 * @returns {Array} Breadcrumb trail
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
