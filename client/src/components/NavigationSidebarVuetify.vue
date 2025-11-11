<template>
  <v-navigation-drawer
    v-model="drawer"
    :location="$vuetify.locale.isRtl ? 'right' : 'left'"
    app
    width="220"
    class="navigation-sidebar minimal-sidebar elevation-1"
  >
    <!-- Sidebar Header: Minimal Logo -->
    <v-list-item class="sidebar-header pa-3 d-flex align-center justify-center">
      <v-avatar color="primary" size="32" class="logo-avatar">
        <v-icon color="white" size="20">mdi-domain</v-icon>
      </v-avatar>
    </v-list-item>
    <v-divider></v-divider>

    <!-- Navigation Menu -->
    <v-list nav class="navigation-menu">
      <v-list-item
        v-for="item in navigation"
        :key="item.id"
        :to="item.route"
        :prepend-icon="item.icon"
        :title="$t('navigation.' + item.id)"
        :active="isActiveRoute(item.route)"
        class="navigation-item minimal-nav-item"
        rounded
      />
    </v-list>
    <v-divider></v-divider>
    <!-- Footer: Minimal Info -->
    <div class="sidebar-footer pa-3 d-flex flex-column align-center">
      <v-icon color="grey" size="18" class="mb-1">mdi-information</v-icon>
      <span class="text-caption text-medium-emphasis">{{
        $t("sidebar.footerText")
      }}</span>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from "vue";
const drawer = ref(true);

// Example navigation items
const navigation = [
  { id: "dashboard", route: "/dashboard", icon: "mdi-view-dashboard" },
  { id: "reports", route: "/reports", icon: "mdi-file-chart" },
  // Add more items as needed
];

function isActiveRoute(route) {
  return window.location.pathname === route;
}
</script>

<style scoped>
.minimal-sidebar {
  border-inline-end: 1px solid #e0e3e7;
  background: #fff;
  border-radius: 0;
  box-shadow: none;
}
.sidebar-header {
  background: transparent;
  border-radius: 0;
  min-height: 56px;
}
.logo-avatar {
  box-shadow: none;
}
.navigation-menu {
  margin-top: 4px;
}
.minimal-nav-item {
  transition:
    background 0.2s,
    color 0.2s;
  border-radius: 6px !important;
  font-size: 0.98rem;
  font-weight: 500;
  padding: 8px 12px;
  margin: 2px 0;
}
.minimal-nav-item:hover {
  background: #f5f7fa !important;
  color: #1976d2 !important;
}
.minimal-nav-item.v-list-item--active {
  background: #1976d2 !important;
  color: #fff !important;
}
.sidebar-footer {
  text-align: center;
  font-size: 0.85rem;
  color: #888;
  border-radius: 0;
  background: transparent;
  margin-top: 8px;
}
</style>
