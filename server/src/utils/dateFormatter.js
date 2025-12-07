/**
 * @file dateFormatter.js
 * @description Date formatting utilities for InsightHub
 * Standard format: Date: 31/Dec/2025, Time: hh:mma/p (e.g., 10:02p)
 * @author InsightHub Development Team
 * @created 2025-01-XX
 * @version 1.2.0
 */

/**
 * Format date to standard format: 31/Dec/2025
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string
 * @example
 * formatDate(new Date('2025-12-31')) // Returns "31/Dec/2025"
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format time to standard format: hh:mma/p (e.g., 10:02p)
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted time string
 * @example
 * formatTime(new Date('2025-12-31T22:02:00')) // Returns "10:02p"
 * formatTime(new Date('2025-12-31T10:02:00')) // Returns "10:02a"
 */
export function formatTime(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'p' : 'a';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const minutesStr = minutes.toString().padStart(2, '0');
  
  return `${hours}:${minutesStr}${ampm}`;
}

/**
 * Format date and time together: 31/Dec/2025 10:02p
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date and time string
 * @example
 * formatDateTime(new Date('2025-12-31T22:02:00')) // Returns "31/Dec/2025 10:02p"
 */
export function formatDateTime(date) {
  if (!date) return '';
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Parse date string in various formats and return Date object
 * @param {string} dateString - Date string in various formats
 * @returns {Date|null} Date object or null if invalid
 */
export function parseDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? null : d;
}

