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
// NProgress for top-of-page progress indicator
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { themeConfig } from "./stores/theme.js";
import { i18n, isRTL } from "./i18n";
import { showLoader, hideLoader } from "./plugins/global-loader";
import globalLoaderPlugin from "./plugins/global-loader";
import GlobalLoader from "./components/GlobalLoader.vue";

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

// Network instrumentation: wrap fetch and XMLHttpRequest so all requests
// (even those triggered during component mount) will start/stop the global loader.
try {
  if (typeof window !== "undefined") {
    // FETCH
    if (window.fetch) {
      const _origFetch = window.fetch.bind(window);
      window.fetch = async (...args) => {
        const init = args[1] || {};
        const headers = (init && init.headers) || {};
        const suppress = Boolean(
          init.suppressLoader ||
            headers["X-Suppress-Loader"] === "1" ||
            headers["x-suppress-loader"] === "1",
        );
        const forceLoader = Boolean(init.forceLoader || init._forceLoader);
        const shouldShow = !(suppress && !forceLoader);
        if (shouldShow) showLoader();
        try {
          const res = await _origFetch(...args);
          if (shouldShow) hideLoader();
          return res;
        } catch (err) {
          if (shouldShow) hideLoader();
          throw err;
        }
      };
    }

    // XHR
    if (window.XMLHttpRequest) {
      const XHR = window.XMLHttpRequest;
      const origOpen = XHR.prototype.open;
      const origSend = XHR.prototype.send;
      XHR.prototype.open = function (method, url, ...rest) {
        this.__requestUrl = url;
        return origOpen.apply(this, [method, url, ...rest]);
      };
      XHR.prototype.send = function (_body) {
        try {
          const url = this.__requestUrl || "";
          const isStatic = /\.(png|jpg|jpeg|svg|gif|ico|css|js)(\?.*)?$/.test(
            url,
          );
          const suppress = isStatic; // keep lightweight here - axios handles patterns
          const shouldShow = !suppress;
          if (shouldShow) showLoader();
          this.addEventListener("loadend", () => {
            if (shouldShow) hideLoader();
          });
        } catch (e) {
          // ignore
        }
        return origSend.apply(this, arguments);
      };
    }
  }
} catch (e) {
  // ignore instrumentation errors
}

const app = createApp(App);
const pinia = createPinia();

// Install global loader plugin and register the minimal component
app.use(globalLoaderPlugin);
app.component("GlobalLoader", GlobalLoader);

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

// Wire NProgress to router navigation
router.beforeEach((to, from, next) => {
  NProgress.start();
  next();
});

router.afterEach(() => {
  NProgress.done();
});

// Register service worker in production for basic caching/PWA behavior
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("Service worker registration failed:", err);
    });
  });
}
// (fetch/XHR instrumentation is configured earlier in this file)

// Development-only: expose app internals for smoke-tests and debugging
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-undef
  window.__APP__ = {
    router,
    pinia,
  };
}
