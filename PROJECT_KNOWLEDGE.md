# InsightHub - Complete Project Knowledge Base

## 📚 Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Architecture Patterns](#architecture-patterns)
4. [Code Organization](#code-organization)
5. [Configuration Management](#configuration-management)
6. [Security Implementation](#security-implementation)
7. [Database Patterns](#database-patterns)
8. [API Patterns](#api-patterns)
9. [Frontend Patterns](#frontend-patterns)
10. [State Management](#state-management)
11. [Routing & Navigation](#routing--navigation)
12. [Internationalization](#internationalization)
13. [Logging & Monitoring](#logging--monitoring)
14. [Testing Patterns](#testing-patterns)
15. [Build & Deployment](#build--deployment)
16. [Development Workflow](#development-workflow)

---

## Technology Stack

### Backend
- **Runtime**: Node.js 18+ (ES Modules)
- **Framework**: Express 4.18.2
- **Authentication**: Passport.js + Google OAuth 2.0
- **Authorization**: Casbin 5.39.0 (RBAC)
- **Database**: MySQL2 3.15.3 (with connection pooling)
- **Logging**: Winston 3.11.0 + Pino 10.0.0
- **Security**: Helmet 7.0.0, express-rate-limit, express-slow-down, csurf
- **Validation**: Zod 4.1.12
- **Monitoring**: prom-client 15.1.3 (Prometheus metrics)
- **API Docs**: swagger-jsdoc 6.2.8, swagger-ui-express 5.0.1
- **Session**: express-session 1.17.3
- **CORS**: cors 2.8.5

### Frontend
- **Framework**: Vue 3.3.4 (Composition API)
- **UI Library**: Vuetify 3.3.14 (Material Design)
- **State Management**: Pinia 2.1.6
- **Routing**: Vue Router 4.2.4
- **HTTP Client**: Axios 1.5.0
- **i18n**: Vue i18n 9.3.0 (English/Arabic with RTL)
- **Build Tool**: Vite 5.4.20
- **Icons**: @mdi/font 7.2.96
- **Progress**: nprogress 0.2.0
- **Animations**: animejs 4.2.2
- **Loading**: vue-loading-overlay 6.0.0

### Development Tools
- **Testing**: Jest 29.7.0 (server), Vitest 0.34.3 (client), Playwright (e2e)
- **Linting**: ESLint 8.57.1
- **Formatting**: Prettier 3.6.2
- **Documentation**: JSDoc 4.0.2, VitePress 1.6.4
- **Process Manager**: concurrently 8.2.0
- **Dev Server**: nodemon 3.0.1

---

## Project Structure

```
InsightHub/
├── client/                 # Vue 3 frontend
│   ├── src/
│   │   ├── components/    # Reusable Vue components
│   │   ├── views/         # Route components (45+ views)
│   │   ├── stores/        # Pinia stores (auth, theme, devMode)
│   │   ├── services/      # API service, logger, loader
│   │   ├── router/        # Vue Router configuration
│   │   ├── config/        # Navigation config, colors
│   │   ├── i18n/          # Internationalization
│   │   ├── locales/       # Translation files (en.json, ar.json)
│   │   ├── plugins/       # Global plugins (loader)
│   │   ├── styles/        # Global styles, theme CSS
│   │   └── composables/   # Vue composables
│   ├── public/            # Static assets
│   ├── docs/jsdoc/        # Generated JSDoc documentation
│   └── vite.config.js     # Vite configuration
│
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── controllers/   # Business logic controllers
│   │   ├── services/      # Service layer (Casbin, DB, logger)
│   │   ├── models/        # Data models (surgical guide orders)
│   │   ├── middleware/    # Express middleware (auth, security, error)
│   │   ├── config/        # Configuration files
│   │   │   ├── casbin/    # RBAC model, policies, users
│   │   │   └── messages/  # System messages
│   │   └── index.js       # Server entry point
│   └── logs/              # Winston log files
│
├── tests/                 # Test suites
│   ├── unit/              # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests (Playwright)
│
├── docs/                  # Documentation
│   ├── vitepress/        # VitePress documentation
│   └── *.md              # Markdown documentation
│
├── database/             # Database schemas
├── scripts/               # Build/deployment scripts
└── package.json          # Root workspace config
```

---

## Architecture Patterns

### Backend Architecture (Clean Architecture)
```
Routes → Controllers → Services → Models → Database
         ↓
    Middleware (Auth, Security, Logging)
```

**Pattern**: Layered architecture with separation of concerns
- **Routes**: Define endpoints, apply middleware
- **Controllers**: Handle HTTP requests/responses, validation
- **Services**: Business logic, orchestration
- **Models**: Data access layer, database queries
- **Middleware**: Cross-cutting concerns (auth, security, logging)

### Frontend Architecture (Component-Based)
```
App.vue → Router → Views → Components
         ↓
    Stores (Pinia) → Services (API)
```

**Pattern**: Component-based architecture with centralized state
- **Views**: Route-level components
- **Components**: Reusable UI components
- **Stores**: Global state management (Pinia)
- **Services**: API communication layer
- **Composables**: Reusable composition functions

---

## Code Organization

### Backend Patterns

#### Service Pattern
```javascript
// services/casbin.js
class CasbinService {
  async initialize() { /* ... */ }
  async authorize(userEmail, resource, action) { /* ... */ }
  async getUserRights(userEmail) { /* ... */ }
}
export default new CasbinService(); // Singleton
```

#### Controller Pattern
```javascript
// controllers/surgicalGuideOrders.controller.js
class SurgicalGuideOrdersController {
  async getReport(req, res) {
    // 1. Extract params
    // 2. Check permissions
    // 3. Call service
    // 4. Return response
  }
}
```

#### Model Pattern
```javascript
// models/surgicalGuideOrders.model.js
class SurgicalGuideOrdersModel {
  async getReportData(params) {
    // Database queries with parameterized statements
    return databaseService.query(sql, params);
  }
}
```

### Frontend Patterns

#### Store Pattern (Pinia Composition API)
```javascript
// stores/auth.js
export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isAuthenticated = computed(() => !!user.value);
  
  const login = async () => { /* ... */ };
  const logout = async () => { /* ... */ };
  
  return { user, isAuthenticated, login, logout };
});
```

#### Service Pattern
```javascript
// services/api.js
export const apiService = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  // ... with interceptors for loader, error handling
};
```

#### Component Pattern
```vue
<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';

const authStore = useAuthStore();
const loading = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await apiService.get('/api/endpoint');
    // Handle data
  } finally {
    loading.value = false;
  }
};
</script>
```

---

## Configuration Management

### Environment Variables

#### Server (.env)
```bash
NODE_ENV=development|production
PORT=3001
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...
SESSION_SECRET=...
CLIENT_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=...
DB_NAME=powerbi_cp_test
DB_CONNECTION_LIMIT=10
LOG_LEVEL=info
```

#### Client (.env)
```bash
VITE_API_URL=http://localhost:3001
```

### Configuration Files

#### Casbin Configuration
- **Model**: `server/src/config/casbin/model.conf` - RBAC model definition
- **Policies**: `server/src/config/casbin/policy.csv` - Permission rules
- **Users**: `server/src/config/casbin/users.json` - User data with groups/roles

#### Navigation Configuration
- **File**: `client/src/config/navigationConfig.js`
- **Structure**: Hierarchical menu with permissions
- **Pattern**: Oracle Fusion-inspired navigation

#### Theme Configuration
- **File**: `client/src/stores/theme.js`
- **Colors**: `client/src/config/colors.json`
- **Support**: Light/Dark themes with CSS variables

---

## Security Implementation

### Security Middleware Stack
```javascript
// Order matters!
1. securityHeaders (Helmet)
2. CORS
3. Rate limiting (generalRateLimit, authRateLimit)
4. Speed limiter
5. Request validation
6. Input sanitization
7. Session security
8. Request logging
9. API security headers
10. Routes
11. Error handlers
```

### Key Security Features

#### 1. Helmet.js Configuration
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer Policy
- Permissions Policy

#### 2. Rate Limiting
- **General**: 100 requests per 15 minutes per IP
- **Auth**: 10 requests per 15 minutes per IP
- **Speed Limiter**: Progressive delay after 50 requests

#### 3. CSRF Protection
- Token-based CSRF protection
- HttpOnly cookies
- SameSite strict in production

#### 4. Input Sanitization
- HTML entity encoding
- XSS prevention
- SQL injection prevention (parameterized queries)

#### 5. Session Security
- HttpOnly cookies
- Secure flag in production
- SameSite strict
- 24-hour expiration
- Rolling sessions

#### 6. CORS Configuration
- Whitelist-based origin validation
- Credentials enabled
- Specific methods and headers

---

## Database Patterns

### Connection Pooling
```javascript
// services/database.js
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
  enableKeepAlive: true,
  multipleStatements: false, // Security
  dateStrings: true
};

const pool = mysql.createPool(dbConfig);
```

### Query Pattern
```javascript
// Always use parameterized queries
async query(sql, params = []) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}
```

### Transaction Pattern
```javascript
async transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

---

## API Patterns

### Request/Response Format

#### Success Response
```json
{
  "success": true,
  "data": { /* ... */ },
  "pagination": { /* optional */ },
  "requestId": "req_abc123"
}
```

#### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "http": 400,
    "message": "Human-readable error message"
  },
  "requestId": "req_abc123"
}
```

### API Service Pattern
```javascript
// Frontend: services/api.js
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true, // For session cookies
  headers: { "Content-Type": "application/json" }
});

// Interceptors for:
// - Global loader management
// - Error handling
// - Request/response logging
```

### Route Pattern
```javascript
// Backend: routes/api.routes.js
router.get('/endpoint', 
  authMiddleware,           // Authentication
  authorize('resource', 'action'), // Authorization
  controller.method         // Controller handler
);
```

---

## Frontend Patterns

### Component Structure
```vue
<template>
  <!-- Vuetify components -->
  <v-container>
    <v-card>
      <!-- Content -->
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const authStore = useAuthStore();
const loading = ref(false);
const data = ref(null);

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* Component-specific styles */
</style>
```

### Loading States
```javascript
// Global loader (automatic via axios interceptors)
showLoader(); // Show
hideLoader(); // Hide

// Suppress loader for specific requests
apiService.get('/api/endpoint', {
  suppressLoader: true
});
```

### Error Handling
```javascript
try {
  const { data } = await apiService.get('/api/endpoint');
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
  } else if (error.response?.status === 403) {
    // Forbidden - show access denied
  } else {
    // Generic error handling
  }
}
```

---

## State Management

### Pinia Store Pattern
```javascript
// stores/example.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useExampleStore = defineStore('example', () => {
  // State
  const items = ref([]);
  const loading = ref(false);
  
  // Getters
  const itemCount = computed(() => items.value.length);
  
  // Actions
  const fetchItems = async () => {
    loading.value = true;
    try {
      const { data } = await apiService.get('/api/items');
      items.value = data.items;
    } finally {
      loading.value = false;
    }
  };
  
  return { items, loading, itemCount, fetchItems };
});
```

### Store Usage
```vue
<script setup>
import { useExampleStore } from '@/stores/example';

const store = useExampleStore();
await store.fetchItems();
</script>
```

---

## Routing & Navigation

### Route Definition
```javascript
// router/index.js
{
  path: "/finance/surgical-guide-report",
  name: "SurgicalGuideReport",
  component: () => import("@/views/Reports/SurgicalGuideReportView.vue"),
  meta: {
    requiresAuth: true,
    requiredGroups: ["admin", "Finance22"],
    breadcrumb: (t) => t("navigation.surgicalGuideReport")
  }
}
```

### Navigation Guard
```javascript
router.beforeEach(async (to, from, next) => {
  // 1. Check authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "Home" });
    return;
  }
  
  // 2. Check group permissions
  if (to.meta.requiredGroups) {
    const hasAccess = hasNavigationAccess(
      to.meta.requiredGroups,
      userGroups
    );
    if (!hasAccess) {
      next({ name: "Dashboard" });
      return;
    }
  }
  
  next();
});
```

### Navigation Config
```javascript
// config/navigationConfig.js
{
  id: "finance",
  title: "Financial Management",
  icon: "mdi-currency-usd",
  permissions: ["admin", "finance"],
  children: [ /* ... */ ]
}
```

---

## Internationalization

### Setup
```javascript
// i18n/index.js
import { createI18n } from 'vue-i18n';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

export const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, ar },
  legacy: false,
  globalInjection: true
});
```

### Usage
```vue
<template>
  <h1>{{ $t('navigation.home') }}</h1>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const title = t('navigation.home');
</script>
```

### RTL Support
```javascript
// Automatic RTL detection
export const isRTL = (locale) => {
  return rtlLanguages.includes(locale);
};

// Updates document direction
document.documentElement.dir = isRTL(locale) ? 'rtl' : 'ltr';
```

---

## Logging & Monitoring

### Backend Logging (Winston)
```javascript
// services/logger.js
import { createContextLogger } from './logger.js';

const logger = createContextLogger(__filename, 'ServiceName');

logger.info('Operation started', { userId, action });
logger.warn('Warning message', { details });
logger.error('Error occurred', { error: error.message, stack });
logger.debug('Debug info', { data }); // Development only
```

### Log Format
```
[SERVER]|2025-01-15 10:30:45|INFO|[service.js:123]|Operation completed|userId=123
```

### Prometheus Metrics
```javascript
// server/src/index.js
import promClient from 'prom-client';

const dbQueryDuration = new promClient.Histogram({
  name: 'sg_report_db_query_duration_seconds',
  help: 'DB query execution time',
  labelNames: ['user_email', 'user_username']
});

// Usage
dbQueryDuration.labels(userEmail, username).observe(seconds);
```

### Metrics Endpoint
- **URL**: `/metrics`
- **Format**: Prometheus exposition format
- **Metrics**: DB query duration, API fulfillment duration, default Node.js metrics

---

## Testing Patterns

### Unit Tests (Jest/Vitest)
```javascript
// __tests__/example.test.js
import { describe, it, expect } from 'vitest';
import { functionToTest } from './example';

describe('Example', () => {
  it('should do something', () => {
    expect(functionToTest()).toBe(expected);
  });
});
```

### Integration Tests
```javascript
// tests/integration/api.test.js
import request from 'supertest';
import app from '../../server/src/index.js';

describe('API Integration', () => {
  it('should return 200', async () => {
    const res = await request(app)
      .get('/api/endpoint')
      .expect(200);
  });
});
```

### E2E Tests (Playwright)
```javascript
// tests/e2e/example.spec.js
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Login');
  // ... test steps
});
```

---

## Build & Deployment

### Build Commands
```bash
# Development
npm run dev              # Start both client and server
npm run dev:client       # Client only (port 3000)
npm run dev:server       # Server only (port 3001)

# Production
npm run build            # Build client for production
npm run build:client     # Client build only

# Testing
npm run test             # Run all tests
npm run test:server      # Server tests
npm run test:client      # Client tests
npm run test:e2e         # E2E tests
```

### Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true }
    }
  }
});
```

### Production Deployment
1. Build client: `npm run build:client`
2. Serve static files from `client/dist`
3. Run server: `node server/src/index.js`
4. Configure environment variables
5. Set up reverse proxy (nginx)
6. Configure SSL/TLS
7. Set up monitoring (Prometheus/Grafana)

---

## Development Workflow

### Code Style
- **ESLint**: Standard config with Vue plugin
- **Prettier**: Code formatting
- **JSDoc**: Function documentation
- **Naming**: camelCase for variables, PascalCase for components

### Git Workflow
1. Create feature branch
2. Make changes
3. Run tests: `npm run test`
4. Lint: `npm run lint`
5. Commit with descriptive message
6. Push and create PR

### Debugging
- **Backend**: Winston logs in `server/logs/`
- **Frontend**: Browser DevTools
- **API**: Swagger UI at `/docs` (development)
- **Metrics**: Prometheus at `/metrics`

---

## Key Conventions

### File Naming
- **Components**: PascalCase (`UserProfile.vue`)
- **Stores**: camelCase (`auth.js`, `theme.js`)
- **Services**: camelCase (`api.js`, `logger.js`)
- **Views**: PascalCase (`DashboardView.vue`)
- **Routes**: kebab-case (`/user-management`)

### Import Order
1. Vue imports
2. Third-party libraries
3. Internal services/stores
4. Components
5. Types/interfaces

### Error Handling
- Always use try/catch for async operations
- Log errors with context
- Return structured error responses
- Handle 401/403 appropriately

### Performance
- Lazy load routes
- Use computed properties for derived state
- Debounce expensive operations
- Optimize database queries
- Use connection pooling

---

## Common Tasks

### Adding a New Route
1. Add route to `client/src/router/index.js`
2. Create view component in `client/src/views/`
3. Add navigation item to `client/src/config/navigationConfig.js`
4. Add translation keys to `client/src/locales/*.json`
5. Add backend route in `server/src/routes/`
6. Create controller method
7. Add service method if needed

### Adding a New API Endpoint
1. Add route in `server/src/routes/api.routes.js`
2. Create controller method in `server/src/controllers/`
3. Add service method if needed
4. Add authorization check
5. Add Swagger documentation
6. Test endpoint

### Adding a New Store
1. Create file in `client/src/stores/`
2. Use `defineStore` with Composition API
3. Export store
4. Use in components: `const store = useStoreName()`

### Adding Database Table
1. Create migration script
2. Add model in `server/src/models/`
3. Add service methods
4. Add controller endpoints
5. Test queries

---

## Best Practices

### Security
- ✅ Always use parameterized queries
- ✅ Validate and sanitize input
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Use secure session cookies
- ✅ Check permissions on every request
- ✅ Log security events

### Performance
- ✅ Use connection pooling
- ✅ Implement caching where appropriate
- ✅ Lazy load routes and components
- ✅ Optimize database queries
- ✅ Use computed properties
- ✅ Debounce user input

### Code Quality
- ✅ Write JSDoc comments
- ✅ Follow naming conventions
- ✅ Keep functions small and focused
- ✅ Use TypeScript-like JSDoc types
- ✅ Write tests for critical paths
- ✅ Handle errors gracefully

### Maintainability
- ✅ Follow project structure
- ✅ Use consistent patterns
- ✅ Document complex logic
- ✅ Keep dependencies updated
- ✅ Refactor when needed
- ✅ Review code before merging

---

## Quick Reference

### Start Development
```bash
npm run dev
```

### Run Tests
```bash
npm run test
```

### Generate Docs
```bash
npm run docs:generate
```

### Lint Code
```bash
npm run lint
```

### Build Production
```bash
npm run build
```

---

**Last Updated**: Based on current codebase analysis
**Version**: 1.0.0

