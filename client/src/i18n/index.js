import { createI18n } from "vue-i18n";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

const messages = {
  en,
  ar,
};

// Get saved locale from localStorage or default to 'en'
const savedLocale = localStorage.getItem("locale") || "en";

export const i18n = createI18n({
  locale: savedLocale,
  fallbackLocale: "en",
  messages,
  legacy: false,
  globalInjection: true,
});

// RTL languages list
export const rtlLanguages = ["ar", "he", "fa", "ur"];

// Language configuration
export const supportedLanguages = [
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

// Helper function to check if current locale is RTL
export const isRTL = (locale = i18n.global.locale.value) => {
  return rtlLanguages.includes(locale);
};

// Helper function to set locale and update document direction
export const setLocale = (locale) => {
  // Just update the i18n locale - App.vue watcher will handle all the rest
  // This keeps all locale/RTL logic in one place (App.vue)
  i18n.global.locale.value = locale;
  localStorage.setItem("locale", locale);
  
  // The App.vue watcher will handle:
  // - Vuetify locale update
  // - Document direction update
  // - CSS classes
  // - All reactive updates
};

// Initialize document direction on load
setLocale(savedLocale);

export default i18n;
