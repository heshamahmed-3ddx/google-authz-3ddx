<template>
  <v-app>
    <!-- Route loading is handled by NProgress (top-of-page) -->

    <!-- Navigation Sidebar (lazy-loaded, only when authenticated) -->
    <Suspense>
      <template #default>
        <NavigationSidebar v-if="authStore.isAuthenticated" v-model="drawer" />
      </template>
      <template #fallback>
        <!-- small placeholder for sidebar -->
        <div
          v-if="authStore.isAuthenticated"
          style="width: 64px; height: 100%"
        ></div>
      </template>
    </Suspense>

    <!-- Global loader placed early so it mounts before routed views and local spinners -->
    <GlobalLoader />

    <v-app-bar
      v-if="showAppBar"
      :elevation="0"
      color="white"
      flat
      height="64"
      class="compact-appbar main-appbar"
    >
      <v-app-bar-title
        class="d-flex align-center pa-0 ml-4"
        style="height: 100%"
      >
        <img
          src="/logo.png"
          alt="App Logo"
          style="
            height: 120px;
            width: auto;
            object-fit: contain;
            padding-top: 10px;
          "
        />
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <div class="appbar-actions">
        <LanguageSwitcher />
        <ThemeToggle />
        <v-btn
          v-if="authStore.isAuthenticated"
          variant="text"
          size="small"
          color="secondary"
          icon
          class="logout-btn"
          :aria-label="$t('auth.logout')"
          @click="handleLogout"
        >
          <v-icon size="20">mdi-location-exit</v-icon>
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Breadcrumbs Section -->
    <div v-if="authStore.isAuthenticated && showAppBar" class="breadcrumbs-bar">
      <v-container fluid class="py-2 px-4">
        <div class="d-flex align-center">
          <!-- Menu button for sidebar toggle -->
          <v-btn
            icon
            size="small"
            variant="text"
            class="mr-3"
            @click="drawer = !drawer"
          >
            <v-icon>mdi-menu</v-icon>
          </v-btn>

          <v-breadcrumbs :items="breadcrumbItems" class="pa-0">
            <template #divider>
              <v-icon size="small">mdi-chevron-right</v-icon>
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
          <!-- small inline fallback while async route loads -->
          <div class="route-fallback pa-6">
            <v-skeleton-loader
              type="heading, text"
              width="60%"
            ></v-skeleton-loader>
          </div>
        </template>
      </Suspense>
    </v-main>

    <!-- Global loader overlay (single instance mounted early) -->

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
  </v-app>
</template>

<script setup>
import { reactive, ref, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import ThemeToggle from "@/components/ThemeToggle.vue";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import GlobalLoader from "@/components/GlobalLoader.vue";
import { defineAsyncComponent } from "vue";

// Lazy load heavier components and use Suspense fallbacks
const NavigationSidebar = defineAsyncComponent(
  () => import("@/components/NavigationSidebar.vue"),
);
const DevToolbar = defineAsyncComponent(
  () => import("@/components/DevToolbar.vue"),
);
import { useI18n } from "vue-i18n";
import { useTheme, useLocale } from "vuetify";
import { isRTL } from "@/i18n";
import rootPkg from "../../package.json";

const authStore = useAuthStore();
const themeStore = useThemeStore();
const { locale, t } = useI18n();
const appVersion = rootPkg.version || "";
const vuetifyTheme = useTheme();
const vuetifyLocale = useLocale();
const router = useRouter();
const route = useRoute();

// Hide AppBar on login/home page
const showAppBar = computed(() => {
  return route.name !== 'Home' && route.path !== '/';
});

// Toggle language between 'en' and 'ar'
function toggleLanguage() {
  const current = String(locale.value || "").toLowerCase();
  const isEnglish = current.startsWith("en");
  locale.value = isEnglish ? "ar" : "en";
}

// Display short locale for button (EN/AR)
const displayLocale = computed(() => {
  const current = String(locale.value || "").toLowerCase();
  if (current.startsWith("en")) return "EN";
  if (current.startsWith("ar")) return "AR";
  return "EN";
});

// Toggle theme between 'light' and 'dark'
function toggleTheme() {
  themeStore.currentTheme =
    themeStore.currentTheme === "light" ? "dark" : "light";
  vuetifyTheme.change(themeStore.currentTheme);
}

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
      await router.push({ name: "Home" });
    } catch (navErr) {
      // Fallback to root path
      window.location.href = "/";
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Logout flow failed:", error);
    // As a last resort, force redirect to root
    window.location.href = "/";
  }
};

