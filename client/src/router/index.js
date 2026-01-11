import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { hasNavigationAccess } from "@/config/navigationConfig";

const routes = [
  {
    path: "/",
    name: "Login",
    component: () => import("@/views/LoginPage.vue"),
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/WelcomeView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    // Prefetch dashboard for faster loading
    component: () =>
      import(/* webpackPrefetch: true */ "@/views/DashboardView.vue"),
    meta: { requiresAuth: true },
  },

  // ========================================
  // USER MANAGEMENT ROUTES
  // ========================================
  {
    path: "/users",
    name: "Users",
    component: () => import("@/views/UserManagement/UsersView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "SWD"] },
  },
  {
    path: "/groups",
    name: "Groups",
    component: () => import("@/views/UserManagement/GroupsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "SWD"] },
  },
  {
    path: "/roles",
    name: "Roles",
    component: () => import("@/views/UserManagement/RolesView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin"] },
  },
  {
    path: "/policies",
    name: "Policies",
    component: () => import("@/views/UserManagement/PoliciesView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin"] },
  },

  // ========================================
  // ORGANIZATION ROUTES
  // ========================================
  {
    path: "/organization/structure",
    name: "OrganizationStructure",
    component: () => import("@/views/Organization/StructureView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "SWD"] },
  },
  {
    path: "/organization/departments",
    name: "Departments",
    component: () => import("@/views/Organization/DepartmentsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "SWD", "finance"] },
  },
  {
    path: "/organization/cost-centers",
    name: "CostCenters",
    component: () => import("@/views/Organization/CostCentersView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "finance"] },
  },
  {
    path: "/organization/units",
    name: "OrganizationalUnits",
    component: () => import("@/views/Organization/UnitsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "SWD"] },
  },

  // ========================================
  // FINANCIAL ROUTES
  // ========================================
  {
    path: "/finance/invoices",
    name: "Invoices",
    component: () => import("@/views/Finance/InvoicesView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "finance"] },
  },
  {
    path: "/finance/budgets",
    name: "Budgets",
    component: () => import("@/views/Finance/BudgetsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "finance"] },
  },
  {
    path: "/finance/reports",
    name: "FinancialReports",
    component: () => import("@/views/Finance/ReportsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "finance"] },
  },
  {
    path: "/finance/surgical-guide-report",
    name: "SurgicalGuideReport",
    component: () => import("@/views/Reports/SurgicalGuideReportView.vue"),
    meta: {
      requiresAuth: true,
      requiredGroups: ["admin", "Finance22"],
      breadcrumb: (t) => t("navigation.surgicalGuideReport"),
    },
  },
  {
    path: "/finance/approvals",
    name: "FinancialApprovals",
    component: () => import("@/views/Finance/ApprovalsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "finance"] },
  },

  // ========================================
  // DEVELOPMENT ROUTES
  // ========================================
  {
    path: "/dev/repositories",
    name: "Repositories",
    component: () => import("@/views/Development/RepositoriesView.vue"),
    meta: {
      requiresAuth: true,
      requiredGroups: ["admin", "SWD", "developers"],
    },
  },
  {
    path: "/dev/deployments",
    name: "Deployments",
    component: () => import("@/views/Development/DeploymentsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "SWD"] },
  },
  {
    path: "/dev/api-keys",
    name: "ApiKeys",
    component: () => import("@/views/Development/ApiKeysView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "SWD"] },
  },
  {
    path: "/dev/webhooks",
    name: "Webhooks",
    component: () => import("@/views/Development/WebhooksView.vue"),
    meta: {
      requiresAuth: true,
      requiredGroups: ["admin", "SWD", "developers"],
    },
  },
  {
    path: "/dev/color-system-test",
    name: "ColorSystemTest",
    component: () => import("@/views/ColorSystemTest.vue"),
    meta: {
      requiresAuth: true,
      requiredGroups: ["*"], // Accessible to all authenticated users for testing
    },
  },

  // ========================================
  // PROJECTS ROUTES
  // ========================================
  {
    path: "/projects",
    name: "Projects",
    component: () => import("@/views/Projects/ProjectsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["*"] },
  },
  {
    path: "/projects/my-tasks",
    name: "MyTasks",
    component: () => import("@/views/Projects/MyTasksView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["*"] },
  },
  {
    path: "/projects/timesheets",
    name: "Timesheets",
    component: () => import("@/views/Projects/TimesheetsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["*"] },
  },
  {
    path: "/projects/reports",
    name: "ProjectReports",
    component: () => import("@/views/Projects/ReportsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "SWD", "finance"] },
  },

  // ========================================
  // DOCUMENTATION ROUTES
  // ========================================
  {
    path: "/docs/api",
    name: "ApiDocs",
    component: () => import("@/views/Documentation/ApiDocsView.vue"),
    meta: {
      requiresAuth: true,
      requiredGroups: ["admin", "SWD", "developers"],
    },
  },
  {
    path: "/docs/jsdoc",
    name: "JSDoc",
    component: () => import("@/views/Documentation/JSDocView.vue"),
    meta: {
      requiresAuth: true,
      requiredGroups: ["admin", "SWD", "developers"],
    },
  },
  {
    path: "/docs/guides",
    name: "UserGuides",
    component: () => import("@/views/Documentation/GuidesView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["*"] },
  },
  {
    path: "/docs/technical",
    name: "TechnicalSpecs",
    component: () => import("@/views/Documentation/TechnicalView.vue"),
    meta: {
      requiresAuth: true,
      requiredGroups: ["admin", "SWD", "developers"],
    },
  },

  // ========================================
  // REPORTS ROUTES
  // ========================================
  {
    path: "/reports/dashboards",
    name: "ReportsDashboards",
    component: () => import("@/views/Reports/DashboardsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "SWD", "finance"] },
  },
  {
    path: "/reports/powerbi",
    name: "PowerBIReporting",
    component: () => import("@/views/Reports/PowerBIView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["*"] },
  },
  {
    path: "/reports/grafana",
    name: "GrafanaMonitoring",
    component: () => import("@/views/Reports/GrafanaView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "SWD"] },
  },
  {
    path: "/reports/user-activity",
    name: "UserActivity",
    component: () => import("@/views/Reports/UserActivityView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin"] },
  },
  {
    path: "/reports/logs",
    name: "SystemLogs",
    component: () => import("@/views/Reports/LogsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "SWD"] },
  },
  {
    path: "/reports/audit",
    name: "AuditTrail",
    component: () => import("@/views/Reports/AuditView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin"] },
  },

  // ========================================
  // SYSTEM ROUTES
  // ========================================
  {
    path: "/system/settings",
    name: "SystemSettings",
    component: () => import("@/views/System/SettingsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["*"] }, // All authenticated users can view, but only admins can edit
  },
  {
    path: "/system/integrations",
    name: "Integrations",
    component: () => import("@/views/System/IntegrationsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin"] },
  },
  {
    path: "/system/notifications",
    name: "Notifications",
    component: () => import("@/views/System/NotificationsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin"] },
  },
  {
    path: "/system/security",
    name: "Security",
    component: () => import("@/views/System/SecurityView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin"] },
  },
  {
    path: "/system/backup",
    name: "Backup",
    component: () => import("@/views/System/BackupView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin"] },
  },

  // ========================================
  // USER PROFILE & HELP
  // ========================================
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/views/ProfileView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["*"] },
  },
  {
    path: "/help/faq",
    name: "FAQ",
    component: () => import("@/views/Help/FAQView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["*"] },
  },
  {
    path: "/help/contact",
    name: "ContactSupport",
    component: () => import("@/views/Help/ContactView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["*"] },
  },
  {
    path: "/help/tutorials",
    name: "Tutorials",
    component: () => import("@/views/Help/TutorialsView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["*"] },
  },
  {
    path: "/help/whats-new",
    name: "WhatsNew",
    component: () => import("@/views/Help/WhatsNewView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["*"] },
  },

  // ========================================
  // LEGACY & SPECIAL ROUTES
  // ========================================
  {
    path: "/swd",
    name: "SWD",
    component: () => import("@/views/SWDView.vue"),
    meta: { requiresAuth: true, requiredGroups: ["admin", "SWD"] },
  },
  {
    path: "/callback",
    name: "Callback",
    component: () => import("@/views/CallbackView.vue"),
    meta: { requiresAuth: false }, // Explicitly public - OAuth callback
  },

  // ========================================
  // ERROR PAGES
  // ========================================
  {
    path: "/unauthorized",
    name: "Unauthorized",
    component: () => import("@/views/UnauthorizedView.vue"),
    meta: { requiresAuth: false }, // Must be accessible without auth
  },
  {
    path: "/404",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
  },

  // Redirect old routes to dashboard
  {
    path: "/user-details",
    redirect: "/dashboard",
  },
  {
    path: "/user-rights",
    redirect: "/dashboard",
  },
  {
    path: "/client-confirmation",
    redirect: "/dashboard",
  },

  // ========================================
  // CATCH-ALL 404 ROUTE (MUST BE LAST)
  // ========================================
  {
    path: "/:pathMatch(.*)*",
    name: "NotFoundCatchAll",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * Helper function to get user groups with multiple fallback mechanisms
 * 
 * Attempts to retrieve user groups from multiple sources in priority order:
 * 1. Cached user rights from auth store
 * 2. User object groups from session
 * 3. Fresh API fetch if authenticated but no cached data
 * 
 * This ensures navigation guards always have access to user groups even
 * if the cache hasn't been populated yet.
 * 
 * @private
 * @async
 * @param {Object} authStore - Pinia auth store instance
 * @param {Object} [authStore.cachedUserRights] - Cached rights from API
 * @param {string[]} [authStore.cachedUserRights.groups] - User's groups
 * @param {Object} [authStore.user] - User object from session
 * @param {string[]} [authStore.user.groups] - User's groups from session
 * @param {boolean} authStore.isAuthenticated - Whether user is logged in
 * @returns {Promise<string[]>} Array of user group names
 * 
 * @example
 * // In router guard
 * const authStore = useAuthStore();
 * const groups = await getUserGroups(authStore);
 * // Returns: ['admin', 'user'] or []
 */
async function getUserGroups(authStore) {
  // Try cached user rights first
  let userGroups = authStore.cachedUserRights?.groups || [];
  
  // Fallback to user object from session if cached rights not available
  if (userGroups.length === 0 && authStore.user?.groups) {
    userGroups = authStore.user.groups;
  }
  
  // If still empty and user is authenticated, try to fetch user rights
  if (userGroups.length === 0 && authStore.isAuthenticated) {
    try {
      // Fetch user rights if not cached (non-blocking)
      const { apiService } = await import("@/services/api");
      const response = await apiService.get("/api/user/rights");
      if (response.data?.data?.groups) {
        userGroups = response.data.data.groups;
      }
    } catch (error) {
      // Silently fail - will use empty groups and rely on wildcard permissions
      console.debug("Failed to fetch user rights in router guard", error);
    }
  }
  
  return userGroups;
}

// Navigation guard with group-based permissions
router.beforeEach(async (to, from, next) => {
  try {
    const authStore = useAuthStore();

    // Fast path: if route doesn't require auth, allow immediately
    if (!to.meta.requiresAuth) {
      // If authenticated user tries to access login page, redirect to home
      if (to.name === "Login" && authStore.isAuthenticated) {
        next({ name: "Home" });
        return;
      }
      next();
      return;
    }

    // Check if user is already authenticated (use cached value first)
    let isAuthenticated = authStore.isAuthenticated;
    
    // Only check with server if not already authenticated (avoid unnecessary API calls)
    if (!isAuthenticated) {
      try {
        isAuthenticated = await authStore.checkAuth();
      } catch (error) {
        // If auth check fails, treat as not authenticated
        console.error("Auth check failed in router guard", error);
        isAuthenticated = false;
      }
    }

    // If logged-in user tries to access login page, redirect to home
    if (to.name === "Login" && isAuthenticated) {
      next({ name: "Home" });
      return;
    }

    // Require authentication for protected routes
    if (!isAuthenticated) {
      next({ name: "Login" });
      return;
    }

    // Check group-based permissions (only if required)
    if (to.meta.requiredGroups) {
      // Check for wildcard permission first (allows all authenticated users)
      if (to.meta.requiredGroups.includes("*")) {
        next();
        return;
      }

      // Get user groups with fallback
      let userGroups = await getUserGroups(authStore);

      // In development mode, merge with simulated groups
      if (import.meta.env.DEV) {
        try {
          const { useDevModeStore } = await import("@/stores/devMode");
          const devModeStore = useDevModeStore();

          // If admin view is enabled, grant access to all routes
          if (devModeStore.adminViewEnabled) {
            next();
            return;
          }

          // Merge actual groups with simulated groups
          userGroups = devModeStore.getMergedGroups(userGroups);
        } catch (error) {
          // Dev mode store might not be available, continue with normal flow
          console.debug("Dev mode store not available", error);
        }
      }

      // Check if user has required access
      try {
        const hasAccess = hasNavigationAccess(to.meta.requiredGroups, userGroups);

        if (!hasAccess) {
          // Redirect to unauthorized page with context
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn(
              `Access denied to ${to.path}. Required groups:`,
              to.meta.requiredGroups,
            );
            // eslint-disable-next-line no-console
            console.warn(`User groups:`, userGroups);
          }
          next({
            name: "Unauthorized",
            query: {
              from: to.path,
              requiredGroups: to.meta.requiredGroups.join(", "),
            },
          });
          return;
        }
      } catch (error) {
        // If permission check fails, deny access by default
        console.error("Permission check failed in router guard", error);
        next({
          name: "Unauthorized",
          query: {
            from: to.path,
            requiredGroups: to.meta.requiredGroups.join(", "),
          },
        });
        return;
      }
    }

    next();
  } catch (error) {
    // Global error handler for router guard
    console.error("Router guard error", error);
    
    // If error occurs, redirect to login to ensure user can re-authenticate
    // Only if we're not already on a public route
    if (to.meta.requiresAuth) {
      next({ name: "Login" });
    } else {
      next(); // Allow public routes even on error
    }
  }
});

export default router;
