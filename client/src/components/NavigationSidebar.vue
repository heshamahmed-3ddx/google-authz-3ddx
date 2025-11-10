/* Sidebar elements: prefer rounded corners from theme */
.v-list-item, .v-list-group,
.v-list-group__items, .v-list-item__prepend, .v-list-item__append,
.v-list-item__content, .v-list-item__title, .v-list-item__subtitle {
  border-radius: var(--border-radius-sm) !important;
}

.navigation-sidebar, .sidebar-header, .user-info-section, .sidebar-footer,
.navigation-menu, .navigation-item, .footer-item, .logout-item,
.navigation-group :deep(.v-list-group__items),
.navigation-item.active-route::after, .logo-avatar, .user-avatar {
  border-radius: var(--border-radius-sm) !important;
}
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
          <v-icon :size="rail ? 22 : 26" color="white">mdi-domain</v-icon>
        </v-avatar>
        <transition name="fade-slide">
          <div v-show="!rail" class="flex-grow-1 company-info">
            <div class="text-h6 font-weight-bold company-name">
              {{ $t("sidebar.companyName") }}
            </div>
            <div class="text-caption text-medium-emphasis company-subtitle">
              {{ $t("sidebar.companySubtitle") }}
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
            {{ rail ? $t("nav.expand") : $t("nav.collapse") }}
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
              :title="rail ? '' : $t('navigation.' + item.id)"
              class="navigation-item navigation-parent"
              :class="{ 'group-open': isOpen }"
            >
              <v-tooltip v-if="rail" activator="parent" location="right">
                {{ $t("navigation." + item.id) }}
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
            :title="rail ? '' : $t('navigation.' + child.id)"
            class="navigation-item navigation-child-item"
            :class="{ 'active-route': isActiveRoute(child.route) }"
            @click="onItemClick"
          >
            <v-tooltip v-if="rail" activator="parent" location="right">
              {{ $t("navigation." + child.id) }}
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
          :title="rail ? '' : $t('navigation.' + item.id)"
          class="navigation-item"
          :class="{ 'active-route': isActiveRoute(item.route) }"
          @click="onItemClick"
        >
          <v-tooltip v-if="rail" activator="parent" location="right">
            {{ $t("navigation." + item.id) }}
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
            :title="rail ? '' : $t('nav.settings')"
            class="footer-item"
          >
            <v-tooltip v-if="rail" activator="parent" location="right">
              {{ $t("nav.settings") }}
            </v-tooltip>
          </v-list-item>

          <!-- Logout -->
          <v-list-item
            prepend-icon="mdi-logout"
            :title="rail ? '' : $t('nav.logout')"
            class="footer-item logout-item"
            @click="handleLogout"
          >
            <v-tooltip v-if="rail" activator="parent" location="right">
              {{ $t("nav.logout") }}
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
   SIDEBAR BASE STYLES - FLAT DESIGN
   ======================================== */
.navigation-sidebar {
  background: #ffffff;
  color: #333333;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none !important;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
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
   SIDEBAR HEADER - FLAT DESIGN
   ======================================== */
.sidebar-header {
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
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
  border-radius: 0 !important;
}

.logo-avatar:hover {
  transform: scale(1.05);
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
  color: #333333;
}

.company-subtitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #666666;
}

.toggle-btn {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 !important;
}

.toggle-btn:hover {
  transform: rotate(90deg);
}

/* ========================================
   USER INFO SECTION - FLAT DESIGN
   ======================================== */
.user-info-section {
  flex-shrink: 0;
  background: #f5f5f5;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-info-section:hover {
  background: #eeeeee;
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
  border-radius: 0 !important;
}

.user-avatar:hover {
  transform: scale(1.08);
}

.user-name,
.user-email {
  transition: all 0.3s ease;
  color: #333333;
}

.admin-badge {
  animation: shimmer 2s infinite;
  border-radius: 0 !important;
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
   NAVIGATION MENU - FLAT DESIGN
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
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0;
  transition: background 0.3s ease;
}

