# Vue Components Reference

## Overview

This guide documents all major Vue 3 components in the application, including props, events, slots, and usage examples.

## Core Components

### NavigationSidebar.vue

**Location:** `client/src/components/NavigationSidebar.vue`

**Purpose:** Main sidebar navigation with Oracle Fusion-inspired design

**Props:**
```typescript
{
  modelValue: boolean,  // Controls drawer open/close
  rail: boolean         // Enables compact mode
}
```

**Events:**
- `update:modelValue` - Emits when drawer state changes
- `update:rail` - Emits when rail mode toggles

**Features:**
- Hierarchical navigation with expandable groups
- Permission-based menu filtering
- User profile display
- Search functionality
- Responsive design (mobile/desktop)

**Usage:**
```vue
<template>
  <NavigationSidebar
    v-model="drawer"
    :rail="isCompact"
    @update:rail="handleRailToggle"
  />
</template>

<script setup>
import { ref } from 'vue';
import NavigationSidebar from '@/components/NavigationSidebar.vue';

const drawer = ref(true);
const isCompact = ref(false);

const handleRailToggle = (newState) => {
  isCompact.value = newState;
};
</script>
```

---

### ThemeToggle.vue

**Location:** `client/src/components/ThemeToggle.vue`

**Purpose:** Light/dark theme switcher with auto mode

**Props:**
- None (uses `useThemeStore()`)

**Features:**
- Light, dark, and auto themes
- Persistent selection (localStorage)
- Smooth transitions
- Icon indicators

**Usage:**
```vue
<template>
  <ThemeToggle />
</template>

<script setup>
import ThemeToggle from '@/components/ThemeToggle.vue';
</script>
```

**Store Integration:**
```javascript
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();
themeStore.setTheme('dark'); // 'light', 'dark', or 'auto'
```

---

### LanguageSwitcher.vue

**Location:** `client/src/components/LanguageSwitcher.vue`

**Purpose:** Multi-language UI switcher

**Props:**
- None (uses Vue I18n)

**Supported Languages:**
- English (en)
- Arabic (ar) - RTL support
- Spanish (es)
- French (fr)

**Features:**
- Dropdown language selector
- Flag icons
- RTL layout switching
- Persistent selection

**Usage:**
```vue
<template>
  <LanguageSwitcher />
</template>

<script setup>
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
</script>
```

---

### OverlaySidebar.vue

**Location:** `client/src/components/OverlaySidebar.vue`

**Purpose:** Full-screen overlay navigation sidebar for mobile and desktop experiences

**Props:**
```typescript
{
  modelValue: boolean  // Controls overlay visibility
}
```

**Events:**
- `update:modelValue` - Emitted when overlay should close/open

**Features:**
- Full-screen overlay with backdrop (using Vuetify `v-overlay`)
- User profile section with avatar, name, job title, and logout button
- Search functionality to filter navigation items by route name or localized title
- Grid-based navigation layout with responsive columns
- Section headers for navigation groups
- RTL support for Arabic and other RTL languages
- Safe area support for mobile devices (notches, home indicators)
- Text selection protection - doesn't close when selecting text
- No results message when search returns empty
- Static design - no animations or hover effects
- Uses Vuetify components (`v-list-item`, `v-list-subheader`, `v-card`)

**Usage:**
```vue
<template>
  <OverlaySidebar v-model="showOverlay" />
</template>

<script setup>
import { ref } from 'vue';
import OverlaySidebar from '@/components/OverlaySidebar.vue';

const showOverlay = ref(false);

// Open overlay
const openNavigation = () => {
  showOverlay.value = true;
};

// Close overlay (also closes on backdrop click or close button)
const closeNavigation = () => {
  showOverlay.value = false;
};
</script>
```

