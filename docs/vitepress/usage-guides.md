# Usage Guides

## Overview

This guide provides step-by-step instructions for common tasks and workflows in the application.

---

## Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [Navigation System](#navigation-system)
3. [Development Mode](#development-mode)
4. [Surgical Guide Reports](#surgical-guide-reports)
5. [User Management](#user-management)
6. [Access Control](#access-control)
7. [Theme Customization](#theme-customization)
8. [Internationalization](#internationalization)

---

## Authentication Flow

### 1. OAuth 2.0 Login

The application uses Google OAuth 2.0 for authentication.

**User Flow:**

1. User visits the application
2. Clicks "Login with Google"
3. Redirected to Google OAuth consent screen
4. Grants permissions
5. Redirected back to application
6. Session established with cookies

**Implementation:**

```vue
<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    await authStore.login();
    router.push('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
</script>

<template>
  <button @click="handleLogin">
    Login with Google
  </button>
</template>
```

**Backend Endpoint:**

```
GET /auth/google
```

**Session Management:**

- Sessions stored in Redis
- 24-hour expiration
- Automatic refresh on activity
- Secure HTTP-only cookies

### 2. Check Authentication Status

```javascript
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Check if user is authenticated
if (authStore.isAuthenticated) {
  console.log('User is logged in');
} else {
  console.log('User is not logged in');
}

// Get user details
const user = authStore.user;
console.log('Email:', user.email);
console.log('Name:', user.name);
console.log('Groups:', user.groups);
```

### 3. Logout

```javascript
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
```

---

## Navigation System

### 1. Understanding the Navigation

The application uses a hierarchical navigation system inspired by Oracle Fusion.

**Navigation Structure:**

```
├── Dashboard
├── User Management
│   ├── My Profile
│   ├── User Permissions
│   └── Role Management
├── Organization
│   ├── Departments
│   └── Company Info
├── Finance
│   ├── Reports
│   └── Invoices
├── Reports
│   └── Surgical Guide Report
└── System
    ├── Settings
    └── Logs
```

### 2. Adding New Routes

**Step 1:** Create the view component

```vue
<!-- client/src/views/MyNewView.vue -->
<script setup>
import { ref } from 'vue';

const data = ref([]);
</script>

<template>
  <v-container>
    <h1>My New Page</h1>
    <!-- Your content here -->
  </v-container>
</template>
```

**Step 2:** Register the route

```javascript
// client/src/router/index.js
{
  path: '/my-new-page',
  name: 'MyNewPage',
  component: () => import('@/views/MyNewView.vue'),
  meta: {
    requiresAuth: true,
    requiredGroups: ['Finance22'],  // Optional
    title: 'My New Page',
    icon: 'mdi-chart-line',
    category: 'Finance'
  }
}
```

**Step 3:** The route automatically appears in navigation based on user permissions

### 3. Permission-Based Navigation

Routes are automatically filtered based on user groups:

```javascript
// User with ['Finance22'] group sees:
- Dashboard ✓
- Finance → Reports ✓
- Reports → Surgical Guide Report ✓
- User Management → My Profile ✓

// User with ['admin'] group sees:
- Everything (admin has access to all routes)
```

### 4. Programmatic Navigation

```vue
<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// Navigate to a route
const goToReports = () => {
  router.push({ name: 'SurgicalGuideReport' });
};

// Navigate with parameters
const goToUserProfile = (userId) => {
  router.push({ 
    name: 'UserProfile', 
    params: { id: userId } 
  });
};

// Navigate with query parameters
const goToReportsWithFilters = () => {
  router.push({
    name: 'SurgicalGuideReport',
    query: {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }
  });
};

// Go back
const goBack = () => {
  router.back();
};
</script>
```

---

## Development Mode

### 1. Enabling Dev Mode

Development mode provides tools for testing and debugging.

**Enable Dev Mode:**

1. Ensure you're running in development: `npm run dev`
2. Dev mode is automatically enabled when `import.meta.env.DEV` is true
3. Dev toolbar appears at the top of the page

**Features:**
- Admin view toggle
- Group simulation
- Permission testing
- Debug information

### 2. Simulating User Groups

Test different permission levels without changing your actual user account:

```vue
<script setup>
import { useDevModeStore } from '@/stores/devMode';

const devMode = useDevModeStore();

// Add simulated group
devMode.addSimulatedGroup('Finance22');

// Remove simulated group
devMode.removeSimulatedGroup('Finance22');

// Clear all simulated groups
devMode.clearSimulatedGroups();

// Check current groups
const groups = devMode.simulatedGroups;
console.log('Simulated groups:', groups);
</script>
```

### 3. Admin View Toggle

Test admin-only features:

```javascript
import { useDevModeStore } from '@/stores/devMode';

const devMode = useDevModeStore();

// Enable admin view
devMode.toggleAdminView();

// Check if admin view is active
const isAdmin = devMode.isAdminView;
console.log('Admin view:', isAdmin);
```

**Important:** Dev mode does NOT grant real permissions. It only affects the UI for testing purposes.

### 4. Dev Mode Best Practices

✅ **Do:**
- Use dev mode to test UI with different permissions
- Test navigation visibility
- Verify access control messages

❌ **Don't:**
- Rely on dev mode for actual authorization
- Use dev mode in production
- Commit dev mode changes to production code

See [Dev Mode Guide](./DEV_MODE_GUIDE.md) for detailed documentation.

---

## Surgical Guide Reports

### 1. Accessing Reports

**Requirements:**
- Must be authenticated
- Must be in `Finance22` group or `admin` group

**Access:**
1. Navigate to "Reports" → "Surgical Guide Report"
2. Report loads with default date range (last 30 days)

### 2. Filtering Reports

**Date Range:**
```vue
<v-date-picker
  v-model="startDate"
  label="Start Date"
/>
<v-date-picker
  v-model="endDate"
  label="End Date"
/>
```

**Order Type:**
```vue
<v-select
  v-model="orderType"
  :items="['All', 'Standard', 'Express', 'Rush']"
  label="Order Type"
/>
```

**Search:**
```vue
<v-text-field
  v-model="search"
  label="Search"
  placeholder="Search cases..."
/>
```

### 3. Pagination

Reports use server-side pagination for performance:

```javascript
// Default: 10 items per page
const itemsPerPage = ref(10);
const page = ref(1);

// Change items per page
itemsPerPage.value = 25;

// Go to specific page
page.value = 3;
```

### 4. Exporting Data

**CSV Export:**

```javascript
const exportToCSV = () => {
  // Exports current filtered data
  api.get('/api/surgical-guide-reports/export', {
    params: {
      startDate: startDate.value,
      endDate: endDate.value,
      orderType: orderType.value,
      format: 'csv'
    },
    responseType: 'blob'
  }).then(response => {
    // Download file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
  });
};
```

### 5. Expandable Row Details

Click on any row to see detailed information:

```vue
<template>
  <v-data-table
    :items="items"
    :expanded="expanded"
    show-expand
  >
    <template #expanded-row="{ item }">
      <tr>
        <td :colspan="headers.length">
          <v-card class="ma-2">
            <v-card-text>
              <h3>Case Details</h3>
              <p><strong>Lab:</strong> {{ item.lab_name }}</p>
              <p><strong>Doctor:</strong> {{ item.doctor_name }}</p>
              <p><strong>Cost:</strong> {{ item.cost }}</p>
              <p><strong>Revenue:</strong> {{ item.revenue }}</p>
            </v-card-text>
          </v-card>
        </td>
      </tr>
    </template>
  </v-data-table>
</template>
```

---

## User Management

### 1. Viewing User Details

**Dashboard Access:**
```
GET /api/user-details
```

**Response:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://...",
  "groups": ["Finance22"],
  "permissions": {
    "read_reports": true,
    "export_data": true
  }
}
```

**Usage:**
```vue
<script setup>
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';

const authStore = useAuthStore();
const user = computed(() => authStore.user);
</script>

<template>
  <v-card>
    <v-card-title>{{ user.name }}</v-card-title>
    <v-card-text>
      <p>Email: {{ user.email }}</p>
      <v-chip
        v-for="group in user.groups"
        :key="group"
        class="ma-1"
      >
        {{ group }}
      </v-chip>
    </v-card-text>
  </v-card>
</template>
```

### 2. Managing User Permissions (Admin Only)

**Get All Users:**
```javascript
const users = await api.get('/api/users');
```

**Update User Groups:**
```javascript
await api.put(`/api/users/${userId}`, {
  groups: ['Finance22', 'Development']
});
```

**Add Permission:**
```javascript
await api.post('/api/permissions', {
  userId: 'user123',
  permission: 'read_reports'
});
```

**Remove Permission:**
```javascript
await api.delete('/api/permissions', {
  data: {
    userId: 'user123',
    permission: 'read_reports'
  }
});
```

---

## Access Control

### 1. Route-Based Access Control

**Define Required Groups:**
```javascript
{
  path: '/finance/reports',
  name: 'FinanceReports',
  component: () => import('@/views/Finance/Reports.vue'),
  meta: {
    requiresAuth: true,
    requiredGroups: ['Finance22', 'admin']
  }
}
```

**Navigation Guard:**
```javascript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login' });
  }
  
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

### 2. Component-Level Access Control

**Using v-if:**
```vue
<template>
  <div>
    <!-- Show for Finance22 users -->
    <v-btn v-if="isFinanceUser">
      View Financial Report
    </v-btn>
    
    <!-- Show for admins only -->
    <AdminPanel v-if="isAdmin" />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';

const authStore = useAuthStore();

const isFinanceUser = computed(() => 
  authStore.user?.groups?.includes('Finance22')
);

const isAdmin = computed(() => 
  authStore.user?.groups?.includes('admin')
);
</script>
```

### 3. API-Level Access Control

Backend enforces permissions using Casbin:

```javascript
// Server-side middleware
const checkPermission = async (req, res, next) => {
  const { userId } = req.session;
  const resource = req.path;
  const action = req.method;
  
  const allowed = await enforcer.enforce(userId, resource, action);
  
  if (!allowed) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};
```

---

## Theme Customization

### 1. Switching Themes

**Using Theme Toggle Component:**
```vue
<template>
  <ThemeToggle />
</template>
```

**Programmatically:**
```javascript
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();

// Set light theme
themeStore.setTheme('light');

// Set dark theme
themeStore.setTheme('dark');

// Set auto (follows system preference)
themeStore.setTheme('auto');
```

### 2. Custom Theme Colors

**Configure Vuetify Theme:**
```javascript
// client/src/main.js
import { createVuetify } from 'vuetify';

const vuetify = createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#616161',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      }
    }
  }
});
```

### 3. Custom CSS

**Global Styles:**
```css
/* client/src/styles/main.css */
:root {
  --custom-color: #1976D2;
  --spacing-unit: 8px;
}

.custom-card {
  border-radius: calc(var(--spacing-unit) * 2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

**Component Styles:**
```vue
<style scoped>
.my-component {
  padding: 16px;
  background-color: var(--v-background-base);
}
</style>
```

---

## Internationalization

### 1. Switching Languages

**Using Language Switcher:**
```vue
<template>
  <LanguageSwitcher />
</template>
```

**Programmatically:**
```javascript
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

// Change to Arabic
locale.value = 'ar';

// Change to English
locale.value = 'en';
```

### 2. Adding Translations

**Create Translation File:**
```json
// client/src/locales/en.json
{
  "common": {
    "welcome": "Welcome",
    "logout": "Logout"
  },
  "dashboard": {
    "title": "Dashboard",
    "greeting": "Hello, {name}"
  }
}
```

**Use in Components:**
```vue
<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div>
    <h1>{{ t('dashboard.title') }}</h1>
    <p>{{ t('dashboard.greeting', { name: 'John' }) }}</p>
  </div>
</template>
```

### 3. RTL Support

**Auto-detect RTL:**
```javascript
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';

const { locale } = useI18n();

watch(locale, (newLocale) => {
  const isRTL = newLocale === 'ar';
  document.dir = isRTL ? 'rtl' : 'ltr';
});
```

---

## Next Steps

- [Architecture Overview](./architecture.md)
- [API Reference](./backend-api.md)
- [Component Reference](./vue-components.md)
- [Security Guide](./security.md)
