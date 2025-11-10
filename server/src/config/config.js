/**
 * @file config.js
 * @description InsightHub application configuration constants and settings
 * @author InsightHub Development Team
 * @created 2025-10-20
 * @version 1.2.0
 * @copyright 2025 InsightHub. All rights reserved.
 */


import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Application configuration constants
 */
export const CONFIG = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development'
  },

  // Date and Time Formats
  dateFormats: {
    display: 'DD/MMM/YYYY',
    timestamp: 'DD/MM/YYYY HH:mm:ss',
    iso: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    log: 'DD/MM/YYYY HH:mm:ss'
  },

  // API Configuration
  api: {
    version: '1.2.0',
    basePath: '/api',
    timeout: 30000,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Authentication & Authorization
  auth: {
    sessionSecret: process.env.SESSION_SECRET || 'default-secret-change-me',
    sessionMaxAge: 24 * 60 * 60 * 1000, // 24 hours
    tokenExpiry: 3600, // 1 hour in seconds
    requireHttps: process.env.NODE_ENV === 'production'
  },

  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    scopes: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/admin.directory.user.readonly',
      'https://www.googleapis.com/auth/admin.directory.group.readonly',
      'https://www.googleapis.com/auth/admin.directory.group.member.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/calendar.readonly'
    ]
  },

  // Casbin Configuration
  casbin: {
    modelPath: path.resolve(__dirname, 'casbin/model.conf'),
    policyPath: path.resolve(__dirname, 'casbin/policy.csv'),
    usersPath: path.resolve(__dirname, 'casbin/users.json'),
    autoSave: true,
    syncInterval: 300000, // 5 minutes
    /**
     * Test authorization config (used for Casbin service self-test)
     * DO NOT use real user emails or sensitive data in production
     */
    test: {
      email: process.env.CASBIN_TEST_EMAIL || 'test@localhost',
      resource: process.env.CASBIN_TEST_RESOURCE || 'dashboard',
      action: process.env.CASBIN_TEST_ACTION || 'read'
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    maxFiles: 10,
    maxSize: '10m',
    logDir: path.resolve(process.cwd(), 'server/logs'),
    enableConsole: true,
    enableFile: true
  },

  // Documentation Configuration
  documentation: {
    swagger: {
      enabled: process.env.NODE_ENV !== 'production',
      path: '/api-docs',
      requireAuth: true,
      authorizedRoles: ['admin', 'developer']
    },
    jsdoc: {
      enabled: process.env.NODE_ENV !== 'production',
      path: '/docs',
      requireAuth: true,
      authorizedRoles: ['admin', 'developer']
    }
  },

  // Database/Storage Configuration
  storage: {
    type: 'file', // 'file' | 'database'
    backupInterval: 24 * 60 * 60 * 1000, // 24 hours
    retentionDays: 30
  },

  // Security Configuration
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"]
        }
      }
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
  },

  // Feature Flags
  features: {
    enableGroupSync: true,
    enableAutoUserCreation: true,
    enableAuditLogging: true,
    enableRealTimeSync: false
  },

  // Localization
  i18n: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr'],
  messagesPath: path.join(__dirname, 'messages')
  }
};

/**
 * Environment-specific overrides
 */
if (CONFIG.server.environment === 'production') {
  CONFIG.logging.level = 'warn';
  CONFIG.documentation.swagger.enabled = false;
  CONFIG.documentation.jsdoc.enabled = false;
  CONFIG.security.helmet.contentSecurityPolicy.directives.scriptSrc = ["'self'"];
}

/**
 * Validation function for required environment variables
 */
export function validateConfig() {
  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'SESSION_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Get configuration value by path (e.g., 'server.port')
 */
export function getConfig(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], CONFIG);
}

export default CONFIG;