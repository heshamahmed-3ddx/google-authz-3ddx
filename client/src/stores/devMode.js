/**
 * Development Mode Store
 *
 * Manages development-only features like admin view toggle and group simulation.
 * This store is only active in development mode and all features are disabled in production.
 */

import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

export const useDevModeStore = defineStore("devMode", () => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;

  // Load persisted state from localStorage
  const loadPersistedState = () => {
    if (!isDevelopment) return { adminViewEnabled: false, simulatedGroups: [] };

    try {
      const stored = localStorage.getItem("devMode");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to load dev mode state:", error);
    }
    return { adminViewEnabled: false, simulatedGroups: [] };
  };

  const persistedState = loadPersistedState();

  // Admin view toggle - shows all restricted sections
  const adminViewEnabled = ref(persistedState.adminViewEnabled);

  // Simulated groups - allows testing with different group memberships
  const simulatedGroups = ref(persistedState.simulatedGroups);

  // Available groups for simulation
  const availableGroups = [
    {
      value: "admin",
      label: "Admin",
      description: "Full administrative access",
    },
    { value: "SWD", label: "SWD", description: "Software Development team" },
    {
      value: "developers",
      label: "Developers",
      description: "Development team members",
    },
    { value: "finance", label: "Finance", description: "Finance department" },
    {
      value: "Finance22",
      label: "Finance22",
      description: "Surgical Guide Report access",
    },
    {
      value: "Developers22",
      label: "Developers22",
      description: "API Documentation access",
    },
    { value: "hr", label: "HR", description: "Human Resources department" },
    {
      value: "reporting",
      label: "Reporting",
      description: "Reporting & Analytics team",
    },
    {
      value: "operations",
      label: "Operations",
      description: "Operations team",
    },
    { value: "sales", label: "Sales", description: "Sales department" },
    {
      value: "marketing",
      label: "Marketing",
      description: "Marketing department",
    },
    {
      value: "support",
      label: "Support",
      description: "Customer Support team",
    },
  ];

  /**
   * Toggle admin view mode
   */
  const toggleAdminView = () => {
    if (!isDevelopment) return;
    adminViewEnabled.value = !adminViewEnabled.value;
  };

  /**
   * Enable admin view
   */
  const enableAdminView = () => {
    if (!isDevelopment) return;
    adminViewEnabled.value = true;
  };

  /**
   * Disable admin view
   */
  const disableAdminView = () => {
    if (!isDevelopment) return;
    adminViewEnabled.value = false;
  };

  /**
   * Set simulated groups
   * @param {string[]} groups - Array of group names
   */
  const setSimulatedGroups = (groups) => {
    if (!isDevelopment) return;
    simulatedGroups.value = groups;
  };

  /**
   * Add a simulated group
   * @param {string} group - Group name to add
   */
  const addSimulatedGroup = (group) => {
    if (!isDevelopment) return;
    if (!simulatedGroups.value.includes(group)) {
      simulatedGroups.value.push(group);
    }
  };

  /**
   * Remove a simulated group
   * @param {string} group - Group name to remove
   */
  const removeSimulatedGroup = (group) => {
    if (!isDevelopment) return;
    simulatedGroups.value = simulatedGroups.value.filter((g) => g !== group);
  };

  /**
   * Clear all simulated groups
   */
  const clearSimulatedGroups = () => {
    if (!isDevelopment) return;
    simulatedGroups.value = [];
  };

  /**
   * Check if a specific group is simulated
   * @param {string} group - Group name to check
   * @returns {boolean}
   */
  const hasSimulatedGroup = (group) => {
    if (!isDevelopment) return false;
    return simulatedGroups.value.includes(group);
  };

  /**
   * Get merged groups (actual + simulated)
   * @param {string[]} actualGroups - User's actual groups
   * @returns {string[]} Combined array of actual and simulated groups
   */
  const getMergedGroups = (actualGroups = []) => {
    if (!isDevelopment || simulatedGroups.value.length === 0) {
      return actualGroups;
    }
    // Merge and deduplicate
    return [...new Set([...actualGroups, ...simulatedGroups.value])];
  };

  /**
   * Check if dev mode features are active
   * @returns {boolean}
   */
  const isActive = computed(() => {
    return (
      isDevelopment &&
      (adminViewEnabled.value || simulatedGroups.value.length > 0)
    );
  });

  /**
   * Reset all dev mode settings
   */
  const reset = () => {
    if (!isDevelopment) return;
    adminViewEnabled.value = false;
    simulatedGroups.value = [];
  };

  // Persist state changes to localStorage
  if (isDevelopment) {
    watch(
      [adminViewEnabled, simulatedGroups],
      () => {
        try {
          localStorage.setItem(
            "devMode",
            JSON.stringify({
              adminViewEnabled: adminViewEnabled.value,
              simulatedGroups: simulatedGroups.value,
            }),
          );
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn("Failed to persist dev mode state:", error);
        }
      },
      { deep: true },
    );
  }

  return {
    // State
    isDevelopment,
    adminViewEnabled,
    simulatedGroups,
    availableGroups,
    isActive,

    // Admin view methods
    toggleAdminView,
    enableAdminView,
    disableAdminView,

    // Group simulation methods
    setSimulatedGroups,
    addSimulatedGroup,
    removeSimulatedGroup,
    clearSimulatedGroups,
    hasSimulatedGroup,
    getMergedGroups,

    // Utility
    reset,
  };
});
