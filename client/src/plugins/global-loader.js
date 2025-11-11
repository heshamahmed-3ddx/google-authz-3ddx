/**
 * Enhanced global loader plugin for Vue 3
 * - Exposes two functions: showLoader() and hideLoader()
 * - Uses a small debounce (200ms) to avoid flashing for short ops
 * - Uses a reactive `isLoading` state (read-only) that components can use
 * - Handles multiple simultaneous requests with a counter system
 * - Includes safety mechanisms to prevent stuck loaders
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
  _lastAction: null, // Track last action for debugging
  _lastTimestamp: null, // Track when loader was shown
});

// Exposed reactive boolean that components can read
const isLoading = computed(() => state._visible);

// Debounce delay (ms) before showing the overlay. In development we show
// the loader immediately to make it easy to verify the overlay is mounted.
const SHOW_DELAY = import.meta.env.DEV ? 0 : 200;

// Safety timeout: automatically hide loader if it's been visible for too long
// This prevents stuck loaders from blocking the UI indefinitely
const MAX_LOADER_DURATION = 60000; // 60 seconds

let _showTimer = null;
let _safetyTimer = null;

/**
 * Reset loader state (safety mechanism)
 * Called when loader has been visible for too long
 */
function resetLoader() {
  if (import.meta.env.DEV) {
    console.warn('[GlobalLoader] Safety reset: Loader was visible for too long, resetting state');
  }
  state._count = 0;
  state._visible = false;
  if (_showTimer) {
    clearTimeout(_showTimer);
    _showTimer = null;
  }
  if (_safetyTimer) {
    clearTimeout(_safetyTimer);
    _safetyTimer = null;
  }
}

/**
 * showLoader()
 * - Increment active counter and (if this is the first) schedule the overlay
 *   to be shown after SHOW_DELAY ms. If hideLoader() runs before the delay
 *   expires, the overlay will never appear.
 * - Includes safety mechanism to prevent stuck loaders
 */
function showLoader() {
  // Prevent negative counts (safety check)
  if (state._count < 0) {
    state._count = 0;
  }

  state._count += 1;
  state._lastAction = 'show';
  
  // If this is the first caller, schedule or show immediately depending on SHOW_DELAY
  if (state._count === 1) {
    if (SHOW_DELAY <= 0) {
      state._visible = true;
      state._lastTimestamp = Date.now();
      _showTimer = null;
      
      // Set safety timer to prevent stuck loader
      if (_safetyTimer) {
        clearTimeout(_safetyTimer);
      }
      _safetyTimer = setTimeout(() => {
        if (state._visible && state._count > 0) {
          resetLoader();
        }
      }, MAX_LOADER_DURATION);
    } else {
      _showTimer = setTimeout(() => {
        // Double-check count is still > 0 before showing
        if (state._count > 0) {
          state._visible = true;
          state._lastTimestamp = Date.now();
          
          // Set safety timer
          if (_safetyTimer) {
            clearTimeout(_safetyTimer);
          }
          _safetyTimer = setTimeout(() => {
            if (state._visible && state._count > 0) {
              resetLoader();
            }
          }, MAX_LOADER_DURATION);
        }
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
 * - Includes safety checks to prevent state inconsistencies
 */
function hideLoader() {
  state._lastAction = 'hide';
  
  // Safety check: if count is already 0, don't go negative
  if (state._count <= 0) {
    // If visible but count is 0, force hide (recovery mechanism)
    if (state._visible) {
      if (import.meta.env.DEV) {
        console.warn('[GlobalLoader] Recovery: Count was 0 but loader was visible, forcing hide');
      }
      state._visible = false;
      if (_safetyTimer) {
        clearTimeout(_safetyTimer);
        _safetyTimer = null;
      }
    }
    return;
  }

  state._count -= 1;

  if (state._count === 0) {
    // Clear safety timer since we're hiding
    if (_safetyTimer) {
      clearTimeout(_safetyTimer);
      _safetyTimer = null;
    }

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
      state._lastTimestamp = null;
    }
  }
}

/**
 * Force reset loader (emergency function)
 * Useful for debugging or recovery from stuck states
 */
function forceReset() {
  if (import.meta.env.DEV) {
    console.warn('[GlobalLoader] Force reset called');
  }
  resetLoader();
}

/**
 * Get current loader state (for debugging)
 */
function getState() {
  return {
    count: state._count,
    visible: state._visible,
    lastAction: state._lastAction,
    lastTimestamp: state._lastTimestamp,
    hasShowTimer: !!_showTimer,
    hasSafetyTimer: !!_safetyTimer,
  };
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
      forceReset,
      getState,
    });

    // Configure globalProperties for Options API / templates
    // Usage in Options API: this.$showLoader(), this.$hideLoader()
    app.config.globalProperties.$showLoader = showLoader;
    app.config.globalProperties.$hideLoader = hideLoader;
    app.config.globalProperties.$forceResetLoader = forceReset;
    app.config.globalProperties.$getLoaderState = getState;

    // Optionally expose a read-only `isLoading` on globalProperties
    Object.defineProperty(app.config.globalProperties, "$isLoading", {
      get: () => isLoading.value,
    });

    // In development, expose loader functions to window for debugging
    if (import.meta.env.DEV) {
      window.__GLOBAL_LOADER__ = {
        show: showLoader,
        hide: hideLoader,
        reset: forceReset,
        state: getState,
        isLoading: readonly(isLoading),
      };
    }
  },
};

// Export helpers for direct import as well as the plugin default
export { showLoader, hideLoader, isLoading, forceReset, getState };
export default globalLoaderPlugin;
