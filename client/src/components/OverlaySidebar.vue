<template>
  <Teleport to="body">
    <v-overlay
      :model-value="modelValue"
      class="overlay-fullscreen"
      :class="{ 'rtl-overlay': isRTL }"
      scrim="rgba(0, 0, 0, 0.5)"
      persistent
      @click:outside="closeSidebar"
    >
      <v-card
        class="overlay-card"
        :class="{ 'rtl-card': isRTL }"
        @click.stop.prevent
      >
        <!-- Close button -->
        <v-btn
          icon
          variant="text"
          size="small"
          class="close-btn-top"
          @click="handleCloseClick"
        >
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>

        <!-- Content Container -->
        <div class="overlay-content" @click.stop.prevent>
          <div class="overlay-content-wrapper" @click.stop.prevent>
          <!-- User Profile Section with Logout -->
          <v-list-item
            v-if="userProfile"
            class="user-profile-section"
            :title="userProfile.name"
            :subtitle="userProfile.jobTitle"
          >
            <template #prepend>
              <v-avatar size="40" class="profile-avatar" color="primary">
                <img
                  v-if="userProfile.picture && !imageError"
                  :src="userProfile.picture"
                  :alt="userProfile.name"
                  class="profile-image"
                  @error="imageError = true"
                  @load="imageError = false"
                />
                <span v-else class="profile-initials">{{ getInitials(userProfile.name) }}</span>
              </v-avatar>
            </template>
            <template #append>
              <v-btn
                variant="text"
                size="small"
                prepend-icon="mdi-logout"
                class="profile-logout-btn"
                @click="handleLogout"
              >
                {{ $t("nav.logout") }}
              </v-btn>
            </template>
          </v-list-item>

          <v-divider v-if="userProfile" class="profile-divider"></v-divider>

          <!-- Search Filter -->
          <v-text-field
            v-model="searchQuery"
            :placeholder="t('nav.searchPlaceholder') || 'Search navigation...'"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="search-input"
            @click.stop
          ></v-text-field>

          <!-- Navigation Grid Container -->
          <div class="navigation-grid-container">
            <!-- No Results Message -->
            <div
              v-if="searchQuery && flattenedNavigation.length === 0"
              class="no-results-message"
            >
              <v-icon size="48" class="no-results-icon">mdi-magnify</v-icon>
              <div class="no-results-text">
                <div class="no-results-title">{{ $t("nav.noResults") || "No results found" }}</div>
                <div class="no-results-subtitle">
                  {{ $t("nav.noResultsSubtitle") || "Try adjusting your search terms" }}
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
                  <v-icon size="16" class="section-icon">{{ item.icon }}</v-icon>
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
                  @click="navigateTo(item.route)"
                >
                  <template #prepend>
                    <v-avatar
                      size="32"
                      class="tile-icon-wrapper"
                    >
                      <v-icon
                        :icon="item.icon"
                        size="20"
                        class="nav-tile-icon"
                      ></v-icon>
                    </v-avatar>
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
                    ></v-badge>
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
import { isRTL as checkRTL } from "@/i18n";
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
const isRTL = computed(() => checkRTL(locale.value));

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
  else if (details.photos && Array.isArray(details.photos) && details.photos.length > 0) {
    const photo = details.photos.find(p => p.primary) || details.photos[0];
    picture = photo?.value || photo?.url;
  }
  // Priority 4: Check thumbnailPhotoUrl (from Google Directory API - might be base64)
  else if (details.thumbnailPhotoUrl) {
    const thumb = details.thumbnailPhotoUrl;
    // If it's already a data URL
    if (thumb.startsWith('data:')) {
      picture = thumb;
    }
    // If it's a regular URL
    else if (thumb.startsWith('http://') || thumb.startsWith('https://')) {
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
    email: details.email || details.primaryEmail || ""
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

function handleCloseClick() {
  // Always close when clicking the close button
  emit("update:modelValue", false);
}

function closeSidebar(event) {
  // Prevent closing if user is selecting text
  if (event && window.getSelection && window.getSelection().toString().length > 0) {
    return;
  }
  // Only close if clicking directly on overlay scrim/background, not on card or content
  if (event) {
    const target = event.target;
    const card = event.currentTarget?.querySelector?.('.overlay-card');
    // Only close if clicking on the scrim/overlay itself, not on the card or its children
    if (target && card && !card.contains(target) && target.classList.contains('v-overlay__scrim')) {
      emit("update:modelValue", false);
    } else if (!card) {
      // Fallback if card not found
      emit("update:modelValue", false);
    }
  } else {
    // Called from @click:outside or other non-event source
    emit("update:modelValue", false);
  }
}

function navigateTo(routePath) {
  if (routePath) {
    router.push(routePath);
    closeSidebar();
  }
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
  }
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
   FULL SCREEN OVERLAY (Vuetify v-overlay)
   ======================================== */
.overlay-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
}

.overlay-fullscreen :deep(.v-overlay__scrim) {
  background-color: rgba(0, 0, 0, 0.5) !important;
  cursor: pointer;
}

.overlay-card {
  cursor: default;
  pointer-events: auto;
}

.overlay-fullscreen :deep(.v-overlay__content) {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  overflow: hidden;
}

.overlay-card {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  background-color: rgb(var(--v-theme-surface)) !important;
  border-radius: 0 !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  margin: 0;
  padding: 0;
}

.overlay-card :deep(.v-card-text) {
  display: none;
}

.v-theme--light .overlay-card {
  background-color: #ffffff !important;
}

.v-theme--dark .overlay-card {
  background-color: #121212 !important;
}

.close-btn-top {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
  min-height: 28px !important;
  border-radius: 4px !important;
}


.overlay-card.rtl-card .close-btn-top {
  right: auto;
  left: 8px;
}

/* RTL Support */
.overlay-card.rtl-card {
  direction: rtl;
}

.overlay-card.rtl-card .overlay-content {
  direction: rtl;
}

.overlay-card.rtl-card .navigation-grid-wrapper {
  direction: ltr;
}

.overlay-card.rtl-card .section-header {
  direction: rtl;
}

.overlay-card.rtl-card .nav-list-item {
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
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 50px 16px 0;
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
   USER PROFILE SECTION (Vuetify v-list-item)
   ======================================== */
.user-profile-section {
  padding: 10px 0 !important;
  margin-bottom: 0 !important;
  min-height: auto !important;
}

.user-profile-section :deep(.v-list-item__prepend) {
  align-self: center;
  margin-inline-end: 12px;
}

.user-profile-section :deep(.v-list-item__content) {
  flex: 1;
  min-width: 0;
}

.user-profile-section :deep(.v-list-item__append) {
  margin-inline-start: 12px;
}

.profile-avatar {
  background: rgba(255, 111, 0, 0.1) !important;
  border: 1px solid rgba(255, 111, 0, 0.2);
}

.v-theme--dark .profile-avatar {
  background: rgba(255, 183, 77, 0.15) !important;
  border-color: rgba(255, 183, 77, 0.25);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-initials {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ff6f00;
}

.v-theme--dark .profile-initials {
  color: #ffb74d;
}

.user-profile-section :deep(.v-list-item-title) {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
  line-height: 1.3;
  margin-bottom: 2px;
}

.user-profile-section :deep(.v-list-item-subtitle) {
  font-size: 0.6875rem;
  font-weight: 400;
  color: rgba(var(--v-theme-on-surface), 0.5);
  line-height: 1.2;
  opacity: 1;
}

.profile-logout-btn {
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  font-size: 0.75rem !important;
  min-height: 28px !important;
}


.profile-divider {
  margin: 16px 0;
}

/* ========================================
   SEARCH FILTER
   ======================================== */
.search-input {
  margin-bottom: 16px;
  width: 100%;
  flex-shrink: 0;
}

.search-input :deep(.v-field) {
  border-radius: 8px;
  background: rgba(var(--v-theme-surface), 1);
  border-color: rgba(var(--v-theme-on-surface), 0.12);
  min-height: 40px;
  max-height: 40px;
  height: 40px;
}

.v-theme--dark .search-input :deep(.v-field) {
  background: rgba(var(--v-theme-surface), 0.8);
  border-color: rgba(255, 255, 255, 0.15);
}


.search-input :deep(.v-field--focused) {
  border-color: rgba(255, 111, 0, 0.5);
  min-height: 40px;
  max-height: 40px;
  height: 40px;
}

.v-theme--dark .search-input :deep(.v-field--focused) {
  border-color: rgba(255, 183, 77, 0.6);
}

.search-input :deep(.v-field__input) {
  padding: 6px 10px;
  font-size: 0.8125rem;
  min-height: 40px;
  max-height: 40px;
  height: 40px;
}

.search-input :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
  padding-inline-end: 8px;
}

.search-input :deep(.v-field__append-inner) {
  padding-inline-start: 8px;
  padding-inline-end: 12px;
}

.search-input :deep(.v-icon) {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.search-input :deep(.v-field--focused .v-icon) {
  color: #ff6f00;
}

.v-theme--dark .search-input :deep(.v-field--focused .v-icon) {
  color: #ffb74d;
}

.search-input :deep(.v-field__clearable) {
  margin: 0;
  padding: 0;
}

/* ========================================
   NAVIGATION GRID CONTAINER
   ======================================== */
.navigation-grid-container {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 6px;
  padding: 0;
}

@media (min-width: 600px) {
  .navigation-grid-wrapper {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 8px;
  }
}

@media (min-width: 960px) {
  .navigation-grid-wrapper {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
  }
}

/* ========================================
   SECTION HEADER (Vuetify v-list-subheader)
   ======================================== */
.section-header {
  margin-top: 12px;
  margin-bottom: 6px;
  padding: 0 4px !important;
  display: flex;
  align-items: center;
  gap: 6px;
  height: auto !important;
  min-height: auto !important;
  background: transparent !important;
}

.section-header:first-child {
  margin-top: 0;
}

.section-icon {
  color: rgba(var(--v-theme-on-surface), 0.55);
  flex-shrink: 0;
  font-size: 15px !important;
}

.v-theme--dark .section-icon {
  color: rgba(255, 255, 255, 0.5);
}

.section-title {
  color: rgba(var(--v-theme-on-surface), 0.65);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
  line-height: 1.3;
}

.v-theme--dark .section-title {
  color: rgba(255, 255, 255, 0.6);
}

.section-separator-line {
  flex: 1;
  margin-left: 0;
  border-color: rgba(var(--v-theme-on-surface), 0.2) !important;
}

.v-theme--dark .section-separator-line {
  border-color: rgba(255, 255, 255, 0.2) !important;
}

/* ========================================
   NAVIGATION ITEM (Vuetify v-list-item)
   ======================================== */
.nav-list-item {
  margin-bottom: 0;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgba(var(--v-theme-surface), 1);
  min-height: 36px;
  padding: 8px 10px !important;
  cursor: pointer;
  width: 100%;
  align-items: flex-start;
  box-sizing: border-box;
}

.nav-list-item :deep(.v-list-item) {
  padding: 0;
  min-height: auto;
}

.v-theme--dark .nav-list-item {
  background: rgba(var(--v-theme-surface), 0.8);
  border-color: rgba(255, 255, 255, 0.15);
}


.nav-list-item.v-list-item--active {
  background: rgba(255, 111, 0, 0.15) !important;
  border-color: rgba(255, 111, 0, 0.5);
  border-width: 1px;
}

.v-theme--dark .nav-list-item.v-list-item--active {
  background: rgba(255, 183, 77, 0.18) !important;
  border-color: rgba(255, 183, 77, 0.55);
  border-width: 1px;
}

.tile-icon-wrapper {
  background: rgba(255, 111, 0, 0.12) !important;
  border-radius: 5px;
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
}

.v-theme--dark .tile-icon-wrapper {
  background: rgba(255, 183, 77, 0.15) !important;
}


.nav-list-item.v-list-item--active .tile-icon-wrapper {
  background: rgba(255, 111, 0, 0.2) !important;
}

.v-theme--dark .nav-list-item.v-list-item--active .tile-icon-wrapper {
  background: rgba(255, 183, 77, 0.25) !important;
}

.nav-tile-icon {
  color: #ff6f00;
  font-size: 18px !important;
}

.v-theme--dark .nav-tile-icon {
  color: #ffb74d;
}


.nav-list-item.v-list-item--active .nav-tile-icon {
  color: #e65100;
}

.v-theme--dark .nav-list-item.v-list-item--active .nav-tile-icon {
  color: #ffcc80;
}

.nav-list-item :deep(.v-list-item__prepend) {
  margin-inline-end: 8px;
}

.nav-list-item :deep(.v-list-item__content) {
  flex: 1;
  min-width: 0;
  padding: 0;
  overflow: visible;
}

.nav-list-item :deep(.v-list-item__append) {
  margin-inline-start: 6px;
}

.nav-tile-label {
  color: rgba(var(--v-theme-on-surface), 0.9);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.4;
  white-space: normal;
  overflow: visible;
  word-wrap: break-word;
  letter-spacing: 0.01em;
}

.v-theme--dark .nav-tile-label {
  color: rgba(255, 255, 255, 0.85);
}


.nav-list-item.v-list-item--active .nav-tile-label {
  color: #e65100;
  font-weight: 600;
}

.v-theme--dark .nav-list-item.v-list-item--active .nav-tile-label {
  color: #ffcc80;
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
@media (max-width: 600px) {
  .navigation-grid-wrapper {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .nav-list-item {
    min-height: 36px;
    padding: 8px 10px !important;
  }

  .tile-icon-wrapper {
    width: 26px !important;
    height: 26px !important;
    min-width: 26px !important;
  }

  .nav-tile-icon {
    font-size: 16px !important;
  }

  .nav-tile-label {
    font-size: 0.8125rem;
  }

  .section-header {
    padding: 0 4px !important;
    margin-top: 10px;
    margin-bottom: 5px;
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
