<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">{{ pageTitle }}</h1>

        <v-card elevation="3" class="mb-6">
          <v-card-text class="text-center py-12">
            <v-icon
              :icon="pageIcon"
              size="64"
              color="primary"
              class="mb-4"
            ></v-icon>
            <h2 class="text-h5 mb-3">{{ pageTitle }}</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">
              {{ pageDescription }}
            </p>

            <v-chip color="info" variant="tonal" prepend-icon="mdi-information">
              Coming Soon
            </v-chip>
          </v-card-text>
        </v-card>

        <!-- Breadcrumb navigation -->
        <v-card elevation="2" class="mb-6">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon icon="mdi-map-marker-path" class="mr-2"></v-icon>
              <v-breadcrumbs :items="breadcrumbs" density="compact">
                <template #divider>
                  <v-icon icon="mdi-chevron-right"></v-icon>
                </template>
              </v-breadcrumbs>
            </div>
          </v-card-text>
        </v-card>

        <!-- Quick actions (if applicable) -->
        <v-card v-if="quickActions.length > 0" elevation="2">
          <v-card-title>
            <v-icon icon="mdi-lightning-bolt" class="mr-2"></v-icon>
            Quick Actions
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="action in quickActions"
                :key="action.title"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card variant="tonal" :color="action.color">
                  <v-card-text class="text-center py-6">
                    <v-icon :icon="action.icon" size="32" class="mb-3"></v-icon>
                    <div class="text-subtitle-1 font-weight-medium">
                      {{ action.title }}
                    </div>
                    <div class="text-caption mt-2">
                      {{ action.description }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  getBreadcrumbTrail,
  NAVIGATION_CONFIG,
} from "@/config/navigationConfig";

const route = useRoute();

