# Client Services & Stores

## Overview

This guide documents the client-side services and Pinia stores used for state management, API communication, and application logic.

## Services

### API Service

**Location:** `client/src/services/api.js`

**Purpose:** Axios-based HTTP client with authentication and error handling

**Configuration:**
```javascript
import api from '@/services/api';

// Base configuration
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const timeout = 30000; // 30 seconds
```

**Methods:**

#### GET Request
```javascript
const response = await api.get('/api/users');
const users = response.data;
```

#### POST Request
```javascript
const response = await api.post('/api/users', {
  email: 'user@example.com',
  name: 'John Doe'
});
```

#### PUT Request
```javascript
const response = await api.put('/api/users/123', {
  name: 'Jane Doe'
});
```

#### DELETE Request
```javascript
const response = await api.delete('/api/users/123');
```

**Features:**
- Automatic authentication headers
- Request/response interceptors
- Error handling and retry logic
- CSRF token management
- Timeout configuration

**Error Handling:**
```javascript
try {
  const response = await api.get('/api/data');
  return response.data;
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('No response received');
  } else {
    // Error setting up request
    console.error('Error:', error.message);
  }
}
```

---

### Logger Service

**Location:** `client/src/services/logger.js`

**Purpose:** Client-side logging utility (currently disabled in production)

**Configuration:**
```javascript
// Enable/disable logging
const LOGGING_ENABLED = import.meta.env.DEV;
```

**Methods:**

```javascript
import logger from '@/services/logger';

// Different log levels
logger.debug('Debug message', { data: 'value' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
```

**Note:** Logging is disabled in production builds. Use console statements wrapped in `import.meta.env.DEV` checks for development debugging.

---

## Pinia Stores

### Auth Store

**Location:** `client/src/stores/auth.js`

**Purpose:** Authentication state and user management

**State:**
```javascript
{
  user: null,           // Current user object
  isAuthenticated: false,
  loading: false,
  error: null
}
```

**Getters:**
```javascript
// Check if user is admin
const isAdmin = computed(() => store.user?.groups?.includes('admin'));

// Get user groups
const userGroups = computed(() => store.user?.groups || []);

// Get user email
const userEmail = computed(() => store.user?.email);
```

**Actions:**

#### Login
```javascript
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
await authStore.login();
```

#### Logout
```javascript
await authStore.logout();
```

#### Check Authentication
```javascript
const isAuth = await authStore.checkAuth();
```

#### Fetch User Profile
```javascript
await authStore.fetchUserProfile();
```

**Usage Example:**
```vue
<script setup>
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';

const authStore = useAuthStore();

const user = computed(() => authStore.user);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);

const handleLogin = async () => {
  await authStore.login();
};

const handleLogout = async () => {
  await authStore.logout();
};
</script>

<template>
  <div v-if="isAuthenticated">
    <p>Welcome, {{ user.name }}</p>
    <button @click="handleLogout">Logout</button>
  </div>
  <div v-else>
    <button @click="handleLogin">Login with Google</button>
  </div>
</template>
```

---

### Theme Store

**Location:** `client/src/stores/theme.js`

**Purpose:** Theme management (light/dark/auto)

**State:**
```javascript
{
  theme: 'auto',  // 'light', 'dark', or 'auto'
  isDark: false   // Computed based on theme and system preference
}
```

**Actions:**

#### Set Theme
```javascript
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();

// Set to light theme
themeStore.setTheme('light');

// Set to dark theme
themeStore.setTheme('dark');

// Set to auto (follows system preference)
themeStore.setTheme('auto');
```

#### Initialize Theme
```javascript
// Called on app startup
themeStore.initTheme();
```

**Usage Example:**
```vue
<script setup>
import { useThemeStore } from '@/stores/theme';
import { computed } from 'vue';

const themeStore = useThemeStore();

const currentTheme = computed(() => themeStore.theme);
const isDark = computed(() => themeStore.isDark);
</script>

<template>
  <div :class="{ 'dark-mode': isDark }">
    <select v-model="currentTheme" @change="themeStore.setTheme($event.target.value)">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="auto">Auto</option>
    </select>
  </div>
</template>
```

**Persistence:**
- Theme preference is saved to localStorage
- Automatically restored on app load
- System preference detection for auto mode

---

### Dev Mode Store

**Location:** `client/src/stores/devMode.js`

**Purpose:** Development mode controls and group simulation

**State:**
```javascript
{
  isDevMode: false,
  isAdminView: false,
  simulatedGroups: []
}
```

**Actions:**

#### Enable Dev Mode
```javascript
import { useDevModeStore } from '@/stores/devMode';

const devModeStore = useDevModeStore();
devModeStore.enableDevMode();
```

#### Toggle Admin View
```javascript
devModeStore.toggleAdminView();
```

#### Manage Simulated Groups
```javascript
// Add group
devModeStore.addSimulatedGroup('Finance22');

// Remove group
devModeStore.removeSimulatedGroup('Finance22');

// Clear all groups
devModeStore.clearSimulatedGroups();
```

