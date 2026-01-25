<template>
  <div
    class="d-flex justify-space-between mb-2 header-container compact-header"
  >
    <div>
      <h1 class="text-h6 pt-2 compact-header-title">
        <v-icon
          v-if="icon"
          size="small"
          style="margin-inline-end: 6px"
          :color="iconColor"
        >
          {{ icon }}
        </v-icon>
        {{ title }}
      </h1>
      <p
        v-if="subtitle"
        class="text-caption text-medium-emphasis header-subtitle compact-header-subtitle"
      >
        {{ subtitle }}
      </p>
    </div>

    <!-- Optional action slot -->
    <div v-if="$slots.actions" class="header-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "",
  },
  iconColor: {
    type: String,
    default: "primary",
  },
});
</script>

<style scoped>
.compact-header {
  min-height: 48px;
}

.compact-header-title {
  font-size: 1.1rem !important;
  font-weight: 600;
  margin: 0;
  padding-top: 0.5rem;
  display: flex;
  align-items: center;
}

.header-subtitle {
  margin-top: 2px;
  font-size: 0.75rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* RTL Support */
[dir="rtl"] .compact-header-title v-icon {
  margin-inline-end: 6px;
  margin-inline-start: 0;
}
</style>
