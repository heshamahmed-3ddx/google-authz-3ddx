<template>
  <v-snackbar
    v-model="showUpdatePrompt"
    :timeout="-1"
    color="primary"
    location="bottom"
    class="pwa-update-snackbar"
  >
    <div class="d-flex align-center ga-3">
      <v-icon>mdi-download</v-icon>
      <span>{{
        $t("pwa.updateAvailable") || "A new version is available!"
      }}</span>
    </div>
    <template #actions>
      <v-btn variant="text" size="small" @click="updateServiceWorker">
        {{ $t("pwa.update") || "Update" }}
      </v-btn>
      <v-btn variant="text" size="small" @click="showUpdatePrompt = false">
        {{ $t("common.later") || "Later" }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const showUpdatePrompt = ref(false);
let updateServiceWorkerCallback = null;
let registration = null;
let updateInterval = null;

const updateServiceWorker = () => {
  if (updateServiceWorkerCallback) {
    updateServiceWorkerCallback();
    showUpdatePrompt.value = false;
  }
};

onMounted(() => {
  // Listen for service worker updates
  if ("serviceWorker" in navigator) {
    // Listen for controller change (service worker updated)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // Service worker has been updated, reload the page
      window.location.reload();
    });

    // Check for updates periodically
    const checkForUpdates = async () => {
      try {
        registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();

          // Check if there's a waiting service worker
          if (registration.waiting) {
            updateServiceWorkerCallback = () => {
              if (registration && registration.waiting) {
                registration.waiting.postMessage({ type: "SKIP_WAITING" });
              }
            };
            showUpdatePrompt.value = true;
          }
        }
      } catch (error) {
        console.warn("Error checking for service worker updates:", error);
      }
    };

    // Initial check
    checkForUpdates();

    // Check for updates every 5 minutes
    updateInterval = setInterval(checkForUpdates, 5 * 60 * 1000);

    // Listen for waiting service worker messages
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SKIP_WAITING") {
        // Service worker is waiting, show update prompt
        updateServiceWorkerCallback = () => {
          if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }
        };
        showUpdatePrompt.value = true;
      }
    });
  }
});

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});
</script>

<style scoped>
.pwa-update-snackbar {
  z-index: 9999;
}
</style>
