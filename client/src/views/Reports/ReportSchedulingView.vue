<template>
  <v-container fluid class="report-scheduling pa-4">
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h5 font-weight-bold">
              <v-icon class="mr-2" color="primary">mdi-calendar-clock</v-icon>
              Report Schedules
            </h1>
            <p class="text-caption text-medium-emphasis">
              Automate report generation and email delivery
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openCreateDialog"
          >
            Create Schedule
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row v-if="stats">
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Total Schedules</div>
            <div class="text-h5 font-weight-bold">{{ stats.total }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Active</div>
            <div class="text-h5 font-weight-bold text-success">{{ stats.active }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Last 30 Days</div>
            <div class="text-h5 font-weight-bold">{{ stats.executions }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-medium-emphasis">Success Rate</div>
            <div class="text-h5 font-weight-bold text-success">{{ stats.successRate }}%</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search schedules"
          clearable
          hide-details
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="filterStatus"
          :items="statusOptions"
          label="Status"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
    </v-row>

    <!-- Schedules List -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text v-if="loading">
            <div class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4 text-medium-emphasis">Loading schedules...</p>
            </div>
          </v-card-text>

          <v-card-text v-else-if="filteredSchedules.length === 0">
            <div class="text-center py-8">
              <v-icon size="64" color="grey">mdi-calendar-remove</v-icon>
              <p class="mt-4 text-h6">No schedules found</p>
              <p class="text-medium-emphasis">Create your first schedule to get started</p>
              <v-btn
                class="mt-4"
                color="primary"
                prepend-icon="mdi-plus"
                @click="openCreateDialog"
              >
                Create Schedule
              </v-btn>
            </div>
          </v-card-text>

          <v-list v-else>
            <v-list-item
              v-for="schedule in filteredSchedules"
              :key="schedule.id"
              @click="viewSchedule(schedule)"
            >
              <template #prepend>
                <v-icon :color="schedule.is_active ? 'success' : 'grey'">
                  {{ schedule.is_active ? 'mdi-check-circle' : 'mdi-pause-circle' }}
                </v-icon>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ schedule.report_name }}
              </v-list-item-title>

              <v-list-item-subtitle>
                <v-chip size="small" class="mr-2" variant="text">
                  <v-icon start size="small">mdi-clock</v-icon>
                  {{ formatFrequency(schedule) }}
                </v-chip>
                <v-chip size="small" class="mr-2" variant="text">
                  <v-icon start size="small">mdi-file</v-icon>
                  {{ schedule.format.toUpperCase() }}
                </v-chip>
                <v-chip size="small" variant="text">
                  <v-icon start size="small">mdi-email</v-icon>
                  {{ schedule.recipients.length }} recipients
                </v-chip>
              </v-list-item-subtitle>

              <template #append>
                <div class="d-flex align-center gap-2">
                  <v-tooltip text="View History">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-history"
                        size="small"
                        variant="text"
                        @click.stop="viewHistory(schedule)"
                      />
                    </template>
                  </v-tooltip>

                  <v-tooltip :text="schedule.is_active ? 'Pause' : 'Activate'">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :icon="schedule.is_active ? 'mdi-pause' : 'mdi-play'"
                        size="small"
                        variant="text"
                        @click.stop="toggleSchedule(schedule)"
                      />
                    </template>
                  </v-tooltip>

                  <v-tooltip text="Run Now">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-play-circle"
                        size="small"
                        variant="text"
                        :loading="triggering[schedule.id]"
                        @click.stop="triggerNow(schedule)"
                      />
                    </template>
                  </v-tooltip>

                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-dots-vertical"
                        size="small"
                        variant="text"
                      />
                    </template>
                    <v-list>
                      <v-list-item @click="editSchedule(schedule)">
                        <template #prepend>
                          <v-icon>mdi-pencil</v-icon>
                        </template>
                        <v-list-item-title>Edit</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="deleteSchedule(schedule)">
                        <template #prepend>
                          <v-icon color="error">mdi-delete</v-icon>
                        </template>
                        <v-list-item-title class="text-error">Delete</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Schedule Form Dialog -->
    <ScheduleFormDialog
      v-model="formDialog"
      :schedule="selectedSchedule"
      @saved="onScheduleSaved"
    />

    <!-- History Dialog -->
    <ScheduleHistoryDialog
      v-model="historyDialog"
      :schedule="selectedSchedule"
    />

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { reportSchedulingService } from '@/services/reportScheduling';
import ScheduleFormDialog from '@/components/Scheduling/ScheduleFormDialog.vue';
import ScheduleHistoryDialog from '@/components/Scheduling/ScheduleHistoryDialog.vue';

// State
const loading = ref(false);
const schedules = ref([]);
const stats = ref(null);
const search = ref('');
const filterStatus = ref('all');
const formDialog = ref(false);
const historyDialog = ref(false);
const selectedSchedule = ref(null);
const triggering = ref({});

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});

