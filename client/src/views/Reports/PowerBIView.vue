<template>
  <v-container fluid class="powerbi-report">
    <!-- Header Section -->
    <v-row>
      <v-col cols="12">
        <div
          class="d-flex justify-space-between mb-2 header-container compact-header"
        >
          <div>
            <h1 class="text-h6 pt-2 compact-header-title">
              <v-icon
                size="small"
                style="margin-inline-end: 6px"
                color="primary"
              >
                mdi-chart-box-outline
              </v-icon>
              {{ $t("navigation.powerbi-reporting") || $t("navigation.powerbiReporting") || "PowerBI Reporting" }}
            </h1>
            <p class="text-caption text-medium-emphasis header-subtitle compact-header-subtitle">
              {{ $t("reports.powerbi.subtitle") || "Interactive analytics and business intelligence dashboards" }}
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Filters and Report Side by Side -->
    <v-row no-gutters>
      <!-- Filters/Controls Section - 3 columns -->
      <v-col cols="12" md="3" class="compact-filters-col">
        <v-card elevation="1" class="compact-filters-card" style="height: 100%;">
          <v-card-text class="compact-filters-content pa-3">
            <!-- Report Controls -->
            <div class="mb-3">
              <div class="text-caption font-weight-medium mb-2">
                <v-icon size="16" class="mr-1">mdi-cog-outline</v-icon>
                Report Controls
              </div>
              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  size="default"
                  variant="elevated"
                  class="flex-1"
                  @click="loadReport"
                  :loading="loading"
                  :disabled="loading"
                >
                  <template #prepend>
                    <v-icon>mdi-refresh</v-icon>
                  </template>
                  Reload
                </v-btn>
                <v-btn
                  color="secondary"
                  size="default"
                  variant="outlined"
                  class="flex-1"
                  @click="toggleFullscreen"
                >
                  <template #prepend>
                    <v-icon>{{ isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
                  </template>
                  {{ isFullscreen ? 'Exit' : 'Fullscreen' }}
                </v-btn>
              </div>
            </div>

            <v-divider class="my-3"></v-divider>

            <!-- Report Information -->
            <div class="mb-3">
              <div class="text-caption font-weight-medium mb-2">
                <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
                Report Info
              </div>
              <div class="text-body-2 text-medium-emphasis">
                <div class="mb-1">
                  <strong>Status:</strong>
                  <v-chip
                    :color="error ? 'error' : loading ? 'warning' : 'success'"
                    size="x-small"
                    class="ml-1"
                  >
                    {{ error ? 'Error' : loading ? 'Loading' : 'Ready' }}
                  </v-chip>
                </div>
                <div v-if="!error && !loading" class="text-caption mt-2">
                  Report is embedded and ready to view. Use the controls above to reload or enter fullscreen mode.
                </div>
              </div>
            </div>

            <!-- Error Display -->
            <v-alert
              v-if="error"
              type="error"
              density="compact"
              variant="tonal"
              class="mt-2"
            >
              <v-alert-title class="text-caption">Failed to Load</v-alert-title>
              <p class="text-caption mb-0">{{ error }}</p>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Report Section - 9 columns -->
      <v-col cols="12" md="9" class="table-col pl-2">
        <v-card elevation="1" class="table-card">
          <v-card-title class="d-flex justify-space-between align-center table-card-title compact-title">
            <div class="d-flex align-center">
              <v-icon
                size="small"
                style="margin-inline-end: 6px"
              >
                mdi-chart-box-outline
              </v-icon>
              <span class="text-subtitle-2 font-weight-medium">{{ displayReportName }}</span>
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
          <div ref="powerbiContainer" class="powerbi-report-container position-relative">
            <!-- Loading overlay -->
            <div v-if="loading" class="loading-overlay d-flex align-center justify-center">
              <div class="text-center">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="64"
                  class="mb-4"
                ></v-progress-circular>
                <p class="text-body-1">Loading PowerBI Report...</p>
              </div>
            </div>

            <!-- Error overlay -->
            <div v-if="error" class="error-overlay d-flex align-center justify-center pa-4">
              <v-alert type="error" variant="tonal" class="max-width-600">
                <v-alert-title>Failed to Load Report</v-alert-title>
                <p class="mb-0">{{ error }}</p>
                <v-btn
                  color="primary"
                  variant="outlined"
                  class="mt-3"
                  @click="loadReport"
                >
                  Retry
                </v-btn>
              </v-alert>
            </div>

            <!-- PowerBI Report iframe -->
            <iframe
              ref="powerbiFrame"
              :src="embedUrl"
              class="powerbi-iframe"
              frameborder="0"
              allowfullscreen
              allow="clipboard-read; clipboard-write"
              @load="onIframeLoad"
              @error="handleIframeError"
            ></iframe>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Footer with Version - Compact -->
    <v-row>
      <v-col cols="12">
        <v-footer class="text-center py-1 compact-footer" elevation="0">
          <v-chip
            size="x-small"
            variant="outlined"
            prepend-icon="mdi-information-outline"
            style="font-size: 0.7rem"
          >
            {{ $t("reports.powerbi.version") || "PowerBI Reporting v1.0.0" }}
          </v-chip>
        </v-footer>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useI18n } from "vue-i18n";

// PowerBI Configuration
const WORKSPACE_ID = "dc346d84-7c7f-483d-92a0-66fdc5465ca3";
const REPORT_ID = "42e28bd8-16a8-44c8-9ee6-e0fe827199d9";
const DATASET_ID = "61249bfd-e2c2-466c-b687-e746ddda991e";
const TENANT_ID = "16f6921f-fafa-40cc-bc2b-7c6487e5ada4";

// i18n
const { t } = useI18n();

// Report name - can be set via environment variable or use default
const REPORT_NAME = import.meta.env.VITE_POWERBI_REPORT_NAME || t("reports.powerbi.dashboard") || "PowerBI Dashboard";

/**
 * PowerBI Embed URL Configuration
 * 
 * To completely eliminate authentication prompts, you have these options:
 * 
 * 1. PUBLISH TO WEB (Simplest - No Auth Required):
 *    - Set VITE_POWERBI_PUBLIC_EMBED_URL in your .env file
 *    - In PowerBI service, publish the report to web and get the embed URL
 *    - ⚠️ WARNING: Report becomes publicly accessible (no authentication)
 *    - Example: VITE_POWERBI_PUBLIC_EMBED_URL=https://app.powerbi.com/view?r=...
 * 
 * 2. SERVICE PRINCIPAL (Recommended for production with security):
 *    - Create a service principal in Azure AD
 *    - Grant it access to the PowerBI workspace
 *    - Install: npm install @azure/msal-node powerbi-client
 *    - Create backend endpoint to generate embed tokens
 *    - Use embed tokens instead of direct URL embedding
 * 
 * 3. CURRENT APPROACH (User-based embedding):
 *    - Uses autoAuth=true to attempt automatic authentication
 *    - May still prompt if user isn't signed in to PowerBI
 *    - Works best when users are already authenticated to PowerBI
 */

// Check if public embed URL is configured (no auth required)
const publicEmbedUrl = import.meta.env.VITE_POWERBI_PUBLIC_EMBED_URL;

// Use public URL if configured, otherwise use authenticated embed
const embedUrl = computed(() => {
  if (publicEmbedUrl) {
    // Public embed URL - no authentication required
    return publicEmbedUrl;
  }
  
  // Authenticated embed URL with parameters to minimize auth prompts
  return `https://app.powerbi.com/reportEmbed?reportId=${REPORT_ID}&autoAuth=true&ctid=${TENANT_ID}&filterPaneEnabled=false&navContentPaneEnabled=false`;
});

// Component state
const loading = ref(true);
const error = ref(null);
const powerbiFrame = ref(null);
const powerbiContainer = ref(null);
const isFullscreen = ref(false);
const reportName = ref(REPORT_NAME); // Start with config value, can be updated from API if needed

// Methods
function onIframeLoad() {
  loading.value = false;
  error.value = null;
  // Try to get report name from iframe title or postMessage
  tryGetReportName();
}

// Listen for PowerBI postMessage events to get report metadata
function handlePowerBIMessage(event) {
  // Only process messages from PowerBI domain
  if (!event.origin.includes('powerbi.com')) {
    return;
  }

  try {
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    
    // PowerBI sends various events, look for report metadata
    if (data && data.type) {
      // Handle different PowerBI event types
      switch (data.type) {
        case 'loaded':
          // Report loaded event might contain metadata
          if (data.reportName) {
            reportName.value = data.reportName;
          }
          break;
        case 'reportLoaded':
          if (data.reportName) {
            reportName.value = data.reportName;
          }
          break;
        case 'pageChanged':
          // Page change events might have report info
          if (data.reportName) {
            reportName.value = data.reportName;
          }
          break;
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }
}

// Try to get report name from iframe title or other methods
function tryGetReportName() {
  if (!powerbiFrame.value) return;

  // Method 1: Try to get from iframe title (if PowerBI sets it)
  setTimeout(() => {
    try {
      if (powerbiFrame.value.contentDocument?.title) {
        const title = powerbiFrame.value.contentDocument.title;
        if (title && title !== 'about:blank' && !title.includes('Power BI')) {
          reportName.value = title;
        }
      }
    } catch (e) {
      // Cross-origin restriction - can't access iframe content directly
      // This is expected for PowerBI embeds
    }
  }, 2000); // Wait a bit for iframe to load
}

function loadReport() {
  loading.value = true;
  error.value = null;
  
  // Reset iframe src to reload
  if (powerbiFrame.value) {
    // Use computed embedUrl which handles both public and authenticated URLs
    powerbiFrame.value.src = embedUrl.value;
  }
}

// Handle iframe errors
function handleIframeError() {
  loading.value = false;
  error.value = "Unable to load PowerBI report. Please check your connection and try again.";
}

// Toggle fullscreen mode
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    // Enter fullscreen - use the table card (report container)
    const container = powerbiContainer.value?.closest('.table-card') || powerbiContainer.value;
    if (container && container.requestFullscreen) {
      container.requestFullscreen().then(() => {
        isFullscreen.value = true;
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    }
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        isFullscreen.value = false;
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  }
}

// Listen for fullscreen changes
function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

// Lifecycle
let timeout = null;

onMounted(() => {
  // Set a timeout to handle cases where iframe doesn't load or load event doesn't fire
  timeout = setTimeout(() => {
    if (loading.value) {
      // If still loading after timeout, hide loading (iframe might still be loading)
      // PowerBI reports can take time to fully load, so we'll show the iframe anyway
      loading.value = false;
    }
  }, 10000); // 10 second timeout - hide loading spinner but keep iframe visible

  // Listen for fullscreen changes
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  // Listen for PowerBI postMessage events to get report metadata
  window.addEventListener('message', handlePowerBIMessage);
});

onUnmounted(() => {
  // Cleanup timeout on unmount
  if (timeout) {
    clearTimeout(timeout);
  }

  // Remove fullscreen listeners
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

  // Remove PowerBI message listener
  window.removeEventListener('message', handlePowerBIMessage);
});
</script>

<style scoped>
/* ========================================
   POWERBI REPORT LAYOUT (Matching Surgical Guide Layout)
   ======================================== */
.powerbi-report {
  padding: 16px;
}

/* Header Section - Matching Surgical Guide */
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
}

.compact-header-subtitle {
  font-size: 0.75rem;
  line-height: 1.4;
  margin-top: 2px;
}

.gap-2 {
  gap: 8px;
}

/* Filters Section - Matching Surgical Guide */
.compact-filters-col {
  padding: 0;
  padding-right: 16px;
}

.compact-filters-card {
  border-radius: 0;
  background: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
  height: calc(100vh - 200px);
  min-height: 600px;
}

.v-theme--dark .compact-filters-card {
  background: rgb(var(--v-theme-surface)) !important;
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
}

.compact-filters-content {
  height: 100%;
  overflow-y: auto;
}

/* Table/Report Section - Matching Surgical Guide */
.table-col {
  padding: 0;
  padding-left: 16px;
}

.table-card {
  width: 100%;
  overflow: hidden;
  border-radius: 0;
  background: rgb(var(--v-theme-surface)) !important;
  height: calc(100vh - 200px);
  min-height: 600px;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.v-theme--dark .table-card {
  background: rgb(var(--v-theme-surface)) !important;
}

.table-card-title {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  min-height: 40px;
  flex-shrink: 0;
  margin: 0;
}

.table-card-title.compact-title {
  padding: 6px 12px;
  min-height: 36px;
}

.v-theme--dark .table-card-title {
  border-bottom-color: rgba(255, 255, 255, 0.12);
}

.table-card :deep(.v-card-text) {
  padding: 8px !important;
  background: transparent !important;
}

/* Report Container */
.powerbi-report-container {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  min-height: 500px;
  margin: 0;
  padding: 0;
}

.powerbi-iframe {
  width: 100% !important;
  height: 100% !important;
  border: none;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
}

.max-width-600 {
  max-width: 600px;
  width: 100%;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  z-index: 10;
}

.v-theme--dark .loading-overlay,
.v-theme--dark .error-overlay {
  background: rgba(18, 18, 18, 0.95);
}

.position-relative {
  position: relative;
}

/* Fullscreen mode adjustments */
.table-card:fullscreen {
  background: rgb(var(--v-theme-surface));
  height: 100vh;
  border-radius: 0;
}

.table-card:-webkit-full-screen {
  background: rgb(var(--v-theme-surface));
  height: 100vh;
  border-radius: 0;
}

.table-card:-moz-full-screen {
  background: rgb(var(--v-theme-surface));
  height: 100vh;
  border-radius: 0;
}

.table-card:-ms-fullscreen {
  background: rgb(var(--v-theme-surface));
  height: 100vh;
  border-radius: 0;
}

/* Responsive adjustments for filter/table layout */
.v-row.no-gutters > .compact-filters-col {
  padding-left: 0;
  padding-right: 16px;
}

.v-row.no-gutters > .table-col {
  padding-left: 16px;
  padding-right: 0;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .powerbi-report {
    padding: 12px;
  }

  .compact-filters-col {
    padding-right: 0;
    padding-bottom: 16px;
  }

  .table-col {
    padding-left: 0;
  }

  .compact-filters-card,
  .table-card {
    height: auto;
    min-height: 500px;
  }

  .compact-filters-card {
    margin-bottom: 16px;
  }
}

@media (max-width: 600px) {
  .powerbi-report {
    padding: 8px;
  }

  .compact-filters-card,
  .table-card {
    min-height: 400px;
  }
}

/* Compact Footer */
.compact-footer {
  background: none !important;
  padding: 8px 0 !important;
  min-height: auto !important;
  justify-content: center;
}
</style>

