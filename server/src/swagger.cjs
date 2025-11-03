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
        }
      }
    }
  }
}

module.exports = swaggerSpec
