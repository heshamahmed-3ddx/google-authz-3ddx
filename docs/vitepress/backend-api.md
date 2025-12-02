# Backend API Reference

## Overview

The backend API is built with Node.js and Express, providing OAuth 2.0 authentication, role-based access control (RBAC) using Casbin, and REST API endpoints.

## Base URL

```
http://localhost:3001/api
```

## Authentication

### OAuth 2.0 Flow

```javascript
// Get Google OAuth URL
GET /auth/google

// Handle OAuth callback
GET /auth/callback?code={authorization_code}

// Logout
POST /auth/logout
```

### Session Management

All authenticated requests require a session cookie. Sessions are stored in Redis with automatic expiration.

## API Endpoints

### User Management

#### Get User Details
```http
GET /api/user/details
Authorization: Required (Session Cookie)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "primaryEmail": "user@example.com",
    "fullName": "John Doe",
    "groups": ["admin", "SWD"],
    "roles": ["system-admin"],
    "orgUnit": "/Engineering/Development"
  }
}
```

#### Get User Rights
```http
GET /api/user/rights
Authorization: Required (Session Cookie)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": ["admin", "SWD", "Finance22"],
    "roles": ["system-admin"],
    "permissions": ["read", "write", "delete"]
  }
}
```

### Casbin Policy Management

#### Get Policies
```http
GET /api/casbin/policies
Authorization: Required (admin group)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "policies": [
      ["admin", "/api/*", "GET"],
      ["admin", "/api/*", "POST"]
    ]
  }
}
```

#### Add Policy
```http
POST /api/casbin/policies
Authorization: Required (admin group)
Content-Type: application/json

{
  "subject": "Finance22",
  "object": "/api/reports/*",
  "action": "GET"
}
```

#### Remove Policy
```http
DELETE /api/casbin/policies
Authorization: Required (admin group)
Content-Type: application/json

{
  "subject": "Finance22",
  "object": "/api/reports/*",
  "action": "GET"
}
```

### Surgical Guide Reports

#### Get Report Data
```http
GET /api/reports/surgical_guide
Authorization: Required (Finance22 or admin group)
Query Parameters:
  - startDate: YYYY-MM-DD (required)
  - endDate: YYYY-MM-DD (required)
  - page: number (default: 1)
  - limit: number (default: 100, max: 100)
  - sortBy: string (default: 'createdTime')
  - sortOrder: 'asc' | 'desc' (default: 'desc')
  - searchQuery: string (optional)
  - orderTypeFilter: 'all' | 'postpaid' | 'fullyPrepaid' | 'free' (optional)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "orderSGID": "SG123",
      "patientName": "John Doe",
      "doctorFullName": "Dr. Smith",
      "scanCenterFullName": "Central Clinic",
      "cost": 1500.00,
      "typeLabel": "coDiagnostiX",
      "createdTime": "2024-01-15 10:30:00",
      "status": "Active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 250,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Get Report Summary
```http
GET /api/reports/surgical_guide/summary
Authorization: Required (Finance22 or admin group)
Query Parameters:
  - startDate: YYYY-MM-DD (required)
  - endDate: YYYY-MM-DD (required)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 250,
    "postpaidOrders": 150,
    "fullyPrepaidOrders": 75,
    "freeOrders": 10,
    "fullyPostpaidOrders": 100,
    "partiallyPostpaidOrders": 40
  }
}
```

#### Export Report to CSV
```http
GET /api/reports/surgical_guide/export
Authorization: Required (Finance22 or admin group)
Query Parameters:
  - startDate: YYYY-MM-DD (required)
  - endDate: YYYY-MM-DD (required)
```

**Response:** CSV file download

### Access Control

#### Check Report Access
```http
GET /api/reports/surgical_guide/access
Authorization: Required (Session Cookie)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasReportAccess": true,
    "hasSwaggerAccess": true,
    "userGroups": ["Finance22", "admin"]
  }
}
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| BAD_REQUEST | 400 | Invalid request parameters |
| INTERNAL_ERROR | 500 | Server error |

## Rate Limiting

- **Rate:** 100 requests per minute per IP
- **Burst:** 20 requests

When rate limit is exceeded:
```json
{
  "success": false,
  "error": {
    "message": "Too many requests",
    "code": "RATE_LIMIT_EXCEEDED",
    "statusCode": 429,
    "retryAfter": 60
  }
}
```

## Monitoring & Metrics

### Prometheus Metrics Endpoint

```http
GET /metrics
Authorization: Optional (Bearer token if configured)
```

**Response:**
- **Content-Type**: `text/plain; version=0.0.4; charset=utf-8`
- **Format**: Prometheus exposition format

**Available Metrics:**
- `sg_report_db_query_duration_seconds` - Database query execution time (histogram)
- `sg_report_api_fulfillment_duration_seconds` - End-to-end API latency (histogram)
- Default Node.js metrics (CPU, memory, event loop, GC, etc.)

**Example:**
```bash
curl http://localhost:3001/metrics
```

**Configuration:**
- Enable/disable via `PROMETHEUS_ENABLED` environment variable
- Optional authentication via `PROMETHEUS_BEARER_TOKEN`
- Custom path via `PROMETHEUS_METRICS_PATH` (default: `/metrics`)

For detailed monitoring documentation, see [Monitoring & Observability](./monitoring).

## Swagger Documentation

Interactive API documentation is available at:
```
http://localhost:3001/docs
```

## Security Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

## CORS Configuration

CORS is configured to allow:
- **Origins:** `http://localhost:5173` (development)
- **Methods:** GET, POST, PUT, DELETE, PATCH
- **Credentials:** true (for session cookies)

## Next Steps

- [Security Guide](./security)
- [Deployment Guide](./deployment)
- [Monitoring & Observability](./monitoring)
- [Architecture Overview](./architecture)