**Technical Details:**
- Uses `Teleport` to render in body
- Uses Vuetify `v-overlay` for backdrop with `@click:outside` handler
- Uses `v-card` for content container
- Uses `v-list-item` for navigation items in a grid layout
- Uses `v-list-subheader` for section headers
- Profile picture with fallback to initials if image fails
- Search filters by route path and localized navigation title
- Grid layout: 1 column (mobile), 2-3 columns (tablet), 3-4 columns (desktop)
- Content max-width: 1200px (centered)
- Bottom safe space: 48px minimum (plus safe area insets)

**Styling:**
- **No animations** - completely static design
- **No hover effects** - clean, minimal interaction
- Compact spacing and typography
- Brand orange color scheme (#ff6f00)
- Full-width overlay with centered content
- Custom scrollbar styling

**RTL Support:**
- Automatic direction switching for RTL languages
- Close button positioned on left in RTL mode
- Text alignment adjusts automatically
- Navigation grid maintains proper layout

**Accessibility:**
- Keyboard support (Escape key closes overlay)
- ARIA labels via Vuetify components
- Focus management
- Screen reader friendly

---

### DevToolbar.vue

**Location:** `client/src/components/DevToolbar.vue`

**Purpose:** Development mode controls and debugging tools

**Props:**
- None (uses `useDevModeStore()`)

**Features:**
- Admin view toggle with visual indicator
- Simulated group membership with count badge
- Groups section showing all simulated groups
- VitePress documentation button (links to docs)
- Compact, modern design
- Status indicators (card-style display)
- Control buttons for Admin View and Groups
- Only visible in development mode

**Usage:**
```vue
<template>
  <DevToolbar v-if="isDevelopment" />
</template>

<script setup>
import DevToolbar from '@/components/DevToolbar.vue';

const isDevelopment = import.meta.env.DEV;
</script>
```

**Store Integration:**
```javascript
import { useDevModeStore } from '@/stores/devMode';

const devMode = useDevModeStore();

// Toggle admin view
devMode.toggleAdminView();

// Add simulated group
devMode.addSimulatedGroup('Finance22');

// Remove simulated group
devMode.removeSimulatedGroup('Finance22');

// Clear all simulated groups
devMode.clearSimulatedGroups();

// Check current state
const isAdminView = devMode.adminViewEnabled;
const simulatedGroups = devMode.simulatedGroups;
```

**UI Features:**
- Floating button with tooltip
- Menu card with header (avatar + title)
- Status indicators showing active states
- Groups section with count badge
- Control buttons for toggles
- Documentation section with links
- Compact design with reduced spacing

---

### AdminPanel.vue

**Location:** `client/src/components/AdminPanel.vue`

**Purpose:** Admin dashboard for user and policy management

**Props:**
```typescript
{
  users: Array<User>,
  userHeaders: Array<TableHeader>,
  loading: boolean
}
```

**Events:**
- `editUser(user)` - Triggers user edit dialog
- `deleteUser(user)` - Triggers user deletion
- `refreshUsers()` - Refreshes user list

**Usage:**
```vue
<template>
  <AdminPanel
    :users="users"
    :user-headers="headers"
    :loading="isLoading"
    @editUser="handleEditUser"
    @deleteUser="handleDeleteUser"
    @refreshUsers="loadUsers"
  />
</template>

<script setup>
import { ref } from 'vue';
import AdminPanel from '@/components/AdminPanel.vue';

const users = ref([]);
const headers = ref([
  { title: 'Email', key: 'email' },
  { title: 'Name', key: 'name' },
  { title: 'Groups', key: 'groups' }
]);
const isLoading = ref(false);

const handleEditUser = (user) => {
  console.log('Edit user:', user);
};

const handleDeleteUser = (user) => {
  console.log('Delete user:', user);
};

const loadUsers = async () => {
  isLoading.value = true;
  // Load users...
  isLoading.value = false;
};
</script>
```

---

## View Components

### DashboardView.vue

**Location:** `client/src/views/DashboardView.vue`

**Purpose:** Main dashboard with user info and access controls

**Features:**
- User profile display
- Groups and permissions
- Technical information (dev mode)
- API documentation links
- Access control indicators

**Route:**
```javascript
{
  path: '/dashboard',
  name: 'Dashboard',
  component: () => import('@/views/DashboardView.vue'),
  meta: { requiresAuth: true }
}
```

---

### SurgicalGuideReportView.vue

**Location:** `client/src/views/Reports/SurgicalGuideReportView.vue`

**Purpose:** Financial report for surgical guide cases

**Features:**
- Date range filtering (YYYY-MM-DD format)
- Search functionality
- Server-side pagination (default: 10 items per page)
- Custom pagination display ("Page X of Y")
- CSV export
- Order type filtering
- Expandable row details
- Access control (Finance22 or admin only)
- **Localized summary cards** - All summary card labels use i18n
- **Date column width** - Optimized width (180px) to prevent text wrapping

**Pagination:**
- Default items per page: 10
- Configurable: 10, 25, 50, 100 items per page
- Server-side pagination for optimal performance
- Custom footer display showing current page and total pages

**Date Formatting:**
- Dates automatically formatted to YYYY-MM-DD before API requests
- Date picker ensures correct format
- Validates date format on both frontend and backend

**Route:**
```javascript
{
  path: '/reports/surgical-guide',
  name: 'SurgicalGuideReport',
  component: () => import('@/views/Reports/SurgicalGuideReportView.vue'),
  meta: { 
    requiresAuth: true,
    requiredGroups: ['Finance22', 'admin']
  }
}
```

**Usage Example:**
```vue
<template>
  <SurgicalGuideReportView />
</template>
```

---

### PlaceholderView.vue

**Location:** `client/src/views/PlaceholderView.vue`

**Purpose:** Generic placeholder for new routes

**Features:**
- Beautiful placeholder UI
- Permission indicator
- Quick navigation
- Development helper

**Usage:**
Copy this file to create new views quickly:
```bash
cp client/src/views/PlaceholderView.vue client/src/views/MyNewView.vue
```

---

## Composition API Patterns

### Using Stores

```vue
<script setup>
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { useDevModeStore } from '@/stores/devMode';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const devModeStore = useDevModeStore();

// Access state
const user = authStore.user;
const isAuthenticated = authStore.isAuthenticated;

// Call actions
const login = () => authStore.login();
const logout = () => authStore.logout();
</script>
```

### API Calls

```vue
<script setup>
import { ref } from 'vue';
import api from '@/services/api';

const data = ref(null);
const loading = ref(false);
const error = ref(null);

const fetchData = async () => {
  try {
    loading.value = true;
    const response = await api.get('/api/endpoint');
    data.value = response.data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>
```

### Route Navigation

```vue
<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToPage = () => {
  router.push('/path');
};

const goBack = () => {
  router.back();
};
</script>
```

---

## Component Best Practices

### 1. Use Composition API

```vue
<script setup>
// Preferred: Composition API with script setup
import { ref, computed, onMounted } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);

onMounted(() => {
  console.log('Component mounted');
});
</script>
```

### 2. Props with Types

```vue
<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});
</script>
```

### 3. Events with Type Safety

```vue
<script setup>
const emit = defineEmits(['update', 'delete', 'refresh']);

const handleClick = () => {
  emit('update', { id: 1, name: 'Item' });
};
</script>
```

### 4. Scoped Styles

```vue
<style scoped>
.component {
  /* Scoped to this component only */
  color: blue;
}
</style>
```

---

## Testing Components

### Unit Test Example

```javascript
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import MyComponent from '@/components/MyComponent.vue';

describe('MyComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        title: 'Test'
      }
    });
    expect(wrapper.text()).toContain('Test');
  });

  it('emits event on click', async () => {
    const wrapper = mount(MyComponent);
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted()).toHaveProperty('click');
  });
});
```

---

## Next Steps

- [Client API Reference](./api.md)
- [Architecture Overview](./architecture.md)
- [Getting Started Guide](./getting-started.md)
