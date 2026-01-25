<template>
  <Teleport to="body">
    <v-overlay
      :model-value="modelValue"
      class="sidebar-overlay"
      scrim="rgba(0, 0, 0, 0.5)"
      persistent
      @click:outside="closeSidebar"
    >
      <v-card class="sidebar-card" @click.stop.prevent>
        <!-- Content Container -->
        <div class="overlay-content" @click.stop.prevent>
          <div class="overlay-content-wrapper" @click.stop.prevent>
            <!-- User Profile Section with Logout -->
            <div v-if="userProfile" class="user-profile-section">
              <v-avatar size="48" class="profile-avatar" color="primary">
                <img
                  v-if="userProfile.picture && !imageError"
                  :src="userProfile.picture"
                  :alt="userProfile.name"
                  class="profile-image"
                  @error="imageError = true"
                  @load="imageError = false"
                />
                <span v-else class="profile-initials">{{
                  getInitials(userProfile.name)
                }}</span>
              </v-avatar>
              <div class="profile-info">
                <div class="profile-name">{{ userProfile.name }}</div>
                <div v-if="userProfile.jobTitle" class="profile-job-title">
                  {{ userProfile.jobTitle }}
                </div>
              </div>
              <v-btn
                variant="text"
                size="small"
                icon="mdi-logout"
                class="profile-logout-btn"
                @click="handleLogout"
              >
                <v-icon size="18">mdi-logout</v-icon>
                <v-tooltip activator="parent" location="bottom">{{
                  $t("nav.logout")
                }}</v-tooltip>
              </v-btn>
            </div>

            <v-divider v-if="userProfile" class="profile-divider"></v-divider>

            <!-- Search Filter -->
            <div class="search-input-wrapper">
              <v-text-field
                v-model="searchQuery"
                :placeholder="
                  t('nav.searchPlaceholder') || 'Search navigation...'
                "
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                density="compact"
                hide-details
                clearable
                class="search-input"
                flat
                @click.stop
              ></v-text-field>
            </div>

            <!-- Navigation Grid Container -->
            <div class="navigation-grid-container">
              <!-- No Results Message -->
              <div
                v-if="searchQuery && flattenedNavigation.length === 0"
                class="no-results-message"
              >
                <v-icon size="48" class="no-results-icon">mdi-magnify</v-icon>
                <div class="no-results-text">
                  <div class="no-results-title">
                    {{ $t("nav.noResults") || "No results found" }}
                  </div>
                  <div class="no-results-subtitle">
                    {{
                      $t("nav.noResultsSubtitle") ||
                      "Try adjusting your search terms"
                    }}
                  </div>
                </div>
              </div>

              <!-- Navigation Items -->
              <div v-else class="navigation-grid-wrapper">
                <template v-for="item in flattenedNavigation" :key="item.id">
                  <!-- Section Header -->
                  <v-list-subheader
                    v-if="item.isSectionHeader"
                    class="section-header"
                    :style="{ gridColumn: '1 / -1' }"
                  >
                    <v-icon size="16" class="section-icon">{{
                      item.icon
                    }}</v-icon>
                    <span class="section-title">
                      {{ $t("navigation." + item.id) }}
                    </span>
                    <v-divider class="section-separator-line"></v-divider>
                  </v-list-subheader>

                  <!-- Navigation Item -->
                  <v-list-item
                    v-else
                    :to="item.route"
                    :active="isActiveRoute(item.route)"
                    class="nav-list-item"
                    :class="{
                      'nav-list-item-active': isActiveRoute(item.route),
                    }"
                  >
                    <template #prepend>
                      <div class="tile-icon-wrapper">
                        <v-icon
                          :icon="item.icon"
                          size="22"
                          class="nav-tile-icon"
                        ></v-icon>
                      </div>
                    </template>
                    <v-list-item-title class="nav-tile-label">
                      {{ $t("navigation." + item.id) }}
                    </v-list-item-title>
                    <template #append>
                      <v-badge
                        v-if="item.badge"
                        :content="item.badge.text"
                        :color="item.badge.color"
                        size="x-small"
                        class="nav-badge"
                      ></v-badge>
                      <v-icon
                        v-else-if="isActiveRoute(item.route)"
                        size="16"
                        class="nav-active-indicator"
                        >mdi-check-circle</v-icon
                      >
                    </template>
                  </v-list-item>
                </template>
              </div>
            </div>

            <!-- Footer Actions -->
            <v-divider v-if="isAdmin" class="footer-divider-top"></v-divider>
            <v-list v-if="isAdmin" class="footer-list">
              <v-list-item
                to="/system/settings"
                class="footer-list-item"
                @click="onItemClick"
              >
                <template #prepend>
                  <v-icon>mdi-cog</v-icon>
                </template>
                <v-list-item-title>{{ $t("nav.settings") }}</v-list-item-title>
              </v-list-item>
            </v-list>

            <!-- Bottom safe space -->
            <div class="bottom-safe-space"></div>
          </div>
        </div>
      </v-card>
    </v-overlay>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useDevModeStore } from "@/stores/devMode";
