<template>
  <v-container fluid class="grafana-report">
    <!-- Header Section -->
    <v-row>
      <v-col cols="12">
        <div
          class="d-flex justify-space-between mb-2 header-container compact-header"
        >
          <div>
            <h1 class="text-h6 pt-2 compact-header-title d-flex align-center">
              <v-icon size="small" class="header-icon" color="primary">
                mdi-chart-timeline-variant
              </v-icon>
              <span>{{
                $t("navigation.grafana") || "Grafana Monitoring"
              }}</span>
            </h1>
            <p
              class="text-caption text-medium-emphasis header-subtitle compact-header-subtitle"
            >
              {{
                $t("reports.grafana.subtitle") ||
                "System monitoring and metrics dashboards powered by Prometheus"
              }}
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Grafana Dashboard -->
    <v-row no-gutters>
      <v-col cols="12" md="3" class="pr-4">
        <v-card elevation="1" class="compact-filters-card" style="height: 100%">
          <v-card-text class="compact-filters-content pa-3">
            <!-- Dashboard Controls -->
            <div class="mb-3">
              <div class="text-caption font-weight-medium mb-2">
                <v-icon size="16" class="mr-1">mdi-cog-outline</v-icon>
                Dashboard Controls
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <v-btn
                  color="primary"
                  size="default"
                  variant="elevated"
                  class="flex-1"
                  :loading="loading"
                  :disabled="loading"
                  @click="reloadDashboard"
                >
                  <template #prepend>
                    <v-icon>mdi-refresh</v-icon>
                  </template>
                  {{ $t("common.reload") || "Reload" }}
                </v-btn>
                <v-btn
                  color="secondary"
                  size="default"
                  variant="outlined"
                  class="flex-1"
                  :href="grafanaUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <template #prepend>
                    <v-icon>mdi-open-in-new</v-icon>
                  </template>
                  {{ $t("reports.grafana.openInNewTab") || "Open in New Tab" }}
                </v-btn>
              </div>
            </div>

            <!-- Info Card -->
            <v-alert type="info" variant="tonal" density="compact" class="mb-3">
              <v-alert-title class="text-caption font-weight-medium">
                {{ $t("reports.grafana.infoTitle") || "About Grafana" }}
              </v-alert-title>
              <div class="text-caption">
                {{
                  $t("reports.grafana.infoMessage") ||
                  "Grafana provides real-time monitoring and visualization of system metrics collected by Prometheus."
                }}
              </div>
            </v-alert>

            <!-- Metrics Info -->
            <v-card variant="outlined" class="mb-3">
              <v-card-title class="text-caption font-weight-medium pa-2">
                <v-icon size="16" class="mr-1">mdi-chart-line</v-icon>
                Available Metrics
              </v-card-title>
              <v-card-text class="pa-2">
                <div class="text-caption mb-1">• Database Query Duration</div>
                <div class="text-caption mb-1">• API Response Times</div>
                <div class="text-caption mb-1">• System Performance</div>
                <div class="text-caption">• Application Health</div>
              </v-card-text>
            </v-card>

            <!-- Prometheus Endpoint -->
            <v-card variant="outlined">
              <v-card-title class="text-caption font-weight-medium pa-2">
                <v-icon size="16" class="mr-1">mdi-link</v-icon>
                Prometheus Endpoint
              </v-card-title>
              <v-card-text class="pa-2">
                <div class="text-caption text-medium-emphasis mb-2">
                  Metrics are available at:
                </div>
                <code class="text-caption" style="word-break: break-all">
                  {{ prometheusUrl }}
                </code>
              </v-card-text>
            </v-card>

            <!-- Dashboard Info -->
            <v-card variant="outlined" class="mt-3">
              <v-card-title class="text-caption font-weight-medium pa-2">
                <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
                Dashboard Info
              </v-card-title>
              <v-card-text class="pa-2">
                <div class="text-caption text-medium-emphasis mb-1">
                  Dashboard UID:
                </div>
                <code
                  class="text-caption"
                  style="word-break: break-all; font-size: 0.7rem"
                >
                  {{ dashboardId || "Not configured" }}
                </code>
                <div class="text-caption text-medium-emphasis mb-1 mt-2">
                  Embed URL:
                </div>
                <code
                  class="text-caption"
                  style="word-break: break-all; font-size: 0.7rem"
                >
                  {{ embedUrl }}
                </code>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Grafana Dashboard iframe -->
      <v-col cols="12" md="9" class="table-col">
        <v-card
          elevation="1"
          class="table-card"
          style="
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          "
        >
          <v-card-title
            class="d-flex justify-space-between align-center table-card-title compact-title"
          >
            <div class="d-flex align-center">
              <v-icon size="small" style="margin-inline-end: 6px">
                mdi-chart-timeline-variant
              </v-icon>
              <span class="text-subtitle-2 font-weight-medium">{{
                displayDashboardName
              }}</span>
            </div>
            <div class="d-flex align-center">
              <v-chip
                v-if="!loading && !error"
                color="success"
                variant="text"
                size="small"
              >
                <v-icon size="small" class="mr-1">mdi-check-circle</v-icon>
                Connected
              </v-chip>
            </div>
          </v-card-title>
          <div
            ref="grafanaContainer"
            class="grafana-report-container position-relative"
            style="
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            "
          >
            <!-- Loading overlay -->
            <div v-if="loading" class="loading-overlay">
              <div class="loading-content">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="72"
                  width="6"
                  class="mb-6"
                ></v-progress-circular>
                <p class="text-h6 font-weight-medium mb-2">
                  Loading Grafana Dashboard
                </p>
                <p class="text-body-2 text-medium-emphasis">
                  Connecting to monitoring system...
                </p>
              </div>
            </div>

            <!-- Error overlay -->
            <div
              v-if="error"
              class="error-overlay d-flex align-center justify-center pa-4"
            >
              <v-alert type="error" variant="tonal" class="max-width-600">
                <v-alert-title>Failed to Load Dashboard</v-alert-title>
                <p class="mb-0">{{ error }}</p>
                <v-btn
                  color="primary"
                  variant="outlined"
                  class="mt-3"
                  @click="loadDashboard"
                >
                  Retry
                </v-btn>
                <v-btn
                  color="secondary"
                  variant="outlined"
                  class="mt-3 ml-2"
                  :href="grafanaUrl"
                  target="_blank"
                >
                  Open in New Tab
                </v-btn>
              </v-alert>
            </div>

            <!-- Grafana Dashboard iframe -->
            <iframe
              ref="grafanaFrame"
              :src="embedUrl"
              class="grafana-iframe"
              frameborder="0"
              allowfullscreen
              style="
                width: 100% !important;
                height: 100% !important;
                border: none !important;
                margin: 0 !important;
                padding: 0 !important;
              "
              @load="onIframeLoad"
              @error="handleIframeError"
            ></iframe>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Footer with Version -->
    <v-row>
      <v-col cols="12">
        <v-footer class="text-center py-1 compact-footer" elevation="0">
          <v-chip
            size="x-small"
            variant="outlined"
            prepend-icon="mdi-information-outline"
            style="font-size: 0.7rem"
          >
            {{ $t("reports.grafana.version") || "Grafana Monitoring v1.0.0" }}
          </v-chip>
        </v-footer>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// Grafana URL from environment variable or default
