/**
 * @file announcement.routes.js
 * @description Routes for announcement management
 * @author InsightHub Development Team
 */

import express from 'express';
import announcementController from '../controllers/announcement.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes MUST come before parameterized routes
router.get('/admin', requireAuth, requireAdmin, announcementController.getAllForAdmin);
router.get('/unread-count', requireAuth, announcementController.getUnreadCount);

// User routes
router.get('/', requireAuth, announcementController.getActiveAnnouncements);
router.post('/', requireAuth, requireAdmin, announcementController.create);

// Parameterized routes MUST come last
router.get('/:id', requireAuth, announcementController.getById);
router.put('/:id', requireAuth, requireAdmin, announcementController.update);
router.delete('/:id', requireAuth, requireAdmin, announcementController.delete);
router.post('/:id/read', requireAuth, announcementController.markAsRead);

export default router;