// Filter options
const statusOptions = [
  { title: 'All', value: 'all' },
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' }
];

// Computed
const filteredSchedules = computed(() => {
  let filtered = schedules.value;

  // Filter by status
  if (filterStatus.value === 'active') {
    filtered = filtered.filter(s => s.is_active);
  } else if (filterStatus.value === 'inactive') {
    filtered = filtered.filter(s => !s.is_active);
  }

  // Filter by search
  if (search.value) {
    const query = search.value.toLowerCase();
    filtered = filtered.filter(s =>
      s.report_name.toLowerCase().includes(query) ||
      s.report_type.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Methods
async function loadSchedules() {
  loading.value = true;
  try {
    const response = await reportSchedulingService.getSchedules();
    schedules.value = response.data || [];
    calculateStats();
  } catch (error) {
    showError('Failed to load schedules');
    console.error('Error loading schedules:', error);
  } finally {
    loading.value = false;
  }
}

function calculateStats() {
  const total = schedules.value.length;
  const active = schedules.value.filter(s => s.is_active).length;
  const executions = schedules.value.reduce((sum, s) => sum + (s.execution_count || 0), 0);
  const failures = schedules.value.reduce((sum, s) => sum + (s.failure_count || 0), 0);
  const successRate = executions > 0 ? Math.round(((executions - failures) / executions) * 100) : 100;

  stats.value = { total, active, executions, successRate };
}

function openCreateDialog() {
  selectedSchedule.value = null;
  formDialog.value = true;
}

function viewSchedule(schedule) {
  selectedSchedule.value = schedule;
  formDialog.value = true;
}

function editSchedule(schedule) {
  selectedSchedule.value = schedule;
  formDialog.value = true;
}

function viewHistory(schedule) {
  selectedSchedule.value = schedule;
  historyDialog.value = true;
}

async function toggleSchedule(schedule) {
  try {
    await reportSchedulingService.toggleSchedule(schedule.id);
    showSuccess(`Schedule ${schedule.is_active ? 'paused' : 'activated'}`);
    await loadSchedules();
  } catch (error) {
    showError('Failed to toggle schedule');
    console.error('Error toggling schedule:', error);
  }
}

async function triggerNow(schedule) {
  triggering.value[schedule.id] = true;
  try {
    await reportSchedulingService.triggerSchedule(schedule.id);
    showSuccess('Schedule triggered successfully');
  } catch (error) {
    showError('Failed to trigger schedule');
    console.error('Error triggering schedule:', error);
  } finally {
    triggering.value[schedule.id] = false;
  }
}

async function deleteSchedule(schedule) {
  if (!confirm(`Delete schedule "${schedule.report_name}"?`)) return;

  try {
    await reportSchedulingService.deleteSchedule(schedule.id);
    showSuccess('Schedule deleted');
    await loadSchedules();
  } catch (error) {
    showError('Failed to delete schedule');
    console.error('Error deleting schedule:', error);
  }
}

function onScheduleSaved() {
  formDialog.value = false;
  loadSchedules();
  showSuccess('Schedule saved successfully');
}

function formatFrequency(schedule) {
  const freq = schedule.schedule_frequency;
  const time = schedule.schedule_time?.substring(0, 5) || '00:00';

  if (freq === 'daily') return `Daily at ${time}`;
  if (freq === 'weekly') {
    const days = schedule.schedule_days?.join(', ') || 'Mon-Fri';
    return `Weekly on ${days} at ${time}`;
  }
  if (freq === 'monthly') {
    const days = schedule.schedule_days?.join(', ') || '1st';
    return `Monthly on ${days} at ${time}`;
  }
  return freq;
}

function showSuccess(message) {
  snackbar.value = { show: true, message, color: 'success' };
}

function showError(message) {
  snackbar.value = { show: true, message, color: 'error' };
}

// Lifecycle
onMounted(() => {
  loadSchedules();
});
</script>

<style scoped>
.report-scheduling {
  max-width: 1400px;
  margin: 0 auto;
}

.gap-2 {
  gap: 8px;
}
</style>
