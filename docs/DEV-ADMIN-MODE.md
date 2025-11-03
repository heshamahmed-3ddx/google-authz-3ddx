# 🔧 Development Admin Mode

## Overview

The Development Admin Mode is a special feature that allows developers to view **all dashboard sections** without needing to be in specific Google Workspace groups (like `SWD`, `admin`, or `developers`).

This is particularly useful for:
- **Testing UI changes** across all dashboard sections
- **Viewing restricted content** during development
- **Debugging access control** without modifying groups
- **Demonstrating features** to stakeholders

---

## 🎯 Features

### Toggle Button
- Located in the **top-left corner** of the dashboard
- Only visible in **development mode** (`npm run dev`)
- **Automatically hidden** in production builds

### Visual Indicators
- **Green chip** when admin mode is ON
- **Warning banner** at the top of the page
- **Eye icon** changes based on state (👁️ ON / 👁️‍🗨️ OFF)
- **Hover tooltip** explaining the feature

### What It Unlocks
When enabled, you gain access to:
1. ✅ **User Rights & Permissions** section
2. ✅ **Technical Information** section
3. ✅ **API Documentation** section
4. ✅ Any future admin-restricted sections

---

## 🚀 How to Use

### Step 1: Start Development Server
```bash
cd client
npm run dev
```

### Step 2: Login to Dashboard
Navigate to your application and authenticate with your Google account.

### Step 3: Toggle Admin Mode
1. Look for the **chip/button** in the top-left corner of the dashboard
2. It should say **"Admin View: OFF"**
3. Click the chip to toggle to **"Admin View: ON"**
4. A success toast will appear: _"Admin View Enabled - All sections visible"_

### Step 4: View Admin Sections
Scroll down the dashboard to see:
- **User Rights & Permissions** card (previously hidden)
- **Technical Information** card (with raw JSON data)
- **API Documentation** card (Swagger & JSDoc links)

### Step 5: Disable When Done
Click the toggle chip again or use the **"Disable"** button in the warning banner.

---

## 🔒 Security

### Production Safety
- ✅ **Completely disabled** in production builds
- ✅ Only checks `import.meta.env.DEV` (Vite environment variable)
- ✅ No backend bypass - only affects UI visibility
- ✅ Actual API authorization still enforced server-side

### Important Notes
> ⚠️ **This does NOT bypass actual authorization checks!**
> 
> The development admin mode only shows UI sections that would normally be hidden. If you try to access restricted API endpoints, you'll still get authorization errors if you don't have the proper groups.

### What It Does
- ✅ Shows restricted UI sections
- ✅ Allows testing frontend components
- ✅ Helps with development workflow

### What It Does NOT Do
- ❌ Bypass Casbin authorization policies
- ❌ Grant actual permissions to restricted resources
- ❌ Modify your Google Workspace groups
- ❌ Work in production builds

---

## 🎨 Visual Design

### OFF State
```
┌─────────────────────────────┐
│ 👁️‍🗨️ Admin View: OFF      │ ← Gray chip
└─────────────────────────────┘
```

### ON State
```
┌─────────────────────────────┐
│ 👁️ Admin View: ON         │ ← Green chip with elevation
└─────────────────────────────┘

⚠️ Development Admin Mode Active
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are viewing all dashboard sections...
                    [Disable] ← Warning banner
```

---

## 🧪 Testing Scenarios

### Test 1: Normal User Without Admin Groups
1. Login with a regular Google account
2. Observe that restricted sections are hidden
3. Enable admin mode → Sections appear
4. Disable admin mode → Sections disappear again

### Test 2: User With SWD Group
1. Login with account in `SWD` group
2. Sections are already visible (no admin mode needed)
3. Admin mode toggle still works but has no effect

### Test 3: Production Build
1. Build for production: `npm run build`
2. Serve production build: `npm run preview`
3. Login to dashboard
4. Verify toggle chip is **not visible**

---

## 📝 Code Implementation

### Key Files Modified

#### `DashboardView.vue` - Component Changes
```javascript
// Development mode detection
const isDevelopment = import.meta.env.DEV;
const devAdminMode = ref(false);

// Toggle function
function toggleDevAdminMode() {
  devAdminMode.value = !devAdminMode.value;
  showToast(
    devAdminMode.value 
      ? 'Admin View Enabled - All sections visible' 
      : 'Admin View Disabled - Normal permissions applied',
    devAdminMode.value ? 'success' : 'info'
  );
}

// Access control check (modified)
const hasAccessToSection = (section) => {
  // Grant access in dev admin mode
  if (isDevelopment && devAdminMode.value) {
    return true;
  }
  
  // Original logic continues...
};
```

#### Template Changes
```vue
<!-- Toggle Chip (only in development) -->
<v-chip
  v-if="isDevelopment"
  :color="devAdminMode ? 'success' : 'default'"
  @click="toggleDevAdminMode"
>
  {{ devAdminMode ? 'Admin View: ON' : 'Admin View: OFF' }}
</v-chip>

<!-- Warning Banner (when enabled) -->
<v-alert v-if="devAdminMode" type="warning">
  Development Admin Mode Active
</v-alert>
```

---

## 🔍 Troubleshooting

