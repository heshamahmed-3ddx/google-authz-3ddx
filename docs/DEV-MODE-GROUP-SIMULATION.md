# 🔧 Development Mode - Group Simulation & Navigation Control

## Overview

The Development Mode system now includes **global controls** that affect both the **sidebar navigation** and **dashboard sections** across all pages of the application. You can simulate different group memberships and toggle admin views to test permissions without modifying your actual Google Workspace groups.

---

## 🎯 Features

### 1. **Global Dev Mode Toolbar**
- **Fixed at the bottom** of every page (only in development)
- **Persists across navigation** - settings remain active as you move between pages
- **Compact design** - doesn't interfere with your work
- **Quick access** to all dev mode features

### 2. **Group Simulation**
- **Select multiple groups** from a dropdown menu
- **Simulated groups** are merged with your actual groups
- **Affects navigation** - see menu items for different departments
- **Affects dashboard** - access restricted sections
- **Live updates** - changes apply immediately across the app

### 3. **Admin View Toggle**
- **One-click access** to all restricted content
- **Bypasses group checks** for testing
- **Works everywhere** - dashboard, navigation, all views
- **Visual indicator** when active

---

## 🚀 Quick Start

### Step 1: Start Development Server
```bash
cd client
npm run dev
```

### Step 2: Login and Navigate
- Login with your Google account
- You'll see a **dark toolbar at the bottom** of the page
- The toolbar shows:
  - Admin toggle chip
  - Groups selector chip
  - Current page name
  - Reset button

### Step 3: Simulate Groups

#### Option A: Using Dashboard Controls
1. At the top of the dashboard, click the **"Groups (0)"** chip
2. A dropdown menu appears with available groups
3. Check the groups you want to simulate:
   - ✅ **finance** - Finance department access
   - ✅ **reporting** - Reporting & Analytics access
   - ✅ **developers** - Developer tools access
   - ✅ **admin** - Full administrative access
4. Click outside to close the menu

#### Option B: Using Global Toolbar
1. Look at the **bottom toolbar** on any page
2. Click the **"Groups (0)"** chip
3. Select groups from the dropdown
4. Changes apply instantly to navigation and content

### Step 4: See the Changes

#### Navigation Sidebar
- **New menu items appear** based on selected groups
- Example: Select "finance" → Finance menu section appears
- Example: Select "reporting" → Reports menu section appears

#### Dashboard Sections
- **Restricted sections become visible**
- Example: Select "SWD" or "developers" → Technical Info section appears
- Example: Select "admin" → All sections appear

#### Other Pages
- **Content filters by groups** automatically
- Navigate to any view and see group-specific features

---

## 📊 Available Groups

| Group | Label | Access Granted |
|-------|-------|----------------|
| **admin** | Admin | Full administrative access to everything |
| **SWD** | SWD | Software Development team features |
| **developers** | Developers | Development tools and technical sections |
| **finance** | Finance | Finance department navigation and data |
| **hr** | HR | Human Resources features |
| **reporting** | Reporting | Reporting & Analytics dashboards |
| **operations** | Operations | Operations team features |
| **sales** | Sales | Sales department access |
| **marketing** | Marketing | Marketing features |
| **support** | Support | Customer Support tools |

---

## 🎨 UI Components

### Dashboard Controls (Top)
```
┌─────────────────────────────────────────────────────┐
│  [👁️ Admin View: OFF]  [⚙️ Groups (2)]    [Logout] │
└─────────────────────────────────────────────────────┘
```

### Global Toolbar (Bottom)
```
┌─────────────────────────────────────────────────────┐
│  [👁️ Admin] [⚙️ Groups (2)] │ 📍 Dashboard  [✕]    │
└─────────────────────────────────────────────────────┘
```

### Warning Banner (When Active)
```
⚠️ Development Mode Active
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Simulated Groups: [finance] [reporting]
This mode is only available in development.
                            [Disable All]
```

---

## 🔄 How It Works

### Architecture

```
┌─────────────────────────────────────────┐
│         devModeStore (Pinia)            │
│  ┌──────────────────────────────────┐   │
│  │ adminViewEnabled: false          │   │
│  │ simulatedGroups: []              │   │
│  │ availableGroups: [...]           │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
           ↓           ↓           ↓
    ┌──────────┐  ┌─────────┐  ┌────────┐
    │Navigation│  │Dashboard│  │ Other  │
    │ Sidebar  │  │  View   │  │  Views │
    └──────────┘  └─────────┘  └────────┘
```

### Data Flow

1. **User selects groups** in toolbar/dashboard
2. **devModeStore updates** `simulatedGroups` array
3. **Components read** merged groups via `getMergedGroups()`
4. **Navigation filters** items by effective groups
5. **Dashboard checks** access using effective groups
6. **UI updates** reactively across all pages

