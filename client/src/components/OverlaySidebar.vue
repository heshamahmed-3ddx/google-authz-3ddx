<template>
  <Teleport to="body">
    <!-- Full Screen Overlay -->
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="overlay-fullscreen"
        :class="{ 'rtl-overlay': isRTL }"
        @click="closeSidebar"
      >
        <!-- Close button -->
        <v-btn
          icon
          variant="text"
          size="small"
          class="close-btn-top"
          @click.stop="closeSidebar"
        >
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>

        <!-- Content Container -->
        <div class="overlay-content" @click.stop>
          <!-- Header -->
          <div class="overlay-header">
            <div class="d-flex align-center justify-space-between pa-3">
              <div class="d-flex align-center">
                <img
                  src="/logo.png"
                  alt="App Logo"
                  class="brand-logo mr-3"
                />
                <div class="text-h5 font-weight-bold company-name">
                  App Navigation
                </div>
              </div>
              <div v-if="authStore.isAuthenticated" class="user-info-display d-flex align-center">
                <v-avatar size="48" color="secondary" class="user-avatar mr-3">
                  <span class="text-white text-body-1 font-weight-bold">{{ getUserInitials() }}</span>
                </v-avatar>
                <div class="user-info-content flex-grow-1">
                  <div class="text-body-1 font-weight-semibold user-name">
                    {{ userInfo?.fullName || userInfo?.name || userInfo?.email || authStore.user?.email || 'User' }}
                  </div>
                  <div v-if="userJobTitle" class="text-caption font-weight-medium user-job-title mt-1">
                    {{ userJobTitle }}
                  </div>
                  <div class="text-caption user-email mt-1">
                    {{ userInfo?.email || authStore.user?.email || '' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Icon Grid Container -->
          <div class="icon-grid-container">
            <div class="icon-grid-wrapper">
              <!-- Flatten navigation items for grid display -->
              <template v-for="item in flattenedNavigation" :key="item.id">
                <!-- Section Header (for groups) -->
                <div
                  v-if="item.isSectionHeader"
                  class="section-header"
                  :style="{ gridColumn: '1 / -1' }"
                >
                  <h3 class="text-subtitle-1 font-weight-bold section-title">
                    {{ $t("navigation." + item.id) }}
                  </h3>
                </div>

                <!-- Icon Tile -->
                <div
                  v-else
                  class="icon-tile"
                  :class="{ 'active-route': isActiveRoute(item.route) }"
                  @click="navigateTo(item.route)"
                >
                  <div class="icon-wrapper">
                    <v-icon :icon="item.icon" size="36" class="tile-icon"></v-icon>
                    <v-badge
                      v-if="item.badge"
                      :content="item.badge.text"
                      :color="item.badge.color"
                      class="tile-badge"
                    ></v-badge>
                  </div>
                  <div class="tile-label">{{ $t("navigation." + item.id) }}</div>
                </div>
              </template>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="overlay-footer">
            <v-btn
              v-if="isAdmin"
              variant="text"
              size="large"
              prepend-icon="mdi-cog"
              class="footer-action-btn"
              to="/system/settings"
              @click="onItemClick"
            >
              {{ $t("nav.settings") }}
            </v-btn>
            <v-btn
              variant="text"
              size="large"
              prepend-icon="mdi-logout"
              color="error"
              class="footer-action-btn"
              @click="handleLogout"
            >
              {{ $t("nav.logout") }}
            </v-btn>
          </div>
        </div>
      </div>
    </Transition>
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
const { locale } = useI18n();

// State
const userInfo = ref(null);
const userGroups = ref([]);

// Computed
const isRTL = computed(() => checkRTL(locale.value));

const isAdmin = computed(() => {
  return userGroups.value.includes("admin") || userInfo.value?.isAdmin;
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
  
  filteredNavigation.value.forEach((item) => {
    // Add section header for groups
    if (item.children && item.children.length > 0) {
      flattened.push({
        ...item,
        isSectionHeader: true,
      });
      
      // Add child items
      item.children.forEach((child) => {
        flattened.push(child);
      });
    } else {
      // Add standalone items
      flattened.push(item);
    }
  });
  
  return flattened;
});

// Computed for user job title
const userJobTitle = computed(() => {
  return userInfo.value?.jobTitle || authStore.user?.jobTitle || null;
});

// Methods
function getUserInitials() {
  if (!userInfo.value) return "?";

  const name = userInfo.value.fullName || userInfo.value.email || "";
  const parts = name.split(" ");

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.substring(0, 2).toUpperCase();
}

function isActiveRoute(itemRoute) {
  if (!itemRoute) return false;
  return route.path === itemRoute || route.path.startsWith(`${itemRoute}/`);
}

function closeSidebar() {
  emit("update:modelValue", false);
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

async function loadUserInfo() {
  try {
    // Try cached user details first
    if (authStore.cachedUserDetails) {
      userInfo.value = authStore.cachedUserDetails;
    } else if (authStore.user) {
      // Fallback to user from authStore
      userInfo.value = authStore.user;
    }

    // Load user groups
    if (authStore.cachedUserRights) {
      userGroups.value = authStore.cachedUserRights.groups || [];
    } else if (authStore.user?.groups) {
      userGroups.value = authStore.user.groups;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to load user info:", error);
  }
}

// Lifecycle
onMounted(() => {
  loadUserInfo();
  document.addEventListener("keydown", handleEscapeKey);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscapeKey);
});

// Watch for auth store updates
watch(
  () => authStore.cachedUserDetails || authStore.user,
  (newUser) => {
    if (newUser) {
      userInfo.value = authStore.cachedUserDetails || authStore.user;
    }
  },
  { immediate: true },
);

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

// Prevent body scroll when sidebar is open and reload user info when opened
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Reload user info when sidebar opens
      loadUserInfo();
    } else {
      document.body.style.overflow = "";
    }
  },
);
</script>

