<template>
  <v-app>
    <v-app-bar
      v-if="showAppBar"
      :elevation="0"
      :color="themeStore.isDark ? '#1e1e1e' : '#ffffff'"
      flat
      height="56"
      class="minimal-appbar main-appbar sharp-appbar"
    >
      <v-app-bar-title
        class="d-flex align-center pa-0 minimal-logo-container"
      >
        <img
          src="/logo.png"
          alt="App Logo"
          class="minimal-logo"
        />
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <div class="minimal-appbar-actions">
        <!-- Menu button for overlay sidebar -->
        <v-tooltip location="bottom" :disabled="false">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-if="authStore.isAuthenticated"
              v-bind="tooltipProps"
              icon
              size="small"
              variant="text"
              :class="['minimal-icon-btn', 'apps-menu-btn', { active: overlaySidebarOpen }]"
              @click="overlaySidebarOpen = !overlaySidebarOpen"
            >
              <v-icon size="20">mdi-apps</v-icon>
            </v-btn>
          </template>
          <span>{{ t('app.navigation') || 'App Navigation' }}</span>
        </v-tooltip>
       
        <ThemeToggle />
        <v-tooltip location="bottom" :disabled="false">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-if="authStore.isAuthenticated"
              v-bind="tooltipProps"
              variant="text"
              size="small"
              icon
              class="minimal-icon-btn logout-btn"
              :aria-label="$t('auth.logout')"
              @click="handleLogout"
            >
              <v-icon size="20">mdi-logout</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('auth.logout') || 'Logout' }}</span>
        </v-tooltip>
      </div>
    </v-app-bar>

    <!-- Breadcrumbs Section -->
    <div v-if="authStore.isAuthenticated && showAppBar && route.name !== 'Home' && route.name !== 'Callback'" class="minimal-breadcrumbs-bar">
      <v-container fluid class="py-0 px-3">
        <div class="d-flex align-center breadcrumb-wrapper">
          <v-breadcrumbs 
            :items="breadcrumbItems" 
            :key="`breadcrumbs-${locale}-${isRtlComputed}`"
            class="pa-0 minimal-breadcrumbs" 
            density="compact"
          >
            <template #divider>
              <v-icon size="x-small" class="breadcrumb-divider">
                {{ isRtlComputed ? 'mdi-chevron-left' : 'mdi-chevron-right' }}
              </v-icon>
            </template>
          </v-breadcrumbs>
        </div>
      </v-container>
    </div>

    <v-main class="main-content-stable">
      <Suspense>
        <template #default>
          <router-view />
        </template>
        <template #fallback>
          <div class="fill-height d-flex align-center justify-center">
            <div class="text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
                class="mb-4"
              ></v-progress-circular>
              <div class="text-body-2 text-medium-emphasis">
                {{ $t("common.loading") || "Loading..." }}
              </div>
            </div>
          </div>
        </template>
      </Suspense>
    </v-main>

    <!-- Overlay Sidebar -->
    <Suspense>
      <template #default>
        <OverlaySidebar
          v-if="authStore.isAuthenticated"
          v-model="overlaySidebarOpen"
        />
      </template>
      <template #fallback>
        <!-- Sidebar placeholder -->
      </template>
    </Suspense>

    <!-- Development Toolbar (lazy-loaded in Suspense) -->
    <Suspense>
      <template #default>
        <DevToolbar v-if="authStore.isAuthenticated" />
      </template>
      <template #fallback>
        <!-- dev toolbar placeholder -->
        <div v-if="authStore.isAuthenticated" style="height: 48px"></div>
      </template>
    </Suspense>

    <div
      v-if="snackbar.show"
      :class="['simple-toast', `toast-${snackbar.color}`]"
      @click="snackbar.show = false"
    >
      {{ snackbar.message }}
      <v-icon class="toast-close" size="small">mdi-close</v-icon>
    </div>

    <!-- PWA Update Prompt -->
    <PWAUpdatePrompt />

    <!-- Footer -->
    <v-footer
      v-if="authStore.isAuthenticated && showAppBar"
      app
      :color="themeStore.isDark ? '#1e1e1e' : '#ffffff'"
      class="app-footer"
      height="36"
    >
      <div class="footer-content">
        <span class="footer-text">v{{ appVersion }}</span>
        <span class="footer-divider">•</span>
        <span class="footer-text">Powered by 3DDX</span>
        <span class="footer-divider">•</span>
        <span class="footer-text">{{ currentYear }}</span>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup>
