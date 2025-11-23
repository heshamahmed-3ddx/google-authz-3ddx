<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" class="fill-height">
        <!-- Page Header -->
        <v-card flat class="mb-2" elevation="0">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-microsoft-power-bi" class="mr-3" size="32" color="primary"></v-icon>
            <div>
              <h1 class="text-h5 mb-1">PowerBI Reporting</h1>
              <p class="text-caption text-medium-emphasis mb-0">
                Interactive analytics and business intelligence dashboards
              </p>
            </div>
          </v-card-title>
        </v-card>

        <!-- PowerBI Report Container -->
        <v-card class="fill-height" elevation="2">
          <v-card-text class="pa-0 fill-height position-relative">
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
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// PowerBI Configuration
const WORKSPACE_ID = "dc346d84-7c7f-483d-92a0-66fdc5465ca3";
const REPORT_ID = "42e28bd8-16a8-44c8-9ee6-e0fe827199d9";
const DATASET_ID = "61249bfd-e2c2-466c-b687-e746ddda991e";
const TENANT_ID = "16f6921f-fafa-40cc-bc2b-7c6487e5ada4";

// Embed URL with autoAuth enabled
const embedUrl = ref(
  `https://app.powerbi.com/reportEmbed?reportId=${REPORT_ID}&autoAuth=true&ctid=${TENANT_ID}`
);

// Component state
const loading = ref(true);
const error = ref(null);
const powerbiFrame = ref(null);

// Methods
function onIframeLoad() {
  loading.value = false;
  error.value = null;
}

function loadReport() {
  loading.value = true;
  error.value = null;
  
  // Reset iframe src to reload
  if (powerbiFrame.value) {
    powerbiFrame.value.src = embedUrl.value;
  }
}

// Handle iframe errors
function handleIframeError() {
  loading.value = false;
  error.value = "Unable to load PowerBI report. Please check your connection and try again.";
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
});

onUnmounted(() => {
  // Cleanup timeout on unmount
  if (timeout) {
    clearTimeout(timeout);
  }
});
</script>

<style scoped>
.powerbi-iframe {
  width: 100%;
  height: calc(100vh - 200px);
  min-height: 600px;
  border: none;
  display: block;
}

.fill-height {
  height: 100%;
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

/* Responsive adjustments */
@media (max-width: 960px) {
  .powerbi-iframe {
    height: calc(100vh - 180px);
    min-height: 500px;
  }
}

@media (max-width: 600px) {
  .powerbi-iframe {
    height: calc(100vh - 160px);
    min-height: 400px;
  }
}
</style>

