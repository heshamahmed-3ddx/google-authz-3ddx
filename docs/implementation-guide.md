# Implementation Specifications - InsightHub

## 🎯 Detailed Implementation Guide

This document provides specific implementation details for transforming the current OAuth demo into a production-ready system meeting all InsightHub requirements.

## 📝 Phase 1: Foundation & Logging

### 1.1 Structured Logging with Pino

**Implementation:**
```bash
npm install pino pino-http uuid
```

**Required Files:**
- `server/src/services/logging.js` - Logger configuration
- `server/src/middleware/requestId.js` - Request ID middleware
- `server/src/middleware/logger.js` - Request logging middleware

**Log Format Requirements:**
```
2023-02-28 14:09:23|INFO|[main.js:603]|message with requestId and userEmail
```

**Log Levels & Events:**
- `DEBUG`: Detailed debugging information
- `INFO`: Authentication success/failure, user actions, page views
- `WARN`: Authorization policy mismatches, recoverable errors
- `ERROR`: Unhandled exceptions, authentication failures

**Required Log Events:**
- `auth.attempt` - User authentication attempt
- `auth.success` - Successful authentication
- `auth.failure` - Authentication failure
- `authz.evaluation` - Casbin policy evaluation
- `user.details.view` - User details accessed
- `page.view` - Page access logging

### 1.2 Request ID Middleware

**Purpose:** Correlate requests across frontend/backend for audit trails

**Implementation:**
```javascript
// Generate UUID for each request
// Add to response headers
// Include in all log entries
// Pass to frontend for correlation
```

### 1.3 Centralized Error Handling

**Required Error Codes:**
- `AUTH_REQUIRED` (401) - Authentication required
- `FORBIDDEN` (403) - Access denied by policy
- `VALIDATION_ERROR` (400) - Input validation failed
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource conflict
- `INTERNAL_ERROR` (500) - Unexpected server error

**Response Format:**
```json
{
  "error": {
    "code": "AUTH_REQUIRED",
    "http": 401,
    "message": "Authentication required"
  },
  "requestId": "abcd1234"
}
```

## 🔐 Phase 2: Casbin Authorization System

### 2.1 Casbin Integration

**Installation:**
```bash
npm install casbin
```

**Required Files:**
- `server/src/config/casbin/model.conf` - RBAC model definition
- `server/src/config/casbin/policy.csv` - Sample policies
- `server/src/config/casbin/users.json` - User-to-group mapping
- `server/src/services/casbin.js` - Casbin service wrapper

### 2.2 Sample Policy Structure

**Model (model.conf):**
```ini
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _
g2 = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
```

**Policies (policy.csv):**
```csv
p, engineering, invoices, read
p, engineering, invoices, approve
p, finance, invoices, read
p, finance, invoices, approve
p, finance, customers, read
p, admin, *, *
g, alice@3ddx.com, engineering
g, bob@3ddx.com, finance
g, admin@3ddx.com, admin
```

### 2.3 API Endpoints

**GET /api/user/rights**
- Evaluate user's permissions based on groups/roles
- Return list of allowed resources and actions
- Log every authorization decision

**Response Example:**
```json
{
  "data": {
    "rights": [
      {"resource": "invoices", "actions": ["read", "approve"]},
      {"resource": "customers", "actions": ["read"]}
    ]
  },
  "requestId": "uuid-here"
}
```

## 👤 Phase 3: Enhanced User Details

### 3.1 Google Workspace Integration

**Required Scopes:**
```javascript
const scopes = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/admin.directory.user.readonly'
];
```

**Note:** Admin SDK access requires domain-wide delegation for production Google Workspace integration.

### 3.2 User Details API Enhancement

**GET /api/user/details**

**Required Response:**
```json
{
  "data": {
    "fullName": "Alice Ahmed",
    "email": "alice@3ddx.com",
    "groups": ["engineering", "platform"],
    "orgUnit": "Engineering/Platform",
    "roles": ["developer"],
    "twoStepEnabled": true
  },
  "requestId": "uuid-here"
}
```

**Implementation Notes:**
- For demo purposes, use mock data mapping in `users.json`
- Production requires Google Admin SDK with domain admin privileges
- Include error handling for API rate limits

## 🎨 Phase 4: Theme & Responsive Design

### 4.1 Theme System

