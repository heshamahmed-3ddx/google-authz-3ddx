<template>
  <v-container fluid class="powerbi-report">
    <!-- Header Section -->
    <v-row>
      <v-col cols="12">
        <div
          class="d-flex justify-space-between mb-2 header-container compact-header"
        >
          <div>
            <h1 class="text-h6 pt-2 compact-header-title d-flex align-center">
              <v-icon
                size="small"
                class="header-icon"
                color="primary"
              >
                mdi-chart-box-outline
              </v-icon>
              <span>{{ $t("navigation.powerbi-reporting") || $t("navigation.powerbiReporting") || "PowerBI Reporting" }}</span>
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
            <div v-show="loading" class="loading-overlay">
              <div class="loading-content">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="72"
                  width="6"
                  class="mb-6"
                ></v-progress-circular>
                <p class="text-h6 font-weight-medium mb-2">Loading PowerBI Report</p>
                <p class="text-body-2 text-medium-emphasis">Please wait while we load your dashboard...</p>
              </div>
            </div>

            <!-- Error overlay -->
            <div v-show="error" class="error-overlay d-flex align-center justify-center pa-4">
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

            <!-- PowerBI Report Container -->
            <div
              ref="powerbiContainer"
              v-once
              class="powerbi-iframe"
            ></div>
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
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import apiService from "@/services/api";

// PowerBI Configuration - Load from environment variables
const WORKSPACE_ID = import.meta.env.VITE_POWERBI_WORKSPACE_ID || "dc128709-2496-4000-9f38-8e154f91fb0d";
const REPORT_ID = import.meta.env.VITE_POWERBI_REPORT_ID || "0d2261f5-b24f-4696-91ab-655a833e42f0";
const TENANT_ID = import.meta.env.VITE_POWERBI_TENANT_ID || "7153c4ca-59f2-4386-8d08-aa17f2f345ef";
const CLIENT_ID = import.meta.env.VITE_POWERBI_CLIENT_ID || "69fd2c72-0e78-4524-ba35-23168f80153c";

// i18n
const { t } = useI18n();

// Report name - can be set via environment variable or use default
const REPORT_NAME = import.meta.env.VITE_POWERBI_REPORT_NAME || t("reports.powerbi.dashboard") || "PowerBI Dashboard";

// Component state
const loading = ref(true);
const error = ref(null);
const powerbiContainer = ref(null);
const isFullscreen = ref(false);
const reportName = ref(REPORT_NAME);
const embedUrl = ref('');
const embedToken = ref('');

// Computed property for the full embed URL with token
const fullEmbedUrl = computed(() => {
  if (!embedUrl.value || !embedToken.value) return '';
  return `${embedUrl.value}&tokenType=Embed&accessToken=${embedToken.value}`;
});

/**
 * Fetch embed token from backend API
 */
async function fetchEmbedToken() {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await apiService.post('/api/powerbi/embed-token', {
      reportId: REPORT_ID,
      workspaceId: WORKSPACE_ID,
    });
    
    // Axios returns data in response.data
    if (response.data.success && response.data.data) {
      const { embedUrl: url, embedToken: token, reportName: name } = response.data.data;
      
      embedUrl.value = url;
      embedToken.value = token;
      reportName.value = name || REPORT_NAME;
      
      // Use PowerBI SDK to embed the report
      embedReport(url, token);
    } else {
      throw new Error('Failed to get embed token');
    }
  } catch (err) {
    console.error('Error fetching embed token:', err);
    error.value = err.message || 'Failed to load PowerBI report. Please try again.';
    loading.value = false;
  }
}

/**
 * Embed PowerBI report using the PowerBI Client SDK
 */
async function embedReport(embedUrl, embedToken) {
  if (!powerbiContainer.value) {
    console.error('PowerBI container not found');
    return;
  }
  
  // Wait for Vue to finish DOM updates
  await nextTick();
  
  try {
    // Get the powerbi service - it should be available globally
    let powerbi = window.powerbi;
    
    // Clear the container first to avoid conflicts
    if (powerbiContainer.value) {
      powerbiContainer.value.innerHTML = '';
    }
    
    // Configuration for PowerBI report  
    const config = {
      type: 'report',
      tokenType: 1, // models.TokenType.Embed = 1 (for GenerateToken API)
      accessToken: embedToken,
      embedUrl: embedUrl,
      id: REPORT_ID,
      settings: {
        filterPaneEnabled: true,
        navContentPaneEnabled: true
      }
    };
    
    // Embed using the global powerbi instance
    const report = powerbi.embed(powerbiContainer.value, config);
    
    // Handle report loaded event
    report.on('loaded', async () => {
      // Use nextTick to avoid DOM manipulation conflicts
      await nextTick();
      loading.value = false;
      error.value = null;
    });
    
    // Handle report rendered event
    report.on('rendered', async () => {
      await nextTick();
      // Clear any lingering errors once rendered successfully
      error.value = null;
    });
    
    // Handle errors - only show critical errors
    report.on('error', async (event) => {
      const errorDetail = event.detail;
      console.error('PowerBI report error:', errorDetail);
      
      // Only show error for critical failures (not transient loading issues)
      if (errorDetail?.message === 'LoadReportFailed' || 
          errorDetail?.errorCode === '403' ||
          errorDetail?.errorCode === '404') {
        await nextTick();
        loading.value = false;
        error.value = 'Failed to load PowerBI report. Please try again.';
      }
      // Ignore other transient errors that happen during initialization
    });
    
  } catch (err) {
    console.error('Error embedding PowerBI report:', err);
    loading.value = false;
    error.value = 'Failed to initialize PowerBI report. Please refresh the page.';
  }
}

// Methods
function loadReport() {
  // Fetch new embed token and load report
  fetchEmbedToken();
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

// Wait for PowerBI SDK to be loaded
function waitForPowerBISDK() {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.powerbi) {
      resolve();
      return;
    }
    
    // Wait with timeout
    let attempts = 0;
    const maxAttempts = 40; // 20 seconds max
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (window.powerbi) {
        clearInterval(checkInterval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        // Try to load it dynamically as fallback
        loadPowerBISDKDynamically()
          .then(resolve)
          .catch(reject);
      }
    }, 500);
  });
}

// Dynamically load PowerBI SDK if not loaded via script tag
function loadPowerBISDKDynamically() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/powerbi-client@2.23.1/dist/powerbi.min.js';
    script.async = false;
    
    script.onload = () => {
      // Wait a bit for the SDK to initialize
      setTimeout(() => {
        if (window.powerbi) {
          resolve();
        } else {
          reject(new Error('PowerBI SDK script loaded but window.powerbi not available'));
        }
      }, 1000);
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load PowerBI SDK from CDN'));
    };
    
    document.head.appendChild(script);
  });
}

// Lifecycle
// Suppress PowerBI SDK console warnings
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  const msg = args.join(' ');
  // Filter out PowerBI-related violations
  if (msg.includes('Violation') || 
      msg.includes('passive event listener') ||
      msg.includes('handler took') ||
      msg.includes('Forced reflow')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

onMounted(async () => {
  // Wait for PowerBI SDK to load
  try {
    await waitForPowerBISDK();
  } catch (err) {
    console.error('Failed to load PowerBI SDK:', err);
    error.value = 'Failed to load PowerBI library. Please refresh the page.';
    loading.value = false;
    return;
  }
  
  // Fetch embed token when component mounts
  fetchEmbedToken();

  // Listen for fullscreen changes
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);
});

onUnmounted(() => {
  // Restore original console.warn
  console.warn = originalConsoleWarn;

  // Remove fullscreen listeners
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
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

