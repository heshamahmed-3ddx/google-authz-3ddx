# InsightHub Authorization API Documentation

## Overview

The InsightHub Authorization API provides enterprise-grade authentication and authorization services for the platform. It integrates Google Workspace SSO with Casbin-based RBAC (Role-Based Access Control) to deliver comprehensive security and audit capabilities.

## Table of Contents

- [Authentication](#authentication)
- [Authorization](#authorization)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Audit Logging](#audit-logging)
- [Code Examples](#code-examples)

## Authentication

### Overview
The API uses session-based authentication with Google OAuth 2.0. Users must authenticate via the Google OAuth flow before accessing protected resources.

### Authentication Flow
1. User initiates login via `/auth/google`
2. Google OAuth consent and authentication
3. User redirected to `/auth/callback` with authorization code
4. Server exchanges code for access tokens
5. Session established with user context
6. Subsequent API calls include session cookie

### Session Management
- Sessions are stored server-side using express-session
- Session cookies are HTTP-only and secure in production
- Sessions include user profile and OAuth tokens
- Automatic session refresh using Google refresh tokens

## Authorization

### Casbin RBAC Model
The authorization system uses Casbin with an RBAC model supporting:

- **Subjects**: Users identified by email addresses
- **Objects**: Resources like `patient_data`, `financial_reports`, `admin_panel`
- **Actions**: Operations like `read`, `write`, `delete`, `approve`
- **Groups**: User groups like `Engineering`, `Finance`, `Admin`
- **Roles**: Organizational roles like `engineer`, `manager`, `admin`

### Policy Structure
```
# Format: subject, object, action
Engineering, patient_data, read
Engineering, patient_data, write
Finance, financial_reports, read
Finance, financial_reports, write
Admin, admin_panel, read
Admin, admin_panel, write
```

### User-Group Mapping
Users are mapped to groups via the `users.json` configuration:
```json
{
  "users": [
    {
      "email": "john.doe@3ddiagnostix.com",
      "fullName": "John Doe",
      "groups": ["Engineering"],
      "roles": ["engineer"],
      "orgUnit": "Software Development",
      "department": "Engineering"
    }
  ]
}
```

## API Endpoints

### User Data Endpoints

#### GET /api/profile
Retrieve user profile from Google API.

**Response:**
```json
{
  "profile": {
    "id": "123456789",
    "name": "John Doe",
    "email": "john.doe@3ddiagnostix.com",
    "picture": "https://lh3.googleusercontent.com/..."
  },
  "source": "Google API"
}
```

#### GET /api/user/details
Get comprehensive user details including groups, roles, and organization.

**Response:**
```json
{
  "data": {
    "fullName": "John Doe",
    "email": "john.doe@3ddiagnostix.com",
    "groups": ["Engineering", "R&D"],
    "roles": ["engineer", "team_lead"],
    "orgUnit": "Software Development",
    "department": "Engineering",
    "twoStepEnabled": true,
    "picture": "https://lh3.googleusercontent.com/..."
  },
  "requestId": "req_1234567890"
}
```

### Authorization Endpoints

#### GET /api/user/rights
Get user's complete permissions across all resources.

**Response:**
```json
{
  "data": {
    "rights": [
      {
        "resource": "patient_data",
        "actions": ["read", "write"]
      },
      {
        "resource": "imaging_systems",
        "actions": ["read"]
      }
    ],
    "userEmail": "john.doe@3ddiagnostix.com",
    "groups": ["Engineering"],
    "roles": ["engineer"],
    "orgUnit": "Software Development",
    "evaluatedAt": "2025-10-08T10:00:00.000Z"
  },
  "requestId": "req_1234567890"
}
```

#### POST /api/authorize
Test authorization for specific resource and action.

**Request:**
```json
{
  "resource": "patient_data",
  "action": "read"
}
```

**Response:**
```json
{
  "data": {
    "allowed": true,
    "resource": "patient_data",
    "action": "read",
    "userEmail": "john.doe@3ddiagnostix.com",
    "userGroups": ["Engineering"],
    "evaluatedAt": "2025-10-08T10:00:00.000Z"
  },
  "requestId": "req_1234567890"
}
```

### System Endpoints

#### GET /api/health
System health check for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-08T10:00:00.000Z",
  "version": "1.0.0",
  "casbin": "initialized"
}
```

#### GET /api/test
Basic connectivity test.

**Response:**
```json
{
  "message": "API is working!",
  "timestamp": "2025-10-08T10:00:00.000Z",
  "authenticated": true
}
```

### Google Services Endpoints

#### GET /api/drive/files
List user's Google Drive files (requires additional OAuth scope).

**Parameters:**
- `pageSize` (optional): Number of files to return (default: 10, max: 100)

**Response:**
```json
{
  "files": [
    {
      "id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      "name": "Patient Report.pdf",
      "mimeType": "application/pdf",
      "modifiedTime": "2025-10-08T09:00:00.000Z"
    }
  ],
  "nextPageToken": "CAMQoUw"
}
```

## Error Handling

### Error Response Format
All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "http": 401,
    "message": "Human-readable error message"
  },
  "requestId": "req_1234567890"
}
```

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_REQUIRED` | 401 | User authentication required |
| `NOT_FOUND` | 404 | Resource or user not found |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `INTERNAL_ERROR` | 500 | Server-side error |

### Common Error Scenarios

#### 401 - Authentication Required
```json
{
  "error": {
    "code": "AUTH_REQUIRED",
    "http": 401,
    "message": "Authentication required"
  },
  "requestId": "req_1234567890"
}
```

#### 404 - User Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "http": 404,
    "message": "User not found in authorization system"
  },
  "requestId": "req_1234567890"
}
```

## Audit Logging

### Structured Logging
All API operations are logged using structured JSON with:

- **Request Correlation**: Unique `requestId` for tracing
- **User Context**: Email, IP address, user agent
- **Authorization Decisions**: Detailed permission evaluations
- **Performance Metrics**: Response times and resource usage

### Log Categories

#### Authentication Events
```json
{
  "level": "info",
  "msg": "User authenticated successfully",
  "time": "2025-10-08T10:00:00.000Z",
  "requestId": "req_1234567890",
  "userEmail": "john.doe@3ddiagnostix.com",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

#### Authorization Events
```json
{
  "level": "info",
  "msg": "Authorization decision",
  "time": "2025-10-08T10:00:00.000Z",
  "requestId": "req_1234567890",
  "userEmail": "john.doe@3ddiagnostix.com",
  "resource": "patient_data",
  "action": "read",
  "allowed": true,
  "evaluationTime": 15,
  "userGroups": ["Engineering"]
}
```

#### Access Events
```json
{
  "level": "info",
  "msg": "User details accessed",
  "time": "2025-10-08T10:00:00.000Z",
  "requestId": "req_1234567890",
  "userEmail": "john.doe@3ddiagnostix.com",
  "groups": ["Engineering"],
  "orgUnit": "Software Development"
}
```

## Code Examples

### Frontend Integration (Vue.js)

#### Authentication Check
```javascript
import api from '@/services/api'

// Check if user is authenticated
const checkAuth = async () => {
  try {
    const response = await api.get('/api/test')
    return response.data.authenticated
  } catch (error) {
    return false
  }
}
```

#### Get User Details
```javascript
const getUserDetails = async () => {
  try {
    const response = await api.get('/api/user/details')
    return response.data.data
  } catch (error) {
    console.error('Failed to fetch user details:', error)
    throw error
  }
}
```

#### Check Authorization
```javascript
const checkPermission = async (resource, action) => {
  try {
    const response = await api.post('/api/authorize', {
      resource,
      action
    })
    return response.data.data.allowed
  } catch (error) {
    console.error('Authorization check failed:', error)
    return false
  }
}

// Usage
const canReadPatientData = await checkPermission('patient_data', 'read')
if (canReadPatientData) {
  // Show patient data UI
}
```

### Backend Integration (Node.js)

#### Middleware for Resource Protection
```javascript
const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userEmail = req.session.user.email
      const authResult = await casbinService.authorize(userEmail, resource, action)
      
      if (authResult.allowed) {
        next()
      } else {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            http: 403,
            message: `Access denied for ${action} on ${resource}`
          }
        })
      }
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          http: 500,
          message: 'Authorization check failed'
        }
      })
    }
  }
}

