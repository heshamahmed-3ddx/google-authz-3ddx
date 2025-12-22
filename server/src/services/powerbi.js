/**
 * PowerBI Embedded Service
 * Handles authentication and embed token generation for PowerBI reports
 */

import * as msal from '@azure/msal-node';
import axios from 'axios';
import { createContextLogger } from './logger.js';

const logger = createContextLogger('powerbi.js');

// PowerBI Configuration from environment variables
const POWERBI_CONFIG = {
  workspaceId: process.env.POWERBI_WORKSPACE_ID,
  reportId: process.env.POWERBI_REPORT_ID,
  tenantId: process.env.POWERBI_TENANT_ID,
  clientId: process.env.POWERBI_CLIENT_ID,
  clientSecret: process.env.POWERBI_CLIENT_SECRET,
};

// Validate configuration
const validateConfig = () => {
  const required = ['workspaceId', 'reportId', 'tenantId', 'clientId', 'clientSecret'];
  const missing = required.filter(key => !POWERBI_CONFIG[key]);
  
  if (missing.length > 0) {
    const errorMsg = `Missing PowerBI configuration: ${missing.join(', ')}`;
    logger.error('PowerBI configuration validation failed', { 
      missing,
      availableKeys: Object.keys(POWERBI_CONFIG),
      hasWorkspaceId: !!POWERBI_CONFIG.workspaceId,
      hasReportId: !!POWERBI_CONFIG.reportId,
      hasTenantId: !!POWERBI_CONFIG.tenantId,
      hasClientId: !!POWERBI_CONFIG.clientId,
      hasClientSecret: !!POWERBI_CONFIG.clientSecret,
    });
    throw new Error(errorMsg);
  }
  
  logger.info('PowerBI configuration validated successfully');
};

// MSAL Configuration for Service Principal authentication
const msalConfig = {
  auth: {
    clientId: POWERBI_CONFIG.clientId,
    authority: `https://login.microsoftonline.com/${POWERBI_CONFIG.tenantId}`,
    clientSecret: POWERBI_CONFIG.clientSecret,
  },
};

// PowerBI API scopes
const POWERBI_SCOPES = ['https://analysis.windows.net/powerbi/api/.default'];

/**
 * Get Azure AD access token using Service Principal
 * @returns {Promise<string>} Access token
 */
async function getAccessToken() {
  try {
    validateConfig();
    
    const confidentialClient = new msal.ConfidentialClientApplication(msalConfig);
    
    const authResult = await confidentialClient.acquireTokenByClientCredential({
      scopes: POWERBI_SCOPES,
    });
    
    if (!authResult || !authResult.accessToken) {
      throw new Error('Failed to acquire access token');
    }
    
    logger.info('Access token acquired successfully');
    return authResult.accessToken;
  } catch (error) {
    logger.error('Failed to get access token', { error: error.message });
    throw error;
  }
}

/**
 * Generate PowerBI embed token for a report
 * @param {string} reportId - PowerBI Report ID
 * @param {string} workspaceId - PowerBI Workspace ID
 * @returns {Promise<Object>} Embed token and configuration
 */
async function generateEmbedToken(reportId = POWERBI_CONFIG.reportId, workspaceId = POWERBI_CONFIG.workspaceId) {
  try {
    const accessToken = await getAccessToken();
    
    // Get report details
    const reportUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`;
    const reportResponse = await axios.get(reportUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const report = reportResponse.data;
    
    // Generate embed token
    const embedTokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`;
    const embedTokenResponse = await axios.post(
      embedTokenUrl,
      {
        accessLevel: 'View',
        allowSaveAs: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const embedToken = embedTokenResponse.data.token;
    const expiration = embedTokenResponse.data.expiration;
    
    logger.info('Embed token generated successfully', {
      reportId,
      workspaceId,
      expiration,
    });
    
    return {
      embedToken,
      embedUrl: report.embedUrl,
      reportId: report.id,
      reportName: report.name,
      datasetId: report.datasetId,
      expiration,
      workspaceId,
    };
  } catch (error) {
    logger.error('Failed to generate embed token', {
      error: error.message,
      response: error.response?.data,
    });
    throw error;
  }
}

/**
 * Get all reports in a workspace
 * @param {string} workspaceId - PowerBI Workspace ID
 * @returns {Promise<Array>} List of reports
 */
async function getWorkspaceReports(workspaceId = POWERBI_CONFIG.workspaceId) {
  try {
    const accessToken = await getAccessToken();
    
    const reportsUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports`;
    const response = await axios.get(reportsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    logger.info('Workspace reports retrieved', {
      workspaceId,
      count: response.data.value?.length || 0,
    });
    
    return response.data.value || [];
  } catch (error) {
    logger.error('Failed to get workspace reports', {
      error: error.message,
      workspaceId,
    });
    throw error;
  }
}

/**
 * Get PowerBI configuration (safe to send to frontend)
 * @returns {Object} Safe configuration without secrets
 */
function getPublicConfig() {
  return {
    workspaceId: POWERBI_CONFIG.workspaceId,
    reportId: POWERBI_CONFIG.reportId,
    tenantId: POWERBI_CONFIG.tenantId,
    clientId: POWERBI_CONFIG.clientId,
    // Never send clientSecret to frontend
  };
}

export {
  generateEmbedToken,
  getWorkspaceReports,
  getPublicConfig,
  getAccessToken,
  POWERBI_CONFIG,
};
