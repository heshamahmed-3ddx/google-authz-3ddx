/**
 * @file announcement.model.js
 * @description Data model for admin announcements
 * @author InsightHub Development Team
 */

import databaseService from '../services/database.js';
import { createContextLogger } from '../services/logger.js';

const logger = createContextLogger('announcement.model');

/**
 * Announcement Model
 * Handles CRUD operations for system announcements
 */
class AnnouncementModel {
  /**
   * Create a new announcement
   * @param {Object} announcementData - Announcement details
   * @param {string} announcementData.title - Announcement title
   * @param {string} announcementData.content - Announcement content
   * @param {string} announcementData.severity - Severity level (info, warning, success, error)
   * @param {boolean} announcementData.is_active - Active status
   * @param {string} announcementData.start_date - Start date
   * @param {string} announcementData.end_date - End date (optional)
   * @param {string} announcementData.created_by - Email of creator
   * @returns {Promise<Object>} Created announcement
   */
  async create(announcementData) {
    try {
      const query = `
        INSERT INTO announcements 
        (title, content, severity, is_active, start_date, end_date, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const result = await databaseService.query(query, [
        announcementData.title,
        announcementData.content,
        announcementData.severity || 'info',
        announcementData.is_active !== undefined ? announcementData.is_active : true,
        announcementData.start_date,
        announcementData.end_date || null,
        announcementData.created_by
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      logger.error('Error creating announcement:', error);
      throw error;
    }
  }

  /**
   * Find announcement by ID
   * @param {number} id - Announcement ID
   * @returns {Promise<Object|null>} Announcement or null
   */
  async findById(id) {
    try {
      const query = 'SELECT * FROM announcements WHERE id = ?';
      const results = await databaseService.query(query, [id]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      logger.error('Error finding announcement by ID:', error);
      throw error;
    }
  }

  /**
   * Get all announcements (admin view)
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of records
   * @param {number} options.offset - Offset for pagination
   * @param {boolean} options.activeOnly - Filter active only
   * @returns {Promise<Array>} List of announcements
   */
  async findAll({ limit = 50, offset = 0, activeOnly = false } = {}) {
    try {
      // Ensure limit and offset are integers to prevent SQL injection
      const limitInt = parseInt(limit, 10) || 50;
      const offsetInt = parseInt(offset, 10) || 0;
      
      let query = 'SELECT * FROM announcements';
      const params = [];

      if (activeOnly) {
        query += ' WHERE is_active = 1';
      }

      // Use direct values instead of placeholders for LIMIT/OFFSET
      // This avoids MySQL prepared statement issues with LIMIT/OFFSET
      query += ` ORDER BY created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`;

      return await databaseService.query(query, params);
    } catch (error) {
      logger.error('Error finding all announcements:', error);
      throw error;
    }
  }

  /**
   * Get active announcements for display to users
   * @param {string} userEmail - User email for read tracking
   * @returns {Promise<Array>} List of active announcements with read status
   */
  async getActiveAnnouncements(userEmail = null) {
    try {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      let query = `
        SELECT 
          a.*,
          ${userEmail ? 'CASE WHEN uar.user_email IS NOT NULL THEN 1 ELSE 0 END as is_read' : '0 as is_read'}
        FROM announcements a
        ${userEmail ? `
          LEFT JOIN user_announcement_reads uar 
            ON a.id = uar.announcement_id 
            AND uar.user_email = ?
        ` : ''}
        WHERE a.is_active = 1
          AND a.start_date <= ?
          AND (a.end_date IS NULL OR a.end_date >= ?)
        ORDER BY a.created_at DESC
      `;

      const params = userEmail ? [userEmail, now, now] : [now, now];
      return await databaseService.query(query, params);
    } catch (error) {
      logger.error('Error getting active announcements:', error);
      throw error;
    }
  }

  /**
   * Update an announcement
   * @param {number} id - Announcement ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated announcement
   */
  async update(id, updateData) {
    try {
      const allowedFields = ['title', 'content', 'severity', 'is_active', 'start_date', 'end_date'];
      const updates = [];
      const params = [];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates.push(`${field} = ?`);
          params.push(updateData[field]);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      updates.push('updated_at = NOW()');
      params.push(id);

      const query = `UPDATE announcements SET ${updates.join(', ')} WHERE id = ?`;
      await databaseService.query(query, params);

      return await this.findById(id);
    } catch (error) {
      logger.error('Error updating announcement:', error);
      throw error;
    }
  }

  /**
   * Delete an announcement
   * @param {number} id - Announcement ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const query = 'DELETE FROM announcements WHERE id = ?';
      await databaseService.query(query, [id]);
      return true;
    } catch (error) {
      logger.error('Error deleting announcement:', error);
      throw error;
    }
  }

  /**
   * Mark announcement as read by user
   * @param {number} announcementId - Announcement ID
   * @param {string} userEmail - User email
   * @returns {Promise<boolean>} Success status
   */
  async markAsRead(announcementId, userEmail) {
    try {
      const query = `
        INSERT INTO user_announcement_reads (announcement_id, user_email, read_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE read_at = NOW()
      `;
      
      await databaseService.query(query, [announcementId, userEmail]);
      return true;
    } catch (error) {
      logger.error('Error marking announcement as read:', error);
      throw error;
    }
  }

  /**
   * Get unread announcement count for user
   * @param {string} userEmail - User email
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userEmail) {
    try {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      const query = `
        SELECT COUNT(*) as unread_count
        FROM announcements a
        LEFT JOIN user_announcement_reads uar 
          ON a.id = uar.announcement_id 
          AND uar.user_email = ?
        WHERE a.is_active = 1
          AND a.start_date <= ?
          AND (a.end_date IS NULL OR a.end_date >= ?)
          AND uar.user_email IS NULL
      `;

      const results = await databaseService.query(query, [userEmail, now, now]);
      return results[0]?.unread_count || 0;
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }
}

export default new AnnouncementModel();
