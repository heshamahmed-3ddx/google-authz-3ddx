<template>
  <div class="theme-toggle-container">
    <v-menu
      v-model="showMenu"
      :close-on-content-click="true"
      location="bottom end"
      offset="4"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          variant="text"
          size="small"
          color="secondary"
          class="minimal-icon-btn theme-btn"
          :aria-label="`Current theme: ${themeStore.currentTheme}`"
        >
          <v-icon size="18" class="theme-icon">{{ currentThemeIcon }}</v-icon>
        </v-btn>
      </template>

      <v-card min-width="200" elevation="3" class="theme-card">
        <v-list density="compact" class="theme-menu">
          <v-list-subheader class="text-caption font-weight-medium px-4 py-2">
            {{ $t("theme.settings") }}
          </v-list-subheader>

          <v-divider class="my-1"></v-divider>

          <v-list-item
            :active="themeStore.currentTheme === 'light'"
            class="theme-option"
            @click="setTheme('light')"
          >
            <template #prepend>
              <v-icon color="amber-darken-2" size="20"
                >mdi-white-balance-sunny</v-icon
              >
            </template>
            <v-list-item-title class="text-body-2">{{
              $t("theme.light")
            }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            :active="themeStore.currentTheme === 'dark'"
            class="theme-option"
            @click="setTheme('dark')"
          >
            <template #prepend>
              <v-icon color="indigo" size="20">mdi-moon-waning-crescent</v-icon>
            </template>
            <v-list-item-title class="text-body-2">{{
              $t("theme.dark")
            }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useThemeStore } from "@/stores/theme";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();
const themeStore = useThemeStore();
const showMenu = ref(false);

const currentThemeIcon = computed(() => {
  if (themeStore.isAutoTheme) {
    return "mdi-theme-light-dark";
  }
  return themeStore.isDark
    ? "mdi-moon-waning-crescent"
    : "mdi-white-balance-sunny";
});

const setTheme = (theme) => {
  themeStore.setTheme(theme);
  showMenu.value = false;
};

// toggleAutoTheme removed as unused
</script>

<style scoped>
.theme-toggle-container {
  display: inline-flex;
}

.theme-btn {
  min-width: 36px !important;
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  border-radius: 6px !important;
  transition: all 0.15s ease !important;
}

.theme-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.04) !important;
}

.v-theme--dark .theme-btn:hover {
  background: rgba(255, 255, 255, 0.06) !important;
}

.theme-icon {
  transition: all 0.15s ease;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
}

.v-theme--dark .theme-icon {
  color: rgba(255, 255, 255, 0.7) !important;
}

.theme-btn:hover .theme-icon {
  transform: scale(1.05);
  color: rgba(var(--v-theme-on-surface), 0.9) !important;
}

.v-theme--dark .theme-btn:hover .theme-icon {
  color: rgba(255, 255, 255, 0.9) !important;
}

.theme-card {
  border-radius: 8px !important;
  overflow: hidden;
}

.theme-menu {
  padding: 4px 0;
}

.theme-option {
  min-height: 48px !important;
  cursor: pointer;
  border-radius: 0 !important;
}

.theme-option:hover {
  background-color: rgba(var(--v-theme-secondary), 0.05);
}

.theme-option.v-list-item--active {
  background-color: rgba(var(--v-theme-secondary), 0.08);
}

.theme-option.v-list-item--active :deep(.v-list-item-title) {
  font-weight: 500;
}
</style>
