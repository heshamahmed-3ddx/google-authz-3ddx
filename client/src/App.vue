<template>
  <v-app>
    <!-- Loading Progress Bar -->
    <v-progress-linear
      v-if="isRouteLoading"
      indeterminate
      color="orange"
      height="3"
      style="position: fixed; top: 0; left: 0; right: 0; z-index: 9999"
    ></v-progress-linear>

    <!-- Full Screen Loading Overlay for Route Transitions -->
    <v-overlay
      v-model="isRouteLoading"
      class="align-center justify-center"
      persistent
      contained
      style="z-index: 9998"
    >
      <v-progress-circular
        color="orange"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>

    <!-- Navigation Sidebar (only show when authenticated) -->
    <NavigationSidebar v-if="authStore.isAuthenticated" v-model="drawer" />

    <v-app-bar :elevation="2" color="primary" dark>
      <!-- Menu button for sidebar toggle -->
      <v-app-bar-nav-icon
        v-if="authStore.isAuthenticated"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>

      <v-app-bar-title class="d-flex align-center">
        <v-icon left>mdi-google</v-icon>
        <span class="mr-2 d-none d-sm-inline">{{ $t("app.title") }}</span>
        <small class="app-version d-none d-md-inline">v{{ appVersion }}</small>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <div class="appbar-actions d-flex align-center">
        <LanguageSwitcher class="mr-2" />
        <ThemeToggle />
      </div>
    </v-app-bar>

    <v-main class="main-content-stable">
      <router-view />
    </v-main>

    <!-- Development Toolbar (only in dev mode) -->
    <DevToolbar v-if="authStore.isAuthenticated" />

    <div
      v-if="snackbar.show"
      :class="['simple-toast', `toast-${snackbar.color}`]"
      @click="snackbar.show = false"
    >
      {{ snackbar.message }}
      <v-icon class="toast-close" size="small">mdi-close</v-icon>
    </div>
  </v-app>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import ThemeToggle from "@/components/ThemeToggle.vue";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import DevToolbar from "@/components/DevToolbar.vue";
import NavigationSidebar from "@/components/NavigationSidebar.vue";
import { useI18n } from "vue-i18n";
import { useTheme, useLocale } from "vuetify";
import { isRTL } from "@/i18n";
import rootPkg from "../../package.json";

const authStore = useAuthStore();
const themeStore = useThemeStore();
const { locale } = useI18n();
const appVersion = rootPkg.version || "";
const vuetifyTheme = useTheme();
const vuetifyLocale = useLocale();
const router = useRouter();

// Drawer state
const drawer = ref(true);

// Route loading state
const isRouteLoading = ref(false);

// Show loading overlay during route transitions
router.beforeEach((to, from, next) => {
  // Show loading immediately on navigation
  isRouteLoading.value = true;
  next();
});

router.afterEach(() => {
  // Wait for next frame to ensure component is rendered
  requestAnimationFrame(() => {
    // Then wait a bit more to ensure content is painted
    setTimeout(() => {
      isRouteLoading.value = false;
    }, 300);
  });
});

// Watch for theme changes and apply to Vuetify
watch(
  () => themeStore.currentTheme,
  (newTheme) => {
    vuetifyTheme.change(newTheme);
    // Applied theme to Vuetify
  },
  { immediate: true },
);

// Watch for locale changes and update RTL
watch(
  () => locale.value,
  (newLocale) => {
    const shouldBeRTL = isRTL(newLocale);

    // Update Vuetify RTL
    vuetifyLocale.isRtl = shouldBeRTL;

    // Update document direction and language
    document.documentElement.dir = shouldBeRTL ? "rtl" : "ltr";
    document.documentElement.lang = newLocale;

    // Add CSS classes for custom RTL styling
    document.documentElement.classList.toggle("rtl", shouldBeRTL);
    document.documentElement.classList.toggle("ltr", !shouldBeRTL);
    document.body.classList.toggle("rtl", shouldBeRTL);
    document.body.classList.toggle("ltr", !shouldBeRTL);

    // Force a small delay to ensure Vuetify processes the RTL change
    setTimeout(() => {
      // RTL updated
    }, 50);
  },
  { immediate: true },
);

const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
  timeout: 4000,
});

// Function to show snackbar messages (currently not used but may be needed)
// const showMessage = (message, color = "success") => {
//   snackbar.message = message;
//   snackbar.color = color;
//   snackbar.show = true;
//
//   // Auto-hide after timeout
//   setTimeout(() => {
//     snackbar.show = false;
//   }, snackbar.timeout);
// };

