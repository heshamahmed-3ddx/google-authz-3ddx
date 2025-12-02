# Oracle Fusion-Inspired Navigation System

## Overview

This project now includes a comprehensive sidebar navigation system inspired by Oracle Fusion's modern, hierarchical design. The navigation is fully integrated with the existing role-based access control (RBAC) system using Casbin, ensuring users only see menu items they have permission to access.

---

## 🎯 Key Features

### 1. **Hierarchical Navigation Structure**
- Multi-level nested menus
- Collapsible menu groups
- Parent-child relationships
- Breadcrumb trail generation

### 2. **Permission-Based Access Control**
- Group-based visibility filtering
- Route-level permission guards
- Dynamic menu generation based on user roles
- Integration with existing Casbin policies

### 3. **Static Design Patterns**
- Modern theme support (light/dark)
- Static design (no animations or hover effects)
- Rail mode (collapsed sidebar) - NavigationSidebar
- Responsive mobile drawer - NavigationSidebar
- Full-screen overlay - OverlaySidebar
- Clean active state indicators

### 4. **User Experience**
- User profile section in sidebar (both components)
- Quick access to logout
- Badge notifications (e.g., "New", "2 pending")
- Tooltips in rail mode (NavigationSidebar)
- Search functionality (OverlaySidebar)
- Grid-based navigation layout (OverlaySidebar)
- Version information in footer (NavigationSidebar)

---

## 📁 File Structure

```
client/src/
├── components/
│   ├── NavigationSidebar.vue      # Desktop sidebar component
│   └── OverlaySidebar.vue         # Mobile/tablet overlay navigation
├── config/
│   ├── navigationConfig.js         # Navigation structure & utilities
│   └── dashboardAccess.js          # Dashboard section permissions
├── views/
│   ├── PlaceholderView.vue         # Generic placeholder for new routes
│   ├── UserManagement/             # User management views
│   │   ├── UsersView.vue
│   │   ├── GroupsView.vue
│   │   ├── RolesView.vue
│   │   └── PoliciesView.vue
│   ├── Organization/               # Organization views
│   │   ├── StructureView.vue
│   │   ├── DepartmentsView.vue
│   │   ├── CostCentersView.vue
│   │   └── UnitsView.vue
│   ├── Finance/                    # Financial management views
│   │   ├── InvoicesView.vue
│   │   ├── BudgetsView.vue
│   │   ├── ReportsView.vue
│   │   └── ApprovalsView.vue
│   ├── Development/                # Development tools views
│   │   ├── RepositoriesView.vue
│   │   ├── DeploymentsView.vue
│   │   ├── ApiKeysView.vue
│   │   └── WebhooksView.vue
│   ├── Projects/                   # Project management views
│   │   ├── ProjectsView.vue
│   │   ├── MyTasksView.vue
│   │   ├── TimesheetsView.vue
│   │   └── ReportsView.vue
│   ├── Documentation/              # Documentation views
│   │   ├── ApiDocsView.vue
│   │   ├── JSDocView.vue
│   │   ├── GuidesView.vue
│   │   └── TechnicalView.vue
│   ├── Reports/                    # Analytics & reporting views
│   │   ├── DashboardsView.vue
│   │   ├── UserActivityView.vue
│   │   ├── LogsView.vue
│   │   └── AuditView.vue
│   ├── System/                     # System administration views
│   │   ├── SettingsView.vue
│   │   ├── IntegrationsView.vue
│   │   ├── NotificationsView.vue
│   │   ├── SecurityView.vue
│   │   └── BackupView.vue
│   └── Help/                       # Help & support views
│       ├── FAQView.vue
│       ├── ContactView.vue
│       ├── TutorialsView.vue
│       └── WhatsNewView.vue
├── router/
│   └── index.js                    # Updated with all routes & guards
└── App.vue                         # Integrated sidebar
```

---

## 🔧 Configuration

### Navigation Configuration (`navigationConfig.js`)

The navigation structure is defined in a centralized configuration file:

```javascript
export const NAVIGATION_CONFIG = [
  {
    id: 'home',
    title: 'Home',
    icon: 'mdi-home',
    route: '/dashboard',
    permissions: ['*'], // Public to all authenticated users
  },
  {
    id: 'user-management',
    title: 'User Management',
    icon: 'mdi-account-multiple',
    permissions: ['admin', 'SWD', 'developers'],
    children: [
      {
        id: 'users-list',
        title: 'Users',
        icon: 'mdi-account-group',
        route: '/users',
        permissions: ['admin', 'SWD'],
      },
      // ... more children
    ],
  },
  // ... more navigation items
];
```