<style scoped>
/* ========================================
   FULL SCREEN OVERLAY
   ======================================== */
.overlay-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(250, 250, 250, 0.98);
  backdrop-filter: blur(20px);
  z-index: 2000;
  overflow-y: auto;
  overflow-x: hidden;
}

.v-theme--dark .overlay-fullscreen {
  background: rgba(18, 18, 18, 0.98);
}

.close-btn-top {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2001;
  background: rgba(255, 140, 0, 0.1) !important;
  backdrop-filter: blur(10px);
  color: #FF8C00 !important;
  transition: all 0.2s ease;
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
}

.v-theme--dark .close-btn-top {
  background: rgba(255, 183, 77, 0.15) !important;
  color: #FFB74D !important;
}

.close-btn-top:hover {
  background: rgba(255, 140, 0, 0.2) !important;
  transform: rotate(90deg);
}

.v-theme--dark .close-btn-top:hover {
  background: rgba(255, 183, 77, 0.25) !important;
}

.overlay-fullscreen.rtl-overlay .close-btn-top {
  right: auto;
  left: 16px;
}

/* ========================================
   CONTENT CONTAINER
   ======================================== */
.overlay-content {
  min-height: 100vh;
  padding: 50px 24px 24px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

@media (max-width: 960px) {
  .overlay-content {
    padding: 50px 16px 16px;
  }
}

/* ========================================
   HEADER
   ======================================== */
.overlay-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.v-theme--dark .overlay-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.company-name {
  color: #212121;
  margin-bottom: 4px;
}

.v-theme--dark .company-name {
  color: #FFFFFF;
}

.company-subtitle {
  color: #616161;
}

.v-theme--dark .company-subtitle {
  color: #B0B0B0;
}

.user-info-display {
  padding: 8px 0;
}

.user-info-content {
  min-width: 0; /* Allow text truncation */
}

.user-name {
  color: #212121;
  line-height: 1.4;
  word-break: break-word;
  margin-bottom: 4px;
}

.v-theme--dark .user-name {
  color: #FFFFFF;
}

.user-job-title {
  color: #FF8C00;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.3px;
}

.v-theme--dark .user-job-title {
  color: #FFB74D;
}

.user-email {
  color: #616161;
  line-height: 1.3;
  word-break: break-all;
  font-size: 0.7rem;
}

.v-theme--dark .user-email {
  color: #B0B0B0;
}

.brand-logo {
  height: 94px;
  width: auto;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.brand-logo:hover {
  transform: scale(1.05);
}

.user-avatar {
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.v-theme--dark .user-avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.user-avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.v-theme--dark .user-avatar:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* ========================================
   ICON GRID
   ======================================== */
.icon-grid-container {
  flex: 1;
  width: 100%;
}

.icon-grid-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 12px;
  padding: 0;
}

@media (min-width: 600px) {
  .icon-grid-wrapper {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 14px;
  }
}

@media (min-width: 960px) {
  .icon-grid-wrapper {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 16px;
  }
}

/* ========================================
   SECTION HEADER
   ======================================== */
.section-header {
  margin-top: 16px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.v-theme--dark .section-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.section-header:first-child {
  margin-top: 0;
}

.section-title {
  color: #FF8C00;
  font-size: 1rem;
}

.v-theme--dark .section-title {
  color: #FFB74D;
}

/* ========================================
   ICON TILE (Compact Style)
   ======================================== */
.icon-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 6px;
  border-radius: 8px;
  background: transparent;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 80px;
  position: relative;
  overflow: visible;
}

.icon-tile:hover {
  background: rgba(255, 140, 0, 0.08);
  transform: translateY(-4px);
  border-color: rgba(255, 140, 0, 0.2);
}

.v-theme--dark .icon-tile:hover {
  background: rgba(255, 183, 77, 0.1);
  border-color: rgba(255, 183, 77, 0.3);
}

.icon-tile:active {
  transform: translateY(-2px);
}

.icon-tile.active-route {
  background: rgba(255, 140, 0, 0.12);
  border-color: #FF8C00;
}

.v-theme--dark .icon-tile.active-route {
  background: rgba(255, 183, 77, 0.15);
  border-color: #FFB74D;
}

.icon-wrapper {
  position: relative;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  transition: all 0.2s ease;
}

.icon-tile:hover .icon-wrapper {
  transform: scale(1.1);
}

.tile-icon {
  color: #FF8C00;
  transition: all 0.2s ease;
}

.v-theme--dark .tile-icon {
  color: #FFB74D;
}

.icon-tile:hover .tile-icon {
  color: #E65100;
  transform: scale(1.1);
}

.v-theme--dark .icon-tile:hover .tile-icon {
  color: #FFCC80;
}

.icon-tile.active-route .tile-icon {
  color: #E65100;
}

.v-theme--dark .icon-tile.active-route .tile-icon {
  color: #FFCC80;
}

.tile-badge {
  position: absolute;
  top: -6px;
  right: -6px;
}

.tile-label {
  color: #212121;
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  margin-top: 2px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.v-theme--dark .tile-label {
  color: #FFFFFF;
}

.icon-tile:hover .tile-label {
  color: #E65100;
  font-weight: 600;
}

.v-theme--dark .icon-tile:hover .tile-label {
  color: #FFCC80;
}

.icon-tile.active-route .tile-label {
  color: #E65100;
  font-weight: 600;
}

.v-theme--dark .icon-tile.active-route .tile-label {
  color: #FFCC80;
}

/* ========================================
   FOOTER
   ======================================== */
.overlay-footer {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.v-theme--dark .overlay-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-action-btn {
  color: #212121 !important;
  background: rgba(255, 140, 0, 0.08) !important;
  border: 1px solid rgba(255, 140, 0, 0.2);
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.v-theme--dark .footer-action-btn {
  color: #FFFFFF !important;
  background: rgba(255, 183, 77, 0.1) !important;
  border: 1px solid rgba(255, 183, 77, 0.3);
}

.footer-action-btn:hover {
  background: rgba(255, 140, 0, 0.15) !important;
  border-color: #FF8C00;
  transform: translateY(-2px);
}

.v-theme--dark .footer-action-btn:hover {
  background: rgba(255, 183, 77, 0.2) !important;
  border-color: #FFB74D;
}

.footer-action-btn :deep(.v-icon) {
  color: #FF8C00 !important;
}

.v-theme--dark .footer-action-btn :deep(.v-icon) {
  color: #FFB74D !important;
}

.footer-action-btn.v-btn--variant-text.v-theme--light {
  color: #212121 !important;
}

/* ========================================
   TRANSITIONS
   ======================================== */
.fade-enter-active {
  transition: opacity 0.3s ease;
}

.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========================================
   MOBILE ADJUSTMENTS
   ======================================== */
@media (max-width: 600px) {
  .icon-grid-wrapper {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 10px;
  }

  .icon-tile {
    min-height: 75px;
    padding: 8px 4px;
  }

  .icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .tile-icon {
    font-size: 28px !important;
  }

  .tile-label {
    font-size: 0.65rem;
  }

  .overlay-header {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .overlay-header .d-flex {
    flex-direction: column;
    width: 100%;
  }

  .user-avatar {
    margin-bottom: 12px;
  }
}

/* ========================================
   ACCESSIBILITY
   ======================================== */
.icon-tile:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.5);
  outline-offset: 4px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>