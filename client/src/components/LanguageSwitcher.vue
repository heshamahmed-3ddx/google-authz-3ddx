<template>
  <div class="language-switcher">
    <v-menu
      v-model="showMenu"
      :close-on-content-click="true"
      location="bottom end"
      offset="8"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          variant="text"
          class="language-toggle"
          :aria-label="`Current language: ${currentLanguage.nativeName}. Click to change language`"
        >
          <span class="flag-emoji">{{ currentLanguage.flag }}</span>
        </v-btn>
      </template>

      <v-card min-width="200" elevation="8">
        <v-list class="language-menu">
          <v-list-subheader>
            <v-icon class="mr-2">mdi-translate</v-icon>
            {{ $t("language.switch") }}
          </v-list-subheader>

          <v-divider></v-divider>

          <!-- Language Options -->
          <v-list-item
            v-for="language in supportedLanguages"
            :key="language.code"
            :active="currentLocale === language.code"
            class="language-option"
            @click="changeLanguage(language.code)"
          >
            <template #prepend>
              <span class="flag-emoji mr-3">{{ language.flag }}</span>
            </template>

            <v-list-item-title>{{ language.nativeName }}</v-list-item-title>
            <v-list-item-subtitle>{{ language.name }}</v-list-item-subtitle>

            <template v-if="currentLocale === language.code" #append>
              <v-icon color="success" size="small">mdi-check</v-icon>
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
    flag: "🇺🇸",
    dir: "ltr",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
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
  position: relative;
  display: inline-block;
}

.language-toggle {
  min-width: 40px !important;
  width: 40px;
  height: 40px;
}

.flag-emoji {
  font-size: 20px;
  line-height: 1;
}

.language-menu {
  padding: 8px 0;
}

.language-option {
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 8px 16px;
}

.language-option:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.language-option.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.12);
}

/* RTL adjustments */
[dir="rtl"] .language-option {
  text-align: right;
}

[dir="rtl"] .flag-emoji {
  margin-left: 12px;
  margin-right: 0;
}
</style>
