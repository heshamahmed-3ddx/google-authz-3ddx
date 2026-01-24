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
    display: 'DD/MMM/YYYY', // Keep for backwards compatibility
    standard: '31/Dec/2025', // New standard format: day/month name/year
    timeStandard: 'hh:mma/p', // New time format: hours:minutesam/pm (e.g., 10:02p)
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
    requireHttps: process.env.NODE_ENV === 'production',
    superAdminGroup: process.env.SUPER_ADMIN_GROUP || 'SWD' // Google Workspace group with full admin access
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
    usersPath: path.resolve(__dirname, 'casbin/users.json'),
    tableName: process.env.CASBIN_TABLE_NAME || 'casbin_rule', // Database table name for policies
    usersTableName: process.env.CASBIN_USERS_TABLE_NAME || 'casbin_users', // Database table name for users
    autoSave: true,
    syncInterval: 300000, // 5 minutes
    useEnhancedAdapter: process.env.CASBIN_USE_ENHANCED !== 'false', // Use enhanced adapter with caching (default: true)
    batchSize: parseInt(process.env.CASBIN_BATCH_SIZE) || 100, // Batch size for bulk operations
    maxRetries: parseInt(process.env.CASBIN_MAX_RETRIES) || 3, // Max retry attempts for transient failures
    cache: {
      enabled: process.env.CASBIN_CACHE_ENABLED !== 'false', // Enable policy caching (default: true)
      ttl: parseInt(process.env.CASBIN_CACHE_TTL) || 300000 // Cache TTL in milliseconds (default: 5 minutes)
    },
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
    },
    github: {
      repositoryUrl: process.env.GITHUB_REPOSITORY_URL || 'https://github.com/3ddx/InsightHub',
      repositoryName: process.env.GITHUB_REPOSITORY_NAME || 'InsightHub',
      displayInDocs: process.env.GITHUB_DISPLAY_IN_DOCS !== 'false' // Default: true
    }
  },

  // Database/Storage Configuration
  storage: {
    type: 'database', // Database storage only (Casbin policies stored in MySQL)
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
      origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:3000'],
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

  // Prometheus Metrics Configuration
  prometheus: {
    enabled: process.env.PROMETHEUS_ENABLED !== 'false',
    metricsPath: process.env.PROMETHEUS_METRICS_PATH || '/metrics',
    metricsPort: parseInt(process.env.PROMETHEUS_METRICS_PORT) || process.env.PORT || 3001,
    instanceName: process.env.PROMETHEUS_INSTANCE_NAME || `insighthub-backend-${process.env.NODE_ENV || 'development'}`,
    jobName: process.env.PROMETHEUS_JOB_NAME || 'insighthub-sg-report',
    environment: process.env.PROMETHEUS_ENVIRONMENT || process.env.NODE_ENV || 'development',
    scrapeInterval: process.env.PROMETHEUS_SCRAPE_INTERVAL || '15s',
    scrapeTimeout: process.env.PROMETHEUS_SCRAPE_TIMEOUT || '10s'
  },

  // Reports Scheduling Configuration
  scheduling: {
    enabled: process.env.SCHEDULING_ENABLED !== 'false', // Default: true
    checkInterval: '*/1 * * * *', // Check every minute (cron format)
    maxConcurrentJobs: parseInt(process.env.SCHEDULING_MAX_CONCURRENT) || 3,
    maxRetries: parseInt(process.env.SCHEDULING_MAX_RETRIES) || 3,
    retryDelay: parseInt(process.env.SCHEDULING_RETRY_DELAY) || 300000, // 5 minutes
    jobTimeout: parseInt(process.env.SCHEDULING_JOB_TIMEOUT) || 300000, // 5 minutes
    
    // Report generation settings
    reportGeneration: {
      maxRecords: parseInt(process.env.REPORT_MAX_RECORDS) || 10000,
      tempDir: process.env.REPORT_TEMP_DIR || path.join(process.cwd(), 'temp/reports'),
      retentionHours: parseInt(process.env.REPORT_RETENTION_HOURS) || 24
    },
    
    // Email settings
    email: {
      provider: process.env.EMAIL_PROVIDER || 'smtp', // 'smtp' or 'sendgrid'
      from: process.env.EMAIL_FROM || 'noreply@insighthub.com',
      fromName: process.env.EMAIL_FROM_NAME || 'InsightHub Reports',
      
      // SMTP settings
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      },
      
      // SendGrid settings
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY
      }
    },
    
    // PDF generation settings (Puppeteer)
    pdf: {
      enabled: process.env.PDF_ENABLED !== 'false',
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    },
    
    // Excel generation settings
    excel: {
      enabled: process.env.EXCEL_ENABLED !== 'false',
      sheetName: 'Report Data',
      autoFilter: true,
      freeze: { row: 1, column: 0 } // Freeze header row
    }
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
 * Validate that all required environment variables are present
 * 
 * Checks for critical environment variables needed for application startup
 * (Google OAuth credentials, session secret). Throws an error with specific
 * missing variables if validation fails. Should be called during app initialization.
 * 
 * @throws {Error} If any required environment variables are missing
 * @returns {void}
 * 
 * @example
 * // At application startup
 * try {
 *   validateConfig();
 *   console.log('Configuration valid');
 * } catch (error) {
 *   console.error('Configuration error:', error.message);
 *   process.exit(1);
 * }
 * 
 * @example
 * // Missing variables
 * // Throws: Error('Missing required environment variables: GOOGLE_CLIENT_ID, SESSION_SECRET')
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
 * Get configuration value by dot-notation path
 * 
 * Safely retrieves nested configuration values using string path notation.
 * Returns undefined if path doesn't exist. Useful for accessing deeply
 * nested config without multiple null checks.
 * 
 * @param {string} path - Dot-notation path to config value (e.g., 'server.port', 'security.cors.origin')
 * @returns {*} Configuration value at path, or undefined if not found
 * 
 * @example
 * // Get server port
 * const port = getConfig('server.port');
 * // Returns: 3001
 * 
 * @example
 * // Get nested security setting
 * const corsOrigin = getConfig('security.cors.origin');
 * // Returns: 'http://localhost:3000'
 * 
 * @example
 * // Non-existent path
 * const value = getConfig('does.not.exist');
 * // Returns: undefined
 */
export function getConfig(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], CONFIG);
}

export default CONFIG;