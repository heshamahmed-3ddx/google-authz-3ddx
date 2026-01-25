<template>
  <div v-if="devModeStore.isDevelopment" class="dev-toolbar">
    <v-menu location="bottom end" :close-on-content-click="false">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          class="dev-toggle-btn"
          size="default"
          elevation="2"
        >
          <v-icon size="20">mdi-code-tags</v-icon>
          <v-tooltip activator="parent" location="left">
            <div class="tooltip-content">
              <div class="font-weight-bold">Development Mode</div>
              <div class="text-caption">Settings & Tools</div>
            </div>
          </v-tooltip>
        </v-btn>
      </template>

      <v-card
        min-width="360"
        max-width="420"
        class="dev-toolbar-card"
        elevation="8"
      >
        <v-card-title class="dev-toolbar-header pa-3">
          <div class="d-flex align-center">
            <v-avatar size="28" color="warning" class="mr-2">
              <v-icon color="white" size="16">mdi-code-tags</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                Development Mode
              </div>
              <div
                class="text-caption text-medium-emphasis"
                style="line-height: 1.2"
              >
                Testing Tools
              </div>
            </div>
          </div>
        </v-card-title>

        <v-divider class="dev-divider"></v-divider>

        <v-card-text class="pa-3">
          <!-- Dev Mode Status Info -->
          <div class="dev-mode-content mb-3">
            <div
              v-if="devModeStore.adminViewEnabled"
              class="mb-2 status-indicator status-active"
            >
              <div class="d-flex align-center">
                <v-icon color="success" size="16" class="mr-2"
                  >mdi-check-circle</v-icon
                >
                <div class="text-caption font-weight-medium">
                  Admin View Enabled
                </div>
              </div>
            </div>

            <div
              v-if="devModeStore.simulatedGroups.length > 0"
              class="mb-2 status-indicator groups-status"
            >
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center">
                  <v-icon color="info" size="18" class="mr-2"
                    >mdi-account-group</v-icon
                  >
                  <div class="text-caption font-weight-bold">
                    Simulated Groups
                  </div>
                </div>
                <v-chip
                  size="x-small"
                  color="primary"
                  variant="flat"
                  class="count-chip"
                >
                  {{ devModeStore.simulatedGroups.length }}
                </v-chip>
              </div>
              <div class="groups-container">
                <v-chip
                  v-for="group in devModeStore.simulatedGroups"
                  :key="group"
                  size="small"
                  color="primary"
                  variant="flat"
                  class="group-chip"
                  prepend-icon="mdi-account-circle"
                >
                  <span class="font-weight-medium">{{ group }}</span>
                </v-chip>
              </div>
            </div>
          </div>

          <!-- Control Buttons -->
          <div class="controls-section mb-2">
            <div class="control-buttons-wrapper">
              <!-- Admin View Toggle -->
              <v-btn
                :color="
                  devModeStore.adminViewEnabled ? 'success' : 'grey-darken-1'
                "
                variant="flat"
                size="small"
                prepend-icon="mdi-shield-crown"
                class="control-btn"
                :class="{ 'btn-active': devModeStore.adminViewEnabled }"
                @click="devModeStore.toggleAdminView"
              >
                <v-icon start size="16">{{
                  devModeStore.adminViewEnabled ? "mdi-eye" : "mdi-eye-off"
                }}</v-icon>
                <span class="font-weight-medium">Admin View</span>
                <v-tooltip activator="parent" location="top">
                  {{ devModeStore.adminViewEnabled ? "Disable" : "Enable" }}
                  admin view
                </v-tooltip>
              </v-btn>

              <!-- Group Simulator -->
              <v-menu offset-y :close-on-content-click="false" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :color="
                      devModeStore.simulatedGroups.length > 0
                        ? 'primary'
                        : 'grey-darken-1'
                    "
                    variant="flat"
                    size="small"
                    prepend-icon="mdi-account-group"
                    class="control-btn"
                    :class="{
                      'btn-active': devModeStore.simulatedGroups.length > 0,
                    }"
                  >
                    <v-icon start size="16">mdi-tune</v-icon>
                    <span class="font-weight-medium">Groups</span>
                    <v-chip
                      v-if="devModeStore.simulatedGroups.length > 0"
                      size="x-small"
                      color="white"
                      variant="flat"
                      class="ml-2 count-badge"
                    >
                      {{ devModeStore.simulatedGroups.length }}
                    </v-chip>
                    <v-tooltip activator="parent" location="top">
                      Simulate group memberships
                    </v-tooltip>
                  </v-btn>
                </template>

                <v-card
                  min-width="300"
                  max-width="380"
                  class="groups-menu-card"
                  elevation="6"
                >
                  <v-card-title
                    class="d-flex align-center justify-space-between pa-2 groups-menu-header"
                  >
                    <div class="d-flex align-center">
                      <v-icon color="primary" size="18" class="mr-2"
                        >mdi-account-group</v-icon
                      >
                      <span class="text-subtitle-2 font-weight-bold"
                        >Simulate Groups</span
                      >
                    </div>
                    <v-btn
                      v-if="devModeStore.simulatedGroups.length > 0"
                      icon="mdi-close-circle"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="devModeStore.clearSimulatedGroups"
                    >
                      <v-tooltip activator="parent" location="left">
                        Clear all
                      </v-tooltip>
                    </v-btn>
                  </v-card-title>
                  <v-divider class="dev-divider"></v-divider>
                  <v-card-text
                    class="pa-0"
                    style="max-height: 300px; overflow-y: auto"
                  >
                    <v-list density="compact">
                      <v-list-item
                        v-for="group in devModeStore.availableGroups"
                        :key="group.value"
                        :active="devModeStore.hasSimulatedGroup(group.value)"
                        @click="toggleGroup(group.value)"
                      >
                        <template #prepend>
                          <v-checkbox-btn
                            :model-value="
                              devModeStore.hasSimulatedGroup(group.value)
                            "
                            hide-details
                            @click.stop="toggleGroup(group.value)"
                          ></v-checkbox-btn>
                        </template>
                        <v-list-item-title class="text-body-2">{{
                          group.label
                        }}</v-list-item-title>
                        <v-list-item-subtitle class="text-caption">
                          {{ group.description }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions class="justify-space-between pa-2">
                    <v-btn
                      size="x-small"
                      variant="outlined"
                      prepend-icon="mdi-refresh"
                      color="grey"
                      @click="devModeStore.clearSimulatedGroups"
                    >
                      Reset
                    </v-btn>
                    <v-chip size="x-small" color="primary" variant="flat">
                      {{ devModeStore.simulatedGroups.length }} selected
                    </v-chip>
                  </v-card-actions>
                </v-card>
              </v-menu>
            </div>
          </div>

          <!-- Page Info & Actions -->
          <v-divider class="my-2 dev-divider"></v-divider>
          <div class="d-flex align-center justify-space-between">
            <v-chip
              size="x-small"
              variant="tonal"
              color="info"
              prepend-icon="mdi-map-marker"
              class="page-info-chip"
            >
              <span class="text-caption">{{ currentRouteName }}</span>
            </v-chip>

            <v-btn
              v-if="devModeStore.isActive"
              icon="mdi-refresh"
              size="x-small"
              variant="text"
              color="error"
              @click="devModeStore.reset"
            >
              <v-tooltip activator="parent" location="top">
                Reset all dev mode settings
              </v-tooltip>
            </v-btn>
          </div>
        </v-card-text>

        <v-divider class="dev-divider"></v-divider>

        <!-- Documentation Links -->
        <v-card-actions class="pa-3 docs-section">
          <div class="w-100">
            <div
              class="text-caption text-medium-emphasis mb-2 font-weight-medium d-flex align-center"
            >
              <v-icon size="14" class="mr-1">mdi-book-open-page-variant</v-icon>
              Documentation
            </div>
            <div class="doc-buttons-wrapper">
              <v-btn
                variant="elevated"
                color="primary"
                prepend-icon="mdi-book-open-variant"
                size="small"
                :href="vitepressUrl"
                target="_blank"
                rel="noopener noreferrer"
                block
                class="doc-btn"
              >
                <span class="font-weight-medium">VitePress Docs</span>
                <v-icon size="14" class="ml-2">mdi-open-in-new</v-icon>
                <v-tooltip activator="parent" location="top">
                  Open VitePress documentation ({{ vitepressUrl }})
                </v-tooltip>
              </v-btn>

              <v-btn
                variant="elevated"
                color="success"
                prepend-icon="mdi-api"
                size="small"
                href="http://localhost:3001/docs"
                target="_blank"
                rel="noopener noreferrer"
                block
                class="doc-btn"
              >
                <span class="font-weight-medium">Swagger API</span>
                <v-icon size="14" class="ml-2">mdi-open-in-new</v-icon>
                <v-tooltip activator="parent" location="top">
                  Open Swagger API documentation (localhost:3001/docs)
                </v-tooltip>
              </v-btn>

              <v-btn
                variant="elevated"
                color="info"
                prepend-icon="mdi-code-json"
                size="small"
                href="/docs/jsdoc/index.html"
                target="_blank"
                rel="noopener noreferrer"
                block
                class="doc-btn"
              >
                <span class="font-weight-medium">JSDoc</span>
                <v-icon size="14" class="ml-2">mdi-open-in-new</v-icon>
                <v-tooltip activator="parent" location="top">
                  Open JSDoc code documentation (/docs/jsdoc)
                </v-tooltip>
              </v-btn>
            </div>
          </div>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useDevModeStore } from "@/stores/devMode";

