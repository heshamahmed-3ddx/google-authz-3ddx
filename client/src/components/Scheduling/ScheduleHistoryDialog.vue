<template>
  <v-dialog
    :model-value="modelValue"
    max-width="900"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-2">mdi-history</v-icon>
        Execution History
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="close"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-4 text-medium-emphasis">Loading history...</p>
        </div>

        <div v-else-if="error" class="pa-4">
          <v-alert type="error" variant="tonal">
            {{ error }}
          </v-alert>
        </div>

        <div v-else>
          <!-- Statistics -->
          <div class="pa-4 bg-grey-lighten-5">
            <v-row>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Total Runs</div>
                <div class="text-h6 font-weight-bold">{{ statistics.total }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Successful</div>
                <div class="text-h6 font-weight-bold text-success">{{ statistics.successful }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Failed</div>
                <div class="text-h6 font-weight-bold text-error">{{ statistics.failed }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Success Rate</div>
                <div class="text-h6 font-weight-bold">{{ statistics.successRate }}%</div>
              </v-col>
            </v-row>
          </div>

          <v-divider />

          <!-- Execution Logs -->
          <v-list v-if="logs.length > 0">
            <v-list-item
              v-for="log in logs"
              :key="log.id"
              class="px-4"
            >
              <template #prepend>
                <v-avatar :color="getStatusColor(log.status)">
                  <v-icon color="white">{{ getStatusIcon(log.status) }}</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ formatDate(log.started_at) }}
              </v-list-item-title>

              <v-list-item-subtitle>
                <div class="d-flex align-center flex-wrap gap-2 mt-1">
                  <v-chip
                    :color="getStatusColor(log.status)"
                    size="small"
                    variant="flat"
                  >
                    {{ log.status }}
                  </v-chip>
                  
                  <span class="text-caption">
                    Duration: {{ formatDuration(log.started_at, log.completed_at) }}
                  </span>

                  <span v-if="log.file_path" class="text-caption">
                    <v-icon size="small">mdi-file</v-icon>
                    {{ log.file_path.split('/').pop() }}
                  </span>

                  <span v-if="log.file_size" class="text-caption">
                    {{ formatFileSize(log.file_size) }}
                  </span>

                  <span v-if="log.email_sent" class="text-caption">
                    <v-icon size="small" color="success">mdi-email-check</v-icon>
                    Email sent
                  </span>
                </div>

                <div v-if="log.error_message" class="mt-2">
                  <v-alert
                    type="error"
                    variant="tonal"
                    density="compact"
                  >
                    {{ log.error_message }}
                  </v-alert>
                </div>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <div v-else class="text-center py-8">
            <v-icon size="64" color="grey">mdi-inbox</v-icon>
            <p class="mt-4 text-medium-emphasis">No execution history yet</p>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="close"
        >
          Close
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          @click="loadHistory"
        >
          Refresh
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { reportSchedulingService } from '@/services/reportScheduling';

const props = defineProps({
  modelValue: Boolean,
  schedule: Object
});

const emit = defineEmits(['update:modelValue']);

// State
const loading = ref(false);
const error = ref(null);
const logs = ref([]);
const statistics = ref({
  total: 0,
  successful: 0,
  failed: 0,
  successRate: 0
});

// Methods
async function loadHistory() {
  if (!props.schedule) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await reportSchedulingService.getScheduleHistory(props.schedule.id, 50);
    logs.value = response.data?.logs || [];
    
    const stats = response.data?.statistics || {};
    statistics.value = {
      total: stats.totalExecutions || 0,
      successful: stats.successfulExecutions || 0,
      failed: stats.failedExecutions || 0,
      successRate: stats.successRate || 0
    };
  } catch (err) {
    error.value = 'Failed to load execution history';
    console.error('Error loading history:', err);
  } finally {
    loading.value = false;
  }
}

function close() {
  emit('update:modelValue', false);
}

function getStatusColor(status) {
  const colors = {
    completed: 'success',
    failed: 'error',
    running: 'info',
    pending: 'warning'
  };
  return colors[status] || 'grey';
}

function getStatusIcon(status) {
  const icons = {
    completed: 'mdi-check-circle',
    failed: 'mdi-close-circle',
    running: 'mdi-loading',
    pending: 'mdi-clock'
  };
  return icons[status] || 'mdi-help-circle';
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDuration(start, end) {
  if (!start || !end) return 'N/A';
  const duration = new Date(end) - new Date(start);
  const seconds = Math.floor(duration / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  if (mb < 1) {
    return `${Math.round(bytes / 1024)}KB`;
  }
  return `${mb.toFixed(2)}MB`;
}

// Watchers
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.schedule) {
    loadHistory();
  }
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