// Usage
app.get('/api/patients', requirePermission('patient_data', 'read'), (req, res) => {
  // Handle patient data request
})
```

#### Casbin Service Usage
```javascript
import casbinService from './services/casbin.js'

// Initialize on startup
await casbinService.initialize()

// Check permission
const authResult = await casbinService.authorize(
  'john.doe@3ddiagnostix.com',
  'patient_data',
  'read'
)

if (authResult.allowed) {
  console.log('Access granted')
} else {
  console.log('Access denied')
}

// Get user rights
const userRights = await casbinService.getUserRights('john.doe@3ddiagnostix.com')
console.log('User rights:', userRights.rights)
```

## Best Practices

### Security
1. **Always validate user sessions** before accessing protected resources
2. **Use HTTPS in production** to protect session cookies and tokens
3. **Implement proper CORS policies** for frontend-backend communication
4. **Log all authorization decisions** for security auditing
5. **Use principle of least privilege** when assigning group memberships

### Performance
1. **Cache user rights** where appropriate to reduce database lookups
2. **Use request correlation IDs** for debugging and performance monitoring
3. **Implement proper error handling** to prevent information leakage
4. **Monitor authorization evaluation times** for performance optimization

### Development
1. **Use the health check endpoint** for load balancer and monitoring setup
2. **Test authorization scenarios** using the `/api/authorize` endpoint
3. **Review audit logs regularly** for security and compliance
4. **Keep Casbin policies version controlled** for reproducible deployments

## Support

For technical support or questions about the API:
- **Development Team**: dev@3ddiagnostix.com
- **Documentation**: https://docs.3ddiagnostix.com
- **Issue Tracking**: Internal JIRA system

---

*Last updated: October 8, 2025*
*API Version: 1.0.0*