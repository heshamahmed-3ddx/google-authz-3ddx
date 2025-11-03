import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { hasNavigationAccess } from "@/config/navigationConfig";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue"),
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
    meta: { requiresAuth: true, requiredGroups: ["admin", "Finance22"] },
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
    meta: { requiresAuth: true, requiredGroups: ["admin"] },
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard with group-based permissions
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    // Only check authentication if we don't already have a user
    // This prevents unnecessary API calls on every navigation
    let isAuthenticated = authStore.isAuthenticated;

    if (!isAuthenticated) {
      // Check authentication from server only if not cached
      isAuthenticated = await authStore.checkAuth();
    }

    if (!isAuthenticated) {
      next({ name: "Home" });
      return;
    }

    // Check group-based permissions
    if (to.meta.requiredGroups) {
      // Get user groups from auth store
      const userRights = authStore.cachedUserRights;
      let userGroups = userRights?.groups || [];

      // In development mode, merge with simulated groups
      if (import.meta.env.DEV) {
        const { useDevModeStore } = await import("@/stores/devMode");
        const devModeStore = useDevModeStore();

        // If admin view is enabled, grant access to all routes
        if (devModeStore.adminViewEnabled) {
          next();
          return;
        }

        // Merge actual groups with simulated groups
        userGroups = devModeStore.getMergedGroups(userGroups);
      }

      // Check if user has required access
      const hasAccess = hasNavigationAccess(to.meta.requiredGroups, userGroups);

      if (!hasAccess) {
        // Redirect to dashboard with error message
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn(
            `Access denied to ${to.path}. Required groups:`,
            to.meta.requiredGroups,
          );
          // eslint-disable-next-line no-console
          console.warn(`User groups:`, userGroups);
        }
        next({ name: "Dashboard" });
        return;
      }
    }

    next();
  } else {
    next();
  }
});

export default router;