### Toggle Button Not Visible
**Problem**: Can't see the admin mode toggle chip
**Solutions**:
1. ✅ Ensure you're running development server (`npm run dev`)
2. ✅ Check you're not using production build
3. ✅ Verify you're logged in (chip only shows after auth)
4. ✅ Try hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Sections Still Not Visible
**Problem**: Enabled admin mode but sections still hidden
**Solutions**:
1. ✅ Check browser console for errors
2. ✅ Verify `userRights.value` is loaded
3. ✅ Ensure components are mounted
4. ✅ Try disabling and re-enabling the toggle

### Toggle Works But API Calls Fail
**Problem**: Can see sections but get 403 errors on actions
**Solutions**:
- ✅ **This is expected behavior!**
- ✅ The toggle only affects UI visibility
- ✅ To test API calls, you need actual group membership
- ✅ Or modify server-side policies temporarily

---

## 🎯 Use Cases

### 1. UI Development
```
Scenario: Building new admin-only dashboard section
Benefits: 
  - Don't need to modify groups in Google Workspace
  - Fast iteration without switching accounts
  - Test responsive design for all sections
```

### 2. Client Demonstrations
```
Scenario: Showing features to stakeholders
Benefits:
  - Demonstrate admin features without admin account
  - Quick toggle between user/admin views
  - No need to logout/login between accounts
```

### 3. Bug Testing
```
Scenario: Reproducing issue in restricted section
Benefits:
  - Quickly access problematic section
  - Compare behavior between modes
  - Test with your own data
```

### 4. Documentation Screenshots
```
Scenario: Creating user guides with screenshots
Benefits:
  - Capture all sections easily
  - No need for multiple accounts
  - Consistent test data
```

---

## 📊 Comparison Table

| Feature | Normal Mode | Dev Admin Mode | Production |
|---------|-------------|----------------|------------|
| Toggle Visible | ❌ | ✅ | ❌ |
| View Restricted Sections | ❌ | ✅ | ❌ |
| API Authorization | ✅ | ✅ | ✅ |
| Group Membership Required | ✅ | ❌ | ✅ |
| Backend Protection | ✅ | ✅ | ✅ |

---

## 🚦 Best Practices

### ✅ DO
- Use for UI development and testing
- Enable when building new features
- Use for demonstrations
- Document behaviors you observe
- Disable when testing actual authorization

### ❌ DON'T
- Rely on it for production testing
- Forget to test with real permissions
- Use as a security bypass
- Leave enabled when not needed
- Commit code that assumes it's always on

---

## 🔮 Future Enhancements

### Planned Features
- [ ] **Persistent state** across page refreshes (localStorage)
- [ ] **Quick group simulation** (simulate being in specific groups)
- [ ] **Permission preview** (show what would be visible in production)
- [ ] **Keyboard shortcut** (e.g., Ctrl+Shift+A to toggle)
- [ ] **Admin mode history** (track when/how long it was enabled)

### Potential Additions
- [ ] **Mock data injection** for testing
- [ ] **Feature flags override** panel
- [ ] **Time-based access simulation** (future-dated permissions)
- [ ] **Multi-role simulation** (test combined permissions)

---

## 📚 Related Documentation

- [Dashboard Access Configuration](./dashboardAccess.js) - Access control setup
- [Navigation System](./NAVIGATION-SYSTEM.md) - Permission-based navigation
- [Security Guide](./security-guide.md) - Overall security architecture
- [Development Guide](./getting-started.md) - Setup and development workflow

---

## 🎓 Technical Details

### Environment Detection
```javascript
// Vite environment variable
const isDevelopment = import.meta.env.DEV;

// Returns:
// - true in development (npm run dev)
// - false in production (npm run build)
```

### Reactivity Chain
```
User clicks chip
    ↓
toggleDevAdminMode() called
    ↓
devAdminMode.value = !devAdminMode.value
    ↓
hasAccessToSection() recomputes
    ↓
canViewUserRights, canViewTechnicalInfo, etc. recompute
    ↓
v-if directives re-evaluate
    ↓
Sections show/hide
```

### Performance Impact
- ✅ **Minimal** - Single boolean check
- ✅ **No API calls** triggered by toggle
- ✅ **Reactive** - Vue's computed properties handle updates
- ✅ **Tree-shakeable** - Code removed in production builds

---

## 💡 Pro Tips

1. **Keyboard Shortcut**: Consider adding `Alt+Shift+A` to quickly toggle
2. **Browser DevTools**: Use Vue DevTools to inspect `devAdminMode` ref
3. **Testing Matrix**: Create checklist of sections to verify with toggle
4. **Screenshot Mode**: Enable all sections for documentation photos
5. **Pair with Storybook**: Use alongside component stories for full testing

---

## ❓ FAQ

**Q: Will this work in production?**  
A: No, the toggle is completely hidden in production builds.

**Q: Can I still get authorization errors?**  
A: Yes! This only affects UI visibility, not actual API authorization.

**Q: Does it persist across refreshes?**  
A: Currently no, but this could be added with localStorage.

**Q: Can I simulate specific groups?**  
A: Not yet, but this is a planned enhancement.

**Q: Is it secure?**  
A: Yes, it only affects frontend visibility. Backend authorization is unchanged.

---

**Last Updated**: October 27, 2025  
**Version**: 1.0.0  
**Author**: Development Team

**Happy developing! 🚀**