.navigation-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* ========================================
   NAVIGATION ITEMS - FLAT DESIGN
   ======================================== */
.navigation-item {
  margin: 2px 8px;
  border-radius: 0 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #666666;
  position: relative;
  overflow: hidden;
}

.navigation-item:hover {
  background: #f5f5f5 !important;
  color: #333333;
  transform: translateX(4px);
}

.navigation-item.active-route {
  background: #e3f2fd !important;
  color: #1976d2;
  border-left: 3px solid #1976d2;
  transform: translateX(0);
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
  border-radius: 0 !important;
}

.sidebar-rail .navigation-child-item {
  margin-left: 8px;
  padding-left: 16px !important;
}

/* ========================================
   NAVIGATION GROUP - FLAT DESIGN
   ======================================== */
.navigation-group :deep(.v-list-group__items) {
  background: #f9f9f9;
  animation: slideDown 0.3s ease-out;
  border-radius: 0 !important;
  border-left: 2px solid #e0e0e0;
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
  color: #1976d2;
  transform: scale(1.1);
}

.navigation-item.active-route :deep(.v-icon) {
  color: #1976d2;
}

/* ========================================
   BADGES - FLAT DESIGN
   ======================================== */
.nav-badge {
  animation: bounce 2s infinite;
  border-radius: 0 !important;
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
   DIVIDERS - FLAT DESIGN
   ======================================== */
.nav-divider {
  opacity: 0.3;
  margin: 8px 16px !important;
  transition: opacity 0.3s ease;
  background-color: rgba(0, 0, 0, 0.08) !important;
}

.navigation-menu:hover .nav-divider {
  opacity: 0.5;
}

/* ========================================
   SIDEBAR FOOTER - FLAT DESIGN
   ======================================== */
.sidebar-footer {
  flex-shrink: 0;
  background: #f5f5f5;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.footer-item {
  margin: 4px 8px;
  border-radius: 0 !important;
  color: #666666;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.footer-item:hover {
  background: #eeeeee;
  color: #333333;
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
   THEME VARIANTS - FLAT DESIGN
   ======================================== */

/* Dark theme */
.v-theme--dark .navigation-sidebar {
  background: #1e1e1e;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.v-theme--dark .navigation-item {
  color: #cccccc;
}

.v-theme--dark .navigation-item:hover {
  background: #2d2d2d !important;
  color: #ffffff;
}

.v-theme--dark .navigation-item.active-route {
  background: #1e3a5f !important;
  color: #64b5f6;
  border-left: 3px solid #64b5f6;
}

.v-theme--dark .user-info-section {
  background: #2d2d2d;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.v-theme--dark .sidebar-footer {
  background: #2d2d2d;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.v-theme--dark .user-name,
.v-theme--dark .user-email {
  color: #ffffff;
}

.v-theme--dark .company-name {
  color: #ffffff;
}

.v-theme--dark .company-subtitle {
  color: #cccccc;
}

/* Light theme - already defined above as default */
.v-theme--light .navigation-sidebar {
  background: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

.v-theme--light .navigation-item {
  color: #666666;
}

.v-theme--light .navigation-item:hover {
  background: #f5f5f5 !important;
  color: #333333;
}

.v-theme--light .navigation-item.active-route {
  background: #e3f2fd !important;
  color: #1976d2;
  border-left: 3px solid #1976d2;
}

.v-theme--light .user-info-section {
  background: #f5f5f5;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.v-theme--light .sidebar-footer {
  background: #f5f5f5;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* ========================================
   ACCESSIBILITY
   ======================================== */

.navigation-item:focus-visible,
.footer-item:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
  background: #f5f5f5 !important;
}

.v-theme--dark .navigation-item:focus-visible,
.v-theme--dark .footer-item:focus-visible {
  outline: 2px solid #64b5f6;
  background: #2d2d2d !important;
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
