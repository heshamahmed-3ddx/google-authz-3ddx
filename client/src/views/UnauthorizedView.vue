<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card elevation="3" class="text-center pa-8">
          <!-- 403 Icon -->
          <v-icon
            size="120"
            color="error"
            class="mb-4"
          >
            mdi-lock-outline
          </v-icon>

          <!-- Error Code -->
          <h1 class="text-h2 font-weight-bold mb-2" style="color: #ef9043;">
            403
          </h1>

          <!-- Title -->
          <h2 class="text-h4 mb-4">
            {{ $t("errors.403.title") || "Access Denied" }}
          </h2>

          <!-- Description -->
          <p class="text-body-1 text-medium-emphasis mb-6">
            {{ $t("errors.403.description") || "You don't have permission to access this page." }}
          </p>

          <!-- User Info -->
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-6 text-left"
          >
            <v-alert-title>
              <v-icon class="mr-2">mdi-shield-alert-outline</v-icon>
              Permission Required
            </v-alert-title>
            <p class="mb-2">
              {{ $t("errors.403.permissionInfo") || "This page requires specific permissions or group membership." }}
            </p>
            <p class="mb-2" v-if="authStore.user">
              <strong>Your Groups:</strong> {{ userGroups || "None" }}
            </p>
            <p class="mb-0 text-caption">
              {{ $t("errors.403.contactAdmin") || "Contact your administrator if you believe you should have access." }}
            </p>
          </v-alert>

          <!-- Developer Info (Development Only) -->
          <v-alert
            v-if="isDevelopment"
            type="info"
            variant="tonal"
            class="mb-6 text-left"
          >
            <v-alert-title>
              <v-icon class="mr-2">mdi-information-outline</v-icon>
              Developer Info
            </v-alert-title>
            <p class="mb-2">
              <strong>Attempted Path:</strong> <code>{{ attemptedPath }}</code>
            </p>
            <p class="mb-2">
              <strong>Required Groups:</strong> <code>{{ requiredGroups || "Unknown" }}</code>
            </p>
            <p class="mb-0">
              <strong>Tip:</strong> Enable "Admin View" in Dev Toolbar to bypass permissions.
            </p>
          </v-alert>

          <!-- Actions -->
          <div class="d-flex gap-3 justify-center flex-wrap">
            <v-btn
              color="primary"
              size="large"
              variant="elevated"
              prepend-icon="mdi-home"
              @click="goToDashboard"
            >
              {{ $t("errors.403.goHome") || "Go to Dashboard" }}
            </v-btn>

            <v-btn
              color="secondary"
              size="large"
              variant="outlined"
              prepend-icon="mdi-arrow-left"
              @click="goBack"
            >
              {{ $t("errors.403.goBack") || "Go Back" }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isDevelopment = computed(() => import.meta.env.DEV);

const attemptedPath = computed(() => {
  return route.query.from || route.query.path || "Unknown";
});

const requiredGroups = computed(() => {
  return route.query.requiredGroups || "Unknown";
});

const userGroups = computed(() => {
  // Try multiple fallbacks for groups (same as router guard)
  let groups = authStore.cachedUserRights?.groups || [];
  
  // Fallback to user object from session
  if (groups.length === 0 && authStore.user?.groups) {
    groups = authStore.user.groups;
  }
  
  // Log for debugging
  if (import.meta.env.DEV) {
    console.log('[UnauthorizedView] Groups from cachedUserRights:', authStore.cachedUserRights?.groups);
    console.log('[UnauthorizedView] Groups from user object:', authStore.user?.groups);
    console.log('[UnauthorizedView] Final groups:', groups);
  }
  
  return groups.length > 0 ? groups.join(", ") : "None";
});

function goToDashboard() {
  router.push({ name: "Dashboard" });
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    goToDashboard();
  }
}
</script>

<style scoped>
code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.v-theme--dark code {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>

