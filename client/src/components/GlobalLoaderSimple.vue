<template>
  <!-- Minimal, unstyled global loader. Render nothing when not active. -->
  <div v-if="isLoading" role="status" aria-live="polite">
    <!-- Placeholder: styling will be added later by the app. -->
    <slot>Loading…</slot>
  </div>
</template>

<script setup>
import { inject } from "vue";
import { isLoading as pluginIsLoading } from "@/plugins/global-loader";

// Try to use the provided loader via inject; otherwise fallback to the
// directly imported plugin's computed ref. This avoids dynamic import and
// keeps lint happy.
const provided = inject("globalLoader", null);
const isLoading =
  provided && provided.isLoading ? provided.isLoading : pluginIsLoading;
</script>

<!-- No styles here — consumer will style the loader. -->
