import "vuetify/styles";
import { createVuetify } from "vuetify";
import { en, ar } from "vuetify/locale";
import colorSystem from "@/config/colorSystem.json";

/**
 * Enhanced Vuetify Configuration with Enterprise Color System
 *
 * This configuration implements the Fortune 500-level color palette
 * following Material Design 3 principles.
 *
 * To use: Replace the import in main.js from './plugins/vuetify.js'
 * to './plugins/vuetify.enhanced.js'
 */

// Light Theme Configuration
const lightTheme = {
  dark: false,
  colors: {
    // Primary (Orange Brand)
    primary: colorSystem.light.primary.main, // #FF8C00
    "primary-darken-1": colorSystem.light.primary.dark, // #E65100
    "primary-lighten-1": colorSystem.light.primary.light, // #FFB74D

    // Secondary (Blue)
    secondary: colorSystem.light.secondary.main, // #1976D2
    "secondary-darken-1": colorSystem.light.secondary.dark, // #1565C0
    "secondary-lighten-1": colorSystem.light.secondary.light, // #42A5F5

    // Accent (Purple)
    accent: colorSystem.light.accent.main, // #7B1FA2

    // Semantic Colors
    success: colorSystem.light.success.main, // #43A047
    warning: colorSystem.light.warning.main, // #FFA000
    error: colorSystem.light.error.main, // #E53935
    info: colorSystem.light.info.main, // #00897B

    // Background & Surface
    background: colorSystem.light.background.default, // #FAFAFA
    surface: colorSystem.light.background.paper, // #FFFFFF

    // Text Colors
    "on-primary": colorSystem.light.text.onPrimary, // #FFFFFF
    "on-secondary": colorSystem.light.text.onSecondary, // #FFFFFF
    "on-surface": colorSystem.light.text.onSurface, // #212121
    "on-background": colorSystem.light.text.primary, // #212121
    "on-success": colorSystem.light.text.onPrimary, // #FFFFFF
    "on-warning": colorSystem.light.text.onSurface, // #212121
    "on-error": colorSystem.light.text.onPrimary, // #FFFFFF
    "on-info": colorSystem.light.text.onPrimary, // #FFFFFF
  },
};

// Dark Theme Configuration
const darkTheme = {
  dark: true,
  colors: {
    // Primary (Orange Brand - Lighter for Dark Mode)
    primary: colorSystem.dark.primary.main, // #FFB74D
    "primary-darken-1": colorSystem.dark.primary.dark, // #FF9800
    "primary-lighten-1": colorSystem.dark.primary.light, // #FFCC80

    // Secondary (Blue - Lighter for Dark Mode)
    secondary: colorSystem.dark.secondary.main, // #64B5F6
    "secondary-darken-1": colorSystem.dark.secondary.dark, // #42A5F5
    "secondary-lighten-1": colorSystem.dark.secondary.light, // #90CAF9

    // Accent (Purple - Lighter for Dark Mode)
    accent: colorSystem.dark.accent.main, // #BA68C8

    // Semantic Colors (Lighter for Dark Mode)
    success: colorSystem.dark.success.main, // #66BB6A
    warning: colorSystem.dark.warning.main, // #FFCA28
    error: colorSystem.dark.error.main, // #EF5350
    info: colorSystem.dark.info.main, // #4DB6AC

    // Background & Surface
    background: colorSystem.dark.background.default, // #121212
    surface: colorSystem.dark.background.paper, // #1E1E1E

    // Text Colors
    "on-primary": colorSystem.dark.text.onPrimary, // #212121
    "on-secondary": colorSystem.dark.text.onSecondary, // #212121
    "on-surface": colorSystem.dark.text.onSurface, // #FFFFFF
    "on-background": colorSystem.dark.text.primary, // #FFFFFF
    "on-success": colorSystem.dark.text.onPrimary, // #212121
    "on-warning": colorSystem.dark.text.onPrimary, // #212121
    "on-error": colorSystem.dark.text.onPrimary, // #FFFFFF
    "on-info": colorSystem.dark.text.onPrimary, // #212121
  },
};

export default createVuetify({
  locale: {
    locale: "en",
    fallback: "en",
    messages: { en, ar },
    rtl: { ar: true },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
    variations: {
      colors: [
        "primary",
        "secondary",
        "accent",
        "success",
        "warning",
        "error",
        "info",
      ],
      lighten: 4,
      darken: 4,
    },
  },
  defaults: {
    VBtn: {
      style: "text-transform: none; font-weight: 500;",
    },
    VCard: {
      elevation: 1,
      style: "border-radius: 8px;",
    },
    VChip: {
      style: "font-weight: 500;",
    },
    VIcon: {
      size: 20,
    },
  },
});