**Usage Example:**
```vue
<script setup>
import { useDevModeStore } from '@/stores/devMode';
import { computed } from 'vue';

const devModeStore = useDevModeStore();

const isDevMode = computed(() => devModeStore.isDevMode);
const isAdminView = computed(() => devModeStore.isAdminView);
const groups = computed(() => devModeStore.simulatedGroups);

const toggleAdmin = () => {
  devModeStore.toggleAdminView();
};

const addGroup = (group) => {
  devModeStore.addSimulatedGroup(group);
};
</script>

<template>
  <div v-if="isDevMode">
    <h3>Dev Mode Controls</h3>
    <button @click="toggleAdmin">
      {{ isAdminView ? 'Disable' : 'Enable' }} Admin View
    </button>
    
    <h4>Simulated Groups:</h4>
    <ul>
      <li v-for="group in groups" :key="group">
        {{ group }}
        <button @click="devModeStore.removeSimulatedGroup(group)">Remove</button>
      </li>
    </ul>
    
    <input 
      v-model="newGroup" 
      placeholder="Add group"
      @keyup.enter="addGroup(newGroup)"
    />
  </div>
</template>
```

**Important Notes:**
- Only available in development mode (`import.meta.env.DEV`)
- Does NOT grant real permissions
- Used for UI testing and development
- See [Dev Mode Guide](./DEV_MODE_GUIDE.md) for more details

---

## Router Configuration

**Location:** `client/src/router/index.js`

**Purpose:** Vue Router configuration with access control

### Route Meta Fields

```javascript
{
  path: '/page',
  name: 'PageName',
  component: () => import('@/views/PageView.vue'),
  meta: {
    requiresAuth: true,              // Requires authentication
    requiredGroups: ['Finance22'],   // Required groups
    title: 'Page Title',             // Page title
    icon: 'mdi-icon-name'            // Navigation icon
  }
}
```

### Navigation Guards

#### Global Before Guard
```javascript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Check authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login' });
  }
  
  // Check group access
  if (to.meta.requiredGroups) {
    const hasAccess = to.meta.requiredGroups.some(
      group => authStore.user?.groups?.includes(group)
    );
    
    if (!hasAccess) {
      return next({ name: 'AccessDenied' });
    }
  }
  
  next();
});
```

### Route Categories

The navigation system organizes routes into categories:

1. **User Management** - User profiles, permissions
2. **Organization** - Company structure, departments
3. **Finance** - Reports, invoices, payments
4. **Development** - Dev tools, testing
5. **Projects** - Project management, tasks
6. **Documentation** - API docs, guides
7. **Reports** - Analytics, surgical guides
8. **System** - Settings, logs
9. **Help** - Support, feedback

---

## I18n Configuration

**Location:** `client/src/i18n/index.js`

**Purpose:** Internationalization setup

### Supported Languages

- English (en) - Default
- Arabic (ar) - RTL
- Spanish (es)
- French (fr)

### Usage in Components

```vue
<script setup>
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const changeLanguage = (lang) => {
  locale.value = lang;
};
</script>

<template>
  <div>
    <h1>{{ t('welcome') }}</h1>
    <p>{{ t('dashboard.greeting', { name: 'John' }) }}</p>
    
    <button @click="changeLanguage('ar')">العربية</button>
    <button @click="changeLanguage('en')">English</button>
  </div>
</template>
```

### Translation Files

```javascript
// client/src/locales/en.json
{
  "welcome": "Welcome",
  "dashboard": {
    "greeting": "Hello, {name}"
  }
}

// client/src/locales/ar.json
{
  "welcome": "مرحبا",
  "dashboard": {
    "greeting": "مرحبا، {name}"
  }
}
```

---

## Best Practices

### 1. Store Usage

✅ **Do:**
```javascript
// Use computed for reactive values
const user = computed(() => authStore.user);
const isAuthenticated = computed(() => authStore.isAuthenticated);
```

❌ **Don't:**
```javascript
// Don't destructure reactive properties
const { user, isAuthenticated } = authStore; // Loses reactivity!
```

### 2. API Error Handling

✅ **Do:**
```javascript
try {
  const response = await api.get('/api/data');
  return response.data;
} catch (error) {
  console.error('Failed to fetch data:', error);
  // Show user-friendly error message
  showErrorToast('Failed to load data');
}
```

### 3. Loading States

✅ **Do:**
```javascript
const loading = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    const data = await api.get('/api/data');
    // Process data
  } finally {
    loading.value = false; // Always reset loading
  }
};
```

### 4. Store Actions

✅ **Do:**
```javascript
// Use async/await for async actions
const login = async () => {
  try {
    await authStore.login();
    router.push('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

---

## Testing

### Store Testing

```javascript
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with null user', () => {
    const store = useAuthStore();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('sets user on login', async () => {
    const store = useAuthStore();
    await store.login();
    expect(store.isAuthenticated).toBe(true);
  });
});
```

### API Service Testing

```javascript
import { vi } from 'vitest';
import api from '@/services/api';

describe('API Service', () => {
  it('makes GET request', async () => {
    const mockData = { users: [] };
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockData });
    
    const response = await api.get('/api/users');
    expect(response.data).toEqual(mockData);
  });
});
```

---

## Next Steps

- [Vue Components Reference](./vue-components.md)
- [Backend API Reference](./backend-api.md)
- [Architecture Overview](./architecture.md)
