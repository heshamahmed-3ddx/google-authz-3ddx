<template>
  <!-- Sidebar Drawer with responsive, minimal, professional design -->
  <v-navigation-drawer
    v-model="drawer"
    :location="$vuetify.locale.isRtl ? 'right' : 'left'"
    app
    :width="drawer ? 260 : 72"
    :permanent="!isMobile"
    :rail="!drawer"
    class="sidebar-enhanced"
    :color="$vuetify.theme.current.dark ? 'grey-darken-4' : 'grey-lighten-5'"
    elevation="2"
  >
    <!-- App Logo/Initials -->
    <v-list-item class="sidebar-logo pa-4 d-flex align-center justify-center">
      <v-avatar size="40" color="primary">
        <span class="text-h6 font-weight-bold white--text">IH</span>
      </v-avatar>
    </v-list-item>
    <!-- Divider -->
    <v-divider></v-divider>
    <!-- Navigation Items -->
    <v-list nav density="comfortable">
      <v-list-item
        v-for="item in navigation"
        :key="item.id"
        :to="item.route"
        :prepend-icon="item.icon"
        :title="drawer ? $t(item.label) : ''"
        :aria-label="$t(item.label)"
        class="sidebar-item"
        rounded
        :active="isActiveRoute(item.route)"
      >
        <!-- Tooltip for collapsed state -->
        <template #prepend>
          <v-tooltip v-if="!drawer" location="right" :text="$t(item.label)">
            <template #activator="{ props }">
              <v-icon v-bind="props" :icon="item.icon" size="24" />
            </template>
          </v-tooltip>
        </template>
        <template v-if="drawer">
          <span class="sidebar-label">{{ $t(item.label) }}</span>
        </template>
      </v-list-item>
    </v-list>
    <!-- Spacer -->
    <div class="flex-grow-1"></div>
    <!-- Dark Mode Toggle -->
    <v-list-item class="sidebar-footer pa-2 d-flex align-center justify-center">
      <v-btn
        icon
        variant="text"
        :aria-label="$t('sidebar.toggleTheme')"
        @click="toggleTheme"
      >
        <v-icon
          :icon="
            $vuetify.theme.current.dark
              ? 'mdi-weather-sunny'
              : 'mdi-weather-night'
          "
        />
      </v-btn>
    </v-list-item>
    <!-- Logout -->
    <v-list-item class="sidebar-footer pa-2 d-flex align-center justify-center">
      <v-btn
        icon
        variant="text"
        :to="'/logout'"
        :aria-label="$t('navigation.logout')"
      >
        <v-icon icon="mdi-logout" />
      </v-btn>
    </v-list-item>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useDisplay } from "vuetify";
const drawer = ref(true);
const { mobile } = useDisplay();
const isMobile = computed(() => mobile.value);

// Navigation items
const navigation = [
  {
    id: "dashboard",
    route: "/dashboard",
    icon: "mdi-view-dashboard",
    label: "navigation.dashboard",
  },
  {
    id: "analytics",
    route: "/analytics",
    icon: "mdi-chart-bar",
    label: "navigation.analytics",
  },
  {
    id: "users",
    route: "/users",
    icon: "mdi-account-group",
    label: "navigation.users",
  },
  {
    id: "settings",
    route: "/settings",
    icon: "mdi-cog",
    label: "navigation.settings",
  },
];

function isActiveRoute(route) {
  return window.location.pathname === route;
}

function toggleTheme() {
  $vuetify.theme.current.dark = !$vuetify.theme.current.dark;
}

// Collapse sidebar on mobile
onMounted(() => {
  if (isMobile.value) drawer.value = false;
});
</script>

<style scoped>
.sidebar-enhanced {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-inline-end: 1px solid rgba(0, 0, 0, 0.07);
  min-height: 100vh;
}
.sidebar-logo {
  justify-content: center;
}
.sidebar-item {
  transition:
    background 0.2s,
    color 0.2s;
  font-size: 1rem;
  font-weight: 500;
  margin-inline: 4px;
  margin-block: 2px;
  border-radius: 8px !important;
}
.sidebar-item:hover {
  background: rgba(33, 150, 243, 0.08) !important;
  color: #1976d2 !important;
}
.sidebar-item.v-list-item--active {
  background: #1976d2 !important;
  color: #fff !important;
}
.sidebar-label {
  margin-inline-start: 12px;
}
.sidebar-footer {
  border-radius: 8px;
}
</style>