---

## 💻 Code Examples

### Using Dev Mode in Components

```vue
<script setup>
import { computed } from 'vue';
import { useDevModeStore } from '@/stores/devMode';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const devModeStore = useDevModeStore();

// Get effective groups (actual + simulated)
const effectiveGroups = computed(() => {
  const actualGroups = authStore.user?.groups || [];
  return devModeStore.getMergedGroups(actualGroups);
});

// Check if user has access to feature
const hasFinanceAccess = computed(() => {
  return effectiveGroups.value.includes('finance');
});

// Use in template
</script>

<template>
  <v-card v-if="hasFinanceAccess">
    <v-card-title>Finance Dashboard</v-card-title>
    <!-- Finance-specific content -->
  </v-card>
</template>
```

### Navigation Configuration

```javascript
// navigationConfig.js
export const NAVIGATION_CONFIG = [
  {
    id: 'finance',
    title: 'Finance',
    icon: 'mdi-currency-usd',
    requiredGroups: ['finance', 'admin'], // Only visible to these groups
    children: [
      {
        id: 'invoices',
        title: 'Invoices',
        to: '/finance/invoices',
        icon: 'mdi-file-document',
      },
      // ... more items
    ],
  },
];

// The navigation sidebar automatically filters based on
// effectiveGroups (actual + simulated in dev mode)
```

### Dashboard Access Control

```javascript
// DashboardView.vue
const hasAccessToSection = (section) => {
  // Admin view bypasses all checks
  if (devModeStore.isDevelopment && devModeStore.adminViewEnabled) {
    return true;
  }
  
  // Get effective groups (actual + simulated)
  const effectiveGroups = devModeStore.getMergedGroups(
    userRights.value.groups
  );
  
  // Check if any effective group has access
  return DASHBOARD_ACCESS[section].some(allowedGroup => 
    effectiveGroups.includes(allowedGroup)
  );
};
```

---

## 🧪 Testing Scenarios

### Scenario 1: Finance Department Testing
```
1. Select "finance" group in toolbar
2. Navigate to sidebar → See "Finance" section appear
3. Click "Finance" → See invoices, budgets, reports
4. Go to dashboard → See finance-specific widgets
5. Deselect "finance" → Finance sections disappear
```

### Scenario 2: Multi-Department User
```
1. Select "finance" + "reporting" groups
2. See both Finance AND Reporting sections in sidebar
3. Navigate between departments seamlessly
4. Test cross-department features
5. Clear all → Back to your actual permissions
```

### Scenario 3: Admin Testing
```
1. Toggle "Admin View: ON"
2. ALL navigation items appear
3. ALL dashboard sections visible
4. Test every feature without group changes
5. Toggle OFF → Back to normal view
```

### Scenario 4: Department Isolation
```
1. Clear all simulated groups
2. Select ONLY "finance"
3. Verify you can't see "reporting" items
4. Verify proper access control
5. Add "reporting" → Now see both
```

---

## 🔒 Security Notes

### What Dev Mode DOES
- ✅ Shows/hides UI elements
- ✅ Filters navigation menu
- ✅ Controls dashboard visibility
- ✅ Helps test different user experiences
- ✅ Works only in development

### What Dev Mode DOES NOT DO
- ❌ Bypass backend authorization
- ❌ Grant actual API permissions
- ❌ Modify server-side policies
- ❌ Change your real groups
- ❌ Work in production builds

### Important
> ⚠️ **You will still get 403 errors** if you try to access API endpoints that require groups you don't actually have. Dev mode only affects **UI visibility**, not **server authorization**.

---

## 🎛️ Configuration

### Adding New Groups

Edit `/client/src/stores/devMode.js`:

```javascript
const availableGroups = [
  { value: 'admin', label: 'Admin', description: 'Full administrative access' },
  { value: 'finance', label: 'Finance', description: 'Finance department' },
  // Add your custom group here:
  { value: 'custom-dept', label: 'Custom Dept', description: 'Custom department features' },
];
```

### Configuring Dashboard Access

Edit `/client/src/config/dashboardAccess.js`:

```javascript
export const DASHBOARD_ACCESS_CONFIG = {
  // Allow specific groups to see section
  customSection: ['custom-dept', 'admin'],
  
  // Allow all users
  publicSection: ['*'],
  
  // Restrict to admins only
  adminSection: ['admin'],
};
```

### Configuring Navigation Items

Edit `/client/src/config/navigationConfig.js`:

