<template>
  <div class="theme-toggle-container">
    <v-menu
      v-model="showMenu"
      :close-on-content-click="true"
      location="bottom end"
      offset="8"
    >
      <template #activator="{ props }">
        <v-btn v-bind="props" icon variant="text" size="small">
          <v-icon>{{ currentThemeIcon }}</v-icon>
        </v-btn>
      </template>

      <v-card min-width="250" elevation="8">
        <v-list>
          <v-list-subheader>
            <v-icon class="mr-2">mdi-palette</v-icon>
            {{ $t("theme.settings") }}
          </v-list-subheader>

          <v-divider></v-divider>

          <v-list-item
            :active="themeStore.currentTheme === 'light'"
            @click="setTheme('light')"
          >
            <template #prepend>
              <v-icon color="amber">mdi-white-balance-sunny</v-icon>
            </template>
            <v-list-item-title>{{ $t("theme.light") }}</v-list-item-title>
          </v-list-item>

          <v-list-item
            :active="themeStore.currentTheme === 'dark'"
            @click="setTheme('dark')"
          >
            <template #prepend>
              <v-icon color="blue-grey">mdi-moon-waning-crescent</v-icon>
            </template>
            <v-list-item-title>{{ $t("theme.dark") }}</v-list-item-title>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item @click="toggleAutoTheme">
            <template #prepend>
              <v-icon :color="themeStore.isAutoTheme ? 'primary' : 'grey'">
                mdi-theme-light-dark
              </v-icon>
            </template>
            <v-list-item-title>{{ $t("theme.autoSystem") }}</v-list-item-title>
            <template #append>
              <v-switch
                :model-value="themeStore.isAutoTheme"
                color="primary"
                hide-details
                density="compact"
              ></v-switch>
            </template>
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

const toggleAutoTheme = () => {
  themeStore.toggleAutoTheme();
  showMenu.value = false;
};
</script>

<style scoped>
.theme-toggle-container {
  position: relative;
}
</style>
