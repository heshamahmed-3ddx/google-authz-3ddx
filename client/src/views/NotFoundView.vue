<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card elevation="3" class="text-center pa-8">
          <!-- 404 Icon -->
          <v-icon size="120" color="primary" class="mb-4">
            mdi-file-question-outline
          </v-icon>

          <!-- Error Code -->
          <h1 class="text-h2 font-weight-bold mb-2" style="color: #ef9043">
            404
          </h1>

          <!-- Title -->
          <h2 class="text-h4 mb-4">
            {{ $t("errors.404.title") || "Page Not Found" }}
          </h2>

          <!-- Description -->
          <p class="text-body-1 text-medium-emphasis mb-6">
            {{
              $t("errors.404.description") ||
              "The page you're looking for doesn't exist or has been moved."
            }}
          </p>

          <!-- Current Path Info (Development Only) -->
          <v-alert
            v-if="isDevelopment"
            type="info"
            variant="tonal"
            class="mb-6 text-left"
          >
            <v-alert-title>
              <v-icon class="mr-2">mdi-information-outline</v-icon>
              Developer Info
            </v-alert-title>
            <p class="mb-2">
              <strong>Requested Path:</strong>
              <code>{{ $route.fullPath }}</code>
            </p>
            <p class="mb-0">
              <strong>From:</strong> <code>{{ from || "Direct access" }}</code>
            </p>
          </v-alert>

          <!-- Actions -->
          <div class="d-flex gap-3 justify-center flex-wrap">
            <v-btn
              color="primary"
              size="large"
              variant="elevated"
              prepend-icon="mdi-home"
              @click="goToDashboard"
            >
              {{ $t("errors.404.goHome") || "Go to Dashboard" }}
            </v-btn>

            <v-btn
              color="secondary"
              size="large"
              variant="outlined"
              prepend-icon="mdi-arrow-left"
              @click="goBack"
            >
              {{ $t("errors.404.goBack") || "Go Back" }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const from = ref(null);

const isDevelopment = computed(() => import.meta.env.DEV);

onMounted(() => {
  // Store the referrer for debugging
  if (document.referrer) {
    from.value = new URL(document.referrer).pathname;
  }
});

function goToDashboard() {
  if (authStore.isAuthenticated) {
    router.push({ name: "Dashboard" });
  } else {
    router.push({ name: "Login" });
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    goToDashboard();
  }
}
</script>

<style scoped>
code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: "Courier New", monospace;
}

.v-theme--dark code {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