#### Navigation Item Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the item |
| `title` | string | Display name shown in menu |
| `icon` | string | Material Design Icon name (mdi-*) |
| `route` | string | Vue Router path (optional for groups) |
| `permissions` | array | Required groups/roles (`['*']` for public) |
| `children` | array | Nested navigation items |
| `badge` | object | Badge config: `{ text: 'New', color: 'error' }` |
| `divider` | boolean | Show divider after this item |

---

## 🔐 Permission System

### Permission Levels

The navigation uses a group-based permission system:

```javascript
permissions: ['*']                    // Public to all authenticated users
permissions: ['admin']                // Admin only
permissions: ['admin', 'SWD']         // Admin OR SWD
permissions: ['admin', 'finance']     // Admin OR Finance
```

### Helper Functions

#### `hasNavigationAccess(itemPermissions, userGroups)`
Checks if a user has access to a navigation item.

```javascript
import { hasNavigationAccess } from '@/config/navigationConfig';

const canAccess = hasNavigationAccess(
  ['admin', 'SWD'],  // Required permissions
  ['SWD', 'users']   // User's groups
);
// Returns: true (user has SWD group)
```

#### `filterNavigationByPermissions(navigationItems, userGroups)`
Filters entire navigation tree based on user's groups.

```javascript
import { filterNavigationByPermissions, NAVIGATION_CONFIG } from '@/config/navigationConfig';

const visibleNav = filterNavigationByPermissions(
  NAVIGATION_CONFIG,
  ['users', 'sales']  // Regular user groups
);
// Returns: Only items user can access
```

#### `getBreadcrumbTrail(navigationItems, route)`
Generates breadcrumb trail for current route.

```javascript
import { getBreadcrumbTrail, NAVIGATION_CONFIG } from '@/config/navigationConfig';

const breadcrumbs = getBreadcrumbTrail(NAVIGATION_CONFIG, '/finance/invoices');
// Returns: [{ title: 'Financial Management', route: null }, { title: 'Invoices', route: '/finance/invoices' }]
```

---

## 🛣️ Router Configuration

### Route Structure

All routes are defined in `router/index.js` with permission metadata:

```javascript
{
  path: '/users',
  name: 'Users',
  component: () => import('@/views/UserManagement/UsersView.vue'),
  meta: { 
    requiresAuth: true,
    requiredGroups: ['admin', 'SWD']
  },
}
```

### Route Guards

The router includes automatic permission checking:

```javascript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    // Check authentication
    const isAuthenticated = await authStore.checkAuth();
    if (!isAuthenticated) {
      next({ name: 'Home' });
      return;
    }

    // Check group-based permissions
    if (to.meta.requiredGroups) {
      const userGroups = authStore.cachedUserRights?.groups || [];
      const hasAccess = hasNavigationAccess(to.meta.requiredGroups, userGroups);
      
      if (!hasAccess) {
        next({ name: 'Dashboard' });
        return;
      }
    }

    next();
  } else {
    next();
  }
});
```

---

## 🎨 Component Usage

### NavigationSidebar Component

The sidebar component is automatically shown when users are authenticated:

```vue
<template>
  <v-app>
    <!-- Navigation Sidebar (only show when authenticated) -->
    <NavigationSidebar 
      v-if="authStore.isAuthenticated" 
      v-model="drawer"
    />
    
    <v-app-bar>
      <!-- Menu button for sidebar toggle -->
      <v-app-bar-nav-icon 
        v-if="authStore.isAuthenticated"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <!-- ... -->
    </v-app-bar>
    
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
```

### Component Features

1. **Rail Mode**: Collapsible to icon-only view
2. **User Info Section**: Shows user avatar, name, email
3. **Hierarchical Menu**: Nested items with expand/collapse
4. **Active Route Highlighting**: Current page highlighted
5. **Footer Actions**: Logout, settings (admin only)

---

### OverlaySidebar Component

The overlay sidebar component provides a full-screen navigation experience optimized for mobile and tablet devices:

