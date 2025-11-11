---
title: 3DDX Application Documentation
layout: home

hero:
  name: 3DDX Platform
  text: Authorization & Management System
  tagline: Comprehensive documentation for the entire Google AuthZ 3DDX platform
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
    title: Modern UI
    details: Vue 3 + Vuetify 3 with dark mode, i18n, and responsive design
  - icon: 📊
    title: Reports & Analytics
    details: Surgical guide financial reports with filtering and export
  - icon: 🚀
    title: Developer Tools
    details: Dev mode with group simulation and permission testing
  - icon: 📱
    title: Responsive Design
    details: Mobile-first approach with Oracle Fusion-inspired navigation
---

# Welcome to 3DDX Documentation

Comprehensive documentation for the entire Google AuthZ 3DDX platform: client, backend, components, API, architecture, and guides.

## 📚 Core Documentation

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
- ✅ **Surgical Guide Reports** - Financial analytics
- ✅ **Multi-language Support** - EN, AR, ES, FR
- ✅ **Dark Mode** - Light, dark, and auto themes
- ✅ **Responsive Design** - Mobile and desktop
- ✅ **Dev Mode Tools** - Testing and debugging

## 📖 Documentation Sections

### Getting Started
- [Installation & Setup](./getting-started)
- [Architecture Overview](./architecture)
- [Usage Guides](./usage-guides)

### API Reference
- [Backend API](./backend-api) - REST endpoints
- [Legacy API Reference](./api-reference)

### Frontend
- [Vue Components](./vue-components) - Component library
- [Client Services](./client-services) - Stores and APIs
- [Legacy Components](./components)
- [Legacy Client API](./api)

### Deployment & Security
- [Deployment Guide](./deployment)
- [Security Guide](./security)
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

**Last Updated:** December 2024 | **Version:** 1.0.0