// Check authentication status on app load - silently handle failures
authStore.checkAuth().catch(() => {
  // Silently handle initial auth check failure - this is expected for non-authenticated users
});
</script>

<style scoped>
.v-app-bar-title {
  font-weight: 500;
}

/* Global theme transition styles */
:deep(.v-application) {
  transition:
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced card styles for theme support */
:deep(.v-card) {
  transition:
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced button styles */
:deep(.v-btn) {
  transition:
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-version {
  opacity: 0.85;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
}

.simple-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  max-width: 400px;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.toast-success {
  background: #4caf50;
}

.toast-error {
  background: #f44336;
}

.toast-info {
  background: #2196f3;
}

.toast-warning {
  background: #ff9800;
}

.toast-close {
  margin-left: auto;
  opacity: 0.8;
}

.toast-close:hover {
  opacity: 1;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

/* ========================================
   RTL (Right-to-Left) Styles
   ======================================== */

/* Global RTL text alignment for headings */
[dir="rtl"] h1,
[dir="rtl"] h2,
[dir="rtl"] h3,
[dir="rtl"] h4,
[dir="rtl"] h5,
[dir="rtl"] h6,
[dir="rtl"] .v-card-title,
[dir="rtl"] .v-card-subtitle,
[dir="rtl"] .text-h1,
[dir="rtl"] .text-h2,
[dir="rtl"] .text-h3,
[dir="rtl"] .text-h4,
[dir="rtl"] .text-h5,
[dir="rtl"] .text-h6 {
  text-align: right !important;
}

/* RTL paragraph and body text */
[dir="rtl"] p,
[dir="rtl"] .text-body-1,
[dir="rtl"] .text-body-2,
[dir="rtl"] .text-subtitle-1,
[dir="rtl"] .text-subtitle-2,
[dir="rtl"] .v-list-item-title,
[dir="rtl"] .v-list-item-subtitle {
  text-align: right !important;
}

/* RTL margins and padding adjustments */
[dir="rtl"] .mr-2 {
  margin-right: 0 !important;
  margin-left: 8px !important;
}

[dir="rtl"] .mr-4 {
  margin-right: 0 !important;
  margin-left: 16px !important;
}

[dir="rtl"] .ml-2 {
  margin-left: 0 !important;
  margin-right: 8px !important;
}

[dir="rtl"] .ml-4 {
  margin-left: 0 !important;
  margin-right: 16px !important;
}

/* RTL flexbox adjustments */
[dir="rtl"] .d-flex {
  flex-direction: row-reverse;
}

/* Keep specific flex directions for certain components */
[dir="rtl"] .v-app-bar .d-flex,
[dir="rtl"] .appbar-actions {
  flex-direction: row;
}

/* RTL card content alignment */
[dir="rtl"] .v-card-text {
  text-align: right;
}

[dir="rtl"] .text-center {
  text-align: center !important;
}

/* RTL icon positioning */
[dir="rtl"] .v-icon.mr-2 {
  margin-right: 0 !important;
  margin-left: 8px !important;
}

/* RTL button content */
[dir="rtl"] .v-btn .v-btn__content {
  flex-direction: row-reverse;
}

/* RTL app bar adjustments */
[dir="rtl"] .v-app-bar-title .v-icon {
  margin-right: 8px !important;
  margin-left: 0 !important;
}

/* RTL list adjustments */
[dir="rtl"] .v-list-item {
  flex-direction: row-reverse;
}

[dir="rtl"] .v-list-item__prepend {
  margin-right: 0 !important;
  margin-left: 16px !important;
}

/* RTL form and input adjustments */
[dir="rtl"] .v-field__input,
[dir="rtl"] .v-text-field input {
  text-align: right;
}

/* RTL toast notification adjustments */
[dir="rtl"] .toast-close {
  margin-left: 0;
  margin-right: auto;
}

/* RTL specific container adjustments */
[dir="rtl"] .v-container {
  text-align: right;
}

/* Override center alignment when explicitly set */
[dir="rtl"] .text-center,
[dir="rtl"] .justify-center {
  text-align: center !important;
}

/* RTL navigation and menu adjustments */
[dir="rtl"] .v-menu__content {
  text-align: right;
}

/* RTL chip and badge positioning */
[dir="rtl"] .v-chip {
  flex-direction: row-reverse;
}

/* RTL alert content */
[dir="rtl"] .v-alert {
  text-align: right;
}

[dir="rtl"] .v-alert-title {
  text-align: right;
}

/* Reserve space for main content to reduce CLS */
.main-content-stable {
  min-height: 600px; /* Adjust as needed for your typical dashboard height */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
</style>
