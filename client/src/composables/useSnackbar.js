/**
 * @fileoverview Snackbar composable for displaying user notifications
 * @module composables/useSnackbar
 * @author InsightHub Development Team
 * @copyright 2025 InsightHub. All rights reserved.
 * @requires vue
 */

import { reactive } from "vue";

/**
 * Composable for managing snackbar notifications throughout the application
 * 
 * Provides a reactive snackbar state and a helper function to display notifications
 * with different types (success, error, warning, info) and custom durations.
 * The snackbar automatically hides after the specified timeout.
 * 
 * @returns {Object} Snackbar API object
 * @returns {Function} returns.showSnackbar - Function to display a notification
 * @returns {Object} returns.snackbar - Reactive snackbar state for v-snackbar binding
 * @returns {boolean} returns.snackbar.show - Whether snackbar is visible
 * @returns {string} returns.snackbar.message - Message to display
 * @returns {string} returns.snackbar.color - Color/type (success, error, warning, info)
 * @returns {number} returns.snackbar.timeout - Duration in milliseconds
 * 
 * @example
 * // In a Vue component
 * import { useSnackbar } from '@/composables/useSnackbar';
 * 
 * const { showSnackbar, snackbar } = useSnackbar();
 * 
 * // Show success message
 * showSnackbar('Operation completed!', 'success');
 * 
 * // Show error message with custom duration
 * showSnackbar('Something went wrong', 'error', 6000);
 * 
 * @example
 * // Template usage
 * <template>
 *   <v-snackbar
 *     v-model="snackbar.show"
 *     :color="snackbar.color"
 *     :timeout="snackbar.timeout"
 *   >
 *     {{ snackbar.message }}
 *   </v-snackbar>
 * </template>
 */
export function useSnackbar() {
  const snackbar = reactive({
    show: false,
    message: "",
    color: "info", // success, error, warning, info
    timeout: 4000,
  });

  /**
   * Display a snackbar notification
   * 
   * @param {string} message - The message to display in the snackbar
   * @param {('success'|'error'|'warning'|'info')} [type='info'] - The notification type/color
   * @param {number} [duration=4000] - How long to display the message in milliseconds
   * @returns {void}
   * 
   * @example
   * showSnackbar('User saved successfully', 'success');
   * showSnackbar('Failed to load data', 'error', 5000);
   */
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

