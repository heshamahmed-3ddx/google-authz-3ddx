<template>
  <div class="security-options-section">
    <v-row no-gutters>
      <v-col cols="12" md="6" class="pr-md-2">
        <v-card variant="outlined" elevation="0" class="mb-3">
          <v-card-title class="text-subtitle-2 font-weight-medium pa-3" style="min-height: 36px;">Casbin Cache</v-card-title>
          <v-card-text class="pa-3">
            <p class="text-caption mb-3">
              Manage Casbin policy cache for better performance
            </p>
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              prepend-icon="mdi-cached"
              @click="invalidateCache"
              :loading="cacheLoading"
            >
              Invalidate Cache
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="pl-md-2">
        <v-card variant="outlined" elevation="0" class="mb-3">
          <v-card-title class="text-subtitle-2 font-weight-medium pa-3" style="min-height: 36px;">Reload Policies</v-card-title>
          <v-card-text class="pa-3">
            <p class="text-caption mb-3">
              Reload all policies from database
            </p>
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              prepend-icon="mdi-refresh"
              @click="reloadPolicies"
              :loading="reloadLoading"
            >
              Reload Policies
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card variant="outlined" elevation="0">
          <v-card-title class="text-subtitle-2 font-weight-medium pa-3" style="min-height: 36px;">Performance Metrics</v-card-title>
          <v-card-text class="pa-3">
            <div v-if="metricsLoading" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            </div>
            <div v-else-if="metrics" class="metrics-grid">
              <div class="metric-item">
                <div class="metric-label">Cache Hit Rate</div>
                <div class="metric-value">{{ metrics.cacheHitRate || "N/A" }}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Average Query Time</div>
                <div class="metric-value">{{ metrics.averageQueryTime || "N/A" }}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Policies Loaded</div>
                <div class="metric-value">{{ metrics.loadPolicyCount || 0 }}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Policies Saved</div>
                <div class="metric-value">{{ metrics.savePolicyCount || 0 }}</div>
              </div>
            </div>
            <div v-else class="text-caption text-medium-emphasis">
              Metrics not available (not using enhanced adapter)
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>

  <!-- Snackbar for notifications -->
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
    {{ snackbar.message }}
    <template #actions>
      <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { apiService } from "@/services/api";
import { useSnackbar } from "@/composables/useSnackbar";

const { showSnackbar, snackbar } = useSnackbar();

const cacheLoading = ref(false);
const reloadLoading = ref(false);
const metricsLoading = ref(false);
const metrics = ref(null);

const invalidateCache = async () => {
  cacheLoading.value = true;
  try {
    await apiService.post("/api/admin/casbin/cache/invalidate");
    showSnackbar("Cache invalidated successfully", "success");
  } catch (err) {
    showSnackbar(
      err.response?.data?.error?.message || "Failed to invalidate cache",
      "error"
    );
  } finally {
    cacheLoading.value = false;
  }
};

const reloadPolicies = async () => {
  reloadLoading.value = true;
  try {
    await apiService.post("/api/admin/casbin/reload");
    showSnackbar("Policies reloaded successfully", "success");
    await loadMetrics();
  } catch (err) {
    showSnackbar(
      err.response?.data?.error?.message || "Failed to reload policies",
      "error"
    );
  } finally {
    reloadLoading.value = false;
  }
};

const loadMetrics = async () => {
  metricsLoading.value = true;
  try {
    const response = await apiService.get("/api/admin/casbin/metrics");
    if (response.data?.data?.metrics) {
      metrics.value = response.data.data.metrics;
    }
  } catch (err) {
    // Metrics might not be available, that's okay
    metrics.value = null;
  } finally {
    metricsLoading.value = false;
  }
};

onMounted(() => {
  loadMetrics();
});
</script>

<style scoped>
.security-options-section {
  min-height: 200px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-item {
  padding: 1rem;
  background-color: rgba(var(--v-theme-surface), 0.5);
  border-radius: 4px;
}

.metric-label {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}
</style>

