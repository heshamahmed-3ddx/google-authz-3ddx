import { createApp } from "vue";
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

// Import custom theme styles
import "./styles/theme.css";

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
      elevation: 2,
    },
    VBtn: {
      style: "text-transform: none;",
    },
    VAppBar: {
      elevation: 1,
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

// Remove initial loader once app is mounted
setTimeout(() => {
  document.body.classList.add("app-mounted");
}, 100);

// Development-only: expose app internals for smoke-tests and debugging
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-undef
  window.__APP__ = {
    router,
    pinia,
  };
}
