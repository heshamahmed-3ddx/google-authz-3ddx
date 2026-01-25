/**
 * @fileoverview Locale toggle composable for switching between English and Arabic
 * @module composables/useLocaleToggle
 * @author InsightHub Development Team
 * @copyright 2025 InsightHub. All rights reserved.
 * @requires vuetify
 */

import { useLocale } from "vuetify";

/**
 * Composable for toggling between application locales (English ↔ Arabic)
 *
 * Provides access to the current locale and a toggle function to switch
 * between 'en' (English) and 'ar' (Arabic). Integrates with Vuetify's
 * i18n system and automatically updates all localized content.
 *
 * @returns {Object} Locale toggle interface
 * @returns {Object} returns.current - Reactive reference to current locale ('en' or 'ar')
 * @returns {Function} returns.toggleLocale - Function to toggle between locales
 *
 * @example
 * // In a Vue component
 * import { useLocaleToggle } from '@/composables/useLocaleToggle';
 *
 * const { current, toggleLocale } = useLocaleToggle();
 *
 * // Get current locale
 * console.log(current.value); // 'en' or 'ar'
 *
 * // Toggle locale
 * toggleLocale(); // Switches en ↔ ar
 *
 * @example
 * // Template usage
 * <template>
 *   <v-btn @click="toggleLocale">
 *     Switch to {{ current === 'en' ? 'العربية' : 'English' }}
 *   </v-btn>
 * </template>
 */
export function useLocaleToggle() {
  const { current } = useLocale();

  /**
   * Toggle between English and Arabic locales
   *
   * Switches the current locale from 'en' to 'ar' or vice versa.
   * This triggers a reactive update throughout the application,
   * updating all i18n translations and RTL/LTR text direction.
   *
   * @returns {void}
   *
   * @example
   * toggleLocale(); // en → ar or ar → en
   */
  function toggleLocale() {
    current.value = current.value === "en" ? "ar" : "en";
  }
  return { current, toggleLocale };
}
