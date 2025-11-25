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
          <!-- Minimal Header -->
          <div class="minimal-overlay-header">
            <div
              class="text-subtitle-1 font-weight-medium minimal-header-title"
            >
              {{ $t("nav.navigation") }}
            </div>
          </div>

          <!-- Navigation Grid Container -->
          <div class="minimal-nav-grid-container">
            <div class="minimal-nav-grid-wrapper">
              <!-- Flatten navigation items for grid display -->
              <template v-for="item in flattenedNavigation" :key="item.id">
                <!-- Section Header (for groups) - Minimal -->
                <div
                  v-if="item.isSectionHeader"
                  class="minimal-section-header"
                  :style="{ gridColumn: '1 / -1' }"
                >
                  <span class="minimal-section-title">
                    {{ $t("navigation." + item.id) }}
                  </span>
                </div>

                <!-- Navigation Tile - Minimal -->
                <div
                  v-else
                  class="minimal-nav-tile"
                  :class="{ 'active-route': isActiveRoute(item.route) }"
                  @click="navigateTo(item.route)"
                >
                  <v-icon
                    :icon="item.icon"
                    size="24"
                    class="nav-tile-icon"
                  ></v-icon>
                  <span class="nav-tile-label">{{
                    $t("navigation." + item.id)
                  }}</span>
                  <v-badge
                    v-if="item.badge"
                    :content="item.badge.text"
                    :color="item.badge.color"
                    class="nav-tile-badge"
                    size="x-small"
                  ></v-badge>
                </div>
              </template>
            </div>
          </div>

          <!-- Minimal Footer Actions -->
          <div class="minimal-overlay-footer">
            <v-btn
              v-if="isAdmin"
              variant="text"
              size="small"
              prepend-icon="mdi-cog"
              class="minimal-footer-btn"
              to="/system/settings"
              @click="onItemClick"
            >
              {{ $t("nav.settings") }}
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              prepend-icon="mdi-logout"
              class="minimal-footer-btn logout-footer-btn"
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
const userGroups = ref([]);

// Computed
const isRTL = computed(() => checkRTL(locale.value));

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

// Methods

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
  background-color: #ffffff !important;
  background: #ffffff !important;
  z-index: 2000;
  overflow-y: auto;
  overflow-x: hidden;
  /* GPU acceleration for smooth scrolling */
  will-change: scroll-position;
  transform: translateZ(0);
  -webkit-overflow-scrolling: touch;
  /* Smooth scrolling optimization */
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}

.overlay-fullscreen::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  z-index: -1;
  pointer-events: none;
}

.v-theme--light .overlay-fullscreen {
  background-color: #ffffff !important;
  background: #ffffff !important;
}

.v-theme--light .overlay-fullscreen::before {
  background-color: #ffffff;
}

.v-theme--dark .overlay-fullscreen {
  background-color: #121212 !important;
  background: #121212 !important;
}

.v-theme--dark .overlay-fullscreen::before {
  background-color: #121212;
}

.close-btn-top {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 2001;
  background: rgba(255, 140, 0, 0.1) !important;
  color: #ff8c00 !important;
  transition: all 0.15s ease;
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
  border-radius: 6px !important;
}

.v-theme--dark .close-btn-top {
  background: rgba(255, 183, 77, 0.15) !important;
  color: #ffb74d !important;
}

.close-btn-top:hover {
  background: rgba(255, 140, 0, 0.2) !important;
  color: #e65100 !important;
}

.v-theme--dark .close-btn-top:hover {
  background: rgba(255, 183, 77, 0.25) !important;
  color: #ffcc80 !important;
}

.overlay-fullscreen.rtl-overlay .close-btn-top {
  right: auto;
  left: 16px;
}

/* ========================================
   MINIMAL CONTENT CONTAINER
   ======================================== */
.overlay-content {
  min-height: 100vh;
  padding: 40px 12px 12px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  position: relative;
  z-index: 1;
}

@media (max-width: 960px) {
  .overlay-content {
    padding: 40px 10px 10px;
  }
}

/* ========================================
   MINIMAL HEADER
   ======================================== */
.minimal-overlay-header {
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 140, 0, 0.2);
}

.v-theme--dark .minimal-overlay-header {
  border-bottom-color: rgba(255, 183, 77, 0.3);
}

.minimal-header-title {
  color: #ff8c00;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.v-theme--dark .minimal-header-title {
  color: #ffb74d;
}

/* ========================================
   MINIMAL NAVIGATION GRID
   ======================================== */
.minimal-nav-grid-container {
  flex: 1;
  width: 100%;
}

.minimal-nav-grid-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 6px;
  padding: 0;
  contain: layout style paint;
}

@media (min-width: 600px) {
  .minimal-nav-grid-wrapper {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
  }
}

@media (min-width: 960px) {
  .minimal-nav-grid-wrapper {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
  }
}

