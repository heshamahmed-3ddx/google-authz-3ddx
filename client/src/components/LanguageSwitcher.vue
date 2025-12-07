<template>
  <div class="language-switcher">
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
          class="minimal-icon-btn language-btn"
          :aria-label="`Current language: ${currentLanguage.nativeName}`"
        >
          <v-icon size="18" class="lang-icon">mdi-web</v-icon>
          <span class="lang-code">{{
            currentLanguage.code.toUpperCase()
          }}</span>
        </v-btn>
      </template>

      <v-card min-width="240" elevation="3" class="language-card">
        <v-list density="compact" class="language-menu">
          <v-list-subheader class="text-caption font-weight-medium px-4 py-2">
            {{ $t("language.switch") }}
          </v-list-subheader>

          <v-divider class="my-1"></v-divider>

          <v-list-item
            v-for="language in supportedLanguages"
            :key="language.code"
            :active="currentLocale === language.code"
            class="language-option"
            @click="changeLanguage(language.code)"
          >
            <v-list-item-title class="text-body-2">
              {{ language.nativeName }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ language.name }}
            </v-list-item-subtitle>

            <template #append>
              <v-icon
                v-if="currentLocale === language.code"
                color="secondary"
                size="18"
              >
                mdi-check-circle
              </v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { setLocale } from "@/i18n";

const { locale } = useI18n();

// Supported languages
const supportedLanguages = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    countryCode: "US",
    dir: "ltr",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    countryCode: "EG",
    dir: "rtl",
  },
];
const showMenu = ref(false);

// Current locale
const currentLocale = computed(() => locale.value);

// Current language object
const currentLanguage = computed(() => {
  return (
    supportedLanguages.find((lang) => lang.code === currentLocale.value) ||
    supportedLanguages[0]
  );
});

// Change language
const changeLanguage = (languageCode) => {
  if (languageCode !== currentLocale.value) {
    // setLocale will update i18n locale, which App.vue watches to update Vuetify locale
    setLocale(languageCode);
    // App.vue watcher will handle Vuetify locale and RTL updates automatically
  }
  showMenu.value = false;
};
</script>

<style scoped>
.language-switcher {
  display: inline-flex;
}

.language-btn {
  min-width: 44px !important;
  height: 36px !important;
  padding: 0 8px !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  border-radius: 6px !important;
  transition: all 0.15s ease !important;
}

.language-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.04) !important;
}

.v-theme--dark .language-btn:hover {
  background: rgba(255, 255, 255, 0.06) !important;
}

.language-btn :deep(.v-btn__content) {
  gap: 6px;
}

.lang-icon {
  transition: all 0.15s ease;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
}

.v-theme--dark .lang-icon {
  color: rgba(255, 255, 255, 0.7) !important;
}

.language-btn:hover .lang-icon {
  color: rgba(var(--v-theme-on-surface), 0.9) !important;
}

.v-theme--dark .language-btn:hover .lang-icon {
  color: rgba(255, 255, 255, 0.9) !important;
}

.lang-code {
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
}

.language-card {
  border-radius: 8px !important;
  overflow: hidden;
}

.language-menu {
  padding: 4px 0;
}

.language-option {
  min-height: 56px !important;
  cursor: pointer;
  border-radius: var(--border-radius-sm) !important;
}

.language-option:hover {
  background-color: rgba(var(--v-theme-secondary), 0.05);
}

.language-option.v-list-item--active {
  background-color: rgba(var(--v-theme-secondary), 0.08);
}

/* RTL support */
[dir="rtl"] .language-btn :deep(.v-btn__content) {
  flex-direction: row-reverse;
}
</style>