import { useI18n } from "vue-i18n";
import {
  NAVIGATION_CONFIG,
  filterNavigationByPermissions,
} from "@/config/navigationConfig";

// Props & Emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

// Composables
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const devModeStore = useDevModeStore();
const { locale, t } = useI18n();

// State
const userGroups = ref([]);
const searchQuery = ref("");
const imageError = ref(false);

// Computed
const userProfile = computed(() => {
  const details = authStore.cachedUserDetails || authStore.user;
  if (!details) return null;

  // Try multiple possible picture fields
  let picture = null;

  // Priority 1: Check session user picture (from OAuth - this is the most reliable)
  if (authStore.user?.picture) {
    picture = authStore.user.picture;
  }
  // Priority 2: Check cached details picture field
  else if (details.picture) {
    picture = details.picture;
  }
  // Priority 3: Check photos array
  else if (
    details.photos &&
    Array.isArray(details.photos) &&
    details.photos.length > 0
  ) {
    const photo = details.photos.find((p) => p.primary) || details.photos[0];
    picture = photo?.value || photo?.url;
  }
  // Priority 4: Check thumbnailPhotoUrl (from Google Directory API - might be base64)
  else if (details.thumbnailPhotoUrl) {
    const thumb = details.thumbnailPhotoUrl;
    // If it's already a data URL
    if (thumb.startsWith("data:")) {
      picture = thumb;
    }
    // If it's a regular URL
    else if (thumb.startsWith("http://") || thumb.startsWith("https://")) {
      picture = thumb;
    }
    // If it's base64 encoded (common for Google Directory API)
    else {
      // Convert base64 to data URL
      picture = `data:image/jpeg;base64,${thumb}`;
    }
  }
  // Priority 5: Check photoUrl
  else if (details.photoUrl) {
    picture = details.photoUrl;
  }

  return {
    name: details.fullName || details.name || "",
    picture: picture,
    jobTitle: details.jobTitle || details.title || null,
    email: details.email || details.primaryEmail || "",
  };
});

const isAdmin = computed(() => {
  return userGroups.value.includes("admin");
});

// Merge actual groups with simulated groups (dev mode only)
const effectiveGroups = computed(() => {
  return devModeStore.getMergedGroups(userGroups.value);
});

const filteredNavigation = computed(() => {
  return filterNavigationByPermissions(
    NAVIGATION_CONFIG,
    effectiveGroups.value,
  );
});

// Flatten navigation for grid display
const flattenedNavigation = computed(() => {
  const flattened = [];
  const query = searchQuery.value.toLowerCase().trim();

  filteredNavigation.value.forEach((item) => {
    // Add section header for groups
    if (item.children && item.children.length > 0) {
      // Filter children based on search query
      const filteredChildren = item.children.filter((child) => {
        if (!query) return true;
        const childTitle = t("navigation." + child.id).toLowerCase();
        const childRoute = (child.route || "").toLowerCase();
        return childTitle.includes(query) || childRoute.includes(query);
      });

      // Only show section header if it has matching children or matches search
      const sectionTitle = t("navigation." + item.id).toLowerCase();
      const sectionMatches = !query || sectionTitle.includes(query);

      if (filteredChildren.length > 0 || sectionMatches) {
        if (sectionMatches || filteredChildren.length > 0) {
          flattened.push({
            ...item,
            isSectionHeader: true,
          });
        }

        // Add filtered child items
        filteredChildren.forEach((child) => {
          flattened.push(child);
        });
      }
    } else {
      // Filter standalone items
      if (!query) {
        flattened.push(item);
      } else {
        const itemTitle = t("navigation." + item.id).toLowerCase();
        const itemRoute = (item.route || "").toLowerCase();
        if (itemTitle.includes(query) || itemRoute.includes(query)) {
          flattened.push(item);
        }
      }
    }
  });

  return flattened;
});