const route = useRoute();
const devModeStore = useDevModeStore();

const currentRouteName = computed(() => {
  return route.name || route.path;
});

// VitePress URL - defaults to 5173, but VitePress will use next available port if taken
const vitepressUrl = computed(() => {
  // Check if VitePress port is configured in environment
  const port = import.meta.env.VITE_VITEPRESS_PORT || "5173";
  return `http://localhost:${port}`;
});

function toggleGroup(group) {
  if (devModeStore.hasSimulatedGroup(group)) {
    devModeStore.removeSimulatedGroup(group);
  } else {
    devModeStore.addSimulatedGroup(group);
  }
}
</script>

<style scoped>
/* Main Toolbar Container */
.dev-toolbar {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Toggle Button - Clean & Professional */
.dev-toggle-btn {
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  border-radius: 50% !important;
  background: #f08a4a !important;
  color: white !important;
  box-shadow:
    0 4px 12px rgba(240, 138, 74, 0.3),
    0 2px 6px rgba(240, 138, 74, 0.2) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  border: none !important;
}

.dev-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 6px 16px rgba(240, 138, 74, 0.4),
    0 4px 8px rgba(240, 138, 74, 0.3) !important;
  background: #e67935 !important;
}

.dev-toggle-btn:active {
  transform: translateY(0);
  box-shadow:
    0 2px 8px rgba(240, 138, 74, 0.3),
    0 1px 4px rgba(240, 138, 74, 0.2) !important;
}

