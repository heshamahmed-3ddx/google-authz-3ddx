<template>
  <v-col cols="12" md="3" class="compact-filters-col">
    <v-card elevation="1" class="compact-filters-card h-100">
      <v-card-text class="compact-filters-content pa-3">
        <slot></slot>
      </v-card-text>
    </v-card>
  </v-col>
</template>

<style scoped>
.compact-filters-col {
  padding-right: 0.5rem;
}

[dir="rtl"] .compact-filters-col {
  padding-right: 0;
  padding-left: 0.5rem;
}

.compact-filters-card {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.compact-filters-content {
  padding: 12px !important;
}

/* Scrollbar styling */
.compact-filters-card::-webkit-scrollbar {
  width: 6px;
}

.compact-filters-card::-webkit-scrollbar-track {
  background: transparent;
}

.compact-filters-card::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.compact-filters-card::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.v-theme--dark .compact-filters-card::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.v-theme--dark .compact-filters-card::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