const grafanaUrl = computed(() => {
  return import.meta.env.VITE_GRAFANA_URL || "http://localhost:3030";
});

// Prometheus URL (backend API URL)
const prometheusUrl = computed(() => {
  return import.meta.env.VITE_PROMETHEUS_URL || "http://localhost:9090";
});

// Dashboard ID from environment
const dashboardId = computed(() => {
  return import.meta.env.VITE_GRAFANA_DASHBOARD_ID || "";
});

// Organization ID from environment
const orgId = computed(() => {
  return import.meta.env.VITE_GRAFANA_ORG_ID || "1";
});

// Display name for the dashboard
const displayDashboardName = computed(() => {
  return (
    import.meta.env.VITE_GRAFANA_DASHBOARD_NAME ||
    t("reports.grafana.dashboard") ||
    "Grafana Dashboard"
  );
});

// Embed URL for Grafana dashboard
const embedUrl = computed(() => {
  const baseUrl = grafanaUrl.value.replace(/\/$/, ""); // Remove trailing slash
  const dashboardUid = dashboardId.value;
  const org = orgId.value;

  // If dashboard ID/UID is provided, use it
  if (dashboardUid) {
    // Clean the dashboard ID - remove any path segments or extra parts
    // Dashboard UID format: just the UUID part (e.g., "237d7ea8-519f-4e37-bedb-9e830778fbb8")
    const cleanDashboardId = dashboardUid.split("/").pop().split("?")[0];

    // Build embed URL with proper parameters
    // kiosk=tv mode removes UI chrome for better embedding
    // from=now-6h&to=now sets default time range
    // refresh=30s sets auto-refresh interval
    const params = new URLSearchParams({
      orgId: org,
      kiosk: "tv",
      theme: "light",
      from: "now-6h",
      to: "now",
      refresh: "30s",
    });

    return `${baseUrl}/d/${cleanDashboardId}?${params.toString()}`;
  }

  // Default to Grafana home or explore page
  const params = new URLSearchParams({
    orgId: org,
    theme: "light",
    from: "now-6h",
    to: "now",
  });
  return `${baseUrl}/explore?${params.toString()}`;
});

