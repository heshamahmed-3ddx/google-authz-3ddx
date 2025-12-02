# Navigation System - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Application

```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client
cd client
npm run dev
```

### 2. Login with Test Account

Navigate to `http://localhost:5173` and login with your Google account.

### 3. View Navigation

Once authenticated, you'll see the sidebar navigation on the left side. The menu items you see depend on your user groups.

---

## 🎯 Navigation Features

### Rail Mode
Click the menu icon (≡ ☰) in the sidebar header to toggle between:
- **Full Mode**: Shows full labels and descriptions
- **Rail Mode**: Shows only icons (hover for labels)

### Mobile Experience
- On mobile devices, the sidebar becomes a drawer
- Click the hamburger menu in the app bar to open
- Automatically closes after selecting a menu item

### Active Route Highlighting
- Current page is highlighted with brand orange accent (#ff6f00)
- Parent menu items automatically expand when child is active

### OverlaySidebar (Mobile/Tablet)
- Full-screen overlay navigation
- Search functionality to filter navigation items
- Grid-based layout (1-4 columns based on screen size)
- User profile with avatar, name, and job title
- RTL support for right-to-left languages

---

## 👥 Testing with Different User Types

### Admin User (Full Access)
**Groups**: `admin`, `SWD`, `developers`

✅ Can access:
- All user management features
- All organization sections
- All financial tools
- All development tools
- All reports and analytics
- All system settings

### SWD User (Developer Access)
**Groups**: `SWD`, `developers`

✅ Can access:
- User and group management
- Organization structure
- Development tools
- Technical documentation
- System logs

❌ Cannot access:
- Financial management
- System settings

### Regular User (Basic Access)
**Groups**: `users`, `sales`

✅ Can access:
- Home dashboard
- Personal profile
- My tasks
- Timesheets
- User guides
- Help & support

❌ Cannot access:
- User management
- Financial tools
- Development tools
- System administration

### Finance User
**Groups**: `finance`, `users`

✅ Can access:
- Financial management (invoices, budgets, reports)
- Organization departments
- Cost centers
- Project reports

❌ Cannot access:
- User management
- Development tools
- System settings

### Contractor
**Groups**: `contractors`, `users`

✅ Can access:
- My tasks
- Timesheets
- Assigned projects
- Help & support

❌ Cannot access:
- Internal resources
- Financial data
- Development tools

---

## 🧪 Testing Navigation Permissions

### Method 1: Mock User Demo Script

```bash
cd tests
node demo-access-control.js
```

This will show you what each user type can see in the dashboard.

### Method 2: Browser Testing

1. Login with your account
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run:
```javascript
// Check your current groups
$store = useAuthStore()
console.log('My groups:', $store.cachedUserRights?.groups)

// See all available navigation items
import { NAVIGATION_CONFIG } from '@/config/navigationConfig'
console.log('All navigation:', NAVIGATION_CONFIG)

// See filtered navigation for your groups
import { filterNavigationByPermissions } from '@/config/navigationConfig'
const myNav = filterNavigationByPermissions(
  NAVIGATION_CONFIG, 
  $store.cachedUserRights?.groups || []
)
console.log('My navigation:', myNav)
```

---

## 🔧 Common Modifications

### Add a New Menu Item

1. **Edit** `client/src/config/navigationConfig.js`:
```javascript
{
  id: 'my-new-item',
  title: 'My New Feature',
  icon: 'mdi-star',
  route: '/my-feature',
  permissions: ['admin', 'SWD'], // Who can see this
}
```

2. **Add route** in `client/src/router/index.js`:
```javascript
{
  path: '/my-feature',
  name: 'MyFeature',
  component: () => import('@/views/MyFeatureView.vue'),
  meta: { 
    requiresAuth: true,
    requiredGroups: ['admin', 'SWD']
  },
}
```

3. **Create view** (or copy placeholder):
```bash
cp client/src/views/PlaceholderView.vue client/src/views/MyFeatureView.vue
```

### Change Menu Permissions

Edit the `permissions` array in `navigationConfig.js`:

```javascript
// Before: Only admin can see
permissions: ['admin']

// After: Admin OR SWD can see
permissions: ['admin', 'SWD']

// Make public to all authenticated users
permissions: ['*']
```

### Add Badge/Notification

```javascript
{
  id: 'invoices',
  title: 'Invoices',
  icon: 'mdi-file-document',
  route: '/finance/invoices',
  permissions: ['finance'],
  badge: { 
    text: 'New',    // Badge text
    color: 'error'  // Badge color: error, warning, success, info, primary
  },
}
```

---

## 🎨 Customization

### Change Sidebar Colors

Edit `client/src/components/NavigationSidebar.vue`:

```css
.navigation-sidebar {
  /* Current dark gradient */
  background: linear-gradient(180deg, #1e1e1e 0%, #2d2d2d 100%);
  
  /* Try a blue gradient */
  /* background: linear-gradient(180deg, #1a237e 0%, #283593 100%); */
  
  /* Try a custom gradient */
  /* background: linear-gradient(180deg, #your-color-1 0%, #your-color-2 100%); */
}
```

### Change Active Item Highlight

```css
.navigation-item.active-route {
  background: linear-gradient(90deg, rgba(25, 118, 210, 0.2) 0%, rgba(25, 118, 210, 0.1) 100%);
  border-left: 3px solid #1976d2; /* Change this color */
}
```

### Add More Icons

Browse Material Design Icons: https://pictogrammers.com/library/mdi/

Use any icon with the `mdi-` prefix:
- `mdi-rocket` → 🚀 Rocket
- `mdi-shield-star` → 🛡️ Shield star
- `mdi-chart-timeline` → 📈 Timeline chart

---

## 🐛 Troubleshooting

### Navigation not showing
✅ **Check**: Are you logged in? Sidebar only shows when authenticated.

### Menu item missing
✅ **Check**: Do you have the required group?
```javascript
// Check your groups in console
useAuthStore().cachedUserRights?.groups
```

### Can't access route
✅ **Check**: Route permissions must match navigation permissions
- Navigation: `permissions: ['admin', 'SWD']`
- Route: `meta: { requiredGroups: ['admin', 'SWD'] }`

### Sidebar looks broken
✅ **Check**: Make sure Vuetify is loaded and theme is initialized
✅ **Try**: Clear browser cache and reload

---

## 📱 Responsive Breakpoints

| Device | Screen Width | Behavior |
|--------|--------------|----------|
| Desktop | > 960px | Permanent sidebar, rail mode available |
| Tablet | 600-960px | Drawer overlay, toggle via button |
| Mobile | < 600px | Drawer overlay, auto-close after selection |

---

## 🔗 Navigation Structure Overview

```
📁 Navigation
├── 🏠 Home (Dashboard)
├── 👥 User Management (Admin, SWD)
│   ├── Users
│   ├── Groups
│   ├── Roles & Permissions
│   └── Access Policies
├── 🏢 Organization (Admin, SWD, Finance)
│   ├── Organization Structure
│   ├── Departments
│   ├── Cost Centers
│   └── Organizational Units
├── 💰 Financial Management (Admin, Finance)
│   ├── Invoices
│   ├── Budgets
│   ├── Financial Reports
│   └── Approvals
├── 💻 Development (Admin, SWD, Developers)
│   ├── Code Repositories
│   ├── Deployments
│   ├── API Keys
│   └── Webhooks
├── 📋 Projects & Tasks (All Users)
│   ├── All Projects
│   ├── My Tasks
│   ├── Timesheets
│   └── Project Reports
├── 📚 Documentation (Varies)
│   ├── API Documentation
│   ├── Code Documentation
│   ├── User Guides
│   └── Technical Specifications
├── 📊 Reports & Analytics (Admin, SWD, Finance)
│   ├── Dashboards
│   ├── User Activity
│   ├── System Logs
│   └── Audit Trail
├── ⚙️ System (Admin Only)
│   ├── System Settings
│   ├── Integrations
│   ├── Notifications
│   ├── Security
│   └── Backup & Recovery
├── 👤 My Profile (All Users)
└── ❓ Help & Support (All Users)
    ├── FAQs
    ├── Contact Support
    ├── Video Tutorials
    └── What's New
```

---

## ✅ Quick Checklist

Before deploying:

- [ ] Test navigation with all user types
- [ ] Verify permissions match between navigation config and routes
- [ ] Check mobile responsiveness
- [ ] Test rail mode functionality
- [ ] Verify active route highlighting
- [ ] Check breadcrumbs work correctly
- [ ] Test logout functionality
- [ ] Verify user info displays correctly
- [ ] Check all icons render properly
- [ ] Test with both light and dark themes

---

## 📞 Need Help?

- **Full Documentation**: See `docs/NAVIGATION-SYSTEM.md`
- **Mock Testing Guide**: See `tests/README-MOCK-TESTING.md`
- **Configuration File**: `client/src/config/navigationConfig.js`
- **Sidebar Component**: `client/src/components/NavigationSidebar.vue`
- **Router Configuration**: `client/src/router/index.js`

---

**Quick Tip**: The navigation system is designed to "just work" - users automatically see only what they have permission to access. No additional configuration needed per user!
