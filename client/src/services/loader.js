/**
 * @fileoverview Global loading state manager with debounced display and auto-cleanup
 * @module services/loader
 * @author InsightHub Development Team
 * @copyright 2025 InsightHub. All rights reserved.
 * @requires vue
 */

import { ref, computed } from "vue";

/**
 * Track active loader IDs to avoid mismatched increments/decrements
 * @type {Map<string, number>}
 * @private
 */
const activeIds = new Map();

/**
 * Counter for generating unique loader IDs
 * @type {number}
 * @private
 */
let nextId = 1;

/**
 * Reactive ref tracking the count of active loaders
 * @type {Object}
 * @private
 */
const loadingCount = ref(0);

/**
 * Computed property indicating if any loader is active
 * @type {Object}
 * @public
 * @example
 * import { isLoading } from '@/services/loader';
 * if (isLoading.value) { console.log('Loading...'); }
 */
export const isLoading = computed(() => loadingCount.value > 0);

/**
 * Debounce delay in milliseconds - show overlay only if request lasts longer
 * @constant {number}
 * @private
 */
const SHOW_DELAY = 150;

/**
 * Dev-only debug toggle based on NODE_ENV
 * @constant {boolean}
 * @private
 */
const DEBUG =
  typeof process !== "undefined" &&
  process.env &&
  process.env.NODE_ENV !== "production";

/**
 * Internal map of pending show timers per loader ID
 * @type {Map<string, NodeJS.Timeout>}
 * @private
 */
const showTimers = new Map();

/**
 * Flag to show the first loader immediately after page reload (no debounce)
 * @type {boolean}
 * @private
 */
let immediateOnFirstRequest = false;
try {
  if (typeof performance !== "undefined" && performance.getEntriesByType) {
    const nav = performance.getEntriesByType("navigation")?.[0];
    if (nav && nav.type === "reload") {
      immediateOnFirstRequest = true;
    }
  }
} catch (e) {
  // ignore
}

/**
 * Debug logger that only logs in development mode
 * @private
 * @param {...*} args - Arguments to log
 * @returns {void}
 */
function debugLog(...args) {
  if (DEBUG) console.debug("[loader]", ...args);
  if (DEBUG) {
    /* eslint-disable-next-line no-console */
    console.debug("[loader]", ...args);
  }
}

/**
 * Start loading indicator with debounced display and automatic cleanup
 * 
 * Creates a unique loader ID and activates the global loading state after a short delay
 * (150ms) to prevent flicker for very fast operations. The first loader after a page
 * reload is shown immediately. Includes automatic cleanup after 30 seconds to prevent
 * stuck loaders.
 * 
 * @returns {string} Unique loader ID to be passed to stopLoading() when done
 * 
 * @example
 * // Basic usage
 * const loaderId = startLoading();
 * try {
 *   await fetchData();
 * } finally {
 *   stopLoading(loaderId);
 * }
 * 
 * @example
 * // With API request
 * import { startLoading, stopLoading } from '@/services/loader';
 * const id = startLoading();
 * apiService.get('/data')
 *   .then(response => { / process / })
 *   .finally(() => stopLoading(id));
 */
export function startLoading() {
  const id = `ldr_${Date.now()}_${nextId++}`;
  try {
    // If this is the first request after a full page reload, activate immediately
    // (so a page refresh shows the loader instantly). Otherwise, start a short
    // timer before we expose the id as active to prevent flicker for very short
    // requests.
    if (immediateOnFirstRequest) {
      activeIds.set(id, Date.now());
      loadingCount.value = activeIds.size;
      immediateOnFirstRequest = false; // only once
      debugLog("activated-immediate", id, "activeCount=", activeIds.size);
    } else {
      const timer = setTimeout(() => {
        activeIds.set(id, Date.now());
        loadingCount.value = activeIds.size;
        showTimers.delete(id);
        debugLog("activated", id, "activeCount=", activeIds.size);
      }, SHOW_DELAY);

      showTimers.set(id, timer);
    }

    // Safety: auto-clear this loader after 30s to avoid stuck state
    setTimeout(() => {
      if (activeIds.has(id)) {
        activeIds.delete(id);
        loadingCount.value = activeIds.size;
        debugLog("auto-cleared", id, "activeCount=", activeIds.size);
      }
      // Also clear any pending show timer for this id
      if (showTimers.has(id)) {
        clearTimeout(showTimers.get(id));
        showTimers.delete(id);
      }
    }, 30000);
  } catch (e) {
    // noop
  }
  debugLog("started", id);
  return id;
}

/**
 * Stop loading indicator for a specific loader ID
 * 
 * Removes the loader from active state. If the loader was still pending (within the
 * 150ms debounce window), cancels its activation. If no ID is provided or the ID
 * is not found, removes any one active loader as fallback.
 * 
 * @param {string} [id] - The loader ID returned from startLoading()
 * @returns {void}
 * 
 * @example
 * // Standard usage with ID
 * const loaderId = startLoading();
 * // ... do work ...
 * stopLoading(loaderId);
 * 
 * @example
 * // Fallback (not recommended - always pass the ID)
 * stopLoading(); // Removes any one active loader
 */
export function stopLoading(id) {
  try {
    // If the id was pending (not yet activated), cancel the show timer
    if (id && showTimers.has(id)) {
      clearTimeout(showTimers.get(id));
      showTimers.delete(id);
      debugLog("cancelled-pending", id);
      return;
    }

    if (id && activeIds.has(id)) {
      activeIds.delete(id);
      loadingCount.value = activeIds.size;
      debugLog("stopped", id, "activeCount=", activeIds.size);
      return;
    }

    // Fallback: remove any one id if available
    const it = activeIds.keys().next();
    if (!it.done) {
      activeIds.delete(it.value);
      loadingCount.value = activeIds.size;
      debugLog("stopped-fallback", it.value, "activeCount=", activeIds.size);
    }
  } catch (e) {
    // noop
  }
}

export default {
  isLoading,
  startLoading,
  stopLoading,
};
