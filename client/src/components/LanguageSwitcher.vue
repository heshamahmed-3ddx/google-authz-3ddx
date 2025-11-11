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
          class="language-btn"
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
import { setLocale, isRTL } from "@/i18n";

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
    const wasRTL = isRTL(currentLocale.value);
    const willBeRTL = isRTL(languageCode);

    setLocale(languageCode);

    // Only reload if RTL direction changes for smoother UX
    if (wasRTL !== willBeRTL) {
      // Add a smooth transition effect
      document.body.style.transition = "all 0.3s ease";
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  }
  showMenu.value = false;
};
</script>

<style scoped>
.language-switcher {
  display: inline-flex;
}

.language-btn {
  min-width: 56px !important;
  height: 36px !important;
  padding: 0 12px !important;
  text-transform: none !important;
  letter-spacing: normal !important;
}

.language-btn :deep(.v-btn__content) {
  gap: 6px;
}

.lang-icon {
  opacity: 0.7;
  transition: opacity 0.2s, color 0.2s;
  color: #146e9c !important; /* Brand blue for light mode */
}

.v-theme--dark .lang-icon {
  color: #ef9043 !important; /* Brand orange for dark mode */
}

.language-btn:hover .lang-icon {
  opacity: 1;
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