// Page configuration based on route
const pageConfig = computed(() => {
  const configs = {
    // User Management
    "/users": {
      title: "Users",
      icon: "mdi-account-group",
      description: "Manage user accounts, permissions, and access levels.",
      actions: [
        {
          title: "Add User",
          icon: "mdi-account-plus",
          color: "primary",
          description: "Create a new user account",
        },
        {
          title: "Import Users",
          icon: "mdi-upload",
          color: "secondary",
          description: "Bulk import users from file",
        },
        {
          title: "User Reports",
          icon: "mdi-chart-box",
          color: "info",
          description: "View user statistics",
        },
      ],
    },
    "/groups": {
      title: "Groups",
      icon: "mdi-google-circles-communities",
      description: "Manage groups and group memberships for access control.",
      actions: [
        {
          title: "Create Group",
          icon: "mdi-plus-circle",
          color: "primary",
          description: "Create a new group",
        },
        {
          title: "Sync Groups",
          icon: "mdi-sync",
          color: "secondary",
          description: "Sync with Google Workspace",
        },
      ],
    },
    "/roles": {
      title: "Roles & Permissions",
      icon: "mdi-shield-account",
      description: "Define roles and manage permission assignments.",
      actions: [
        {
          title: "New Role",
          icon: "mdi-shield-plus",
          color: "primary",
          description: "Create a new role",
        },
        {
          title: "Permission Matrix",
          icon: "mdi-matrix",
          color: "info",
          description: "View permission matrix",
        },
      ],
    },
    "/policies": {
      title: "Access Policies",
      icon: "mdi-shield-lock",
      description: "Configure access control policies using Casbin.",
      actions: [
        {
          title: "New Policy",
          icon: "mdi-file-plus",
          color: "primary",
          description: "Add new policy rule",
        },
        {
          title: "Test Policy",
          icon: "mdi-test-tube",
          color: "secondary",
          description: "Test policy enforcement",
        },
      ],
    },

    // Organization
    "/organization/structure": {
      title: "Organization Structure",
      icon: "mdi-sitemap",
      description: "View and manage the organizational hierarchy.",
      actions: [],
    },
    "/organization/departments": {
      title: "Departments",
      icon: "mdi-office-building",
      description: "Manage department structure and assignments.",
      actions: [],
    },
    "/organization/cost-centers": {
      title: "Cost Centers",
      icon: "mdi-cash-multiple",
      description: "Configure cost centers for financial tracking.",
      actions: [],
    },
    "/organization/units": {
      title: "Organizational Units",
      icon: "mdi-file-tree",
      description: "Manage organizational units in Google Workspace.",
      actions: [],
    },

    // Finance
    "/finance/invoices": {
      title: "Invoices",
      icon: "mdi-file-document",
      description: "Manage invoices and billing records.",
      actions: [
        {
          title: "New Invoice",
          icon: "mdi-plus",
          color: "primary",
          description: "Create new invoice",
        },
        {
          title: "Pending Review",
          icon: "mdi-clock-alert",
          color: "warning",
          description: "5 invoices pending",
        },
      ],
    },
    "/finance/budgets": {
      title: "Budgets",
      icon: "mdi-chart-pie",
      description: "Track and manage department budgets.",
      actions: [],
    },
    "/finance/reports": {
      title: "Financial Reports",
      icon: "mdi-chart-line",
      description: "Generate and view financial reports.",
      actions: [],
    },
    "/finance/approvals": {
      title: "Approvals",
      icon: "mdi-check-circle",
      description: "Review and approve financial requests.",
      actions: [],
    },

    // Development
    "/dev/repositories": {
      title: "Code Repositories",
      icon: "mdi-source-repository",
      description: "Access code repositories and version control.",
      actions: [],
    },
    "/dev/deployments": {
      title: "Deployments",
      icon: "mdi-rocket-launch",
      description: "Manage application deployments and releases.",
      actions: [],
    },
    "/dev/api-keys": {
      title: "API Keys",
      icon: "mdi-key-variant",
      description: "Manage API keys and authentication tokens.",
      actions: [],
    },
    "/dev/webhooks": {
      title: "Webhooks",
      icon: "mdi-webhook",
      description: "Configure webhooks for event notifications.",
      actions: [],
    },

    // Projects
    "/projects": {
      title: "All Projects",
      icon: "mdi-folder-multiple",
      description: "View and manage all projects.",
      actions: [],
    },
    "/projects/my-tasks": {
      title: "My Tasks",
      icon: "mdi-checkbox-marked-circle",
      description: "View and manage your assigned tasks.",
      actions: [],
    },
    "/projects/timesheets": {
      title: "Timesheets",
      icon: "mdi-clock-time-four",
      description: "Log time and manage timesheets.",
      actions: [],
    },
    "/projects/reports": {
      title: "Project Reports",
      icon: "mdi-chart-gantt",
      description: "View project progress and analytics.",
      actions: [],
    },

    // Documentation
    "/docs/api": {
      title: "API Documentation",
      icon: "mdi-api",
      description: "Interactive API documentation and references.",
      actions: [],
    },
    "/docs/jsdoc": {
      title: "Code Documentation",
      icon: "mdi-file-document-outline",
      description: "Detailed code documentation generated from JSDoc.",
      actions: [],
    },
    "/docs/guides": {
      title: "User Guides",
      icon: "mdi-help-circle",
      description: "Step-by-step guides and tutorials.",
      actions: [],
    },
    "/docs/technical": {
      title: "Technical Specifications",
      icon: "mdi-file-code",
      description: "Technical documentation and architecture specs.",
      actions: [],
    },

    // Reports
    "/reports/dashboards": {
      title: "Dashboards",
      icon: "mdi-view-dashboard",
      description: "Customizable analytics dashboards.",
      actions: [],
    },
    "/reports/user-activity": {
      title: "User Activity",
      icon: "mdi-account-clock",
      description: "Track user activity and engagement.",
      actions: [],
    },
    "/reports/logs": {
      title: "System Logs",
      icon: "mdi-text-box-search",
      description: "View system logs and events.",
      actions: [],
    },
    "/reports/audit": {
      title: "Audit Trail",
      icon: "mdi-history",
      description: "Comprehensive audit trail of system changes.",
      actions: [],
    },

    // System
    "/system/settings": {
      title: "System Settings",
      icon: "mdi-cog-outline",
      description: "Configure system-wide settings and preferences.",
      actions: [],
    },
    "/system/integrations": {
      title: "Integrations",
      icon: "mdi-puzzle",
      description: "Manage third-party integrations.",
      actions: [],
    },
    "/system/notifications": {
      title: "Notifications",
      icon: "mdi-bell",
      description: "Configure notification settings and alerts.",
      actions: [],
    },
    "/system/security": {
      title: "Security",
      icon: "mdi-security",
      description: "Security settings and access controls.",
      actions: [],
    },
    "/system/backup": {
      title: "Backup & Recovery",
      icon: "mdi-backup-restore",
      description: "Backup and disaster recovery settings.",
      actions: [],
    },

    // Help
    "/help/faq": {
      title: "FAQs",
      icon: "mdi-frequently-asked-questions",
      description: "Frequently asked questions and answers.",
      actions: [],
    },
    "/help/contact": {
      title: "Contact Support",
      icon: "mdi-email-outline",
      description: "Get in touch with our support team.",
      actions: [],
    },
    "/help/tutorials": {
      title: "Video Tutorials",
      icon: "mdi-video-outline",
      description: "Watch tutorial videos and walkthroughs.",
      actions: [],
    },
    "/help/whats-new": {
      title: "What's New",
      icon: "mdi-new-box",
      description: "Latest updates and new features.",
      actions: [],
    },
  };

  return (
    configs[route.path] || {
      title: "Page",
      icon: "mdi-file",
      description: "This page is under construction.",
      actions: [],
    }
  );
});

const pageTitle = computed(() => pageConfig.value.title);
const pageIcon = computed(() => pageConfig.value.icon);
const pageDescription = computed(() => pageConfig.value.description);
const quickActions = computed(() => pageConfig.value.actions);

const breadcrumbs = computed(() => {
  const trail = getBreadcrumbTrail(NAVIGATION_CONFIG, route.path);
  return trail.map((item) => ({
    title: item.title,
    disabled: item.route === route.path,
    to: item.route,
  }));
});
</script>

<style scoped>
/* Optional custom styles */
</style>
