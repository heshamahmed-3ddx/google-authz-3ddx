/**
 * @fileoverview Report scheduling API service
 * @module services/reportScheduling
 * @author InsightHub Development Team
 * @created 2026-01-24
 * @copyright 2026 InsightHub. All rights reserved.
 */

import apiClient from './api.js';

/**
 * Report Scheduling API Service
 * Handles all API calls for report scheduling system
 */
export const reportSchedulingService = {
  /**
   * Create a new report schedule
   * @param {Object} scheduleData - Schedule configuration
   * @returns {Promise<Object>} Created schedule
   */
  async createSchedule(scheduleData) {
    const response = await apiClient.post('/api/reports/schedules', scheduleData);
    return response.data;
  },

  /**
   * Get all schedules for current user
   * @param {boolean} activeOnly - Only return active schedules
   * @returns {Promise<Array>} List of schedules
   */
  async getSchedules(activeOnly = false) {
    const response = await apiClient.get('/api/reports/schedules', {
      params: { activeOnly }
    });
    return response.data;
  },

  /**
   * Get schedule by ID
   * @param {number} id - Schedule ID
   * @returns {Promise<Object>} Schedule details
   */
  async getScheduleById(id) {
    const response = await apiClient.get(`/api/reports/schedules/${id}`);
    return response.data;
  },

  /**
   * Update schedule
   * @param {number} id - Schedule ID
   * @param {Object} updates - Updated fields
   * @returns {Promise<Object>} Updated schedule
   */
  async updateSchedule(id, updates) {
    const response = await apiClient.put(`/api/reports/schedules/${id}`, updates);
    return response.data;
  },

  /**
   * Toggle schedule active status
   * @param {number} id - Schedule ID
   * @returns {Promise<Object>} Updated schedule
   */
  async toggleSchedule(id) {
    const response = await apiClient.patch(`/api/reports/schedules/${id}/toggle`);
    return response.data;
  },

  /**
   * Delete schedule
   * @param {number} id - Schedule ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteSchedule(id) {
    const response = await apiClient.delete(`/api/reports/schedules/${id}`);
    return response.data;
  },

  /**
   * Get schedule execution history
   * @param {number} id - Schedule ID
   * @param {number} limit - Maximum number of log entries
   * @returns {Promise<Object>} Execution history and statistics
   */
  async getScheduleHistory(id, limit = 50) {
    const response = await apiClient.get(`/api/reports/schedules/${id}/history`, {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get schedule statistics
   * @param {number} id - Schedule ID
   * @returns {Promise<Object>} Schedule statistics
   */
  async getScheduleStatistics(id) {
    const response = await apiClient.get(`/api/reports/schedules/${id}/statistics`);
    return response.data;
  },

  /**
   * Manually trigger schedule execution
   * @param {number} id - Schedule ID
   * @returns {Promise<Object>} Trigger result
   */
  async triggerSchedule(id) {
    const response = await apiClient.post(`/api/reports/schedules/${id}/trigger`);
    return response.data;
  },

  /**
   * Get scheduler system status (admin only)
   * @returns {Promise<Object>} System status
   */
  async getSystemStatus() {
    const response = await apiClient.get('/api/reports/schedules/system/status');
    return response.data;
  },

  /**
   * Send test email
   * @param {string} recipient - Email address
   * @returns {Promise<Object>} Test result
   */
  async sendTestEmail(recipient) {
    const response = await apiClient.post('/api/reports/schedules/system/test-email', {
      recipient
    });
    return response.data;
  }
};

export default reportSchedulingService;