```vue
<template>
  <v-app>
    <!-- App Bar with Navigation Button -->
    <v-app-bar>
      <v-app-bar-nav-icon 
        v-if="authStore.isAuthenticated"
        @click="showOverlay = true"
      ></v-app-bar-nav-icon>
      <!-- ... -->
    </v-app-bar>
    
    <!-- Overlay Sidebar -->
    <OverlaySidebar 
      v-if="authStore.isAuthenticated" 
      v-model="showOverlay"
    />
    
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import OverlaySidebar from '@/components/OverlaySidebar.vue';

const showOverlay = ref(false);
</script>
```

### OverlaySidebar Features

1. **Full-Screen Overlay**: Covers entire viewport with backdrop
2. **User Profile Section**: Shows avatar, name, job title, and logout button
3. **Search Functionality**: Filter navigation items by route name or title
4. **Grid-Based Layout**: Responsive grid (1-4 columns based on screen size)
5. **Section Headers**: Organized navigation groups
6. **RTL Support**: Full right-to-left language support
7. **Safe Area Support**: Handles mobile notches and home indicators
8. **Text Selection Protection**: Doesn't close when selecting text
9. **Static Design**: No animations or hover effects

### OverlaySidebar Usage

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

### Search Functionality

The OverlaySidebar includes a search feature that filters navigation items:

- **Search by route**: Matches route paths (e.g., "dashboard", "reports")
- **Search by title**: Matches localized navigation titles
- **Real-time filtering**: Updates as you type
- **Smart section headers**: Only shows sections with matching items
- **No results message**: User-friendly message when no matches found
6. **Responsive**: Mobile drawer behavior

---

## 👥 User Access Matrix

| User Type | Home | User Mgmt | Organization | Finance | Development | Projects | Docs | Reports | System | Help |
|-----------|------|-----------|--------------|---------|-------------|----------|------|---------|--------|------|
| **Admin** | ✅ | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ | ✅ | ✅ Full | ✅ Full | ✅ |
| **SWD** | ✅ | ✅ Users, Groups | ✅ Structure, Units | ❌ | ✅ Full | ✅ | ✅ | ✅ Logs, Dashboards | ❌ | ✅ |
| **Developer** | ✅ | ❌ | ❌ | ❌ | ✅ Repos, Webhooks | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Finance** | ✅ | ❌ | ✅ Departments, Cost Centers | ✅ Full | ❌ | ✅ | ❌ | ✅ Dashboards | ❌ | ✅ |
| **Regular User** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ My Tasks, Timesheets | ✅ Guides | ❌ | ❌ | ✅ |
| **Contractor** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ My Tasks, Timesheets | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Adding New Navigation Items

### Step 1: Add to Navigation Config

Edit `client/src/config/navigationConfig.js`:

```javascript
{
  id: 'new-section',
  title: 'New Section',
  icon: 'mdi-new-icon',
  permissions: ['admin', 'custom-group'],
  children: [
    {
      id: 'new-page',
      title: 'New Page',
      icon: 'mdi-page-icon',
      route: '/new-page',
      permissions: ['admin'],
    },
  ],
},
```

### Step 2: Add Route

Edit `client/src/router/index.js`:

```javascript
{
  path: '/new-page',
  name: 'NewPage',
  component: () => import('@/views/NewPageView.vue'),
  meta: { 
    requiresAuth: true,
    requiredGroups: ['admin']
  },
},
```

### Step 3: Create View Component

Create `client/src/views/NewPageView.vue`:

```vue
<template>
  <v-container>
    <h1>New Page</h1>
    <!-- Your content here -->
  </v-container>
</template>

<script setup>
// Your logic here
</script>
```

Or use the PlaceholderView for rapid prototyping:

```bash
cp client/src/views/PlaceholderView.vue client/src/views/NewPageView.vue
```

---

## 🧪 Testing Navigation with Mock Users

Use the existing mock user infrastructure to test navigation:

```bash
# Run the demo script
cd tests
node demo-access-control.js
```

### Mock Users for Testing

| User Type | Email | Groups | Navigation Access |
|-----------|-------|--------|-------------------|
| Admin | test.admin@3ddx.com | admin, SWD, developers | Full access to all sections |
| SWD | test.developer@3ddx.com | SWD, developers | Limited admin functions |
| Regular | test.user@3ddx.com | users, sales | Basic access only |
| Finance | test.finance@3ddx.com | finance, users | Finance-specific sections |
| Contractor | test.contractor@3ddx.com | contractors, users | Tasks and timesheets |
| Suspended | test.suspended@3ddx.com | *(none)* | No access |

---

## 📱 Responsive Behavior

