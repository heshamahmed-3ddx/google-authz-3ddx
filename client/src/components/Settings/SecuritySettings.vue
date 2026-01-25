<template>
  <div class="security-settings">
    <div class="pa-3">
      <!-- Security Header -->
      <div class="mb-3">
        <div class="d-flex justify-space-between align-center mb-2">
          <div>
            <h2 class="text-subtitle-2 font-weight-medium mb-1">
              <v-icon
                size="small"
                style="margin-inline-end: 6px"
                color="primary"
                >mdi-security</v-icon
              >
              Security Settings
            </h2>
            <p class="text-caption text-medium-emphasis">
              Manage roles, permissions, and access control policies
            </p>
          </div>
          <v-chip
            v-if="!isAdmin"
            color="info"
            variant="tonal"
            size="small"
            prepend-icon="mdi-eye"
          >
            View Only Mode
          </v-chip>
        </div>
        <v-alert
          v-if="!isAdmin"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          <v-alert-title class="text-subtitle-2"
            >Read-Only Access</v-alert-title
          >
          <div class="text-caption">
            You are viewing this page in read-only mode. Only administrators can
            make changes to roles and permissions.
          </div>
        </v-alert>
      </div>

      <!-- Security Sections -->
      <v-row no-gutters>
        <v-col cols="12">
          <!-- Roles & Permissions Section -->
          <v-card elevation="1" class="mb-3">
            <v-card-title class="d-flex align-center compact-title pa-3">
              <v-icon
                icon="mdi-shield-account"
                size="small"
                style="margin-inline-end: 6px"
                color="primary"
              ></v-icon>
              <span class="text-subtitle-2 font-weight-medium"
                >Roles & Permissions</span
              >
            </v-card-title>
            <v-card-text class="pa-3">
              <RolesPermissionsSection :is-admin="isAdmin" />
            </v-card-text>
          </v-card>

          <!-- Access Policies Section -->
          <v-card elevation="1" class="mb-3">
            <v-card-title class="d-flex align-center compact-title pa-3">
              <v-icon
                icon="mdi-shield-lock"
                size="small"
                style="margin-inline-end: 6px"
                color="primary"
              ></v-icon>
              <span class="text-subtitle-2 font-weight-medium"
                >Access Policies</span
              >
            </v-card-title>
            <v-card-text class="pa-3">
              <AccessPoliciesSection :is-admin="isAdmin" />
            </v-card-text>
          </v-card>

          <!-- Security Options Section (Admin Only) -->
          <v-card v-if="isAdmin" elevation="1">
            <v-card-title class="d-flex align-center compact-title pa-3">
              <v-icon
                icon="mdi-security"
                size="small"
                style="margin-inline-end: 6px"
                color="primary"
              ></v-icon>
              <span class="text-subtitle-2 font-weight-medium"
                >Security Options</span
              >
            </v-card-title>
            <v-card-text class="pa-3">
              <SecurityOptionsSection />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useDevModeStore } from "@/stores/devMode";
import RolesPermissionsSection from "./RolesPermissionsSection.vue";
import AccessPoliciesSection from "./AccessPoliciesSection.vue";
import SecurityOptionsSection from "./SecurityOptionsSection.vue";

const authStore = useAuthStore();
const devModeStore = useDevModeStore();

// Extract reactive refs from stores to ensure proper reactivity
// Note: isDevelopment is not a ref, it's a constant, so access it directly
const { cachedUserRights } = storeToRefs(authStore);
const { adminViewEnabled, simulatedGroups } = storeToRefs(devModeStore);

// Check if user is admin (including dev mode admin view)
// This computed will automatically update when adminViewEnabled or simulatedGroups change
const isAdmin = computed(() => {
  // In development mode, if admin view is enabled, grant admin access
  // isDevelopment is a constant, not a ref, so access it directly
  if (devModeStore.isDevelopment && adminViewEnabled.value) {
    return true;
  }

  // Get user's actual groups
  const userRights = cachedUserRights?.value;
  const actualGroups = userRights?.groups || [];

  // Access simulatedGroups to ensure Vue tracks it for reactivity
  const simGroups = simulatedGroups?.value || [];

  // Merge with simulated groups (dev mode)
  // This will include "admin" if it's in simulatedGroups
  const effectiveGroups = devModeStore.getMergedGroups(actualGroups);

  // Check if admin is in effective groups (including simulated)
  return effectiveGroups.includes("admin");
});
</script>

<style scoped>
.security-settings {
  min-height: 400px;
}

.compact-title {
  padding: 6px 12px;
  min-height: 36px;
}
</style>
