---
title: Architecture
---

# System Architecture Overview

## Introduction
This document provides a high-level overview of the architecture for the InsightHub platform, detailing the major components, their interactions, and design principles.

## Architecture Diagram

```
+-------------------+        +-------------------+        +-------------------+
|   Vue 3 Frontend  | <----> |   Express Backend | <----> |   Casbin RBAC     |
+-------------------+        +-------------------+        +-------------------+
        |                        |                            |
        v                        v                            v
+-------------------+   +-------------------+   +-------------------+
|   Vuetify UI      |   |   Auth Middleware |   |   Policy Storage   |
+-------------------+   +-------------------+   +-------------------+
        |                        |                            |
        v                        v                            v
+-------------------+   +-------------------+   +-------------------+
|   i18n/RTL        |   |   API Endpoints   |   |   User Groups     |
+-------------------+   +-------------------+   +-------------------+
```

## Components

### 1. Frontend (Vue 3 + Vuetify)
- SPA with responsive UI, RTL/i18n, and theme support
- Handles authentication via Google OAuth
- Communicates with backend via REST API
- Admin panel for user/policy management
- **NavigationSidebar** - Desktop sidebar navigation with rail mode
- **OverlaySidebar** - Mobile/tablet full-screen overlay navigation with search
- **DevToolbar** - Development tools with VitePress integration
- **Static design philosophy** - No animations, optimized performance
- **Search functionality** - Filter navigation items
- **Grid-based layout** - Responsive navigation grid

### 2. Backend (Node.js + Express)
- Serves API endpoints for authentication, authorization, and admin features
- Integrates with Google OAuth 2.0 for SSO
- Manages sessions and user context
- Implements Casbin RBAC for fine-grained access control
- Structured logging (Winston) and error handling
- **Prometheus metrics** - Performance monitoring
- **Grafana integration** - Metrics visualization
- **Swagger/OpenAPI** - API documentation at /docs

### 3. Authorization (Casbin RBAC)
- Policy engine for user/group/role management
- Policy storage in CSV/JSON files
- Real-time policy evaluation for API requests

### 4. Security & Middleware
- Helmet.js for HTTP security headers
- Rate limiting and request tracking
- CSRF protection for sensitive endpoints
- Audit logging for admin actions

### 5. Monitoring & Observability
- Prometheus metrics collection
- Grafana dashboards for visualization
- Performance monitoring (API latency, DB query duration)
- User context tracking in metrics

## Data Flow
1. User accesses frontend and initiates Google login
2. Backend handles OAuth callback, establishes session
3. User context and permissions loaded from Casbin
4. API requests validated against RBAC policies
5. Admin panel allows real-time policy/user/group management

## Design Principles
- Separation of concerns (frontend/backend/auth)
- Stateless REST API with session management
- Modular middleware for security and logging
- Extensible policy engine for future requirements

## Extensibility
- Easily add new roles/groups/policies via admin panel
- Support for additional OAuth providers
- Scalable for multi-tenant deployments

## References
- [Casbin Documentation](https://casbin.org/docs/en/overview)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Vue.js](https://vuejs.org/)
- [Express.js](https://expressjs.com/)
