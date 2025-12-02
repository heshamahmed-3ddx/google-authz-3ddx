---
title: InsightHub Application Documentation
layout: home

hero:
  name: InsightHub Platform
  text: Authorization & Management System
  tagline: Comprehensive documentation for the entire InsightHub platform
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View Architecture
      link: /architecture
    - theme: alt
      text: API Reference
      link: /backend-api

features:
  - icon: 🔐
    title: OAuth 2.0 Authentication
    details: Secure Google authentication with session management and CSRF protection
  - icon: 🛡️
    title: Casbin RBAC
    details: Fine-grained role-based access control with policy management
  - icon: 🎨
    title: Compact UI Design
    details: Global compact UI system with static design (no animations), consistent spacing, typography, and components
  - icon: 📱
    title: OverlaySidebar Navigation
    details: Full-screen overlay navigation with search, user profile, and grid-based layout
  - icon: ⚙️
    title: Settings Management
    details: Comprehensive settings page with roles, permissions, and policies management
  - icon: 📊
    title: Reports & Analytics
    details: Surgical guide financial reports with filtering and export
  - icon: 📈
    title: Monitoring & Observability
    details: Prometheus metrics and Grafana dashboards for performance tracking
  - icon: 🚀
    title: Developer Tools
    details: Dev mode with group simulation and permission testing
---

# Welcome to InsightHub Documentation

Comprehensive documentation for the entire InsightHub platform: client, backend, components, API, architecture, and guides.

## 📚 Core Documentation

### UI & Styling
- **[Compact UI Style Guide](./compact-ui-style-guide)** - Global compact design system
- **[Settings Page Guide](./settings-page-guide)** - Settings and permissions management

### Backend
- **[Backend API Reference](./backend-api)** - Complete REST API documentation
- **[Casbin User Management](./casbin-user-management)** - Role-based access control

### Frontend
- **[Vue Components Reference](./vue-components)** - All Vue 3 components
- **[Client Services & Stores](./client-services)** - State management and APIs

### Guides
- **[Usage Guides](./usage-guides)** - Step-by-step tutorials
- **[Getting Started](./getting-started)** - Setup and installation
- **[Dev Mode Guide](./DEV_MODE_GUIDE)** - Development tools

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js 18+ with Express
- Passport.js (OAuth 2.0)
- Casbin (RBAC)
- Redis (sessions)
- PostgreSQL (data)

**Frontend:**
- Vue 3 (Composition API)
- Vuetify 3 (UI framework)
- Pinia (state management)
- Vue Router (navigation)
- Vite (build tool)

**[View Full Architecture →](./architecture)**

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd InsightHub

# Install dependencies
npm install

# Start development servers
npm run dev
```

**[Complete Setup Guide →](./getting-started)**

## 🔑 Key Features

- ✅ **OAuth 2.0 Authentication** - Secure Google login
- ✅ **Casbin RBAC** - Fine-grained permissions
- ✅ **Compact UI System** - Global consistent design with static styling (no animations)
- ✅ **OverlaySidebar Navigation** - Full-screen overlay navigation with search
- ✅ **Settings Management** - Roles, permissions, and policies
- ✅ **Surgical Guide Reports** - Financial analytics with localization
- ✅ **Monitoring & Observability** - Prometheus metrics and Grafana dashboards
- ✅ **Multi-language Support** - EN, AR, ES, FR with full RTL support
- ✅ **Dark Mode** - Light, dark, and auto themes
- ✅ **Responsive Design** - Mobile and desktop optimized
- ✅ **Dev Mode Tools** - Testing and debugging with VitePress docs integration

## 📖 Documentation Sections

### Getting Started
- [Installation & Setup](./getting-started)
- [Architecture Overview](./architecture)
- [Usage Guides](./usage-guides)

### API Reference
- [Backend API](./backend-api) - REST endpoints
- [Legacy API Reference](./api-reference)

### Frontend
- [Compact UI Style Guide](./compact-ui-style-guide) - Global design system
- [Settings Page Guide](./settings-page-guide) - Settings management
- [Vue Components](./vue-components) - Component library
- [Client Services](./client-services) - Stores and APIs
- [Legacy Components](./components)
- [Legacy Client API](./api)

### Deployment & Security
- [Deployment Guide](./deployment)
- [Security Guide](./security)
- [Monitoring & Observability](./monitoring)
- [Technical Specifications](./technical-specifications)

### Development
- [Dev Mode Guide](./DEV_MODE_GUIDE)
- [General Guide](./guide)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

**Code Standards:**
- ESLint for JavaScript linting
- Prettier for code formatting
- Vue 3 Style Guide for components
- JSDoc for documentation

## 📞 Support

Need help? Check these resources:

- **[Usage Guides](./usage-guides)** - Common tasks and workflows
- **[API Reference](./backend-api)** - Complete API documentation
- **[Component Reference](./vue-components)** - UI component docs
- **[Architecture](./architecture)** - System design

---

**Last Updated:** January 2025 | **Version:** 1.1.0