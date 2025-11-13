<template>
  <div class="enhanced-stats-section">
    <div v-if="title" class="stats-section-title">
      <v-icon v-if="titleIcon" size="16" class="mr-1">{{ titleIcon }}</v-icon>
      <span class="text-caption font-weight-medium">{{ title }}</span>
    </div>
    <div class="enhanced-stats-grid">
      <div
        v-for="stat in stats"
        :key="stat.key"
        class="enhanced-stat-card"
        :class="{ 'stat-card-active': activeKey === stat.key }"
        @click="$emit('stat-click', stat.key)"
      >
        <div class="stat-card-icon" :class="`stat-icon-${stat.color}`">
          <v-icon size="18">{{ stat.icon }}</v-icon>
        </div>
        <div class="stat-card-content">
          <div class="stat-card-label">{{ stat.label }}</div>
          <div class="stat-card-value">{{ stat.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(
        (stat) =>
          stat.key &&
          stat.label &&
          stat.icon &&
          stat.color &&
          (stat.value !== undefined)
      );
    },
  },
  activeKey: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    default: '',
  },
  titleIcon: {
    type: String,
    default: 'mdi-chart-box-outline',
  },
});

defineEmits(['stat-click']);
</script>

<style scoped>
.enhanced-stats-section {
  margin-top: 16px;
}

.stats-section-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 600;
}

.v-theme--dark .stats-section-title {
  color: rgba(255, 255, 255, 0.7);
}

.enhanced-stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.enhanced-stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-theme--dark .enhanced-stat-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
}

.enhanced-stat-card:hover {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(20, 110, 156, 0.3);
  transform: translateX(2px);
}

.v-theme--dark .enhanced-stat-card:hover {
  background: rgba(255, 255, 255, 0.05);
}

.stat-card-active {
  background: rgba(20, 110, 156, 0.1) !important;
  border-color: #146e9c !important;
  box-shadow: 0 2px 8px rgba(20, 110, 156, 0.2);
}

.stat-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
}

/* Icon color variants */
.stat-icon-primary {
  background: rgba(20, 110, 156, 0.1);
  color: #146e9c;
}

.stat-icon-success {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.stat-icon-warning {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.stat-icon-error {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.stat-icon-info {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.stat-icon-orange {
  background: rgba(239, 144, 67, 0.1);
  color: #ef9043;
}

.stat-card-content {
  flex: 1;
  min-width: 0;
}

.stat-card-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-theme--dark .stat-card-label {
  color: rgba(255, 255, 255, 0.7);
}

.stat-card-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #146e9c;
}

.v-theme--dark .stat-card-value {
  color: #4fc3f7;
}

/* RTL Support */
[dir="rtl"] .enhanced-stat-card:hover {
  transform: translateX(-2px);
}
</style>