// Methods

function isActiveRoute(itemRoute) {
  if (!itemRoute) return false;
  return route.path === itemRoute || route.path.startsWith(`${itemRoute}/`);
}

function closeSidebar(event) {
  // Prevent closing if user is selecting text
  if (
    event &&
    window.getSelection &&
    window.getSelection().toString().length > 0
  ) {
    return;
  }
  emit("update:modelValue", false);
}

function onItemClick() {
  closeSidebar();
}

async function handleLogout() {
  try {
    await authStore.logout();
    closeSidebar();
    router.push("/");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Logout failed:", error);
  }
}

function handleEscapeKey(event) {
  if (event.key === "Escape" && props.modelValue) {
    closeSidebar();
  }
}

function loadUserGroups() {
  try {
    // Load user groups for permission checks
    if (authStore.cachedUserRights) {
      userGroups.value = authStore.cachedUserRights.groups || [];
    } else if (authStore.user?.groups) {
      userGroups.value = authStore.user.groups;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to load user groups:", error);
  }
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Lifecycle
onMounted(() => {
  loadUserGroups();
  document.addEventListener("keydown", handleEscapeKey);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscapeKey);
});

// Watch for auth store updates
watch(
  () => authStore.cachedUserRights || authStore.user?.groups,
  () => {
    if (authStore.cachedUserRights?.groups) {
      userGroups.value = authStore.cachedUserRights.groups;
    } else if (authStore.user?.groups) {
      userGroups.value = authStore.user.groups;
    }
  },
  { immediate: true },
);

// Reset image error when profile changes
watch(
  () => userProfile.value?.picture,
  () => {
    imageError.value = false;
  },
);

// Close sidebar when route changes (after navigation completes)
// This ensures sidebar stays open during navigation, then closes smoothly
let routeChangeTimer = null;
watch(
  () => route.path,
  (newPath, oldPath) => {
    // Clear any existing timer
    if (routeChangeTimer) {
      clearTimeout(routeChangeTimer);
    }

    // Only close if sidebar is open and route actually changed
    if (props.modelValue && newPath !== oldPath && oldPath) {
      // Wait for route transition to start before closing sidebar
      // This prevents the "sidebar disappears, wait, then navigate" issue
      routeChangeTimer = setTimeout(() => {
        emit("update:modelValue", false);
        routeChangeTimer = null;
      }, 200); // Small delay to allow route transition to begin
    }
  },
  { immediate: false },
);

// Prevent body scroll when sidebar is open
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      loadUserGroups();
    } else {
      document.body.style.overflow = "";
    }
  },
);
</script>

<style scoped>
/* ========================================
   SIDEBAR OVERLAY (Vuetify v-overlay)
   ======================================== */
.sidebar-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 2000 !important;
}

.sidebar-overlay :deep(.v-overlay__scrim) {
  background-color: rgba(0, 0, 0, 0.5) !important;
  cursor: pointer;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-card {
  cursor: default;
  pointer-events: auto;
}

.sidebar-overlay :deep(.v-overlay__content) {
  width: auto !important;
  height: 100vh !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  display: flex !important;
  align-items: stretch !important;
  justify-content: flex-start !important; /* Both LTR and RTL: Sidebar on left */
  overflow: hidden !important;
  left: 0 !important;
  right: auto !important;
}

.sidebar-overlay :deep(.v-overlay__content) {
  justify-content: flex-start !important;
}

.sidebar-card {
  width: 480px !important;
  max-width: 85vw !important;
  height: 100vh !important;
  background-color: rgb(var(--v-theme-surface)) !important;
  border-radius: 0 !important;
  display: flex !important;
  flex-direction: column;
  overflow: hidden;
  position: relative !important;
  margin: 0 !important;
  padding: 0;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  transform: translateX(0);
  animation: slideInFromLeft 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@media (max-width: 600px) {
  .sidebar-card {
    width: 100vw !important;
    max-width: 100vw !important;
  }
}

.sidebar-card :deep(.v-card-text) {
  display: none;
}

.v-theme--light .sidebar-card {
  background-color: #ffffff !important;
}

.v-theme--dark .sidebar-card {
  background-color: #1e1e1e !important;
}

/* RTL Support */
.sidebar-card.rtl-card {
  direction: rtl;
}

.sidebar-card.rtl-card .overlay-content {
  direction: rtl;
}

.sidebar-card.rtl-card .navigation-grid-wrapper {
  direction: ltr;
}

.sidebar-card.rtl-card .section-header {
  direction: rtl;
}

.sidebar-card.rtl-card .nav-list-item {
  direction: rtl;
}

/* ========================================
   CONTENT CONTAINER
   ======================================== */
.overlay-content {
  padding: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  width: 100%;
  height: 100%;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-on-surface), 0.3) transparent;
}

