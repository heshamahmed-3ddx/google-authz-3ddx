/**
 * @fileoverview Announcement API service
 * @module services/announcementService
 * @author InsightHub Development Team
 * @created 2026-01-25
 * @copyright 2026 InsightHub. All rights reserved.
 */

import apiClient from "./api.js";

/**
 * Announcement API Service
 * Handles all API calls for announcement management system
 */
const announcementService = {
  /**
   * Get all announcements for admin view
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of records
   * @param {number} options.offset - Offset for pagination
   * @param {boolean} options.activeOnly - Filter active only
   * @returns {Promise<Array>} List of announcements
   */
  async getAllForAdmin({ limit = 50, offset = 0, activeOnly = false } = {}) {
    const response = await apiClient.get("/api/announcements/admin", {
      params: { limit, offset, activeOnly },
    });
    return response.data.data;
  },

  /**
   * Get active announcements for current user
   * @returns {Promise<Array>} List of active announcements
   */
  async getActive() {
    const response = await apiClient.get("/api/announcements");
    return response.data.data;
  },

  /**
   * Create a new announcement
   * @param {Object} announcementData - Announcement data
   * @param {string} announcementData.title - Announcement title
   * @param {string} announcementData.content - Announcement content
   * @param {string} announcementData.type - Announcement type (info, warning, success, error)
   * @param {string} announcementData.priority - Priority level (low, medium, high, critical)
   * @param {Date} announcementData.start_date - Start date
   * @param {Date} announcementData.end_date - End date
   * @param {boolean} announcementData.is_active - Active status
   * @returns {Promise<Object>} Created announcement
   */
  async create(announcementData) {
    const response = await apiClient.post(
      "/api/announcements",
      announcementData,
    );
    return response.data;
  },

  /**
   * Update an existing announcement
   * @param {number} id - Announcement ID
   * @param {Object} updates - Updated fields
   * @returns {Promise<Object>} Updated announcement
   */
  async update(id, updates) {
    const response = await apiClient.put(`/api/announcements/${id}`, updates);
    return response.data;
  },

  /**
   * Delete an announcement
   * @param {number} id - Announcement ID
   * @returns {Promise<Object>} Deletion result
   */
  async delete(id) {
    const response = await apiClient.delete(`/api/announcements/${id}`);
    return response.data;
  },

  /**
   * Mark announcement as read for current user
   * @param {number} id - Announcement ID
   * @returns {Promise<Object>} Result
   */
  async markAsRead(id) {
    const response = await apiClient.post(`/api/announcements/${id}/read`);
    return response.data;
  },

  /**
   * Get unread announcements count
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount() {
    const response = await apiClient.get("/api/announcements/unread-count");
    return response.data.count || 0;
  },
};

export default announcementService;
