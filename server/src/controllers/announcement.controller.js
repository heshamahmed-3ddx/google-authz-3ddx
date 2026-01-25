/**
 * @file announcement.controller.js
 * @description Controller for announcement endpoints
 * @author InsightHub Development Team
 */

import announcementModel from '../models/announcement.model.js';
import { createContextLogger } from '../services/logger.js';

const logger = createContextLogger('announcement.controller');

/**
 * Announcement Controller
 * Handles HTTP requests for announcement management
 */
class AnnouncementController {
  /**
   * Get all announcements (admin)
   * @route GET /api/announcements/admin
   */
  async getAllForAdmin(req, res) {
    try {
      const { limit = 50, offset = 0, activeOnly = false } = req.query;
      
      const announcements = await announcementModel.findAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        activeOnly: activeOnly === 'true'
      });

      res.json({
        success: true,
        data: announcements
      });
    } catch (error) {
      logger.error('Error getting all announcements for admin:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve announcements'
      });
    }
  }

  /**
   * Get active announcements for current user
   * @route GET /api/announcements
   */
  async getActiveAnnouncements(req, res) {
    try {
      const userEmail = req.session?.user?.email;
      const announcements = await announcementModel.getActiveAnnouncements(userEmail);

      res.json({
        success: true,
        data: announcements
      });
    } catch (error) {
      logger.error('Error getting active announcements:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve announcements'
      });
    }
  }

  /**
   * Get unread announcement count for current user
   * @route GET /api/announcements/unread-count
   */
  async getUnreadCount(req, res) {
    try {
      const userEmail = req.session?.user?.email;
      
      if (!userEmail) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const count = await announcementModel.getUnreadCount(userEmail);

      res.json({
        success: true,
        count: count
      });
    } catch (error) {
      logger.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get unread count'
      });
    }
  }

  /**
   * Get announcement by ID
   * @route GET /api/announcements/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const announcement = await announcementModel.findById(id);

      if (!announcement) {
        return res.status(404).json({
          success: false,
          error: 'Announcement not found'
        });
      }

      res.json({
        success: true,
        data: announcement
      });
    } catch (error) {
      logger.error('Error getting announcement by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve announcement'
      });
    }
  }

  /**
   * Create a new announcement (admin only)
   * @route POST /api/announcements
   */
  async create(req, res) {
    try {
      const { title, content, severity, is_active, start_date, end_date } = req.body;

      // Validation
      if (!title || !content || !start_date) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, content, start_date'
        });
      }

      const announcementData = {
        title,
        content,
        severity: severity || 'info',
        is_active: is_active !== undefined ? is_active : true,
        start_date,
        end_date: end_date || null,
        created_by: req.session?.user?.email || 'unknown'
      };

      const announcement = await announcementModel.create(announcementData);

      logger.info(`Announcement created by ${req.session?.user?.email}: ${announcement.id}`);

      res.status(201).json({
        success: true,
        data: announcement
      });
    } catch (error) {
      logger.error('Error creating announcement:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create announcement'
      });
    }
  }

  /**
   * Update an announcement (admin only)
   * @route PUT /api/announcements/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if announcement exists
      const existing = await announcementModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Announcement not found'
        });
      }

      const announcement = await announcementModel.update(id, updateData);

      logger.info(`Announcement updated by ${req.session?.user?.email}: ${id}`);

      res.json({
        success: true,
        data: announcement
      });
    } catch (error) {
      logger.error('Error updating announcement:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update announcement'
      });
    }
  }

  /**
   * Delete an announcement (admin only)
   * @route DELETE /api/announcements/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Check if announcement exists
      const existing = await announcementModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Announcement not found'
        });
      }

      await announcementModel.delete(id);

      logger.info(`Announcement deleted by ${req.session?.user?.email}: ${id}`);

      res.json({
        success: true,
        message: 'Announcement deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting announcement:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete announcement'
      });
    }
  }

  /**
   * Mark announcement as read
   * @route POST /api/announcements/:id/read
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.session?.user?.email;

      if (!userEmail) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      await announcementModel.markAsRead(id, userEmail);

      res.json({
        success: true,
        message: 'Announcement marked as read'
      });
    } catch (error) {
      logger.error('Error marking announcement as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark announcement as read'
      });
    }
  }
}

export default new AnnouncementController();