**External Color Palette (config/colors.json):**
```json
{
  "light": {
    "primary": "#1976d2",
    "secondary": "#424242",
    "accent": "#82b1ff",
    "error": "#ff5252",
    "info": "#2196f3",
    "success": "#4caf50",
    "warning": "#fb8c00",
    "background": "#ffffff",
    "surface": "#ffffff"
  },
  "dark": {
    "primary": "#2196f3",
    "secondary": "#424242",
    "accent": "#ff4081",
    "error": "#ff5252",
    "info": "#2196f3",
    "success": "#4caf50",
    "warning": "#fb8c00",
    "background": "#121212",
    "surface": "#1e1e1e"
  }
}
```

### 4.2 Responsive Breakpoints

**Required Breakpoints:**
- Mobile: ≤600px
- Tablet: 601-960px  
- Desktop: >960px

**Layout Adaptations:**
- Header: Collapse to hamburger menu on mobile
- Sidebar: Hidden on mobile, overlay on tablet
- Footer: Stack copyright and version on mobile
- Content: Single column on mobile, responsive grid on larger screens

### 4.3 Theme Toggle Implementation

**Frontend Requirements:**
- Toggle button in header
- Persist choice in localStorage
- Apply theme on page load
- Smooth transitions between themes

## 📚 Phase 5: API Documentation

### 5.1 OpenAPI/Swagger Integration

**Installation:**
```bash
npm install swagger-jsdoc swagger-ui-express
```

**Required Endpoints Documentation:**
- `GET /` - Landing page
- `GET /auth/google` - Initiate OAuth flow
- `GET /auth/google/callback` - OAuth callback
- `POST /auth/logout` - Sign out
- `GET /api/user/details` - User information
- `GET /api/user/rights` - User permissions
- `GET /api/health` - Health check

### 5.2 Function Documentation

**JSDoc Example:**
```javascript
/**
 * Fetches Google profile for authenticated user.
 * @param {string} accessToken - Google access token
 * @returns {Promise<UserProfile>} - normalized user profile
 * @throws {AuthError} - when token invalid or request fails
 */
async function fetchGoogleProfile(accessToken) {
  // Implementation
}
```

**Required File Headers:**
```javascript
/**
 * @file auth.js
 * @description Google OAuth authentication routes and session management
 * @author InsightHub Development Team
 * @created 2025-10-07
 * @copyright 2025 InsightHub, Inc. All rights reserved.
 */
```

## 🧪 Phase 6: Comprehensive Testing

### 6.1 Testing Stack

**Installation:**
```bash
npm install --save-dev jest supertest @playwright/test
```

**Test Structure:**
```
tests/
├── unit/
│   ├── auth.test.js
│   ├── casbin.test.js
│   └── validation.test.js
├── integration/
│   ├── api.test.js
│   └── auth-flow.test.js
└── e2e/
    ├── login-flow.spec.js
    ├── user-details.spec.js
    ├── theme-toggle.spec.js
    └── responsive.spec.js
```

### 6.2 Test Requirements

**Unit Tests (Jest):**
- >70% code coverage on core modules
- Test auth middleware, Casbin integration, utilities
- Mock external dependencies (Google APIs)

**Integration Tests (Supertest):**
- Test API endpoints end-to-end
- Mock Google OAuth flow
- Validate request/response formats

**E2E Tests (Playwright):**
- Full login flow with test accounts
- Theme switching validation
- Responsive design across viewports
- Accessibility testing

## 🔒 Security Implementation

### 6.1 Session Security

**Required Settings:**
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
}));
```

### 6.2 Input Validation

**Zod Schema Example:**
```javascript
const userDetailsSchema = z.object({
  email: z.string().email(),
  accessToken: z.string().min(1)
});
```

### 6.3 CORS Configuration

**Production Settings:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
}));
```

## 📋 Environment Variables

**Required Variables:**
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Session
SESSION_SECRET=your-session-secret

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Casbin
CASBIN_MODEL_PATH=./src/config/casbin/model.conf
CASBIN_POLICY_PATH=./src/config/casbin/policy.csv

# Logging
LOG_LEVEL=info
```

## 🚀 Deployment Checklist

**Pre-Production:**
- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] Session security enabled
- [ ] CORS properly configured
- [ ] Error handling tested
- [ ] Logging structured and working
- [ ] Test suite passing (>70% coverage)
- [ ] API documentation generated
- [ ] Security audit completed

**Production Readiness:**
- [ ] Health check endpoint
- [ ] Performance monitoring
- [ ] Log aggregation configured
- [ ] Backup strategies in place
- [ ] Rollback procedures documented
- [ ] Load testing completed

This implementation guide provides the roadmap to transform your working OAuth demo into a production-ready enterprise authentication and authorization system that fully satisfies the InsightHub requirements.