/* ========================================
   MINIMAL SECTION HEADER
   ======================================== */
.minimal-section-header {
  margin-top: 10px;
  margin-bottom: 4px;
  padding-bottom: 3px;
  border-bottom: 1px solid rgba(255, 140, 0, 0.15);
}

.v-theme--dark .minimal-section-header {
  border-bottom-color: rgba(255, 183, 77, 0.25);
}

.minimal-section-header:first-child {
  margin-top: 0;
}

.minimal-section-title {
  color: #ff8c00;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.v-theme--dark .minimal-section-title {
  color: #ffb74d;
}

/* ========================================
   MINIMAL NAVIGATION TILE
   ======================================== */
.minimal-nav-tile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  min-height: 36px;
  border: 1px solid transparent;
}

.minimal-nav-tile:hover {
  background: rgba(255, 140, 0, 0.08);
  border-color: rgba(255, 140, 0, 0.2);
}

.v-theme--dark .minimal-nav-tile:hover {
  background: rgba(255, 183, 77, 0.1);
  border-color: rgba(255, 183, 77, 0.3);
}

.minimal-nav-tile.active-route {
  background: rgba(255, 140, 0, 0.12);
  border-color: #ff8c00;
}

.v-theme--dark .minimal-nav-tile.active-route {
  background: rgba(255, 183, 77, 0.15);
  border-color: #ffb74d;
}

.nav-tile-icon {
  color: rgba(var(--v-theme-on-surface), 0.6);
  transition: color 0.15s ease;
  flex-shrink: 0;
  font-size: 20px !important;
}

.minimal-nav-tile:hover .nav-tile-icon {
  color: #ff8c00;
}

.v-theme--dark .minimal-nav-tile:hover .nav-tile-icon {
  color: #ffb74d;
}

.minimal-nav-tile.active-route .nav-tile-icon {
  color: #ff8c00;
}

.v-theme--dark .minimal-nav-tile.active-route .nav-tile-icon {
  color: #ffb74d;
}

.nav-tile-label {
  color: rgba(var(--v-theme-on-surface), 0.75);
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.3;
  flex: 1;
  text-align: left;
}

.minimal-nav-tile:hover .nav-tile-label {
  color: #e65100;
  font-weight: 500;
}

.v-theme--dark .minimal-nav-tile:hover .nav-tile-label {
  color: #ffcc80;
}

.minimal-nav-tile.active-route .nav-tile-label {
  color: #e65100;
  font-weight: 600;
}

.v-theme--dark .minimal-nav-tile.active-route .nav-tile-label {
  color: #ffcc80;
}

.nav-tile-badge {
  flex-shrink: 0;
}

/* ========================================
   MINIMAL FOOTER
   ======================================== */
.minimal-overlay-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 140, 0, 0.2);
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.v-theme--dark .minimal-overlay-footer {
  border-top-color: rgba(255, 183, 77, 0.3);
}

.minimal-footer-btn {
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  text-transform: none !important;
  font-weight: 400 !important;
  font-size: 0.8125rem !important;
  padding: 6px 12px !important;
  min-height: 32px !important;
  transition: all 0.15s ease;
}

.minimal-footer-btn:hover {
  color: #ff8c00 !important;
  background: rgba(255, 140, 0, 0.1) !important;
}

.v-theme--dark .minimal-footer-btn:hover {
  color: #ffb74d !important;
  background: rgba(255, 183, 77, 0.15) !important;
}

.logout-footer-btn:hover {
  color: rgba(244, 67, 54, 0.9) !important;
  background: rgba(244, 67, 54, 0.1) !important;
}

.minimal-footer-btn :deep(.v-icon) {
  color: inherit !important;
  font-size: 18px !important;
}

/* ========================================
   TRANSITIONS
   ======================================== */
.fade-enter-active {
  transition: opacity 0.3s ease;
}

.fade-enter-active .overlay-fullscreen {
  opacity: 1 !important;
  background-color: #ffffff !important;
}

.v-theme--dark .fade-enter-active .overlay-fullscreen {
  background-color: #121212 !important;
}

.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from .overlay-fullscreen,
.fade-leave-to .overlay-fullscreen {
  opacity: 0;
  background-color: #ffffff !important;
}

.v-theme--dark .fade-enter-from .overlay-fullscreen,
.v-theme--dark .fade-leave-to .overlay-fullscreen {
  background-color: #121212 !important;
}

/* ========================================
   MOBILE ADJUSTMENTS
   ======================================== */
@media (max-width: 600px) {
  .minimal-nav-grid-wrapper {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .minimal-nav-tile {
    min-height: 34px;
    padding: 6px 8px;
    gap: 8px;
  }

  .nav-tile-icon {
    font-size: 18px !important;
  }

  .nav-tile-label {
    font-size: 0.75rem;
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