.overlay-content::-webkit-scrollbar {
  width: 8px;
}

.overlay-content::-webkit-scrollbar-track {
  background: transparent;
}

.overlay-content::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-on-surface), 0.3);
  border-radius: 4px;
}

.overlay-content-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 20px 0;
  min-height: 100%;
}

.bottom-safe-space {
  height: max(48px, calc(env(safe-area-inset-bottom, 0px) + 32px));
  flex-shrink: 0;
}

@media (max-width: 960px) {
  .overlay-content-wrapper {
    padding: 45px 14px 0;
  }
}

@media (max-width: 600px) {
  .overlay-content-wrapper {
    padding: 45px 12px 0;
  }
}

/* ========================================
   USER PROFILE SECTION
   ======================================== */
.user-profile-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 16px;
  background: rgba(240, 138, 74, 0.06);
  border-radius: 8px;
  transition: background 0.2s ease;
}

.user-profile-section:hover {
  background: rgba(240, 138, 74, 0.1);
}

.v-theme--dark .user-profile-section {
  background: rgba(240, 138, 74, 0.08);
}

.v-theme--dark .user-profile-section:hover {
  background: rgba(240, 138, 74, 0.12);
}

.profile-avatar {
  background: rgba(240, 138, 74, 0.12) !important;
  border: 1px solid rgba(240, 138, 74, 0.25);
  flex-shrink: 0;
}

