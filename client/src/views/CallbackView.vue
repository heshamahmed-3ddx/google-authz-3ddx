<template>
  <div class="callback-view">
    <div class="callback-container">
      <!-- Main Card -->
      <v-card 
        elevation="0" 
        class="callback-card"
        :class="{ 'error-state': error, 'success-state': success }"
      >
        <!-- Loading State -->
        <template v-if="loading">
          <div class="callback-content">
            <!-- Centered Spinner -->
            <div class="loader-wrapper">
              <v-progress-circular
                indeterminate
                color="primary"
                size="56"
                width="5"
                class="loader-spinner"
              ></v-progress-circular>
            </div>

            <!-- Title -->
            <div class="callback-title">
              {{ $t("auth.processingAuth") }}
            </div>

            <!-- Subtitle -->
            <div class="callback-subtitle">
              {{ $t("auth.completingAuth") }}
            </div>
          </div>
        </template>

            <!-- Success State -->
            <template v-else-if="success">
              <div class="callback-content">
                <!-- Success Icon -->
                <div class="icon-wrapper success-icon">
                  <v-icon 
                    size="64" 
                    color="success"
                  >
                    mdi-check-circle
                  </v-icon>
                </div>

                <!-- Title -->
                <div class="callback-title success-text">
                  {{ $t("auth.authSuccess") }}
                </div>

                <!-- Message -->
                <div class="callback-subtitle mb-4">
                  {{ $t("auth.authSuccessMessage") }}
                </div>

                <!-- Redirecting -->
                <div class="redirecting-indicator">
                  <v-progress-circular
                    indeterminate
                    color="success"
                    size="18"
                    width="2"
                    class="mr-2"
                  ></v-progress-circular>
                  <span>Redirecting...</span>
                </div>
              </div>
            </template>

            <!-- Error State -->
            <template v-else-if="error">
              <div class="callback-content">
                <!-- Error Icon -->
                <div class="icon-wrapper error-icon">
                  <v-icon 
                    size="64" 
                    color="error"
                  >
                    mdi-alert-circle
                  </v-icon>
                </div>

                <!-- Title -->
                <div class="callback-title error-text mb-3">
                  {{ $t("auth.authFailed") }}
                </div>

                <!-- Error Message -->
                <v-alert 
                  type="error" 
                  variant="tonal" 
                  density="compact"
                  class="error-alert mb-4"
                >
                  <div class="text-body-2">{{ error }}</div>
                </v-alert>

                <!-- Action Button -->
                <v-btn
                  color="primary"
                  size="default"
                  prepend-icon="mdi-home"
                  variant="elevated"
                  @click="goHome"
                  block
                  class="error-action-btn"
                >
                  {{ $t("auth.returnHome") }}
                </v-btn>
              </div>
            </template>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref(null);
const success = ref(false);

const handleCallback = async () => {
  try {
    const code = route.query.code;
    const errorParam = route.query.error;
    const successParam = route.query.success;

    // Handle error from query params
    if (errorParam) {
      throw new Error(`Authentication error: ${errorParam}`);
    }

    // Handle success redirect from backend
    if (successParam === 'true') {
      const isAuthenticated = await authStore.checkAuth();
      
      if (!isAuthenticated) {
        throw new Error("Authentication failed - session not found");
      }

      success.value = true;

      // Prefetch dashboard data
      try {
        await authStore.prefetchDashboardData();
      } catch (err) {
        // Non-blocking
      }

      // Brief delay before redirect to home page
      setTimeout(() => {
        router.push("/home");
      }, 600);
      return;
    }

    // Handle direct code flow
    if (code) {
      await authStore.handleCallback(code);
      success.value = true;

      try {
        await authStore.prefetchDashboardData();
      } catch (err) {
        // Non-blocking
      }

      setTimeout(() => {
        router.push("/home");
      }, 600);
      return;
    }

    throw new Error("No authorization code or success parameter received");
  } catch (err) {
    error.value = err.message || "Authentication failed";
  } finally {
    loading.value = false;
  }
};

const goHome = () => {
  router.push("/");
};

onMounted(() => {
  handleCallback();
});
</script>

<style scoped>
.callback-view {
  position: fixed;
  inset: 0;
  background: rgb(var(--v-theme-background));
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.callback-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.callback-card {
  border-radius: 16px !important;
  width: 100%;
  background: rgb(var(--v-theme-surface)) !important;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.06) !important;
  overflow: hidden;
}

.callback-card.error-state {
  border: 2px solid rgb(var(--v-theme-error)) !important;
}

.callback-card.success-state {
  border: 2px solid rgb(var(--v-theme-success)) !important;
}

.callback-content {
  padding: 48px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Loader Styles */
.loader-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  width: 100%;
}

.loader-spinner {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

/* Icon Wrapper */
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.08);
  animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-wrapper.success-icon {
  background: rgba(var(--v-theme-success), 0.1);
}

.icon-wrapper.error-icon {
  background: rgba(var(--v-theme-error), 0.1);
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Typography */
.callback-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 8px;
  color: rgba(var(--v-theme-on-surface), 0.95);
}

.callback-subtitle {
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.success-text {
  color: rgb(var(--v-theme-success)) !important;
}

.error-text {
  color: rgb(var(--v-theme-error)) !important;
}

/* Redirecting Indicator */
.redirecting-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 8px;
}

/* Error Alert */
.error-alert {
  text-align: left;
  border-radius: 8px;
}

/* Error Action Button */
.error-action-btn {
  margin-top: 8px;
}

/* Responsive */
@media (max-width: 600px) {
  .callback-view {
    padding: 16px;
  }

  .callback-content {
    padding: 40px 24px;
  }

  .loader-wrapper {
    margin-bottom: 20px;
  }

  .loader-spinner {
    width: 48px !important;
    height: 48px !important;
  }

  .icon-wrapper {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
  }

  .icon-wrapper :deep(.v-icon) {
    font-size: 48px !important;
  }

  .callback-title {
    font-size: 1.125rem;
  }

  .callback-subtitle {
    font-size: 0.875rem;
  }
}
</style>
