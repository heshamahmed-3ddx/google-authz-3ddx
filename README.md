<div align="center">
  <img src="./client/public/logo.png" alt="Brand Logo" width="240"/>
</div>

# Google AuthZ 3DDX - Authentication & Authorization Demo

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-brightgreen.svg)](https://vuejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![Google OAuth](https://img.shields.io/badge/Google-OAuth%202.0-blue.svg)](https://developers.google.com/identity/protocols/oauth2)

> **Purpose**: Demonstrate secure authentication using Google Workspace accounts and policy-based authorization using Casbin for 3D Diagnostix, Inc.

## 🎯 Project Overview

This application provides a complete demonstration of:
- **Google Workspace SSO** authentication with automatic user registration
- **Policy-based authorization** using Casbin RBAC
- **Admin panel** for real-time user and policy management
- **Modern Vue.js** frontend with Vuetify and RTL support
- **Multi-language support** (English/Arabic) with full RTL layout
- **Structured logging** and comprehensive audit trails
- **Enterprise-grade security** with rate limiting and CSRF protection

### Current Status: ✅ **Production Ready** | ✅ **All Features Complete**

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd google-authz-3ddx

# Run setup script
./scripts/setup-dev.sh

# Start development servers
npm run dev
```

Visit http://localhost:3000 to view the application.

## 🧑‍💻 Demo Flows

The SPA demonstrates:
- **Login with Google**: Authenticate using your Google Workspace account with automatic user registration
- **View Dashboard**: Access protected dashboard and see your groups/roles/rights (Casbin-powered)
- **Admin Panel**: Comprehensive management interface for users, policies, and group assignments (admin users only)
  - **Users Tab**: View all system users, edit group memberships, manage user details
  - **Policies Tab**: Add/remove authorization policies, view complete policy matrix
  - **Groups Tab**: Manage user-group assignments with real-time updates
- **User Rights Testing**: Test authorization for specific resources and actions
- **Multi-language**: Switch between English and Arabic with full RTL support
- **Theme System**: Toggle between light and dark modes

### Quick Admin Testing
Users with admin privileges can:
1. **Manage Users**: Add users to groups, view organizational details
2. **Control Policies**: Define who can access what resources
3. **Test Permissions**: Verify authorization rules in real-time
4. **Monitor System**: View complete user and permission overview

> **Admin Access**: Use `heshamahmed8877@gmail.com` to test admin features or add your email to `server/src/config/casbin/users.json` with admin group membership. See [Admin Testing Guide](./docs/admin-testing-guide.md) for details.

Main links:
- `Login with Google` (on homepage)
- `Dashboard` (after login)

See [docs/getting-started.md](./docs/getting-started.md) for a step-by-step demo walkthrough.

## �📁 Project Structure

```
google-authz-3ddx/
├── 📁 server/          # Node.js + Express backend
│   ├── src/            # Server source code
│   ├── package.json    # Server dependencies
│   └── .env.example    # Server environment template
├── 📁 client/          # Vue 3 + Vuetify frontend  
│   ├── src/            # Client source code
│   ├── package.json    # Client dependencies
│   └── .env.example    # Client environment template
├── 📁 tests/           # Test suites (unit, integration, e2e)
├── 📁 scripts/         # Utility scripts
├── 📁 docs/            # Project documentation
├── .gitignore          # Git ignore rules
└── package.json        # Root package configuration
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework with comprehensive middleware
- **Casbin** - RBAC authorization engine
- **Google Auth Library** - OAuth 2.0 implementation
- **Google APIs** - API integration
- **Express Session** - Secure session management
- **Pino** - Structured logging

### Frontend  
- **Vue 3** - Progressive JavaScript framework
- **Vuetify** - Material Design component library with RTL support
- **Vite** - Build tool and dev server
- **Pinia** - State management
- **Vue Router** - Client-side routing with guards
- **Vue i18n** - Internationalization with English/Arabic
- **Axios** - HTTP client with interceptors

### Development Tools
- **Jest** - Server testing framework
- **Vitest** - Client testing framework  
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🔧 Configuration

### Google Cloud Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable required APIs (Google+ API, Drive API, etc.)
3. Create OAuth 2.0 credentials:
   - **Client ID** and **Client Secret**
   - **Authorized redirect URIs**: `http://localhost:3001/auth/google/callback`
   - **Authorized JavaScript origins**: `http://localhost:3000`

### User & Permission Configuration

#### Casbin User Management
Users, groups, and roles are configured in:
```
server/src/config/casbin/users.json
server/src/config/casbin/policy.csv
```

#### Adding Admin Users for Testing
To add yourself as an admin user, add your Gmail to `server/src/config/casbin/users.json`:

```json
{
  "email": "your-email@gmail.com",
  "fullName": "Your Name (Admin)",
  "groups": ["admin", "engineering"],
  "orgUnit": "IT/Administration",
  "roles": ["admin", "system-admin"],
  "twoStepEnabled": true,
  "department": "IT"
}
```

See [Casbin User Management Guide](./docs/casbin-user-management.md) for complete documentation and [Admin Testing Guide](./docs/admin-testing-guide.md) for quick setup instructions.

### Environment Variables


Both the server and client require environment variables for configuration. Copy `.env.example` to `.env` in each directory and fill in the required values:

### Server (`server/.env`)

| Variable                | Description                                 |
|------------------------|---------------------------------------------|
| NODE_ENV               | Node environment (`development`, `production`) |
| PORT                   | Server port (default: `3001`)               |
| GOOGLE_CLIENT_ID       | Google OAuth Client ID                      |
| GOOGLE_CLIENT_SECRET   | Google OAuth Client Secret                   |
| GOOGLE_REDIRECT_URI    | Google OAuth Redirect URI                    |
| SESSION_SECRET         | Secret for session encryption                |
| CLIENT_URL             | Client app URL for CORS (default: `http://localhost:3000`) |
| DATABASE_URL           | (Optional) Database connection string        |

### Client (`client/.env`)

| Variable      | Description                       |
|--------------|-----------------------------------|
| VITE_API_URL | Backend API base URL (default: `http://localhost:3001`) |

See `.env.example` in each directory for sample values and required fields.

> **Security Note:** `.env` files are listed in `.gitignore` and must never be committed. Store Google credentials and secrets only in environment files.

## 📜 Available Scripts

### Development
```bash
npm run dev              # Start both server and client
npm run dev:server       # Start only server
npm run dev:client       # Start only client
```

### Building
```bash
npm run build            # Build for production
npm run build:client     # Build only client
```

### Testing
```bash
npm run test             # Run all tests
npm run test:server      # Run server tests
npm run test:client      # Run client tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run end-to-end tests
```

### Utilities
```bash
npm run setup            # Setup development environment
npm run lint             # Lint all code
npm run clean            # Clean node_modules
npm run clean:build      # Clean build artifacts
```

## 🔒 Security Features

### Authentication & Authorization
- **Google OAuth 2.0** with secure session management
- **Casbin RBAC** with policy-based access control
- **Automatic user registration** with default permissions
- **Admin-only endpoints** with privilege checking

### Security Middleware
- **Helmet.js** for HTTP security headers
- **Rate limiting** per endpoint and IP
- **CORS** configuration for cross-origin requests
- **Request ID tracking** for audit trails
- **Input validation** with Zod schemas

### Additional Security Notes
- **Session cookies** use `HttpOnly`, `Secure`, and `SameSite=Strict` in production
- **CSRF protection** enabled for sensitive operations
- **OAuth redirect URIs** validated and restricted
- **Environment variables** for all secrets and credentials

## 🎯 Features Demonstrated

### Authentication & User Management
- **Google OAuth 2.0** complete flow with token refresh
- **Automatic user registration** for new Google accounts
- **Session-based authentication** with secure cookies
- **User profile integration** from Google APIs

### Authorization & Access Control
- **Casbin RBAC** with groups, roles, and policies
- **Real-time policy evaluation** for all API requests
- **Comprehensive admin panel** with user, policy, and group management
- **User management interface** - View, edit, and assign groups to users
- **Policy management** - Add/remove authorization policies dynamically
- **Group assignment system** - Manage user group memberships
- **Live authorization testing** - Test permissions in real-time
- **Fine-grained permissions** per resource and action
- **Auto-user registration** with configurable default permissions

### Frontend Features
- **Responsive Material Design** UI with Vuetify
- **Multi-language support** (English/Arabic) with RTL
- **Dark/Light theme system** with user preferences
- **State management** with Pinia and persistent storage
- **Route protection** with authentication guards
- **Error handling** and comprehensive user feedback
- **Loading states** and smooth animations
- **Three-tab admin panel** for complete system management:
  - **Users Tab**: View all users, edit group assignments, manage user details
  - **Policies Tab**: Add/remove authorization policies, view policy matrix
  - **Groups Tab**: Manage user-group assignments, bulk operations
- **Real-time authorization testing** interface with permission validation
- **User rights visualization** with detailed permissions breakdown

## 📚 Documentation

### Core Documentation
- [Getting Started](./docs/getting-started.md) - Setup and development guide
- [API Reference](./docs/api-reference.md) - Backend API documentation
- [Architecture](./docs/architecture.md) - System design overview
- [Security](./docs/security.md) - Security considerations
- [Reuse Guide](./docs/reuse-guide.md) - How to adapt this system for future projects
- [Testing Guide](./tests/README.md) - Testing documentation

### Casbin & User Management
- **[Casbin User Management Guide](./docs/casbin-user-management.md)** - Complete guide for managing users, groups, and roles
- **[Admin Testing Guide](./docs/admin-testing-guide.md)** - Quick reference for testing admin features
- [Implementation Guide](./docs/implementation-guide.md) - Details on Casbin structure and usage

### API & Function Documentation
- **OpenAPI Spec**: [docs/api-spec.yaml](./docs/api-spec.yaml) and served at `/api/docs`
- **JSDoc HTML**: Generated docs in `client/docs/jsdoc/`
- See [docs/jsdoc.md](./docs/jsdoc.md) for instructions to generate/view function docs.

## ♻️ Reusing for Future Projects

See [docs/reuse-guide.md](./docs/reuse-guide.md) for step-by-step instructions on how to adapt this authentication and authorization system for other applications, organizations, or deployments. The guide covers:
- Customizing branding, UI, and language
- Setting up Google OAuth for your own project
- Defining users, groups, and policies
- Extending the admin panel and API endpoints
- Security and compliance best practices
- Extending functionality for new requirements

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests** - Individual component testing
- **Integration Tests** - API endpoint testing
- **End-to-End Tests** - Complete user flow testing

Run tests with coverage reporting:
```bash
npm run test:coverage
```

## 🚢 Deployment

See [deployment documentation](./docs/deployment.md) for production deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Check the [documentation](./docs/) for detailed guides
- Review the [API reference](./docs/api-reference.md) for backend endpoints
- Examine the [test cases](./tests/) for usage examples
- Create an [issue](../../issues) for bug reports or feature requests

---

**Note**: This is a demonstration project for educational purposes. Ensure proper security measures are implemented before using in production environments.