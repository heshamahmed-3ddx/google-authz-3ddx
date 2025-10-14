# Technical Specifications - Google AuthZ 3DDX

## 📋 Requirements Analysis

This document maps the current implementation against the comprehensive 3D Diagnostix requirements for Authentication & Authorization using Google.

### Current Implementation Status ✅

**Working Components:**
- ✅ Google OAuth 2.0 authentication with OpenID Connect scopes
- ✅ Vue 3 + Vuetify frontend with modern composition API
- ✅ Node.js + Express backend with proper CORS
- ✅ Session management with express-session
- ✅ Basic user authentication flow
- ✅ Frontend-backend integration working

**Architecture Alignment:**
- ✅ Vue.js (composition API) + Vuetify ✓
- ✅ Node.js + Express ✓
- ✅ Google Workspace SSO via OAuth 2.0 ✓
- ✅ Single-page app (SPA) ✓

### Required Enhancements 🔄

**Critical Missing Components:**

1. **Structured Logging System**
   - Replace console.log with pino structured JSON logging
   - Add request ID correlation across frontend/backend
   - Implement audit logging for authorization decisions
   - Format: `timestamp|level|[file:line]|message`

2. **Casbin Authorization Engine**
   - Implement node-casbin for policy-based authorization
   - Create sample policies (CSV format) and models (CONF format)
   - Add user-to-group/role mapping for demo
   - Implement /api/user/rights endpoint

3. **Enhanced User Details API**
   - Extend /api/user/details to include Google Workspace metadata
   - Add groups, organizational units, 2FA status
   - Integrate with Google Admin SDK (requires domain admin)

4. **Middleware & Error Handling**
   - Add request ID middleware (uuid-based)
   - Implement centralized error handler with standardized responses
   - Add input validation with zod/joi
   - CSRF protection and security headers

5. **API Documentation**
   - OpenAPI/Swagger documentation
   - Swagger UI at /docs endpoint
   - Document all endpoints with request/response schemas

6. **Theme & Responsive Design**
   - Dark/light theme toggle with localStorage persistence
   - External color palette configuration (config/colors.json)
   - Responsive breakpoints: mobile (≤600px), tablet (601-960px), desktop (>960px)
   - Runtime theming with CSS variables

7. **Comprehensive Testing**
   - Jest unit tests (>70% coverage)
   - Supertest integration tests
   - Playwright E2E tests with theme/responsive validation
   - Test Google OAuth flow with mock providers

8. **Documentation & File Headers**
   - JSDoc function headers with purpose, params, returns, throws
   - File headers with name, purpose, author, date
   - Generated API docs with JSDoc/typedoc

## 🏗️ Implementation Phases

### Phase 1: Foundation & Logging
**Priority: HIGH**
- [ ] Implement pino structured logging
- [ ] Add request ID middleware
- [ ] Centralized error handling
- [ ] Input validation with zod

### Phase 2: Authorization Framework
**Priority: HIGH**
- [ ] Install and configure Casbin
- [ ] Create sample policies and models
- [ ] Implement /api/user/rights endpoint
- [ ] Add authorization audit logging

### Phase 3: Enhanced User Data
**Priority: MEDIUM**
- [ ] Extend Google Workspace integration
- [ ] Add groups/org unit retrieval
- [ ] Enhanced /api/user/details endpoint
- [ ] User-to-role mapping for demo

### Phase 4: UI/UX Enhancements
**Priority: MEDIUM**
- [ ] Theme toggle implementation
- [ ] External color palette system
- [ ] Responsive design across breakpoints
- [ ] Accessibility improvements

### Phase 5: Documentation & Testing
**Priority: MEDIUM**
- [ ] OpenAPI/Swagger documentation
- [ ] Comprehensive test suite
- [ ] JSDoc function documentation
- [ ] Setup and deployment guides

### Phase 6: Production Readiness
**Priority: LOW**
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Monitoring and health checks
- [ ] Environment-specific configurations

## 📋 User Stories Implementation Map

| User Story | Current Status | Required Implementation |
|------------|----------------|------------------------|
| US-001: Landing Page | ✅ Complete | Already working |
| US-002: Google SSO | ✅ Complete | Working with current OAuth |
| US-003: User Details | 🔄 Partial | Need groups/orgUnit from Google |
| US-004: User Rights | ❌ Missing | Need full Casbin implementation |
| US-005: Sample Policies | ❌ Missing | Need policy files and loader |
| US-006: Logout | ✅ Complete | Already working |
| US-007: Theme/Responsive | ❌ Missing | Need full UI enhancement |

## 🎯 Success Criteria Alignment

**Business Objectives:**
- ✅ Google Workspace SSO (working)
- ✅ Public landing page with two links (working)
- ✅ Modern Vue.js interface (working)
- 🔄 User identity and membership details (partial - need groups/orgUnit)
- ❌ Policy-based authorization with Casbin (missing)
- ❌ Audit-ready logs (missing structured logging)

**Technical Requirements:**
- ✅ Vue 3 + Vuetify (implemented)
- ✅ Node.js + Express (implemented)
- ✅ Google OAuth integration (implemented)
- ❌ Casbin integration (missing)
- ❌ Structured JSON logging (missing)
- ❌ API documentation (missing)

## 🔧 Technology Stack Validation

**Current vs Required:**

| Component | Current | Required | Status |
|-----------|---------|----------|---------|
| Frontend | Vue 3 + Vuetify | Vue 3 + Vuetify | ✅ Match |
| Backend | Express | Express | ✅ Match |
| Auth | google-auth-library | Passport/google-auth-library | ✅ Compatible |
| Authorization | None | Casbin | ❌ Missing |
| Logging | console.log | pino structured | ❌ Needs upgrade |
| Testing | None | Jest/Supertest/Playwright | ❌ Missing |
| Docs | None | OpenAPI/JSDoc | ❌ Missing |

## 📁 Required File Structure

```
google-authz-3ddx/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CHeader.vue
│   │   │   ├── CFooter.vue
│   │   │   └── CSidebar.vue
│   │   ├── views/
│   │   │   ├── PageUserDetails.vue
│   │   │   └── PageUserRights.vue
│   │   ├── stores/
│   │   │   ├── auth.js
│   │   │   └── theme.js
│   │   └── config/
│   │       └── colors.json
├── server/
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── requestId.js
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   ├── routes/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── services/
│   │   │   ├── casbin.js
│   │   │   ├── google.js
│   │   │   └── logging.js
│   │   └── config/
│   │       ├── casbin/
│   │       │   ├── model.conf
│   │       │   ├── policy.csv
│   │       │   └── users.json
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── api/
│   └── generated/
└── scripts/
    ├── load-sample-policies.sh
    └── generate-docs.sh
```

## 🚀 Next Steps

1. **Immediate Priority**: Implement structured logging and request ID middleware
2. **Core Feature**: Add Casbin authorization system with sample policies
3. **API Enhancement**: Extend user details with Google Workspace data
4. **UI Polish**: Implement theme toggle and responsive design
5. **Quality Assurance**: Add comprehensive testing suite
6. **Documentation**: Generate API docs and function documentation

This roadmap will transform the current working OAuth demo into a production-ready enterprise authentication and authorization system that fully meets the 3D Diagnostix requirements.