/**
 * Snackbar composable for showing notifications
 * Returns reactive state that components can use with v-snackbar
 */

import { reactive } from "vue";

export function useSnackbar() {
  const snackbar = reactive({
    show: false,
    message: "",
    color: "info", // success, error, warning, info
    timeout: 4000,
  });

  const showSnackbar = (message, type = "info", duration = 4000) => {
    snackbar.message = message;
    snackbar.color = type;
    snackbar.timeout = duration;
    snackbar.show = true;
    
    // Auto-hide after duration
    setTimeout(() => {
      snackbar.show = false;
    }, duration);
  };

  return {
    showSnackbar,
    snackbar, // Export reactive state for v-snackbar binding
  };
}