.dev-toggle-btn :deep(.v-icon) {
  color: white !important;
  transition: transform 0.2s ease;
}

.dev-toggle-btn:hover :deep(.v-icon) {
  transform: scale(1.05);
}

.tooltip-content {
  text-align: center;
  line-height: 1.4;
}

/* Card Styling */
.dev-toolbar-card {
  border-radius: 16px !important;
  overflow: hidden;
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-surface), 0.98) !important;
}

.dev-toolbar-header {
  background: linear-gradient(
    135deg,
    rgba(255, 152, 0, 0.1) 0%,
    rgba(255, 152, 0, 0.05) 100%
  );
  padding: 12px 16px !important;
  border-bottom: 1px solid rgba(255, 152, 0, 0.2);
}

.dev-divider {
  opacity: 0.3;
}

/* Alert Styling */
.dev-alert {
  border-radius: 12px;
  border-left-width: 4px !important;
}

/* Status Indicators */
.status-indicator {
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(var(--v-theme-surface), 0.5);
  border: 1px solid rgba(var(--v-theme-border), 0.2);
  transition: all 0.3s ease;
}

.status-indicator.status-active {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.3);
}

.status-indicator:hover {
  background: rgba(var(--v-theme-surface), 0.7);
  transform: translateX(2px);
}

/* Groups Container */
.groups-status {
  background: rgba(25, 118, 210, 0.08) !important;
  border-color: rgba(25, 118, 210, 0.25) !important;
}

.groups-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.group-chip {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.group-chip:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.count-chip {
  font-weight: 600;
  min-width: 24px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Controls Section */
.controls-section {
  padding: 10px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-surface), 0.4) 0%,
    rgba(var(--v-theme-surface), 0.2) 100%
  );
  border: 1px solid rgba(var(--v-theme-border), 0.15);
}

.control-buttons-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.control-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: auto;
  padding: 0 16px;
  flex: 1 1 auto;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.control-btn.btn-active {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.4);
}

.control-btn.btn-active:hover {
  box-shadow: 0 6px 18px rgba(var(--v-theme-primary), 0.5);
}

.count-badge {
  font-weight: 600;
  min-width: 20px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  margin-left: 6px;
}

/* Groups Menu Card */
.groups-menu-card {
  border-radius: 12px !important;
}

.groups-menu-header {
  background: linear-gradient(
    135deg,
    rgba(25, 118, 210, 0.1) 0%,
    rgba(25, 118, 210, 0.05) 100%
  );
}

/* Page Info Chip */
.page-info-chip {
  border-radius: 8px;
  font-weight: 500;
}

/* Documentation Section */
.docs-section {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-surface), 0.5) 0%,
    rgba(var(--v-theme-surface), 0.3) 100%
  );
}

.doc-buttons-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.doc-btn {
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: none;
  letter-spacing: 0.3px;
  font-size: 0.8125rem;
  min-height: 36px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.doc-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25) !important;
}

.doc-btn:active {
  transform: translateY(0);
}

.doc-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
}

.doc-btn:active {
  transform: translateY(0);
}

/* Cursor Pointer */
.cursor-pointer {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.cursor-pointer:active {
  transform: translateY(0);
}

/* Animations */
@keyframes slideUp {
  from {
    transform: translateY(100%) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* List Item Enhancements */
:deep(.v-list-item) {
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.2s ease;
}

:deep(.v-list-item:hover) {
  background: rgba(var(--v-theme-primary), 0.1);
  transform: translateX(4px);
}

:deep(.v-list-item--active) {
  background: rgba(var(--v-theme-primary), 0.15);
  border-left: 3px solid rgb(var(--v-theme-primary));
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .dev-toolbar-card {
    min-width: 90vw;
    max-width: 95vw;
  }
}
</style>
