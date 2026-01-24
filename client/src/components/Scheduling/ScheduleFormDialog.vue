<template>
  <v-dialog
    :model-value="modelValue"
    max-width="800"
    persistent
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-2">{{ isEdit ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
        {{ isEdit ? 'Edit' : 'Create' }} Report Schedule
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-form ref="formRef" v-model="valid">
          <!-- Report Configuration -->
          <div class="mb-4">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Report Configuration</h3>
            
            <v-text-field
              v-model="form.reportName"
              label="Schedule Name"
              placeholder="e.g., Monthly Surgical Guide Report"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-select
              v-model="form.reportType"
              :items="reportTypes"
              label="Report Type"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-select
              v-model="form.format"
              :items="formatOptions"
              label="Output Format"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
            />
          </div>

          <v-divider class="my-4" />

          <!-- Schedule Configuration -->
          <div class="mb-4">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Schedule Configuration</h3>
            
            <v-select
              v-model="form.frequency"
              :items="frequencyOptions"
              label="Frequency"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-text-field
              v-model="form.time"
              label="Time"
              type="time"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-select
              v-if="form.frequency === 'weekly'"
              v-model="form.days"
              :items="weekDays"
              label="Days of Week"
              multiple
              chips
              closable-chips
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-select
              v-if="form.frequency === 'monthly'"
              v-model="form.days"
              :items="monthDays"
              label="Days of Month"
              multiple
              chips
              closable-chips
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-select
              v-model="form.timezone"
              :items="timezones"
              label="Timezone"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
            />
          </div>

          <v-divider class="my-4" />

          <!-- Recipients -->
          <div class="mb-4">
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Email Recipients</h3>
            
            <v-combobox
              v-model="form.recipients"
              label="Recipient Emails"
              multiple
              chips
              closable-chips
              :rules="[rules.required, rules.email]"
              variant="outlined"
              density="comfortable"
              hint="Press Enter to add email"
              persistent-hint
            >
              <template #chip="{ props, item }">
                <v-chip
                  v-bind="props"
                  :color="isValidEmail(item) ? 'primary' : 'error'"
                  closable
                >
                  {{ item }}
                </v-chip>
              </template>
            </v-combobox>
          </div>

          <v-divider class="my-4" />

          <!-- Report Filters (Optional) -->
          <div>
            <h3 class="text-subtitle-1 font-weight-bold mb-2">
              Report Filters (Optional)
            </h3>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.filters.startDate"
                  label="Start Date"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.filters.endDate"
                  label="End Date"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>

            <v-select
              v-if="form.reportType === 'surgical_guide'"
              v-model="form.filters.status"
              :items="statusOptions"
              label="Order Status"
              clearable
              variant="outlined"
              density="comfortable"
            />
          </div>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="close"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="saving"
          :disabled="!valid"
          @click="save"
        >
          {{ isEdit ? 'Update' : 'Create' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { reportSchedulingService } from '@/services/reportScheduling';

const props = defineProps({
  modelValue: Boolean,
  schedule: Object
});

const emit = defineEmits(['update:modelValue', 'saved']);

// State
const formRef = ref(null);
const valid = ref(false);
const saving = ref(false);

// Form data
const form = ref({
  reportName: '',
  reportType: 'surgical_guide',
  frequency: 'monthly',
  time: '08:00',
  days: [],
  timezone: 'America/New_York',
  recipients: [],
  format: 'pdf',
  filters: {
    startDate: '',
    endDate: '',
    status: null
  }
});

// Computed
const isEdit = computed(() => !!props.schedule);

// Options
const reportTypes = [
  { title: 'Surgical Guide Report', value: 'surgical_guide' },
  { title: 'Power BI Report', value: 'powerbi' },
  { title: 'Custom Report', value: 'custom' }
];

const frequencyOptions = [
  { title: 'Daily', value: 'daily' },
  { title: 'Weekly', value: 'weekly' },
  { title: 'Monthly', value: 'monthly' }
];

const formatOptions = [
  { title: 'PDF', value: 'pdf' },
  { title: 'Excel (XLSX)', value: 'excel' },
  { title: 'HTML', value: 'html' }
];

const weekDays = [
  { title: 'Monday', value: 'Mon' },
  { title: 'Tuesday', value: 'Tue' },
  { title: 'Wednesday', value: 'Wed' },
  { title: 'Thursday', value: 'Thu' },
  { title: 'Friday', value: 'Fri' },
  { title: 'Saturday', value: 'Sat' },
  { title: 'Sunday', value: 'Sun' }
];

const monthDays = Array.from({ length: 31 }, (_, i) => ({
  title: `${i + 1}${getOrdinalSuffix(i + 1)}`,
  value: String(i + 1)
}));

const timezones = [
  { title: 'Eastern Time (ET)', value: 'America/New_York' },
  { title: 'Central Time (CT)', value: 'America/Chicago' },
  { title: 'Mountain Time (MT)', value: 'America/Denver' },
  { title: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
  { title: 'UTC', value: 'UTC' }
];

const statusOptions = [
  { title: 'Pending', value: 'pending' },
  { title: 'In Progress', value: 'in_progress' },
  { title: 'Completed', value: 'completed' },
  { title: 'Cancelled', value: 'cancelled' }
];

// Validation rules
const rules = {
  required: v => !!v || 'Required',
  email: v => {
    if (!Array.isArray(v) || v.length === 0) return 'At least one recipient required';
    return v.every(email => isValidEmail(email)) || 'All emails must be valid';
  }
};

// Methods
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getOrdinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

async function save() {
  const { valid: isValid } = await formRef.value.validate();
  if (!isValid) return;

  saving.value = true;
  try {
    const payload = {
      reportType: form.value.reportType,
      reportName: form.value.reportName,
      frequency: form.value.frequency,
      time: form.value.time,
      timezone: form.value.timezone,
      days: form.value.days,
      recipients: form.value.recipients,
      format: form.value.format,
      filters: form.value.filters
    };

    if (isEdit.value) {
      await reportSchedulingService.updateSchedule(props.schedule.id, payload);
    } else {
      await reportSchedulingService.createSchedule(payload);
    }

    emit('saved');
    close();
  } catch (error) {
    console.error('Error saving schedule:', error);
    alert('Failed to save schedule. Please try again.');
  } finally {
    saving.value = false;
  }
}

function close() {
  emit('update:modelValue', false);
  resetForm();
}

function resetForm() {
  form.value = {
    reportName: '',
    reportType: 'surgical_guide',
    frequency: 'monthly',
    time: '08:00',
    days: [],
    timezone: 'America/New_York',
    recipients: [],
    format: 'pdf',
    filters: {
      startDate: '',
      endDate: '',
      status: null
    }
  };
}

function loadSchedule(schedule) {
  if (!schedule) {
    resetForm();
    return;
  }

  form.value = {
    reportName: schedule.report_name,
    reportType: schedule.report_type,
    frequency: schedule.schedule_frequency,
    time: schedule.schedule_time?.substring(0, 5) || '08:00',
    days: schedule.schedule_days || [],
    timezone: schedule.schedule_timezone || 'America/New_York',
    recipients: schedule.recipients || [],
    format: schedule.format,
    filters: schedule.filters || {
      startDate: '',
      endDate: '',
      status: null
    }
  };
}

// Watchers
watch(() => props.schedule, (newVal) => {
  loadSchedule(newVal);
}, { immediate: true });

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadSchedule(props.schedule);
  }
});
</script>

<style scoped>
:deep(.v-field__input) {
  min-height: 40px;
}
</style>
