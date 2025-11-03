/**
 * Minimal OpenAPI specification for the demo APIs
 * Served via swagger-ui-express in development for quick inspection
 */
const version = process.env.npm_package_version || '1.0.0'

const swaggerSpec = {
  openapi: '3.0.1',
  info: {
    title: '3D Diagnostix - AuthZ Demo API',
    version,
    description: 'Minimal OpenAPI spec for the Google SSO + Casbin demo'
  },
  servers: [
    { url: `http://localhost:${process.env.PORT || 3001}` }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: '3ddiagnostix.sid'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          picture: { type: 'string', format: 'uri' }
        }
      },
      UserDetails: {
        type: 'object',
        properties: {
          fullName: { type: 'string' },
          email: { type: 'string' },
          groups: { type: 'array', items: { type: 'string' } },
          orgUnit: { type: 'string' },
          roles: { type: 'array', items: { type: 'string' } },
          twoStepEnabled: { type: 'boolean' },
          picture: { type: 'string', format: 'uri' }
        }
      },
      UserRights: {
        type: 'object',
        properties: {
          rights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                resource: { type: 'string' },
                actions: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'object' }
        }
      }
    },
    parameters: {
      oauthCode: {
        name: 'code',
        in: 'query',
        description: 'Authorization code returned by Google',
        required: true,
        schema: { type: 'string' }
      },
      oauthState: {
        name: 'state',
        in: 'query',
        description: 'State value passed to Google (optional)',
        required: false,
        schema: { type: 'string' }
      },
      oauthError: {
        name: 'error',
        in: 'query',
        description: 'Error returned by Identity Provider when consent is rejected',
        required: false,
        schema: { type: 'string' }
      }
    }
  },
  paths: {
    '/auth/google': {
      get: {
        summary: 'Generate Google OAuth URL',
        responses: {
          '200': { description: 'Auth URL generated' }
        }
      }
    },
    '/auth/google/callback': {
      get: {
        summary: 'OAuth callback endpoint (handled by backend)',
        parameters: [
          { $ref: '#/components/parameters/oauthCode' },
          { $ref: '#/components/parameters/oauthState' },
          { $ref: '#/components/parameters/oauthError' }
        ],
        responses: { '302': { description: 'Redirect to frontend' }, '400': { $ref: '#/components/schemas/ErrorResponse' } }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Get current authenticated user from session',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Authenticated user', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' }, authenticated: { type: 'boolean' } } } } } },
          '401': { description: 'Not authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/user/details': {
      get: {
        summary: 'Get user details (combines Google and local data)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'User details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/UserDetails' },
                    requestId: { type: 'string' }
                  },
                  example: {
                    data: {
                      fullName: 'John Doe',
                      email: 'john@3ddiagnostix.com',
                      groups: ['Engineering', 'R&D'],
                      orgUnit: 'Software Development',
                      roles: ['engineer', 'team_lead'],
                      twoStepEnabled: true,
                      department: 'Engineering',
                      picture: 'https://example.com/photo.jpg'
                    },
                    requestId: 'abc123'
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { $ref: '#/components/schemas/ErrorResponse' },
                    requestId: { type: 'string' }
                  },
                  example: {
                    error: {
                      code: 'VALIDATION_ERROR',
                      http: 400,
                      message: 'Invalid session user or tokens',
                      details: 'email must be valid, tokens required'
                    },
                    requestId: 'abc123'
                  }
                }
              }
            }
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { $ref: '#/components/schemas/ErrorResponse' },
                    requestId: { type: 'string' }
                  },
                  example: {
                    error: {
                      code: 'NOT_FOUND',
                      http: 404,
                      message: 'User not found in system for email: john@3ddiagnostix.com'
                    },
                    requestId: 'abc123'
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { $ref: '#/components/schemas/ErrorResponse' },
                    requestId: { type: 'string' }
                  },
                  example: {
                    error: {
                      code: 'INTERNAL_ERROR',
                      http: 500,
                      message: 'Failed to fetch user details'
                    },
                    requestId: 'abc123'
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/user/rights': {
      get: {
        summary: 'Evaluate user rights via Casbin',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'User rights',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        rights: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              resource: { type: 'string' },
                              action: { type: 'string' },
                              allowed: { type: 'boolean' }
                            }
                          }
                        },
                        userEmail: { type: 'string' },
                        groups: { type: 'array', items: { type: 'string' } },
                        roles: { type: 'array', items: { type: 'string' } },
                        orgUnit: { type: 'string' },
                        evaluatedAt: { type: 'string', format: 'date-time' }
                      }
                    },
                    requestId: { type: 'string' }
                  },
                  example: {
                    data: {
                      rights: [
                        { resource: 'patient_data', action: 'read', allowed: true },
                        { resource: 'financial_reports', action: 'write', allowed: false }
                      ],
                      userEmail: 'john@3ddiagnostix.com',
                      groups: ['Engineering'],
                      roles: ['engineer'],
                      orgUnit: 'Software Development',
                      evaluatedAt: '2025-10-08T10:00:00.000Z'
                    },
                    requestId: 'abc123'
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { $ref: '#/components/schemas/ErrorResponse' },
                    requestId: { type: 'string' }
                  },
                  example: {
                    error: {
                      code: 'VALIDATION_ERROR',
                      http: 400,
                      message: 'Invalid session user or tokens',
                      details: 'email must be valid, tokens required'
                    },
                    requestId: 'abc123'
                  }
                }
              }
            }
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { $ref: '#/components/schemas/ErrorResponse' },
                    requestId: { type: 'string' }
                  },
                  example: {
                    error: {
                      code: 'NOT_FOUND',
                      http: 404,
                      message: 'User not found in authorization system for email: john@3ddiagnostix.com'
                    },
                    requestId: 'abc123'
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { $ref: '#/components/schemas/ErrorResponse' },
                    requestId: { type: 'string' }
                  },
                  example: {
                    error: {
                      code: 'INTERNAL_ERROR',
                      http: 500,
                      message: 'Failed to evaluate user rights'
                    },
                    requestId: 'abc123'
                  }
                }
              }
            }
          }
        }
      }
    },
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number' },
                    memoryUsage: { type: 'object' },
                    cpuUsage: { type: 'object' },
                    requestId: { type: 'string' }
                  },
                  example: {
                    status: 'ok',
                    timestamp: '2025-10-13T12:00:00.000Z',
                    uptime: 12345.67,
                    memoryUsage: { rss: 12345678, heapTotal: 2345678, heapUsed: 1234567 },
                    cpuUsage: { user: 123456, system: 23456 },
                    requestId: 'abc123'
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { $ref: '#/components/schemas/ErrorResponse' },
                    requestId: { type: 'string' }
                  },
                  example: {
                    error: {
                      code: 'INTERNAL_ERROR',
                      http: 500,
                      message: 'Failed to perform health check'
                    },
                    requestId: 'abc123'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

