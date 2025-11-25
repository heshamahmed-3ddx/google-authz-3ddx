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
    route: "/dashboard",
    permissions: ["*"], // Available to all authenticated users
  },

  // ========================================
  // USER MANAGEMENT SECTION
  // ========================================
  {
    id: "user-management",
    title: "User Management",
    icon: "mdi-account-multiple",
    permissions: ["admin", "SWD", "developers"],
    children: [
      {
        id: "users-list",
        title: "Users",
        icon: "mdi-account-group",
        route: "/users",
        permissions: ["admin", "SWD"],
      },
      {
        id: "groups-list",
        title: "Groups",
        icon: "mdi-google-circles-communities",
        route: "/groups",
        permissions: ["admin", "SWD"],
      },
      {
        id: "roles-permissions",
        title: "Roles & Permissions",
        icon: "mdi-shield-account",
        route: "/roles",
        permissions: ["admin"],
      },
      {
        id: "access-policies",
        title: "Access Policies",
        icon: "mdi-shield-lock",
        route: "/policies",
        permissions: ["admin"],
      },
    ],
  },

  // ========================================
  // ORGANIZATION SECTION
  // ========================================
  {
    id: "organization",
    title: "Organization",
    icon: "mdi-domain",
    permissions: ["admin", "SWD", "finance", "users"],
    children: [
      {
        id: "org-structure",
        title: "Organization Structure",
        icon: "mdi-sitemap",
        route: "/organization/structure",
        permissions: ["admin", "SWD"],
      },
      {
        id: "departments",
        title: "Departments",
        icon: "mdi-office-building",
        route: "/organization/departments",
        permissions: ["admin", "SWD", "finance"],
      },
      {
        id: "cost-centers",
        title: "Cost Centers",
        icon: "mdi-cash-multiple",
        route: "/organization/cost-centers",
        permissions: ["admin", "finance"],
      },
      {
        id: "org-units",
        title: "Organizational Units",
        icon: "mdi-file-tree",
        route: "/organization/units",
        permissions: ["admin", "SWD"],
      },
    ],
  },

  // ========================================
  // FINANCIAL MANAGEMENT
  // ========================================
  {
    id: "finance",
    title: "Financial Management",
    icon: "mdi-currency-usd",
    permissions: ["admin", "finance"],
    children: [
      {
        id: "invoices",
        title: "Invoices",
        icon: "mdi-file-document",
        route: "/finance/invoices",
        permissions: ["admin", "finance"],
      },
      {
        id: "budgets",
        title: "Budgets",
        icon: "mdi-chart-pie",
        route: "/finance/budgets",
        permissions: ["admin", "finance"],
      },
      {
        id: "reports",
        title: "Financial Reports",
        icon: "mdi-chart-line",
        route: "/finance/reports",
        permissions: ["admin", "finance"],
      },
      {
        id: "surgical-guide-report",
        title: "Surgical Guide Report",
        icon: "mdi-file-chart",
        route: "/finance/surgical-guide-report",
        permissions: ["admin", "Finance22"],
      },
      {
        id: "approvals",
        title: "Approvals",
        icon: "mdi-check-circle",
        route: "/finance/approvals",
        permissions: ["admin", "finance"],
      },
    ],
  },

  // ========================================
  // DEVELOPMENT SECTION
  // ========================================
  {
    id: "development",
    title: "Development",
    icon: "mdi-code-braces",
    permissions: ["admin", "SWD", "developers"],
    children: [
      {
        id: "repositories",
        title: "Code Repositories",
        icon: "mdi-source-repository",
        route: "/dev/repositories",
        permissions: ["admin", "SWD", "developers"],
      },
      {
        id: "deployments",
        title: "Deployments",
        icon: "mdi-rocket-launch",
        route: "/dev/deployments",
        permissions: ["admin", "SWD"],
      },
      {
        id: "api-keys",
        title: "API Keys",
        icon: "mdi-key-variant",
        route: "/dev/api-keys",
        permissions: ["admin", "SWD"],
      },
      {
        id: "webhooks",
        title: "Webhooks",
        icon: "mdi-webhook",
        route: "/dev/webhooks",
        permissions: ["admin", "SWD", "developers"],
      },
      {
        id: "color-system-test",
        title: "Color System Test",
        icon: "mdi-palette",
        route: "/dev/color-system-test",
        permissions: ["*"], // Accessible to all authenticated users for testing
      },
    ],
  },

  // ========================================
  // PROJECTS & TASKS
  // ========================================
  {
    id: "projects",
    title: "Projects & Tasks",
    icon: "mdi-briefcase",
    permissions: ["*"],
    children: [
      {
        id: "projects-list",
        title: "All Projects",
        icon: "mdi-folder-multiple",
        route: "/projects",
        permissions: ["*"],
      },
      {
        id: "my-tasks",
        title: "My Tasks",
        icon: "mdi-checkbox-marked-circle",
        route: "/projects/my-tasks",
        permissions: ["*"],
      },
      {
        id: "timesheets",
        title: "Timesheets",
        icon: "mdi-clock-time-four",
        route: "/projects/timesheets",
        permissions: ["*"],
      },
      {
        id: "project-reports",
        title: "Project Reports",
        icon: "mdi-chart-gantt",
        route: "/projects/reports",
        permissions: ["admin", "SWD", "finance"],
      },
    ],
  },

  // ========================================
  // DOCUMENTATION
  // ========================================
  {
    id: "documentation",
    title: "Documentation",
    icon: "mdi-book-open-variant",
    permissions: ["admin", "SWD", "developers"],
    divider: true, // Add divider after this section
    children: [
      {
        id: "api-docs",
        title: "API Documentation",
        icon: "mdi-api",
        route: "/docs/api",
        permissions: ["admin", "SWD", "developers"],
      },
      {
        id: "jsdoc",
        title: "Code Documentation",
        icon: "mdi-file-document-outline",
        route: "/docs/jsdoc",
        permissions: ["admin", "SWD", "developers"],
      },
      {
        id: "user-guides",
        title: "User Guides",
        icon: "mdi-help-circle",
        route: "/docs/guides",
        permissions: ["*"],
      },
      {
        id: "technical-specs",
        title: "Technical Specifications",
        icon: "mdi-file-code",
        route: "/docs/technical",
        permissions: ["admin", "SWD", "developers"],
      },
    ],
  },

  // ========================================
  // REPORTS & ANALYTICS
  // ========================================
  {
    id: "reports",
    title: "Reports & Analytics",
    icon: "mdi-chart-box",
    permissions: ["admin", "SWD", "finance"],
    children: [
      {
        id: "dashboards",
        title: "Dashboards",
        icon: "mdi-view-dashboard",
        route: "/reports/dashboards",
        permissions: ["admin", "SWD", "finance"],
      },
      {
        id: "powerbi-reporting",
        title: "PowerBI Reporting",
        icon: "mdi-chart-box-outline",
        route: "/reports/powerbi",
        permissions: ["*"],
      },
      {
        id: "user-activity",
        title: "User Activity",
        icon: "mdi-account-clock",
        route: "/reports/user-activity",
        permissions: ["admin"],
      },
      {
        id: "system-logs",
        title: "System Logs",
        icon: "mdi-text-box-search",
        route: "/reports/logs",
        permissions: ["admin", "SWD"],
      },
      {
        id: "audit-trail",
        title: "Audit Trail",
        icon: "mdi-history",
        route: "/reports/audit",
        permissions: ["admin"],
      },
    ],
  },

  // ========================================
  // SYSTEM CONFIGURATION
  // ========================================
  {
    id: "system",
    title: "System",
    icon: "mdi-cog",
    permissions: ["admin"],
    children: [
      {
        id: "settings",
        title: "System Settings",
        icon: "mdi-cog-outline",
        route: "/system/settings",
        permissions: ["*"], // All authenticated users can view, but only admins can edit
      },
      {
        id: "integrations",
        title: "Integrations",
        icon: "mdi-puzzle",
        route: "/system/integrations",
        permissions: ["admin"],
      },
      {
        id: "notifications",
        title: "Notifications",
        icon: "mdi-bell",
        route: "/system/notifications",
        permissions: ["admin"],
      },
      {
        id: "security",
        title: "Security",
        icon: "mdi-security",
        route: "/system/security",
        permissions: ["admin"],
      },
      {
        id: "backup",
        title: "Backup & Recovery",
        icon: "mdi-backup-restore",
        route: "/system/backup",
        permissions: ["admin"],
      },
    ],
  },

  // ========================================
  // USER PROFILE
  // ========================================
  {
    id: "profile",
    title: "My Profile",
    icon: "mdi-account-circle",
    route: "/profile",
    permissions: ["*"],
    divider: true,
  },

  // ========================================
  // HELP & SUPPORT
  // ========================================
  {
    id: "help",
    title: "Help & Support",
    icon: "mdi-help-circle-outline",
    permissions: ["*"],
    children: [
      {
        id: "faq",
        title: "FAQs",
        icon: "mdi-frequently-asked-questions",
        route: "/help/faq",
        permissions: ["*"],
      },
      {
        id: "contact-support",
        title: "Contact Support",
        icon: "mdi-email-outline",
        route: "/help/contact",
        permissions: ["*"],
      },
      {
        id: "tutorials",
        title: "Video Tutorials",
        icon: "mdi-video-outline",
        route: "/help/tutorials",
        permissions: ["*"],
      },
      {
        id: "whats-new",
        title: "What's New",
        icon: "mdi-new-box",
        route: "/help/whats-new",
        permissions: ["*"],
        badge: { text: "2", color: "primary" },
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