// Drawer state - hidden by default, user can open when needed
const drawer = ref(false);

// Route loading handled globally with NProgress in main.js

// Breadcrumb items computed from current route
const breadcrumbItems = computed(() => {
  const items = [];

  // Add home
  items.push({
    title: t("nav.home"),
    disabled: false,
    href: "/dashboard",
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
  } else if (route.name && route.name !== "dashboard") {
    // Generate breadcrumb from route name
    const routeName = String(route.name).replace(/-/g, " ");
    items.push({
      title: routeName.charAt(0).toUpperCase() + routeName.slice(1),
      disabled: true,
    });
  }

  return items;
});

// Route loading handled globally with NProgress (main.js)

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
    vuetifyLocale.isRtl = shouldBeRTL;
    document.documentElement.dir = shouldBeRTL ? "rtl" : "ltr";
    document.documentElement.lang = newLocale;
    document.documentElement.classList.toggle("rtl", shouldBeRTL);
    document.documentElement.classList.toggle("ltr", !shouldBeRTL);
    document.body.classList.toggle("rtl", shouldBeRTL);
    document.body.classList.toggle("ltr", !shouldBeRTL);
    setTimeout(() => {}, 50);
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

.compact-appbar :deep(.v-toolbar__content) {
  padding-left: 4px !important;
  padding-right: 8px !important;
}

/* Main app bar without border - breadcrumbs will have the border */
.main-appbar :deep(.v-app-bar) {
  border-bottom: none !important;
}

/* Breadcrumbs bar styling */
.breadcrumbs-bar {
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 64px;
  z-index: 100;
}

.v-theme--dark .breadcrumbs-bar {
  background: #1e1e1e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.breadcrumbs-bar :deep(.v-breadcrumbs) {
  padding: 0;
}

.breadcrumbs-bar :deep(.v-breadcrumbs-item) {
  font-size: 0.875rem;
}

.breadcrumbs-bar :deep(.v-breadcrumbs-item--disabled) {
  color: rgba(0, 0, 0, 0.6);
}

.v-theme--dark .breadcrumbs-bar :deep(.v-breadcrumbs-item--disabled) {
  color: rgba(255, 255, 255, 0.6);
}

/* RTL support for breadcrumbs */
[dir="rtl"] .breadcrumbs-bar .d-flex {
  flex-direction: row-reverse;
}

[dir="rtl"] .breadcrumbs-bar .mr-3 {
  margin-right: 0 !important;
  margin-left: 12px !important;
}

[dir="rtl"] .breadcrumbs-bar :deep(.v-breadcrumbs) {
  direction: rtl;
}

[dir="rtl"] .breadcrumbs-bar :deep(.v-breadcrumbs-divider) {
  transform: scaleX(-1);
}

/* Flat Design - Remove all shadows and elevations */
:deep(.v-app-bar) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: none !important;
}

.v-theme--dark :deep(.v-app-bar) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
.appbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 20px;
}

[dir="rtl"] .appbar-actions {
  padding-right: 0;
  padding-left: 20px;
}

/* Logout button */
.logout-btn {
  min-width: 36px !important;
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
}

.logout-btn .v-icon {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logout-btn:hover .v-icon {
  transform: translateX(3px);
}

[dir="rtl"] .logout-btn:hover .v-icon {
  transform: translateX(-3px);
}
</style>