import { reactive, ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import ThemeToggle from "@/components/ThemeToggle.vue";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt.vue";
import { defineAsyncComponent } from "vue";
import pkg from "../../package.json";

// Lazy load heavier components and use Suspense fallbacks
const OverlaySidebar = defineAsyncComponent(
  () => import("@/components/OverlaySidebar.vue"),
);
const DevToolbar = defineAsyncComponent(
  () => import("@/components/DevToolbar.vue"),
);
import { useI18n } from "vue-i18n";
import { useTheme, useLocale } from "vuetify";
import { nextTick } from "vue";

const authStore = useAuthStore();
const themeStore = useThemeStore();
const { locale, t } = useI18n();
const vuetifyTheme = useTheme();
const vuetifyLocale = useLocale();
const router = useRouter();
const route = useRoute();
const appVersion = pkg.version || "1.1.0";
const currentYear = new Date().getFullYear();

// Hide AppBar on login page (landing page)
const showAppBar = computed(() => {
  return route.name !== "Login" && route.path !== "/";
});


// Logout handler - robust: clear local state, attempt server logout, then redirect
const handleLogout = async () => {
  try {
    // Optimistically clear client-side state so UI updates immediately
    try {
      authStore.user = null;
      authStore.tokens = null;
    } catch (e) {
      // ignore if store is implemented with getters/setters
    }

    // Attempt server-side logout but don't block the UX
    try {
      await authStore.logout();
    } catch (err) {
      // Log silently and continue with redirect
      // eslint-disable-next-line no-console
      console.warn("Server logout failed (non-blocking):", err);
    }

    // Ensure navigation even if logout threw - go to public Home page
    try {
      await router.push({ name: "Login" });
    } catch (navErr) {
      // Fallback to router push to login; as a last resort use location
      try {
        await router.push({ path: "/" });
      } catch (e) {
        // Router navigation failed. Log a warning but avoid forcing a full page reload.
        // A forced reload here would discard app state; keep user on current page.
        // If you intentionally want to force a full reload in some environments,
        // re-enable `window.location.href = '/'` here.
        // eslint-disable-next-line no-console
        console.warn("Navigation fallback to root failed, not reloading.", e);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Logout flow failed:", error);
    // As a last resort try router navigation then force redirect
    try {
      await router.push({ path: "/login" });
    } catch (e) {
      // Router navigation failed to redirect to root; avoid full reload.
      // eslint-disable-next-line no-console
      console.warn("Final navigation attempt to root failed, not reloading.", e);
    }
  }
};

// Overlay sidebar state
const overlaySidebarOpen = ref(false);

// Listen for custom event from WelcomeView to open overlay sidebar
const handleOpenOverlaySidebar = () => {
  overlaySidebarOpen.value = true;
};

onMounted(() => {
  window.addEventListener('openOverlaySidebar', handleOpenOverlaySidebar);
});

onBeforeUnmount(() => {
  window.removeEventListener('openOverlaySidebar', handleOpenOverlaySidebar);
});

// Computed property for RTL state - reactive to locale changes
const isRtlComputed = computed(() => {
  return vuetifyLocale.isRtl.value;
});

// Breadcrumb items computed from current route
const breadcrumbItems = computed(() => {
  // Don't show breadcrumbs if we're on the home page or callback page
  if (route.name === "Home" || route.name === "home" || route.name === "Callback") {
    return [];
  }

  const items = [];

  // Add home - use 'to' instead of 'href' for Vue Router navigation (no page refresh)
  items.push({
    title: t("nav.home"),
    disabled: false,
    to: "/home",
  });

  // Add current route breadcrumbs
  if (route.meta?.breadcrumb) {
    let breadcrumbTitle = route.meta.breadcrumb;
    if (typeof breadcrumbTitle === "function") {
      breadcrumbTitle = breadcrumbTitle(t);
    }
    items.push({
      title: breadcrumbTitle,
      disabled: true,
    });
  } else if (route.name && route.name !== "home" && route.name !== "Home") {
    // Generate breadcrumb from route name
    const routeName = String(route.name).replace(/-/g, " ");
    items.push({
      title: routeName.charAt(0).toUpperCase() + routeName.slice(1),
      disabled: true,
    });
  }

  return items;
});

// Initialize theme from store (which loads from localStorage)
// and apply to Vuetify immediately
vuetifyTheme.change(themeStore.currentTheme);

// Watch for theme changes and apply to Vuetify
watch(
  () => themeStore.currentTheme,
  (newTheme) => {
    vuetifyTheme.change(newTheme);
    // Also update document class for Vuetify theme
    if (newTheme === "dark") {
      document.documentElement.classList.add("v-theme--dark");
    } else {
      document.documentElement.classList.remove("v-theme--dark");
    }
  },
  { immediate: true },
);

// Watch for locale changes and update Vuetify locale (which handles RTL automatically)
watch(
  () => locale.value,
  async (newLocale) => {
    // Update Vuetify locale - this will automatically update RTL based on locale.rtl config
    vuetifyLocale.current.value = newLocale;
    
    // Wait for Vuetify to update
    await nextTick();
    
    // Wait one more tick to ensure all reactive updates propagate
    await nextTick();
    
    // Get the RTL state from Vuetify (it's now reactive based on locale.current)
    const shouldBeRTL = vuetifyLocale.isRtl.value;
    
    // Update document direction to match Vuetify's RTL state
    document.documentElement.dir = shouldBeRTL ? "rtl" : "ltr";
    document.documentElement.lang = newLocale;
    
    // Remove old direction classes first
    document.documentElement.classList.remove("rtl", "ltr");
    document.body.classList.remove("rtl", "ltr");
    
    // Add new direction classes
    if (shouldBeRTL) {
      document.documentElement.classList.add("rtl");
      document.body.classList.add("rtl");
    } else {
      document.documentElement.classList.add("ltr");
      document.body.classList.add("ltr");
    }
    
    // Force a re-render by triggering multiple events for components that might need it
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("localechange"));
    
    // Force Vue to recognize the change
    await nextTick();
  },
  { immediate: true },
);

// Watch route changes to update document title
watch(
  () => route.fullPath,
  () => {
    let pageTitle = "";
    if (route.meta?.breadcrumb) {
      pageTitle =
        typeof route.meta.breadcrumb === "function"
          ? route.meta.breadcrumb(t)
          : route.meta.breadcrumb;
    } else if (route.name) {
      pageTitle = String(route.name).replace(/-/g, " ");
      pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
    } else {
      pageTitle = t("navigation.home");
    }
    document.title = `InsightHub | ${pageTitle}`;
  },
  { immediate: true },
);

const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
  timeout: 4000,
});

