/**
 * @file dateFormatter.js
 * @description Client-side date formatting utilities for InsightHub
 * Standard format: Date: 17/Jan/2025, Time: 14:30:45
 * @author InsightHub Development Team
 * @created 2025-01-XX
 * @version 1.3.0
 */

/**
 * Format date to standard format: 17/Jan/2025
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string
 * @example
 * formatDate(new Date('2025-01-17')) // Returns "17/Jan/2025"
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!d || isNaN(d?.getTime?.())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format time to standard format: 14:30:45 (24-hour format)
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted time string
 * @example
 * formatTime(new Date('2025-12-31T14:30:45')) // Returns "14:30:45"
 */
export function formatTime(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!d || isNaN(d?.getTime?.())) return '';
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format date and time together: 17/Jan/2025:14:30:45
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date and time string
 * @example
 * formatDateTime(new Date('2025-01-17T14:30:45')) // Returns "17/Jan/2025:14:30:45"
 */
export function formatDateTime(date) {
  if (!date) return '';
  return `${formatDate(date)}:${formatTime(date)}`;
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

