/**
 * Simple global loader plugin for Vue 3
 * - Exposes two functions: showLoader() and hideLoader()
 * - Uses a small debounce (200ms) to avoid flashing for short ops
 * - Uses a reactive `isLoading` state (read-only) that components can use
 * - Can be registered as a plugin via `app.use(globalLoaderPlugin)`
 *
 * Usage:
 *  import globalLoaderPlugin, { showLoader, hideLoader, isLoading } from '@/plugins/global-loader'
 *  app.use(globalLoaderPlugin)
 *
 *  // In components (Options API)
 *  this.$showLoader()
 *  this.$hideLoader()
 *
 *  // Or import helpers directly
 *  import { showLoader, hideLoader } from '@/plugins/global-loader'
 */
import { reactive, readonly, computed } from "vue";

// Internal reactive state
const state = reactive({
  _count: 0,
  _visible: false,
});

// Exposed reactive boolean that components can read
const isLoading = computed(() => state._visible);

// Debounce delay (ms) before showing the overlay. In development we show
// the loader immediately to make it easy to verify the overlay is mounted.
const SHOW_DELAY = import.meta.env.DEV ? 0 : 200;

let _showTimer = null;

/**
 * showLoader()
 * - Increment active counter and (if this is the first) schedule the overlay
 *   to be shown after SHOW_DELAY ms. If hideLoader() runs before the delay
 *   expires, the overlay will never appear.
 */
function showLoader() {
  state._count += 1;
  // If this is the first caller, schedule or show immediately depending on SHOW_DELAY
  if (state._count === 1) {
    if (SHOW_DELAY <= 0) {
      state._visible = true;
      _showTimer = null;
    } else {
      _showTimer = setTimeout(() => {
        state._visible = true;
        _showTimer = null;
      }, SHOW_DELAY);
    }
  }
}

/**
 * hideLoader()
 * - Decrement active counter and hide overlay when count reaches zero.
 * - If hideLoader is called before the debounce timer fired, cancel the
 *   pending show so the overlay never appears.
 */
function hideLoader() {
  if (state._count <= 0) return;
  state._count -= 1;

  if (state._count === 0) {
    // If a show is pending, cancel it (no visible overlay ever shown)
    if (_showTimer) {
      clearTimeout(_showTimer);
      _showTimer = null;
      state._visible = false;
      return;
    }

    // If overlay was visible, hide it immediately
    if (state._visible) {
      state._visible = false;
    }
  }
}

/**
 * Plugin install function
 * - Provides functions via provide/inject and also attaches to globalProperties
 */
const globalLoaderPlugin = {
  install(app) {
    // Provide to the composition API
    app.provide("globalLoader", {
      showLoader,
      hideLoader,
      isLoading: readonly(isLoading),
    });

    // Configure globalProperties for Options API / templates
    // Usage in Options API: this.$showLoader(), this.$hideLoader()
    app.config.globalProperties.$showLoader = showLoader;
    app.config.globalProperties.$hideLoader = hideLoader;

    // Optionally expose a read-only `isLoading` on globalProperties
    Object.defineProperty(app.config.globalProperties, "$isLoading", {
      get: () => isLoading.value,
    });
  },
};

// Export helpers for direct import as well as the plugin default
export { showLoader, hideLoader, isLoading };
export default globalLoaderPlugin;