// Check authentication status on app load - silently handle failures
authStore.checkAuth();
</script>

<style scoped>
/* Global font settings */
:deep(.v-application) {
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif !important;
}

:deep([dir="rtl"] .v-application),
:deep([dir="rtl"]) * {
  font-family:
    "Tajawal",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif !important;
}

/* Apply fonts to all text elements */
:deep(h1),
:deep(h2),
:deep(h3),
:deep(h4),
:deep(h5),
:deep(h6),
:deep(.text-h1),
:deep(.text-h2),
:deep(.text-h3),
:deep(.text-h4),
:deep(.text-h5),
:deep(.text-h6),
:deep(.text-subtitle-1),
:deep(.text-subtitle-2),
:deep(.text-body-1),
:deep(.text-body-2),
:deep(.text-caption),
:deep(.text-overline),
:deep(.v-card-title),
:deep(.v-card-subtitle),
:deep(.v-card-text),
:deep(.v-list-item-title),
:deep(.v-list-item-subtitle),
:deep(.v-btn),
:deep(.v-chip),
:deep(.v-tab),
:deep(p),
:deep(span),
:deep(div),
:deep(label) {
  font-family: inherit !important;
}

.v-app-bar-title {
  font-weight: 500;
}

/* Minimal Professional Appbar */
.minimal-appbar {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.minimal-appbar :deep(.v-toolbar__content) {
  height: 56px !important;
}

.minimal-logo-container {
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 0 !important;
}

.minimal-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
  max-width: 250px;
  margin-top: 4px; /* Move logo down slightly */
}

