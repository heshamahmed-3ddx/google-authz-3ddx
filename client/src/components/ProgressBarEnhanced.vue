<template>
  <div class="progress-bar-enhanced">
    <!-- Progress Bar -->
    <v-progress-linear
      :model-value="percentage"
      :color="color"
      height="8"
      rounded
      class="mb-2 progress-bar-linear"
    >
    </v-progress-linear>

    <!-- Status Information -->
    <div class="d-flex justify-space-between align-center text-caption">
      <div class="d-flex align-center gap-2">
        <v-icon size="small" :color="color">{{ currentStateIcon }}</v-icon>
        <span>{{ currentStateText }}</span>
        <span v-if="percentage > 0" class="text-medium-emphasis">
          ({{ percentage }}%)
        </span>
      </div>

      <div v-if="estimatedTimeRemaining" class="text-medium-emphasis">
        <v-icon size="x-small">mdi-clock-outline</v-icon>
        {{ estimatedTimeRemaining }}
      </div>
    </div>

    <!-- Stage Indicators (Optional) -->
    <div
      v-if="showStages && stages.length > 0"
      class="d-flex justify-space-between mt-2 stage-indicators"
    >
      <div
        v-for="stage in stages"
        :key="stage.id"
        :class="[
          'stage-indicator',
          { active: stage.completed, current: stage.current },
        ]"
      >
        <v-icon size="small">{{
          stage.completed ? "mdi-check-circle" : "mdi-circle-outline"
        }}</v-icon>
        <span class="text-caption">{{ stage.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  percentage: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100,
  },
  color: {
    type: String,
    default: "primary",
  },
  startTime: {
    type: Date,
    default: () => new Date(),
  },
  estimatedTotalDuration: {
    type: Number,
    default: null, // milliseconds
  },
  stages: {
    type: Array,
    default: () => [],
  },
  showStages: {
    type: Boolean,
    default: false,
  },
});

const elapsedTime = ref(0);
let intervalId = null;

const currentStateText = computed(() => {
  if (props.percentage === 0) return "Starting...";
  if (props.percentage < 30) return "Initializing";
  if (props.percentage < 50) return "Processing";
  if (props.percentage < 90) return "Nearly complete";
  if (props.percentage < 100) return "Finalizing";
  return "Complete";
});

const currentStateIcon = computed(() => {
  if (props.percentage === 0) return "mdi-play-circle-outline";
  if (props.percentage < 30) return "mdi-loading";
  if (props.percentage < 50) return "mdi-sync";
  if (props.percentage < 90) return "mdi-check-circle-outline";
  if (props.percentage < 100) return "mdi-check-all";
  return "mdi-check-circle";
});

const estimatedTimeRemaining = computed(() => {
  if (props.percentage === 0 || !props.estimatedTotalDuration) return null;

  const elapsed = elapsedTime.value;
  if (elapsed === 0) return null;

  // Calculate estimated remaining time based on progress
  const estimatedTotal =
    props.estimatedTotalDuration || elapsed / (props.percentage / 100);
  const remaining = estimatedTotal - elapsed;

  if (remaining <= 0) return "Almost done...";
  if (remaining < 1000) return "Less than a second";
  if (remaining < 60000) return `${Math.ceil(remaining / 1000)}s remaining`;
  if (remaining < 3600000) return `${Math.ceil(remaining / 60000)}m remaining`;
  return `${Math.ceil(remaining / 3600000)}h remaining`;
});

onMounted(() => {
  // Update elapsed time every second
  intervalId = setInterval(() => {
    if (props.startTime) {
      elapsedTime.value = Date.now() - props.startTime.getTime();
    }
  }, 1000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
});

watch(
  () => props.percentage,
  (newVal) => {
    if (newVal === 100 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  },
);
</script>

<style scoped>
.progress-bar-enhanced {
  width: 100%;
}

.progress-bar-enhanced {
  width: 100%;
}

.stage-indicators {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}

.stage-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: 0.5;
  transition: opacity 0.3s;
  flex: 1;
}

.stage-indicator.active {
  opacity: 1;
  color: rgb(var(--v-theme-primary));
}

.stage-indicator.current {
  opacity: 1;
  font-weight: 600;
}
</style>
