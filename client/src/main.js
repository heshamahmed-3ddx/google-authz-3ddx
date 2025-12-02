import { createApp, nextTick } from "vue";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { mdi } from "vuetify/iconsets/mdi";
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

import App from "./App.vue";
import router from "./router";
import { themeConfig } from "./stores/theme.js";
import { i18n, isRTL } from "./i18n";

// Suppress workbox console logs
if (typeof window !== "undefined") {
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  const originalConsoleDebug = console.debug;
  const originalConsoleInfo = console.info;

  const suppressWorkbox = (originalMethod) => {
    return function (...args) {
      const message = args[0]?.toString() || "";
      // Filter out workbox-related console messages
      if (
        message.includes("workbox") ||
        message.includes("Workbox") ||
        message.includes("WORKBOX") ||
        args.some((arg) => {
          const str = String(arg || "");
          return (
            str.includes("workbox") ||
            str.includes("Workbox") ||
            str.includes("WORKBOX")
          );
        })
      ) {
        return; // Suppress workbox logs
      }
      originalMethod.apply(console, args);
    };
  };

  console.log = suppressWorkbox(originalConsoleLog);
  console.warn = suppressWorkbox(originalConsoleWarn);
  console.error = suppressWorkbox(originalConsoleError);
  console.debug = suppressWorkbox(originalConsoleDebug);
  console.info = suppressWorkbox(originalConsoleInfo);
}

// Import custom theme styles
import "./styles/theme.css";
// Import compact UI global styles
import "./styles/compact-ui.css";

// Enhanced Vuetify theme configuration with 3D Diagnostix colors
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    sets: {
      mdi,
    },
  },
  locale: {
    rtl: {
      ar: true,
      he: true,
      fa: true,
      ur: true,
    },
  },
  rtl: isRTL(i18n.global.locale.value),
  theme: {
    defaultTheme: "light",
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
      lighten: 3,
      darken: 3,
    },
    themes: {
      light: {
        dark: false,
        colors: themeConfig.light.colors,
      },
      dark: {
        dark: true,
        colors: themeConfig.dark.colors,
      },
    },
  },
  defaults: {
    VCard: {
      elevation: 1, // Compact default elevation
    },
    VBtn: {
      style: "text-transform: none;",
    },
    VAppBar: {
      elevation: 1,
    },
    VTextField: {
      density: "compact", // Compact default density
      variant: "outlined", // Outlined variant by default
      hideDetails: true, // Hide details by default for compact look
    },
    VSelect: {
      density: "compact",
      variant: "outlined",
      hideDetails: true,
    },
    VTextarea: {
      density: "compact",
      variant: "outlined",
      hideDetails: true,
    },
    VAutocomplete: {
      density: "compact",
      variant: "outlined",
      hideDetails: true,
    },
    VCombobox: {
      density: "compact",
      variant: "outlined",
      hideDetails: true,
    },
    VAlert: {
      density: "compact", // Compact default density
    },
    VList: {
      density: "compact",
    },
    VDataTable: {
      density: "compact", // Compact density for all tables
      class: "ultra-compact-table", // Apply ultra-compact styling
    },
  },
});


const app = createApp(App);
const pinia = createPinia();


// Development-only: suppress specific noisy Vue warnings in headless environments
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg) => {
    if (
      msg.includes(
        "onScopeDispose() is called when there is no active effect scope",
      ) ||
      msg.includes("withDirectives can only be used inside render functions") ||
      msg.includes(
        "Missing ref owner context. ref cannot be used on hoisted vnodes",
      )
    ) {
      return;
    }
    // Log other warnings normally
    // console.warn(`[Vue warn]: ${msg}`, trace);
  };
}

app.use(pinia);
app.use(i18n);
// Register Vuetify and router after Pinia and i18n so dependent components
// have access to stores and translations during initialization.
app.use(vuetify);

// Make Vuetify instance globally available for RTL handling
window.vuetifyInstance = vuetify;

app.use(router);

// Mount app
app.mount("#app");

// Mark app as mounted
document.body.classList.add("app-mounted");

// PWA Service Worker registration is handled automatically by vite-plugin-pwa
// The plugin registers the service worker and handles updates automatically
// No manual registration needed - the plugin injects the registration code

// Development-only: expose app internals for smoke-tests and debugging
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-undef
  window.__APP__ = {
    router,
    pinia,
  };
}