/* Main app bar without border - breadcrumbs will have the border */
.main-appbar :deep(.v-app-bar),
.v-application .main-appbar :deep(.v-app-bar),
.v-theme--dark .main-appbar :deep(.v-app-bar),
.v-theme--dark .v-application .main-appbar :deep(.v-app-bar) {
  border-bottom: none !important;
  border-radius: 0 !important;
}

.main-appbar :deep(.v-toolbar),
.v-application .main-appbar :deep(.v-toolbar),
.v-theme--dark .main-appbar :deep(.v-toolbar),
.v-theme--dark .v-application .main-appbar :deep(.v-toolbar) {
  border-radius: 0 !important;
}

/* Sharp edges for appbar - override all border-radius */
.sharp-appbar,
.sharp-appbar :deep(.v-app-bar),
.sharp-appbar :deep(.v-toolbar),
.sharp-appbar :deep(.v-toolbar__content),
.sharp-appbar :deep(.v-toolbar__prepend),
.sharp-appbar :deep(.v-toolbar__append),
.v-application .sharp-appbar,
.v-application .sharp-appbar :deep(.v-app-bar),
.v-application .sharp-appbar :deep(.v-toolbar),
.v-theme--dark .sharp-appbar,
.v-theme--dark .sharp-appbar :deep(.v-app-bar),
.v-theme--dark .sharp-appbar :deep(.v-toolbar),
.v-theme--dark .v-application .sharp-appbar,
.v-theme--dark .v-application .sharp-appbar :deep(.v-app-bar),
.v-theme--dark .v-application .sharp-appbar :deep(.v-toolbar) {
  border-radius: 0 !important;
}

/* Minimal Breadcrumbs bar styling */
.minimal-breadcrumbs-bar {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  position: sticky;
  top: 56px;
  z-index: 100;
  min-height: 36px;
  max-height: 36px;
}

.minimal-breadcrumbs-bar :deep(.v-container) {
  min-height: auto !important;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.minimal-breadcrumbs-bar :deep(.v-container > .breadcrumb-wrapper) {
  height: 100%;
  align-items: center;
  width: 100%;
}

.minimal-breadcrumbs {
  padding: 0;
  min-height: 28px;
  height: 28px;
  display: flex;
  align-items: center;
}

.minimal-breadcrumbs :deep(.v-breadcrumbs-item) {
  font-size: 0.8125rem;
  line-height: 1.4;
  padding: 4px 6px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-weight: 400;
  transition: color 0.15s ease;
}

.minimal-breadcrumbs :deep(.v-breadcrumbs-item:hover) {
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.minimal-breadcrumbs :deep(.v-breadcrumbs-item--disabled) {
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-weight: 500;
}

.breadcrumb-divider {
  color: rgba(var(--v-theme-on-surface), 0.3) !important;
  margin: 0 4px;
  font-size: 0.75rem;
}

.minimal-breadcrumbs :deep(.v-breadcrumbs-item--disabled) {
  color: rgba(var(--v-theme-on-surface), 0.5);
}

/* RTL support for minimal breadcrumbs */
.breadcrumb-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

/* RTL: Align breadcrumbs container to the right */
[dir="rtl"] .minimal-breadcrumbs-bar :deep(.v-container) {
  justify-content: flex-end !important;
}

[dir="rtl"] .breadcrumb-wrapper {
  justify-content: flex-end;
}

/* Flat Design - Remove all shadows and elevations */
:deep(.v-app-bar) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: none !important;
  border-radius: 0 !important;
}

.v-theme--dark :deep(.v-app-bar),
.v-theme--dark .v-application :deep(.v-app-bar),
.v-theme--dark .v-application .v-app-bar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0 !important;
}

:deep(.v-card) {
  box-shadow: none !important;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--border-radius-md) !important;
}