.v-theme--dark .profile-avatar {
  background: rgba(240, 138, 74, 0.15) !important;
  border-color: rgba(240, 138, 74, 0.35);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-initials {
  font-size: 1rem;
  font-weight: 700;
  color: #f08a4a;
}

.v-theme--dark .profile-initials {
  color: #ffb74d;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.95);
  line-height: 1.4;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-job-title {
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(var(--v-theme-on-surface), 0.6);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-logout-btn {
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
  min-width: 36px !important;
  width: 36px !important;
  height: 36px !important;
  min-height: 36px !important;
  border-radius: 8px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  flex-shrink: 0;
}

.profile-logout-btn:hover {
  background: rgba(244, 67, 54, 0.1) !important;
  color: #f44336 !important;
  transform: scale(1.05);
}

.profile-divider {
  margin: 16px 0;
}

/* ========================================
   SEARCH FILTER
   ======================================== */
.search-input-wrapper {
  margin-bottom: 12px;
  width: 100%;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
}

.search-input :deep(.v-field) {
  border-radius: 8px;
  background: rgba(var(--v-theme-surface), 0.6) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  min-height: 40px;
  max-height: 40px;
  height: 40px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none;
}

.v-theme--dark .search-input :deep(.v-field) {
  background: rgba(var(--v-theme-surface), 0.5) !important;
  border-color: rgba(255, 255, 255, 0.12);
}

.search-input :deep(.v-field--focused) {
  background: rgba(var(--v-theme-surface), 0.9) !important;
  border-color: #f08a4a !important;
  box-shadow: 0 0 0 2px rgba(240, 138, 74, 0.1);
  min-height: 40px;
  max-height: 40px;
  height: 40px;
}

.v-theme--dark .search-input :deep(.v-field--focused) {
  background: rgba(var(--v-theme-surface), 0.8) !important;
  border-color: #ffb74d !important;
  box-shadow: 0 0 0 2px rgba(255, 183, 77, 0.15);
}

.search-input :deep(.v-field__input) {
  padding: 0 12px;
  font-size: 0.8125rem;
  min-height: 40px;
  max-height: 40px;
  height: 40px;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.search-input :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
  padding-inline-end: 8px;
  padding-top: 0;
  align-items: center;
}

.search-input :deep(.v-field__append-inner) {
  padding-inline-start: 8px;
  padding-inline-end: 12px;
  padding-top: 0;
  align-items: center;
}

.search-input :deep(.v-icon) {
  color: rgba(var(--v-theme-on-surface), 0.5);
  transition: color 0.2s ease;
  font-size: 18px;
}

.search-input :deep(.v-field--focused .v-icon) {
  color: #f08a4a;
}

.v-theme--dark .search-input :deep(.v-field--focused .v-icon) {
  color: #ffb74d;
}

.search-input :deep(.v-field__clearable) {
  margin: 0;
  padding: 0;
}

.search-input :deep(.v-field__clearable .v-icon) {
  font-size: 16px;
}

/* ========================================
   NAVIGATION GRID CONTAINER
   ======================================== */
.navigation-grid-container {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 0;
  padding-top: 0;
  min-height: 0;
}

/* ========================================
   NO RESULTS MESSAGE
   ======================================== */
.no-results-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  flex: 1;
  min-height: 200px;
}

.no-results-icon {
  color: rgba(var(--v-theme-on-surface), 0.3);
  margin-bottom: 16px;
}

.v-theme--dark .no-results-icon {
  color: rgba(255, 255, 255, 0.3);
}

.no-results-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.no-results-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.4;
}

.v-theme--dark .no-results-title {
  color: rgba(255, 255, 255, 0.7);
}

.no-results-subtitle {
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(var(--v-theme-on-surface), 0.5);
  line-height: 1.4;
}

.v-theme--dark .no-results-subtitle {
  color: rgba(255, 255, 255, 0.5);
}

.navigation-grid-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0;
}

/* ========================================
   SECTION HEADER (Vuetify v-list-subheader)
   ======================================== */
.section-header {
  margin-top: 12px;
  margin-bottom: 6px;
  padding: 6px 12px !important;
  display: flex;
  align-items: center;
  gap: 8px;
  height: auto !important;
  min-height: auto !important;
  background: transparent !important;
}

.section-header:first-child {
  margin-top: 0;
}

.section-icon {
  color: #f08a4a;
  flex-shrink: 0;
  font-size: 18px !important;
}

.v-theme--dark .section-icon {
  color: #ffb74d;
}

.section-title {
  color: rgba(var(--v-theme-on-surface), 0.75);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
  line-height: 1.3;
}

.v-theme--dark .section-title {
  color: rgba(255, 255, 255, 0.7);
}

.section-separator-line {
  flex: 1;
  margin-left: 0;
  border-color: rgba(var(--v-theme-on-surface), 0.15) !important;
  border-width: 1px !important;
}

.v-theme--dark .section-separator-line {
  border-color: rgba(255, 255, 255, 0.15) !important;
}

/* ========================================
   NAVIGATION ITEM (Vuetify v-list-item)
   ======================================== */
.nav-list-item {
  margin-bottom: 0;
  border-radius: 8px;
  border: none;
  background: transparent;
  min-height: 48px;
  padding: 10px 12px !important;
  cursor: pointer;
  width: 100%;
  align-items: center;
  box-sizing: border-box;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-list-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: #f08a4a;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.nav-list-item:hover {
  background: rgba(240, 138, 74, 0.08);
  transform: translateX(4px);
}

.nav-list-item:hover::before {
  opacity: 1;
}

.nav-list-item :deep(.v-list-item) {
  padding: 0;
  min-height: auto;
}

.v-theme--dark .nav-list-item {
  background: rgba(var(--v-theme-surface), 0.9);
  border-color: rgba(255, 255, 255, 0.12);
}