```javascript
{
  id: 'custom-menu',
  title: 'Custom Menu',
  icon: 'mdi-star',
  requiredGroups: ['custom-dept', 'admin'], // Visible to these groups
  children: [
    // ... menu items
  ],
}
```

---

## 🐛 Troubleshooting

### Toolbar Not Visible
**Problem**: Can't see the dev toolbar at the bottom

**Solutions**:
1. ✅ Ensure you're running `npm run dev` (not production build)
2. ✅ Check you're logged in (toolbar only shows when authenticated)
3. ✅ Verify `import.meta.env.DEV` is true (check browser console)
4. ✅ Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)

### Groups Not Affecting Navigation
**Problem**: Selected groups but navigation doesn't change

**Solutions**:
1. ✅ Check NavigationSidebar is using `effectiveGroups` computed property
2. ✅ Verify navigation items have correct `requiredGroups` array
3. ✅ Check browser console for errors
4. ✅ Try toggling groups off/on again

### Dashboard Sections Not Showing
**Problem**: Simulated groups but dashboard sections still hidden

**Solutions**:
1. ✅ Verify `hasAccessToSection()` uses `getMergedGroups()`
2. ✅ Check `DASHBOARD_ACCESS_CONFIG` has correct group names
3. ✅ Ensure `userRights.value` is loaded
4. ✅ Try enabling "Admin View" to bypass and test

### Changes Not Persisting
**Problem**: Settings reset when navigating pages

**Solutions**:
- ✅ **This is expected!** Dev mode doesn't persist across page refreshes
- ✅ Settings DO persist when navigating between routes (without refresh)
- ✅ To persist: Add localStorage support to devModeStore (future enhancement)

---

## 📈 Performance

- **Minimal overhead** - Simple boolean and array checks
- **Reactive updates** - Vue's computed properties handle changes
- **No API calls** - All client-side logic
- **Tree-shakeable** - Completely removed in production builds
- **Lazy loading** - DevToolbar only loads when authenticated

---

## 🔮 Future Enhancements

### Planned Features
- [ ] **Persistent state** via localStorage
- [ ] **Quick presets** (e.g., "Finance User", "Admin", "Read-Only")
- [ ] **Group history** - Recently used groups
- [ ] **Keyboard shortcuts** (Alt+G for groups, Alt+A for admin)
- [ ] **URL parameters** - Share specific configurations
- [ ] **Export/Import** group configurations
- [ ] **Mock data** injection for testing
- [ ] **Time-travel** debugging for group changes

### Community Requests
- [ ] **Visual diff** - Show what changed with groups
- [ ] **Permission matrix** - See all groups vs features
- [ ] **Audit log** - Track dev mode usage
- [ ] **Screenshot mode** - Hide/show toolbar for docs

---

## 📚 Related Documentation

- [Navigation System](./NAVIGATION-SYSTEM.md) - Complete navigation guide
- [Dashboard Access](./dashboardAccess.js) - Access control configuration  
- [Dev Admin Mode](./DEV-ADMIN-MODE.md) - Admin toggle documentation
- [Security Guide](./security-guide.md) - Security architecture

---

## 🎓 Best Practices

### Do's ✅
- Use for UI development and testing
- Test with multiple group combinations
- Verify proper access control
- Document group requirements in code
- Clear simulated groups before testing real permissions

### Don'ts ❌
- Don't rely on dev mode for production testing
- Don't forget to test with actual permissions
- Don't assume API access follows UI visibility
- Don't leave dev mode active when committing
- Don't use as a security bypass mechanism

---

## 💡 Pro Tips

1. **Test Matrix**: Create a spreadsheet of groups vs features
2. **Quick Reset**: Use the ✕ button in toolbar to clear everything
3. **Department Switching**: Simulate switching between departments quickly
4. **Screenshot Docs**: Take screenshots with different groups for documentation
5. **Pair Testing**: Use with multiple browser windows to compare views

---

## ❓ FAQ

**Q: Why doesn't this work in production?**  
A: It's development-only by design. Production uses real group memberships only.

**Q: Can I test API calls with simulated groups?**  
A: No, the server checks actual groups. You'll get 403 errors without real membership.

**Q: Do settings persist across page refreshes?**  
A: Currently no. Settings persist when navigating between routes, but not across refreshes.

**Q: Can I create custom group presets?**  
A: Not yet, but it's on the roadmap! You can manually add groups to the store.

**Q: How do I add my own departments?**  
A: Edit `devModeStore.js` to add groups, then configure access in navigation/dashboard configs.

**Q: Does this slow down the app?**  
A: No, minimal overhead. Computed properties only recalculate when groups change.

---

**Last Updated**: October 27, 2025  
**Version**: 2.0.0  
**Author**: Development Team

**Happy testing across all departments! 🎉**
