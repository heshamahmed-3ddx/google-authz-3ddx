# Usage Guides

## Overview

This guide provides step-by-step instructions for common tasks and workflows in the application.

---

## Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [Navigation System](#navigation-system)
3. [Compact UI System](#compact-ui-system)
4. [Settings & Permissions](#settings--permissions)
5. [Development Mode](#development-mode)
6. [Surgical Guide Reports](#surgical-guide-reports)
7. [User Management](#user-management)
8. [Access Control](#access-control)
9. [Theme Customization](#theme-customization)
10. [Internationalization](#internationalization)

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

The application uses a hierarchical navigation system inspired by Oracle Fusion. The system supports two navigation components:

- **NavigationSidebar** - Traditional sidebar navigation (desktop)
- **OverlaySidebar** - Full-screen overlay navigation (mobile/tablet)

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

### 1.1 OverlaySidebar Navigation

The `OverlaySidebar` component provides a full-screen navigation experience:

**Features:**
- Full-screen overlay with backdrop
- User profile display (avatar, name, job title)
- Search functionality to filter navigation items
- Grid-based layout for navigation items
- Section headers for navigation groups
- RTL support
- Mobile-optimized with safe area support

**Opening the Overlay:**
```vue
<template>
  <v-btn @click="showOverlay = true">
    Open Navigation
  </v-btn>
  <OverlaySidebar v-model="showOverlay" />
</template>

<script setup>
import { ref } from 'vue';
import OverlaySidebar from '@/components/OverlaySidebar.vue';

const showOverlay = ref(false);
</script>
```

**Search Functionality:**
- Search by route name (e.g., "dashboard", "reports")
- Search by localized navigation title
- Real-time filtering as you type
- Shows "No results found" message when empty
- Smart section header display (only shows if section or children match)

**Example:**
```javascript
// User types "report" in search
// Shows:
// - Reports → Surgical Guide Report
// - Financial Reports
// - All items with "report" in route or title
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

Routes are automatically filtered based on user groups. Both `NavigationSidebar` and `OverlaySidebar` use the same permission system:

```javascript
// User with ['Finance22'] group sees:
- Dashboard ✓
- Finance → Reports ✓
- Reports → Surgical Guide Report ✓
- User Management → My Profile ✓

// User with ['admin'] group sees:
- Everything (admin has access to all routes)
```

**Navigation Filtering:**
- Navigation items are filtered based on user groups
- Section headers only appear if they have visible children
- Search respects permission filtering
- Empty sections are automatically hidden

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

## Compact UI System

### 1. Using Compact UI Classes

The application uses a global compact UI design system. All components automatically use compact styling.

**Page Container:**
```vue
<template>
  <v-container fluid class="page-container">
    <!-- Your content -->
  </v-container>
</template>
```

**Compact Header:**
```vue
<template>
  <div class="compact-header">
    <h1 class="compact-header-title">
      <v-icon size="small" style="margin-inline-end: 6px" color="primary">
        mdi-icon-name
      </v-icon>
      Page Title
    </h1>
    <p class="compact-header-subtitle">Page description</p>
  </div>
</template>
```

**Compact Card:**
```vue
<template>
  <v-card elevation="1">
    <v-card-title class="compact-title">
      <v-icon size="small" style="margin-inline-end: 6px" color="primary">
        mdi-icon-name
      </v-icon>
      <span class="text-subtitle-2 font-weight-medium">Card Title</span>
    </v-card-title>
    <v-card-text class="compact-card-text">
      <!-- Content -->
    </v-card-text>
  </v-card>
</template>
```

### 2. Tables

All tables automatically use ultra-compact styling with orange headers:

```vue
<template>
  <v-card elevation="1" class="table-card">
    <v-card-title class="table-card-title compact-title">
      Table Title
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="items"
      density="compact"
    />
  </v-card>
</template>
```

**Table Features:**
- Orange header background (#FF8C00)
- White header text
- Compact cell padding
- Sticky headers
- Automatic compact footer

### 3. Buttons and Inputs

Buttons and inputs automatically use compact styling:

```vue
<template>
  <!-- Compact button -->
  <v-btn size="small" variant="outlined">Button</v-btn>
  
  <!-- Compact input (automatic) -->
  <v-text-field
    v-model="value"
    label="Label"
    density="compact"
    variant="outlined"
    hide-details
  />
</template>
```

See [Compact UI Style Guide](./compact-ui-style-guide.md) for complete documentation.

---

## Settings & Permissions

### 1. Accessing Settings

Navigate to `/system/settings` or `/system/settings?tab=security`

**Access:**
- **View:** All authenticated users
- **Edit:** Admin users only

### 2. Managing Roles

**View Roles:**
- All roles are displayed in the Roles & Permissions section
- Click on a role to view details

**Add Role (Admin Only):**
1. Click "Add Role" button
2. Enter role name and description
3. Click "Create"

**Edit Role (Admin Only):**
1. Click edit icon next to role
2. Modify details
3. Click "Update"

**Delete Role (Admin Only):**
1. Click delete icon next to role
2. Confirm deletion

### 3. Managing Permissions

**Using Permissions Matrix:**
1. Select a role from dropdown
2. View permissions grid (Resources × Actions)
3. Click checkboxes to toggle permissions
4. Changes save automatically

**Permission Format:**
- **Subject:** Role or group name
- **Object:** Resource name (e.g., `users`, `projects`)
- **Action:** Action type (e.g., `read`, `write`, `delete`)

### 4. Managing Policies

**View Policies:**
- All policies displayed in table format
- Shows subject, resource, and action

**Add Policy (Admin Only):**
1. Click "Add Policy" button
2. Select subject (role/group)
3. Enter resource name
4. Select action
5. Click "Create"

**Edit Policy (Admin Only):**
1. Click edit icon in policies table
2. Modify policy details
3. Click "Update"

**Delete Policy (Admin Only):**
1. Click delete icon
2. Confirm deletion

### 5. Security Options (Admin Only)

**Cache Management:**
- Click "Invalidate Cache" to clear Casbin cache
- Forces reload from database

**Policy Reload:**
- Click "Reload Policies" to reload from database
- Useful after manual database changes

**Performance Metrics:**
- View cache hit rate
- View average query time
- View operation counts

See [Settings Page Guide](./settings-page-guide.md) for complete documentation.

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
- Dates must be in `YYYY-MM-DD` format
- Date picker automatically formats dates correctly
- Both start and end dates are required

```vue
<v-date-picker
  v-model="startDate"
  label="Start Date"
  format="YYYY-MM-DD"
/>
<v-date-picker
  v-model="endDate"
  label="End Date"
  format="YYYY-MM-DD"
/>
```

**Note:** The application automatically formats dates to `YYYY-MM-DD` format before sending API requests to ensure compatibility.

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

**Default Settings:**
- **Items per page**: 10 (default)
- **Page display**: Shows "Page X of Y" format
- **Server-side**: All pagination is handled server-side for optimal performance

**Features:**
- Change items per page using the dropdown (10, 25, 50, 100)
- Navigate between pages using pagination controls
- Current page and total pages are displayed in the footer
- Pagination resets to page 1 when filters change

```javascript
// Default: 10 items per page
const itemsPerPage = ref(10);
const currentPage = ref(1);

// Change items per page (resets to page 1)
itemsPerPage.value = 25;

// Navigate to specific page
currentPage.value = 3;
```

**Pagination Display:**
- Footer shows: "Page X of Y" where X is current page and Y is total pages
- Total items count is also displayed
- Pagination controls include first, previous, next, and last page buttons

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
  },
  "nav": {
    "navigation": "Navigation",
    "searchPlaceholder": "Search navigation...",
    "noResults": "No results found",
    "noResultsSubtitle": "Try adjusting your search terms",
    "logout": "Logout",
    "settings": "Settings"
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "users": "Users",
    "reports": "Reports"
  }
}
```

**New Navigation Translation Keys:**
- `nav.navigation` - "Navigation" title
- `nav.searchPlaceholder` - Search input placeholder
- `nav.noResults` - "No results found" message
- `nav.noResultsSubtitle` - "Try adjusting your search terms"
- `nav.logout` - Logout button text
- `nav.settings` - Settings button text
- `navigation.*` - All navigation item titles (e.g., `navigation.home`, `navigation.dashboard`)

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
import { isRTL as checkRTL } from '@/i18n';

const { locale } = useI18n();

// Check if current locale is RTL
const isRTL = computed(() => checkRTL(locale.value));

watch(locale, (newLocale) => {
  const isRTL = checkRTL(newLocale);
  document.dir = isRTL ? 'rtl' : 'ltr';
});
```

**RTL Support in Components:**

**OverlaySidebar RTL:**
- Automatic direction switching
- Close button positioned on left in RTL mode
- Text alignment adjusts automatically
- Navigation grid maintains proper layout
- Profile section and footer adapt to RTL

```vue
<template>
  <OverlaySidebar 
    v-model="showOverlay"
    :class="{ 'rtl-overlay': isRTL }"
  />
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { isRTL as checkRTL } from '@/i18n';

const { locale } = useI18n();
const isRTL = computed(() => checkRTL(locale.value));
</script>
```

**RTL Text Alignment:**
- Use `text-align: start` instead of `left` or `right`
- Use `margin-inline-start` and `margin-inline-end` instead of `margin-left` and `margin-right`
- Use `padding-inline-start` and `padding-inline-end` for padding

---

## Next Steps

- [Architecture Overview](./architecture.md)
- [API Reference](./backend-api.md)
- [Component Reference](./vue-components.md)
- [Security Guide](./security.md)
