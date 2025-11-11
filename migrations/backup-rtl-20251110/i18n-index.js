// Backup of original RTL logic
// Source: client/src/i18n/index.js

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
		flag: "1fa1f8",
		dir: "ltr",
	},
	{
		code: "ar",
		name: "Arabic",
		nativeName: "1f81e6",
		flag: "1f81e6",
		dir: "rtl",
	},
];

// Helper function to check if current locale is RTL
export const isRTL = (locale = i18n.global.locale.value) => {
	return rtlLanguages.includes(locale);
};

// Helper function to set locale and update document direction
export const setLocale = (locale) => {
	i18n.global.locale.value = locale;
	localStorage.setItem("locale", locale);

	const isRtl = isRTL(locale);

	// Update document attributes
	document.documentElement.lang = locale;
	document.documentElement.dir = isRtl ? "rtl" : "ltr";

	// Add CSS classes for styling
	document.documentElement.classList.toggle("rtl", isRtl);
	document.documentElement.classList.toggle("ltr", !isRtl);

	// Update body class for global RTL styles
	document.body.classList.toggle("rtl", isRtl);
	document.body.classList.toggle("ltr", !isRtl);

	// Update Vuetify RTL if available
	if (window.vuetifyInstance && window.vuetifyInstance.framework) {
		window.vuetifyInstance.framework.rtl.value = isRtl;
	}

	// Locale changed
};

// Initialize document direction on load
setLocale(savedLocale);

export default i18n;