const loading = ref(true);
const error = ref(null);
const grafanaContainer = ref(null);
const grafanaFrame = ref(null);

function loadDashboard() {
  loading.value = true;
  error.value = null;

  // Reset iframe to trigger reload
  if (grafanaFrame.value) {
    const currentSrc = grafanaFrame.value.src;
    grafanaFrame.value.src = "";
    setTimeout(() => {
      if (grafanaFrame.value) {
        grafanaFrame.value.src = currentSrc;
      }
    }, 100);
  }
}

function reloadDashboard() {
  loadDashboard();
}

function onIframeLoad() {
  loading.value = false;
  error.value = null;
}

function handleIframeError() {
  loading.value = false;
  error.value =
    "Failed to load Grafana dashboard. Please check the Grafana URL configuration.";
}

onMounted(() => {
  // Set loading to false after a timeout if iframe doesn't load
  setTimeout(() => {
    if (loading.value) {
      loading.value = false;
    }
  }, 10000); // 10 second timeout
});
</script>

<style scoped>
.grafana-report {
  padding: 16px;
}

/* Ensure columns display side by side on medium+ screens */
@media (min-width: 960px) {
  .grafana-report .v-row {
    display: flex !important;
    flex-wrap: nowrap !important;
  }

  .grafana-report .v-row > .v-col.md-3 {
    flex: 0 0 25% !important;
    max-width: 25% !important;
    width: 25% !important;
  }

  .grafana-report .v-row > .v-col.md-9 {
    flex: 0 0 75% !important;
    max-width: 75% !important;
    width: 75% !important;
  }
}

.v-row.no-gutters > .table-col {
  padding: 0 !important;
  margin: 0 !important;
}

.table-card {
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden;
  border-radius: 0;
  background: rgb(var(--v-theme-surface)) !important;
  height: calc(100vh - 200px);
  min-height: 600px;
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  padding: 0 !important;
}

.table-card :deep(.v-card-text) {
  padding: 0 !important;
  margin: 0 !important;
  background: transparent !important;
}

.grafana-report-container {
  flex: 1;
  width: 100% !important;
  max-width: 100% !important;
  height: 100%;
  overflow: hidden;
  position: relative;
  min-height: 500px;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box;
}

.grafana-iframe {
  width: 100% !important;
  max-width: 100% !important;
  height: 100% !important;
  border: none !important;
  display: block !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.v-theme--dark .loading-overlay,
.v-theme--dark .error-overlay {
  background: rgba(18, 18, 18, 0.98);
}

/* Gap utilities are now handled globally via compact-ui.css */

.compact-filters-card {
  height: 100%;
  min-height: 600px;
}

.compact-filters-content {
  height: 100%;
}

.compact-footer {
  margin-top: 16px;
}

/* Header Section */
.header-container {
  margin-bottom: 16px;
}

.compact-header {
  padding: 8px 0;
}

.compact-header-title {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  flex-direction: row;
}

.header-icon {
  margin-inline-end: 6px;
  flex-shrink: 0;
}

/* RTL: Reverse icon and text order */
[dir="rtl"] .compact-header-title {
  flex-direction: row-reverse;
}

[dir="rtl"] .header-icon {
  margin-inline-end: 0;
  margin-inline-start: 6px;
}
</style>
