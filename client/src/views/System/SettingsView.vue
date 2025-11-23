<template>
  <v-container fluid class="settings-page">
    <!-- Header Section -->
    <v-row>
      <v-col cols="12">
        <div
          class="d-flex justify-space-between mb-2 header-container compact-header"
        >
          <div>
            <h1 class="text-h6 pt-2 compact-header-title">
              <v-icon size="small" style="margin-inline-end: 6px" color="primary"
                >mdi-cog</v-icon
              >
              Settings
            </h1>
            <p class="text-caption text-medium-emphasis header-subtitle compact-header-subtitle">
              Manage system settings and configurations
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Settings Tabs -->
    <v-row no-gutters>
      <v-col cols="12">
        <v-card elevation="1">
          <v-tabs
            v-model="activeTab"
            bg-color="primary"
            slider-color="white"
            color="white"
            class="settings-tabs"
            density="compact"
          >
            <v-tab value="general">
              <v-icon icon="mdi-cog-outline" size="small" style="margin-inline-end: 6px"></v-icon>
              General
            </v-tab>
            <v-tab value="security">
              <v-icon icon="mdi-security" size="small" style="margin-inline-end: 6px"></v-icon>
              Security
            </v-tab>
            <v-tab value="notifications">
              <v-icon icon="mdi-bell-outline" size="small" style="margin-inline-end: 6px"></v-icon>
              Notifications
            </v-tab>
            <v-tab value="integrations">
              <v-icon icon="mdi-puzzle-outline" size="small" style="margin-inline-end: 6px"></v-icon>
              Integrations
            </v-tab>
          </v-tabs>

          <v-card-text class="pa-0">
            <!-- Tab Content -->
            <v-window v-model="activeTab">
              <!-- General Tab -->
              <v-window-item value="general">
                <GeneralSettings />
              </v-window-item>

              <!-- Security Tab -->
              <v-window-item value="security">
                <SecuritySettings />
              </v-window-item>

              <!-- Notifications Tab -->
              <v-window-item value="notifications">
                <NotificationsSettings />
              </v-window-item>

              <!-- Integrations Tab -->
              <v-window-item value="integrations">
                <IntegrationsSettings />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SecuritySettings from "@/components/Settings/SecuritySettings.vue";
import GeneralSettings from "@/components/Settings/GeneralSettings.vue";
import NotificationsSettings from "@/components/Settings/NotificationsSettings.vue";
import IntegrationsSettings from "@/components/Settings/IntegrationsSettings.vue";

const route = useRoute();
const router = useRouter();
const activeTab = ref("general");

// Set active tab from route query or default to general
onMounted(() => {
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  }
});

// Watch for tab changes and update route
watch(activeTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } });
});
</script>

<style scoped>
.settings-page {
  padding: 8px;
}

@media (min-width: 600px) {
  .settings-page {
    padding: 12px;
  }
}

@media (min-width: 960px) {
  .settings-page {
    padding: 16px;
  }
}

.compact-header {
  min-height: 50px !important;
}

.compact-header-title {
  font-size: 1.25rem !important;
  line-height: 1.5rem !important;
  min-height: 1.5rem !important;
  margin-bottom: 0 !important;
}

.compact-header-subtitle {
  font-size: 0.75rem !important;
  line-height: 1rem !important;
  min-height: 1rem !important;
  margin-top: 2px !important;
}

.settings-tabs :deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
  min-height: 40px;
}

.settings-tabs :deep(.v-tab--selected) {
  color: white;
}
</style>
