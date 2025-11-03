<template>
  <div v-if="devModeStore.isDevelopment" class="dev-toolbar">
    <v-menu location="bottom end" :close-on-content-click="false">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          color="warning"
          class="dev-toggle-btn"
          size="small"
          elevation="4"
        >
          <v-icon>mdi-code-tags</v-icon>
          <v-tooltip activator="parent" location="left">
            Development Mode Settings
          </v-tooltip>
        </v-btn>
      </template>

      <v-card min-width="400" max-width="500">
        <v-card-title class="bg-grey-darken-4 text-warning">
          <v-icon class="mr-2">mdi-code-tags</v-icon>
          Development Mode
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mb-4"
            icon="mdi-information"
          >
            This mode is only available in development and will be disabled in
            production.
          </v-alert>

          <!-- Admin View Toggle -->
          <v-chip
            :color="devModeStore.adminViewEnabled ? 'success' : 'grey'"
            variant="flat"
            size="small"
            prepend-icon="mdi-shield-crown"
            class="cursor-pointer"
            @click="devModeStore.toggleAdminView"
          >
            <v-icon start size="16">{{
              devModeStore.adminViewEnabled ? "mdi-eye" : "mdi-eye-off"
            }}</v-icon>
            Admin
            <v-tooltip activator="parent" location="top">
              {{ devModeStore.adminViewEnabled ? "Disable" : "Enable" }} admin
              view
            </v-tooltip>
          </v-chip>

          <!-- Group Simulator -->
          <v-menu offset-y :close-on-content-click="false" location="top">
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                :color="
                  devModeStore.simulatedGroups.length > 0 ? 'primary' : 'grey'
                "
                variant="flat"
                size="small"
                prepend-icon="mdi-account-group"
                class="cursor-pointer"
              >
                <v-icon start size="16">mdi-tune</v-icon>
                Groups ({{ devModeStore.simulatedGroups.length }})
                <v-tooltip activator="parent" location="top">
                  Simulate group memberships
                </v-tooltip>
              </v-chip>
            </template>

            <v-card min-width="300" max-width="400">
              <v-card-title
                class="d-flex align-center justify-space-between pa-3"
              >
                <span class="text-subtitle-2">Simulate Groups</span>
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
              <v-divider></v-divider>
              <v-card-text
                class="pa-0"
                style="max-height: 400px; overflow-y: auto"
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
                  size="small"
                  variant="text"
                  prepend-icon="mdi-refresh"
                  @click="devModeStore.clearSimulatedGroups"
                >
                  Reset
                </v-btn>
                <v-chip size="small" color="info" variant="flat">
                  {{ devModeStore.simulatedGroups.length }} selected
                </v-chip>
              </v-card-actions>
            </v-card>
          </v-menu>

          <!-- Divider -->
          <v-divider vertical class="mx-1"></v-divider>

          <!-- Current Page Info -->
          <v-chip
            size="small"
            variant="text"
            prepend-icon="mdi-map-marker"
            class="text-caption"
          >
            {{ currentRouteName }}
          </v-chip>

          <!-- Reset All Button -->
          <v-btn
            v-if="devModeStore.isActive"
            icon="mdi-close"
            size="x-small"
            variant="text"
            color="error"
            @click="devModeStore.reset"
          >
            <v-tooltip activator="parent" location="top">
              Reset all dev mode settings
            </v-tooltip>
          </v-btn>
        </v-card-text>
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

function toggleGroup(group) {
  if (devModeStore.hasSimulatedGroup(group)) {
    devModeStore.removeSimulatedGroup(group);
  } else {
    devModeStore.addSimulatedGroup(group);
  }
}
</script>

<style scoped>
.dev-toolbar {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.dev-toggle-btn {
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4) !important;
}

.dev-toggle-btn:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

.dev-toolbar .v-chip,
.dev-toolbar .v-btn {
  margin-right: 10px;
  margin-bottom: 6px;
  padding-left: 14px !important;
  padding-right: 14px !important;
}
.dev-toolbar .v-chip:last-child,
.dev-toolbar .v-btn:last-child {
  margin-right: 0;
}

.cursor-pointer {
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.cursor-pointer:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.cursor-pointer:active {
  transform: translateY(0);
}

/* Smooth entrance animation */
.dev-toolbar {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
