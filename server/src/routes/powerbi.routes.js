/**
 * PowerBI API Routes
 * Endpoints for PowerBI embed token generation and report management
 */

import express from 'express';
import {
  generateEmbedToken,
  getWorkspaceReports,
  getPublicConfig,
} from '../services/powerbi.js';
import { createContextLogger } from '../services/logger.js';

const router = express.Router();
const logger = createContextLogger('powerbi.routes.js');

/**
 * @route GET /api/powerbi/config
 * @desc Get PowerBI configuration (safe public values)
 * @access Public
 */
router.get('/config', async (req, res) => {
  try {
    const config = getPublicConfig();
    res.json({
      success: true,
      config,
    });
  } catch (error) {
    logger.error('Failed to get PowerBI config', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve PowerBI configuration',
      error: error.message,
    });
  }
});

/**
 * @route POST /api/powerbi/embed-token
 * @desc Generate embed token for PowerBI report
 * @access Authenticated
 */
router.post('/embed-token', async (req, res) => {
  try {
    const { reportId, workspaceId } = req.body;
    
    const embedData = await generateEmbedToken(reportId, workspaceId);
    
    res.json({
      success: true,
      data: embedData,
    });
  } catch (error) {
    logger.error('Failed to generate embed token', {
      error: error.message,
      user: req.user?.email,
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate PowerBI embed token',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/powerbi/reports
 * @desc Get all reports in workspace
 * @access Authenticated
 */
router.get('/reports', async (req, res) => {
  try {
    const { workspaceId } = req.query;
    
    const reports = await getWorkspaceReports(workspaceId);
    
    res.json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    logger.error('Failed to get workspace reports', {
      error: error.message,
      user: req.user?.email,
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve PowerBI reports',
      error: error.message,
    });
  }
});

export default router;