.v-theme--dark :deep(.v-card) {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

:deep(.v-btn) {
  box-shadow: none !important;
  border-radius: var(--border-radius-sm) !important;
  text-transform: none;
}

:deep(.v-btn:hover) {
  box-shadow: none !important;
}

:deep(.v-app-bar-nav-icon) {
  border-radius: var(--border-radius-sm) !important;
}

:deep(.v-navigation-drawer) {
  box-shadow: none !important;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

.v-theme--dark :deep(.v-navigation-drawer) {
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

:deep(.v-data-table) {
  box-shadow: none !important;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.v-theme--dark :deep(.v-data-table) {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

:deep(.v-dialog > .v-overlay__content) {
  box-shadow: none !important;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--border-radius-md) !important;
}

.v-theme--dark :deep(.v-dialog > .v-overlay__content) {
  border: 1px solid rgba(255, 255, 255, 0.12);
}

:deep(.v-menu > .v-overlay__content) {
  box-shadow: none !important;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--border-radius-md) !important;
}

.v-theme--dark :deep(.v-menu > .v-overlay__content) {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

:deep(.v-text-field .v-field) {
  border-radius: var(--border-radius-sm) !important;
}

:deep(.v-select .v-field) {
  border-radius: var(--border-radius-sm) !important;
}

:deep(.v-chip) {
  border-radius: var(--border-radius-md) !important;
}

:deep(.v-tabs) {
  border-radius: var(--border-radius-md) !important;
}

:deep(.v-tab) {
  border-radius: var(--border-radius-sm) !important;
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
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced button styles */
:deep(.v-btn) {
  transition:
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

/* Appbar actions */
.minimal-appbar-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  padding-right: 8px;
}

[dir="rtl"] .minimal-appbar-actions {
  padding-right: 0;
  padding-left: 8px;
}

/* Minimal Professional Icon Button Base Styles */
.minimal-icon-btn {
  min-width: 36px !important;
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  border-radius: 6px !important;
  transition: all 0.15s ease !important;
  position: relative;
}

.minimal-icon-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 6px;
  background: transparent;
  transition: background-color 0.15s ease;
  z-index: 0;
}

.minimal-icon-btn:hover::before {
  background: rgba(0, 0, 0, 0.04);
}

.v-theme--dark .minimal-icon-btn:hover::before {
  background: rgba(255, 255, 255, 0.06);
}

.minimal-icon-btn .v-icon {
  position: relative;
  z-index: 1;
  transition: all 0.15s ease;
}

/* Apps Menu Button */
.apps-menu-btn {
  color: #ff8c00 !important;
}

.v-theme--dark .apps-menu-btn {
  color: #ffb74d !important;
}

.apps-menu-btn .v-icon {
  color: inherit !important;
}

.apps-menu-btn:hover {
  background: rgba(255, 140, 0, 0.1) !important;
  transform: translateY(-1px);
}

.v-theme--dark .apps-menu-btn:hover {
  background: rgba(255, 183, 77, 0.15) !important;
}

.apps-menu-btn:hover .v-icon {
  transform: scale(1.15) rotate(90deg);
  color: #e65100 !important;
}

.v-theme--dark .apps-menu-btn:hover .v-icon {
  color: #ffcc80 !important;
}

.apps-menu-btn:active {
  transform: translateY(0);
}

/* Logout Button - Minimal */
.logout-btn {
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
}

.v-theme--dark .logout-btn {
  color: rgba(255, 255, 255, 0.6) !important;
}

.logout-btn .v-icon {
  color: inherit !important;
}

.logout-btn:hover {
  color: rgba(244, 67, 54, 0.8) !important;
  background: rgba(244, 67, 54, 0.08) !important;
}

.v-theme--dark .logout-btn:hover {
  color: rgba(244, 67, 54, 0.9) !important;
  background: rgba(244, 67, 54, 0.12) !important;
}

.logout-btn:hover .v-icon {
  transform: scale(1.05);
  color: inherit !important;
}

/* Active state for menu button when sidebar is open */
.apps-menu-btn.active {
  background: rgba(255, 140, 0, 0.15) !important;
}

.v-theme--dark .apps-menu-btn.active {
  background: rgba(255, 183, 77, 0.2) !important;
}

/* Footer Styles */
.app-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0 16px;
}

.v-theme--dark .app-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.v-theme--dark .footer-content {
  color: rgba(255, 255, 255, 0.6);
}

.footer-text {
  font-weight: 400;
}

.footer-divider {
  color: rgba(0, 0, 0, 0.3);
}

.v-theme--dark .footer-divider {
  color: rgba(255, 255, 255, 0.3);
}
</style>
