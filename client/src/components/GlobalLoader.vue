<template>
  <v-overlay
    :model-value="isActive"
    :scrim="true"
    :persistent="false"
    class="global-loader-overlay"
    :z-index="9999"
    :close-on-content-click="false"
  >
    <v-progress-circular
      indeterminate
      color="primary"
      size="64"
    ></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { computed } from "vue";
import { isLoading } from "@/plugins/global-loader";

const isActive = computed(() => isLoading.value);
</script>

<style scoped>
.global-loader-overlay {
  z-index: 9999 !important;
}
</style>
