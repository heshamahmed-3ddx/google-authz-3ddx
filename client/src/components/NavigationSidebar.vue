/* Force all sidebar items to be flat */ .v-list-item, .v-list-group,
.v-list-group__items, .v-list-item__prepend, .v-list-item__append,
.v-list-item__content, .v-list-item__title, .v-list-item__subtitle {
border-radius: 0 !important; } /* Remove all border radius from sidebar elements
*/ .navigation-sidebar, .sidebar-header, .user-info-section, .sidebar-footer,
.navigation-menu, .navigation-item, .footer-item, .logout-item,
.navigation-group :deep(.v-list-group__items),
.navigation-item.active-route::after, .logo-avatar, .user-avatar {
border-radius: 0 !important; }
<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    :permanent="!mobile"
    :temporary="mobile"
    app
    class="navigation-sidebar"
    :class="{ 'sidebar-rail': rail, 'sidebar-expanded': !rail }"
    :width="280"
    :rail-width="72"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header" :class="{ 'header-rail': rail }">
      <div class="d-flex align-center pa-4 header-content">
        <v-avatar
          :size="rail ? 36 : 44"
          color="primary"
          class="logo-avatar"
          :class="{ 'mr-3': !rail }"
        >
          <v-icon :size="rail ? 22 : 26" color="white">mdi-google</v-icon>
        </v-avatar>
        <transition name="fade-slide">
          <div v-show="!rail" class="flex-grow-1 company-info">
            <div class="text-h6 font-weight-bold company-name">
              3D Diagnostix
            </div>
            <div class="text-caption text-medium-emphasis company-subtitle">
              Authorization System
            </div>
          </div>
        </transition>
        <v-btn
          v-if="!mobile"
          :icon="rail ? 'mdi-menu' : 'mdi-menu-open'"
          variant="text"
          size="small"
          class="toggle-btn"
          @click="toggleRail"
        >
          <v-tooltip activator="parent" location="right">
            {{ rail ? "Expand" : "Collapse" }}
          </v-tooltip>
        </v-btn>
      </div>
      <v-divider></v-divider>
    </div>

    <!-- User Info Section -->
    <div
      v-if="userInfo"
      class="user-info-section"
      :class="{ 'user-info-rail': rail }"
    >
      <v-list-item
        class="user-info-item"
        :class="{ 'py-2': rail, 'py-3': !rail }"
      >
        <template #prepend>
          <v-badge
            v-if="userInfo.isAdmin && !rail"
            dot
            color="success"
            location="bottom right"
            offset-x="4"
            offset-y="4"
          >
            <v-avatar
              :size="rail ? 36 : 44"
              color="secondary"
              class="user-avatar"
            >
              <span class="text-white text-body-1">{{
                getUserInitials()
              }}</span>
            </v-avatar>
          </v-badge>
          <v-avatar
            v-else
            :size="rail ? 36 : 44"
            color="secondary"
            class="user-avatar"
          >
            <span class="text-white text-body-1">{{ getUserInitials() }}</span>
          </v-avatar>
        </template>
        <transition name="fade-slide">
          <div v-show="!rail">
            <v-list-item-title
              class="text-subtitle-2 font-weight-medium user-name"
            >
              {{ userInfo.fullName || userInfo.email }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption user-email">
              {{ userInfo.email }}
            </v-list-item-subtitle>
          </div>
        </transition>
        <template v-if="!rail && userInfo.isAdmin" #append>
          <v-chip
            size="x-small"
            color="primary"
            variant="flat"
            class="admin-badge"
          >
            <v-icon size="12" start>mdi-shield-crown</v-icon>
            Admin
          </v-chip>
        </template>
      </v-list-item>
      <v-divider></v-divider>
    </div>

    <!-- Navigation Menu -->
    <v-list density="compact" nav class="navigation-menu">
      <template v-for="(item, index) in filteredNavigation" :key="item.id">
        <!-- Navigation Item with Children -->
        <v-list-group
          v-if="item.children && item.children.length > 0"
          :value="item.id"
          class="navigation-group"
          @click="onGroupClick"
        >
          <template #activator="{ props: activatorProps, isOpen }">
            <v-list-item
              v-bind="activatorProps"
              :prepend-icon="item.icon"
              :title="rail ? '' : item.title"
              class="navigation-item navigation-parent"
              :class="{ 'group-open': isOpen }"
            >
              <v-tooltip v-if="rail" activator="parent" location="right">
                {{ item.title }}
              </v-tooltip>
              <template v-if="item.badge && !rail" #append>
                <v-badge
                  :content="item.badge.text"
                  :color="item.badge.color"
                  inline
                  class="nav-badge"
                ></v-badge>
              </template>
            </v-list-item>
          </template>

          <!-- Child Items -->
          <v-list-item
            v-for="child in item.children"
            :key="child.id"
            :to="child.route"
            :prepend-icon="child.icon"
            :title="rail ? '' : child.title"
            class="navigation-item navigation-child-item"
            :class="{ 'active-route': isActiveRoute(child.route) }"
            @click="onItemClick"
          >
            <v-tooltip v-if="rail" activator="parent" location="right">
              {{ child.title }}
            </v-tooltip>
            <template v-if="child.badge && !rail" #append>
              <v-badge
                :content="child.badge.text"
                :color="child.badge.color"
                inline
                class="nav-badge"
              ></v-badge>
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Navigation Item without Children -->
        <v-list-item
          v-else
          :to="item.route"
          :prepend-icon="item.icon"
          :title="rail ? '' : item.title"
          class="navigation-item"
          :class="{ 'active-route': isActiveRoute(item.route) }"
          @click="onItemClick"
        >
          <v-tooltip v-if="rail" activator="parent" location="right">
            {{ item.title }}
          </v-tooltip>
          <template v-if="item.badge && !rail" #append>
            <v-badge
              :content="item.badge.text"
              :color="item.badge.color"
              inline
              class="nav-badge"
            ></v-badge>
          </template>
        </v-list-item>

        <!-- Divider with animation -->
        <v-divider
          v-if="item.divider"
          :key="`divider-${index}`"
          class="my-3 nav-divider"
        ></v-divider>
      </template>
    </v-list>

    <!-- Sidebar Footer -->
    <template #append>
      <div class="sidebar-footer">
        <v-divider></v-divider>
        <v-list density="compact" nav>
          <!-- Settings (Admin only) -->
          <v-list-item
            v-if="isAdmin"
            to="/system/settings"
            prepend-icon="mdi-cog"
            :title="rail ? '' : 'Settings'"
            class="footer-item"
          >
            <v-tooltip v-if="rail" activator="parent" location="right">
              Settings
            </v-tooltip>
          </v-list-item>

          <!-- Logout -->
          <v-list-item
            prepend-icon="mdi-logout"
            :title="rail ? '' : 'Logout'"
            class="footer-item logout-item"
            @click="handleLogout"
          >
            <v-tooltip v-if="rail" activator="parent" location="right">
              Logout
            </v-tooltip>
          </v-list-item>
        </v-list>

        <!-- Version Info with fade transition -->
        <transition name="fade">
          <div v-if="!rail" class="version-info text-center pa-2">
            <v-divider class="mb-2"></v-divider>
            <span class="text-caption text-medium-emphasis">v1.0.0</span>
          </div>
        </transition>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import { useAuthStore } from "@/stores/auth";
import { useDevModeStore } from "@/stores/devMode";
import {
  NAVIGATION_CONFIG,
  filterNavigationByPermissions,
} from "@/config/navigationConfig";

// Props & Emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

// Composables
const route = useRoute();
const router = useRouter();
const { mobile } = useDisplay();
const authStore = useAuthStore();
const devModeStore = useDevModeStore();

// State
const drawer = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const rail = ref(false);
const userInfo = ref(null);
const userGroups = ref([]);

// Computed
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

function toggleRail() {
  rail.value = !rail.value;
  // Add a small haptic feedback effect (visual pulse)
  const sidebar = document.querySelector(".navigation-sidebar");
  if (sidebar) {
    sidebar.classList.add("rail-toggle-pulse");
    setTimeout(() => sidebar.classList.remove("rail-toggle-pulse"), 300);
  }
}

function onItemClick() {
  // Close drawer on mobile after clicking
  if (mobile.value) {
    drawer.value = false;
  }
}

function onGroupClick() {
  // Optional: Add any group-specific behavior
  // For example, auto-expand in rail mode
  if (rail.value && !mobile.value) {
    rail.value = false;
  }
}

async function handleLogout() {
  try {
    await authStore.logout();
    router.push("/");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Logout failed:", error);
  }
}

async function loadUserInfo() {
  try {
    // Get user details from auth store
    if (authStore.cachedUserDetails) {
      userInfo.value = authStore.cachedUserDetails;
    }

    // Get user rights/groups from auth store
    if (authStore.cachedUserRights) {
      userGroups.value = authStore.cachedUserRights.groups || [];
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to load user info:", error);
  }
}

// Watchers
watch(mobile, (newValue) => {
  if (newValue) {
    rail.value = false;
  }
});

// Lifecycle
onMounted(() => {
  loadUserInfo();

  // Auto-collapse on mobile
  if (mobile.value) {
    drawer.value = false;
  }
});

// Watch for auth store updates
watch(
  () => authStore.cachedUserDetails,
  (newDetails) => {
    if (newDetails) {
      userInfo.value = newDetails;
    }
  },
);

watch(
  () => authStore.cachedUserRights,
  (newRights) => {
    if (newRights?.groups) {
      userGroups.value = newRights.groups;
    }
  },
);
</script>

<style scoped>
/* ========================================
   SIDEBAR BASE STYLES
   ======================================== */
.navigation-sidebar {
  background: linear-gradient(180deg, #1e1e1e 0%, #2d2d2d 100%);
  color: #ffffff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}

.navigation-sidebar :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Rail toggle pulse effect */
.rail-toggle-pulse {
  animation: pulse 0.3s ease-out;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.98);
  }
}

/* ========================================
   SIDEBAR HEADER
   ======================================== */
.sidebar-header {
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-header.header-rail {
  padding: 0;
}

.header-content {
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-avatar {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.logo-avatar:hover {
  transform: scale(1.05) rotate(5deg);
}

.company-info {
  overflow: hidden;
}

.company-name {
  line-height: 1.3;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-subtitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toggle-btn {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-btn:hover {
  transform: rotate(90deg);
}

/* ========================================
   USER INFO SECTION
   ======================================== */
.user-info-section {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-info-section:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-info-item {
  min-height: 72px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-info-rail .user-info-item {
  justify-content: center;
  min-height: 60px;
}

.user-avatar {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.user-avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.user-name,
.user-email {
  transition: all 0.3s ease;
}

.admin-badge {
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* ========================================
   NAVIGATION MENU
   ======================================== */
.navigation-menu {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;
}

/* Custom scrollbar */
.navigation-menu::-webkit-scrollbar {
  width: 6px;
}

.navigation-menu::-webkit-scrollbar-track {
  background: transparent;
}

.navigation-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0;
  transition: background 0.3s ease;
}

.navigation-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ========================================
   NAVIGATION ITEMS
   ======================================== */
.navigation-item {
  margin: 2px 8px;
  border-radius: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  overflow: hidden;
}

/* Hover effect with slide animation */
.navigation-item::before {
  content: "";
  position: absolute;
  left: -100%;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.5s ease;
}

.navigation-item:hover::before {
  left: 100%;
}

.navigation-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.navigation-item.active-route {
  background: linear-gradient(
    90deg,
    rgba(25, 118, 210, 0.25) 0%,
    rgba(25, 118, 210, 0.1) 100%
  ) !important;
  color: #ffffff;
  border-left: 3px solid #1976d2;
  transform: translateX(0);
  box-shadow: 0 2px 12px rgba(25, 118, 210, 0.3);
}

.navigation-item.active-route::after {
  content: "";
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: #1976d2;
  border-radius: 0;
  animation: glow 2s infinite;
}

@keyframes glow {
  0%,
  100% {
    box-shadow: 0 0 4px #1976d2;
  }
  50% {
    box-shadow: 0 0 12px #1976d2;
  }
}

/* Parent items in groups */
.navigation-parent {
  font-weight: 500;
}

.navigation-parent.group-open {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

/* Child items */
.navigation-child-item {
  margin-left: 24px;
  font-size: 0.875rem;
  padding-left: 48px !important;
}

.sidebar-rail .navigation-child-item {
  margin-left: 8px;
  padding-left: 16px !important;
}

/* ========================================
   NAVIGATION GROUP
   ======================================== */
.navigation-group :deep(.v-list-group__items) {
  background: rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease-out;
  border-radius: 0 !important;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.navigation-group :deep(.v-list-item__prepend) {
  opacity: 0.7;
  transition: all 0.3s ease;
}

.navigation-group:hover :deep(.v-list-item__prepend),
.navigation-item:hover :deep(.v-icon) {
  opacity: 1;
  color: #64b5f6;
  transform: scale(1.1);
}

.navigation-item.active-route :deep(.v-icon) {
  color: #1976d2;
  filter: drop-shadow(0 0 4px #1976d2);
}

/* ========================================
   BADGES
   ======================================== */
.nav-badge {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

/* ========================================
   DIVIDERS
   ======================================== */
.nav-divider {
  opacity: 0.3;
  margin: 8px 16px !important;
  transition: opacity 0.3s ease;
}

.navigation-menu:hover .nav-divider {
  opacity: 0.5;
}

/* ========================================
   SIDEBAR FOOTER
   ======================================== */
.sidebar-footer {
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-item {
  margin: 4px 8px;
  border-radius: 0;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.footer-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  transform: translateX(2px);
}

/* Make logout button and icon visible by default */
.logout-item {
  color: #ff5252 !important;
}
.logout-item :deep(.v-icon) {
  color: #ff5252 !important;
}
.logout-item:hover {
  background: rgba(244, 67, 54, 0.15) !important;
  color: #ff5252;
}
.logout-item:hover :deep(.v-icon) {
  color: #ff5252;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-3px);
  }
  75% {
    transform: translateX(3px);
  }
}

.version-info {
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.version-info:hover {
  opacity: 0.8;
}

/* ========================================
   TRANSITIONS & ANIMATIONS
   ======================================== */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Staggered animation for menu items */
.navigation-item {
  animation: fadeInUp 0.3s ease-out backwards;
}

.navigation-item:nth-child(1) {
  animation-delay: 0.05s;
}
.navigation-item:nth-child(2) {
  animation-delay: 0.1s;
}
.navigation-item:nth-child(3) {
  animation-delay: 0.15s;
}
.navigation-item:nth-child(4) {
  animation-delay: 0.2s;
}
.navigation-item:nth-child(5) {
  animation-delay: 0.25s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================
   RAIL MODE ADJUSTMENTS
   ======================================== */
.sidebar-rail .navigation-item {
  justify-content: center;
  padding: 12px 8px;
}

.sidebar-rail .v-list-item__prepend {
  margin-right: 0;
}

.sidebar-rail .footer-item {
  justify-content: center;
}

/* ========================================
   MOBILE ADJUSTMENTS
   ======================================== */
@media (max-width: 960px) {
  .navigation-sidebar {
    max-width: 280px;
  }

  .navigation-item:hover {
    transform: translateX(2px);
  }
}

/* ========================================
   THEME VARIANTS
   ======================================== */

/* Minimal, professional sidebar with brand colors */
.v-theme--dark .navigation-sidebar {
  background: #181e22;
}

.v-theme--light .navigation-sidebar {
  background: #f8fafc;
  color: #222;
  box-shadow: 2px 0 8px rgba(52, 124, 172, 0.07);
}

.v-theme--light .navigation-item {
  color: #222;
  border-left: 3px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.v-theme--light .navigation-item:hover {
  background: #eaf3f9 !important;
  color: #347cac;
  border-left: 3px solid #347cac;
}

.v-theme--light .navigation-item.active-route {
  background: #e0f0fa !important;
  color: #347cac;
  border-left: 3px solid #f08a4a;
  font-weight: 600;
}

.v-theme--light .user-info-section {
  background: #f3f7fa;
  border-bottom: 1px solid #e0e0e0;
}

.v-theme--light .sidebar-footer {
  background: #f3f7fa;
  border-top: 1px solid #e0e0e0;
}

/* ========================================
   ACCESSIBILITY
   ======================================== */

.navigation-item:focus-visible,
.footer-item:focus-visible {
  outline: 2px solid #347cac;
  outline-offset: 2px;
  background: #eaf3f9 !important;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .navigation-sidebar,
  .navigation-item,
  .user-avatar,
  .logo-avatar,
  .toggle-btn,
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