.v-theme--dark .nav-list-item:hover {
  background: rgba(240, 138, 74, 0.08);
  border-color: rgba(240, 138, 74, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-list-item-active,
.nav-list-item.v-list-item--active {
  background: rgba(240, 138, 74, 0.12) !important;
  border-left: 3px solid #f08a4a !important;
  transform: translateX(0);
}

.nav-list-item-active::before,
.nav-list-item.v-list-item--active::before {
  opacity: 1;
}

.v-theme--dark .nav-list-item-active,
.v-theme--dark .nav-list-item.v-list-item--active {
  background: rgba(240, 138, 74, 0.15) !important;
  border-left-color: #ffb74d !important;
}

.tile-icon-wrapper {
  background: transparent !important;
  border-radius: 6px;
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-tile-icon {
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 20px !important;
  transition: color 0.2s ease;
}

.v-theme--dark .nav-tile-icon {
  color: rgba(255, 255, 255, 0.7);
}

.nav-list-item:hover .nav-tile-icon {
  color: #f08a4a;
}

.v-theme--dark .nav-list-item:hover .nav-tile-icon {
  color: #ffb74d;
}

.nav-list-item-active .nav-tile-icon,
.nav-list-item.v-list-item--active .nav-tile-icon {
  color: #f08a4a;
}

.v-theme--dark .nav-list-item-active .nav-tile-icon,
.v-theme--dark .nav-list-item.v-list-item--active .nav-tile-icon {
  color: #ffb74d;
}

.nav-active-indicator {
  color: #f08a4a !important;
  animation: fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.nav-list-item :deep(.v-list-item__prepend) {
  margin-inline-end: 12px;
}

.nav-list-item :deep(.v-list-item__content) {
  flex: 1;
  min-width: 0;
  padding: 0;
  overflow: visible;
}

.nav-list-item :deep(.v-list-item__append) {
  margin-inline-start: 8px;
}

.nav-tile-label {
  color: rgba(var(--v-theme-on-surface), 0.85);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.v-theme--dark .nav-tile-label {
  color: rgba(255, 255, 255, 0.85);
}

.nav-list-item-active .nav-tile-label,
.nav-list-item.v-list-item--active .nav-tile-label {
  color: #f08a4a;
  font-weight: 600;
}

.v-theme--dark .nav-list-item-active .nav-tile-label,
.v-theme--dark .nav-list-item.v-list-item--active .nav-tile-label {
  color: #ffb74d;
}

/* ========================================
   FOOTER (Vuetify v-list)
   ======================================== */
.footer-divider-top {
  margin-top: 24px;
  margin-bottom: 0;
  border-color: rgba(var(--v-theme-on-surface), 0.12) !important;
}

.v-theme--dark .footer-divider-top {
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.footer-list {
  background: transparent;
  padding: 0;
}

.footer-list-item {
  padding: 8px 12px !important;
  min-height: 36px !important;
  border-radius: 4px;
}

.footer-list-item :deep(.v-list-item-title) {
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.75rem;
  font-weight: 400;
}

.footer-list-item :deep(.v-icon) {
  color: inherit;
  font-size: 18px;
}

/* ========================================
   RESPONSIVE ADJUSTMENTS
   ======================================== */
@media (max-width: 960px) {
  .overlay-content-wrapper {
    padding: 18px 16px 0;
  }
}

@media (max-width: 600px) {
  .overlay-content-wrapper {
    padding: 16px 14px 0;
  }

  .nav-list-item {
    min-height: 44px;
    padding: 8px 10px !important;
  }

  .tile-icon-wrapper {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
  }

  .nav-tile-icon {
    font-size: 18px !important;
  }

  .nav-tile-label {
    font-size: 0.8125rem;
  }

  .section-header {
    padding: 6px 0 !important;
    margin-top: 20px;
    margin-bottom: 10px;
  }

  .user-profile-section {
    padding: 12px;
    gap: 12px;
  }

  .profile-avatar {
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
  }

  .search-input-wrapper {
    margin-bottom: 10px;
  }

  .search-input :deep(.v-field) {
    min-height: 38px;
    max-height: 38px;
    height: 38px;
  }

  .search-input :deep(.v-field__input) {
    min-height: 38px;
    max-height: 38px;
    height: 38px;
    font-size: 0.8125rem;
  }
}

/* ========================================
   ACCESSIBILITY
   ======================================== */
.icon-tile:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.5);
  outline-offset: 4px;
}
</style>
