import { ref, computed } from "vue";

// Track active loader IDs to avoid mismatched increments/decrements
const activeIds = new Map();
let nextId = 1;
const loadingCount = ref(0);

export const isLoading = computed(() => loadingCount.value > 0);

// Debounce configuration (ms) - show overlay only if request lasts longer
const SHOW_DELAY = 150;

// Dev-only debug toggle
const DEBUG =
  typeof process !== "undefined" &&
  process.env &&
  process.env.NODE_ENV !== "production";

// Internal map of pending show timers per id
const showTimers = new Map();

// If the page was reloaded, show the first loader immediately (no debounce).
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

function debugLog(...args) {
  if (DEBUG) console.debug("[loader]", ...args);
  if (DEBUG) {
    /* eslint-disable-next-line no-console */
    console.debug("[loader]", ...args);
  }
}

// Start loading and return an id that should be passed to stopLoading
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

// Stop loading for a specific id. If no id provided, clear one entry.
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
