/**
 * @file swagger.config.js
 * @description Enhanced Swagger/OpenAPI configuration with security and comprehensive documentation
 * @author 3D Diagnostix Development Team
 * @created 2025-10-20
 * @version 1.2.0
 */

import { VERSION } from './src/config/version.js';
import CONFIG from './src/config/config.js';

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '3D Diagnostix Google OAuth & Casbin RBAC API',
      version: VERSION.toString(),
      description: `
# 3D Diagnostix Authentication & Authorization API

This API provides comprehensive authentication and authorization services using Google OAuth 2.0 and Casbin RBAC.

## Features
- Google OAuth 2.0 integration
- Role-based access control with Casbin
- Google Groups and organizational unit synchronization
- Comprehensive audit logging
- Rate limiting and security controls

## Authentication
All protected endpoints require valid Google OAuth 2.0 authentication. Include session cookies in requests.

## Rate Limiting
API requests are limited to ${CONFIG.api.rateLimit.max} requests per ${CONFIG.api.rateLimit.windowMs / 1000 / 60} minutes per IP address.

## Versioning
API version: ${VERSION.toString()}
Compatible client versions: ${CONFIG.api.compatibility?.supportedVersions?.join(', ') || 'N/A'}

## Support
For technical support, contact the 3D Diagnostix development team.
      `,
      contact: {
        name: '3D Diagnostix Development Team',
        email: 'dev@3ddiagnostix.com',
        url: 'https://www.3ddiagnostix.com'
      },
      license: {
        name: 'Proprietary',
        url: 'https://www.3ddiagnostix.com/license'
      }
    },
    
    servers: [
      {
        url: `http://localhost:${CONFIG.server.port}`,
        description: 'Development server'
      },
      {
        url: 'https://api-staging.3ddiagnostix.com',
        description: 'Staging server'
      },
      {
        url: 'https://api.3ddiagnostix.com',
        description: 'Production server'
      }
    ],
    
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session',
          description: 'Session-based authentication using Google OAuth 2.0'
        },
        googleOAuth: {
          type: 'oauth2',
          description: 'Google OAuth 2.0',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
              tokenUrl: 'https://oauth2.googleapis.com/token',
              scopes: {
                'https://www.googleapis.com/auth/userinfo.profile': 'Access user profile information',
                'https://www.googleapis.com/auth/userinfo.email': 'Access user email address',
                'https://www.googleapis.com/auth/admin.directory.user.readonly': 'Read user directory information',
                'https://www.googleapis.com/auth/admin.directory.group.readonly': 'Read group directory information',
                'https://www.googleapis.com/auth/drive.readonly': 'Read Google Drive files',
                'https://www.googleapis.com/auth/calendar.readonly': 'Read calendar events'
              }
            }
          }
        }
      },
      
      schemas: {
        Error: {
          type: 'object',
          required: ['code', 'http', 'message'],
          properties: {
            code: {
              type: 'string',
              example: 'VALIDATION_ERROR',
              description: 'Machine-readable error code'
            },
            http: {
              type: 'integer',
              example: 400,
              description: 'HTTP status code'
            },
            message: {
              type: 'string',
              example: 'Invalid request parameters',
              description: 'Human-readable error message'
            },
            details: {
              type: 'string',
              example: 'Resource is required',
              description: 'Additional error details (optional)'
            }
          }
        },
        
        ApiResponse: {
          type: 'object',
          required: ['requestId', 'timestamp'],
          properties: {
            requestId: {
              type: 'string',
              example: 'f4512178-0098-431f-bea9-de5bcc93c645',
              description: 'Unique request identifier for tracking'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-20T10:30:00.000Z',
              description: 'Response timestamp in ISO 8601 format'
            },
            version: {
              type: 'string',
              example: '1.2.0',
              description: 'API version'
            }
          }
        },
        
        UserDetails: {
          type: 'object',
          required: ['fullName', 'email', 'groups', 'orgUnit'],
          properties: {
            fullName: {
              type: 'string',
              example: 'John Doe',
              description: 'User\'s full name from Google profile'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@3ddiagnostix.com',
              description: 'User\'s email address'
            },
            groups: {
              type: 'array',
              items: { type: 'string' },
              example: ['Engineering', 'SWD'],
              description: 'Google Groups the user belongs to'
            },
            roles: {
              type: 'array',
              items: { type: 'string' },
              example: ['MEMBER', 'OWNER'],
              description: 'User\'s roles in Google Groups'
            },
            orgUnit: {
              type: 'string',
              example: 'Software Development',
              description: 'User\'s organizational unit in Google Workspace'
            },
            department: {
              type: 'string',
              nullable: true,
              example: 'Engineering',
              description: 'User\'s department (if available)'
            },
            twoStepEnabled: {
              type: 'boolean',
              example: false,
              description: 'Whether two-step verification is enabled'
            },
            picture: {
              type: 'string',
              format: 'uri',
              nullable: true,
              example: 'https://lh3.googleusercontent.com/...',
              description: 'User\'s profile picture URL'
            }
          }
        }
      }
    },
    
    security: [
      {
        sessionAuth: []
      }
    ],
    
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and session management'
      },
      {
        name: 'User Management',
        description: 'User details and profile information'
      },
      {
        name: 'Authorization',
        description: 'Role-based access control and permissions'
      },
      {
        name: 'Google Integration',
        description: 'Google APIs integration (Drive, Calendar, etc.)'
      },
      {
        name: 'Administration',
        description: 'Admin-only endpoints for policy and user management'
      },
      {
        name: 'System',
        description: 'Health checks and system information'
      }
    ]
  },
  
  apis: [
    './src/routes/*.js',
    './src/services/*.js'
  ]
};

export const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 50px 0; }
    .swagger-ui .info .title { color: #2c3e50; }
  `,
  customSiteTitle: '3D Diagnostix API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    docExpansion: 'list',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2
  }
};

export default { swaggerOptions, swaggerUiOptions };