### Desktop (> 960px)
- **NavigationSidebar**: Permanently visible, can toggle rail mode
- **OverlaySidebar**: Full-screen overlay, 3-4 column grid layout
- Full navigation labels

### Tablet (600-960px)
- **NavigationSidebar**: Drawer overlay, toggle via hamburger button
- **OverlaySidebar**: Full-screen overlay, 2-3 column grid layout
- Full navigation labels

### Mobile (< 600px)
- **NavigationSidebar**: Drawer overlay, auto-closes after navigation
- **OverlaySidebar**: Full-screen overlay, 1 column grid layout
- Optimized for touch
- Safe area support for notches and home indicators

---

## 🎨 Customization

### Theme Colors

Both navigation components automatically adapt to the current theme:

**NavigationSidebar:**
- Dark theme: Theme-aware dark backgrounds
- Light theme: Theme-aware light backgrounds

**OverlaySidebar:**
- Dark theme: Theme-aware dark backgrounds
- Light theme: Theme-aware light backgrounds
- Brand orange accent: `#ff6f00` for active states and profile

### Icon Library

Uses Material Design Icons (MDI):
- Browse icons: https://pictogrammers.com/library/mdi/
- Prefix: `mdi-`
- Example: `mdi-account`, `mdi-chart-line`, `mdi-shield-lock`

### Active Route Styling

**NavigationSidebar:**
```css
.navigation-item.active-route {
  border-left: 2px solid #ff6f00; /* Brand orange */
}
```

**OverlaySidebar:**
```css
.nav-list-item.v-list-item--active {
  border: 1px solid #ff6f00; /* Brand orange */
  background-color: rgba(255, 111, 0, 0.1);
}
```

**Note:** Both components use static design with no animations or hover effects.
  color: #ffffff;
  border-left: 3px solid #1976d2;
}
```

---

## 🔍 Troubleshooting

### Navigation Item Not Showing

1. **Check permissions**: Ensure user has required group
2. **Check configuration**: Verify `permissions` array includes user's group
3. **Check parent visibility**: Parent must be visible for children to show
4. **Check console**: Look for permission warnings

### Route Access Denied

1. **Check route meta**: Verify `requiredGroups` matches navigation config
2. **Check user groups**: Use Vue DevTools to inspect `authStore.cachedUserRights.groups`
3. **Check route guard**: Console will log access denials

### Sidebar Not Appearing

1. **Check authentication**: Sidebar only shows when `authStore.isAuthenticated === true`
2. **Check component import**: Ensure `NavigationSidebar` is imported in `App.vue`
3. **Check drawer state**: `drawer` ref should be `true` by default

---

## 📚 Related Documentation

- **Dashboard Access Control**: `docs/DASHBOARD_ACCESS_GUIDE.md`
- **Mock Testing**: `tests/README-MOCK-TESTING.md`
- **Test Results**: `tests/TEST-RESULTS-SUMMARY.md`
- **Quick Reference**: `tests/QUICK-REFERENCE.md`

---

## 🎯 Future Enhancements

- [ ] Search functionality in sidebar
- [ ] Favorites/pinned items
- [ ] Recent items history
- [ ] Keyboard shortcuts
- [ ] Multi-language support for navigation titles
- [ ] Custom icon upload support
- [ ] Navigation analytics (track which items are used most)
- [ ] Drag-and-drop menu customization

---

## 💡 Best Practices

1. **Keep hierarchy shallow**: Max 2-3 levels deep
2. **Use clear icons**: Icons should be instantly recognizable
3. **Group related items**: Keep related functionality together
4. **Consistent naming**: Use parallel structure for titles
5. **Test with all user types**: Verify each role sees appropriate items
6. **Performance**: Navigation filtering is cached for performance

---

## 📞 Support

For questions or issues with the navigation system:
- Check existing documentation above
- Review `navigationConfig.js` for current structure
- Test with mock users using demo script
- Contact development team for Casbin policy updates

---

---

## 📚 Related Documentation

- [Navigation UI Enhancements](./NAVIGATION-UI-ENHANCEMENTS.md) - UI/UX design guide
- [Vue Components Reference](../vitepress/vue-components.md) - Component documentation
- [Usage Guides](../vitepress/usage-guides.md) - Usage examples and patterns
- [Compact UI Style Guide](../vitepress/compact-ui-style-guide.md) - Design system

---

**Last Updated**: January 2025  
**Version**: 2.0.0 (Added OverlaySidebar)  
**Author**: Development Team
