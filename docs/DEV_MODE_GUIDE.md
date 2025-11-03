# 🔧 Development Mode Guide

## Quick Fix: Access Denied Error

If you're seeing: **"Access denied to /finance/surgical-guide-report"**, follow these steps:

---

## ✅ Solution (2 Options)

### **Option A: Enable Specific Group (Recommended)**

1. **Navigate to Dashboard** (click "Dashboard" in the sidebar)
2. **Look at the top-left** - you'll see two chips:
   - 🛡️ "Admin View: OFF"
   - 👥 "Groups (0)"
3. **Click "Groups (0)"**
4. **Check "Finance22"** in the dropdown menu
5. **Navigate back to Surgical Guide Report** - You now have access! ✅

### **Option B: Enable Admin View (Full Access)**

1. **Navigate to Dashboard**
2. **Click "Admin View: OFF"** chip
3. It will toggle to **"Admin View: ON"** (green)
4. **You now have access to ALL routes!** ✅

---

## 🎯 What Just Happened?

The router was checking your **real** Google Workspace groups but wasn't considering the **simulated** groups from dev mode. I've fixed this by:

1. ✅ Updated the router guard to check simulated groups in development mode
2. ✅ Added support for "Admin View" bypass in the router
3. ✅ Enhanced the Surgical Guide Report with a helpful dev mode banner

---

## 📋 Development Mode Features

### **Group Simulator**
- **Purpose**: Test routes that require specific group memberships
- **Available Groups**:
  - ✅ admin - Full administrative access
  - ✅ Finance22 - Surgical Guide Report access
  - ✅ Developers22 - API Documentation access
  - ✅ SWD - Software Development team
  - ✅ finance - Finance department
  - ✅ hr - Human Resources
  - ✅ And more...

### **Admin View Toggle**
- **Purpose**: Quick access to all routes without checking groups
- **When ON**: Bypasses all group-based restrictions
- **Best For**: Testing navigation and UI without group setup

### **Development Banner**
- **Shows**: Current simulated groups and admin view status
- **Color**: Yellow/warning (to remind you it's dev mode)
- **Auto-hides**: In production builds

---

## 🔐 Group Requirements by Route

| Route | Required Groups | Description |
|-------|----------------|-------------|
| `/finance/surgical-guide-report` | `admin`, `Finance22` | Surgical guide cases report |
| `/users` | `admin`, `SWD` | User management |
| `/groups` | `admin`, `SWD` | Group management |
| `/roles` | `admin` | Role management |
| `/policies` | `admin` | Policy management |
| `/finance/*` | `admin`, `finance` | Financial routes |
| `/organization/*` | `admin`, `SWD` | Organization routes |

---

## 🧪 Testing Workflow

### **Testing a Specific Route**

1. Open Dashboard
2. Click "Groups (0)"
3. Select the required group (e.g., Finance22)
4. Navigate to the route
5. Verify functionality
6. To test "Access Denied", uncheck the group

### **Testing Admin Features**

1. Enable "Admin View: ON"
2. Navigate to any admin route
3. Test all functionality
4. Disable "Admin View" to test restrictions

### **Testing Multiple Groups**

1. Click "Groups (0)"
2. Check multiple groups (e.g., Finance22 + Developers22)
3. You'll see both features:
   - Finance22: Report access ✅
   - Developers22: "API Documentation" button ✅

---

## 🎨 Visual Guide

```
┌─────────────────────────────────────────────────┐
│  Dashboard                                       │
├─────────────────────────────────────────────────┤
│                                                  │
│  [Admin View: OFF]  [Groups (0)]    [Logout]   │
│         ↓                ↓                       │
│    Click to enable   Click to open              │
│    full access       group selector             │
│                                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────┐
│  Simulate Groups             │
├─────────────────────────────┤
│  ☐ Admin                     │
│  ☐ SWD                       │
│  ☐ Finance                   │
│  ☑ Finance22  ← Check this!  │
│  ☐ Developers22              │
│  ☐ HR                        │
│                              │
│  [Reset]  0 selected         │
└─────────────────────────────┘
```

---

## 🚫 Production Safety

**All dev mode features are automatically disabled in production:**

- ❌ Group Simulator: Hidden
- ❌ Admin View Toggle: Hidden
- ❌ Dev Mode Banner: Hidden
- ✅ Real Google Workspace groups used
- ✅ Casbin policies enforced

**Check with**: `import.meta.env.DEV` returns `false` in production

---

## 🐛 Troubleshooting

### **Groups dropdown not appearing**
- **Cause**: Not in development mode
- **Fix**: Run `npm run dev` (not production build)

### **Access still denied after selecting group**
- **Cause**: Router needs to re-evaluate
- **Fix**: Navigate to Dashboard, then back to the route
- **Alternative**: Refresh the page (F5)

### **"Admin View: ON" but still denied**
- **Cause**: Route guard not updated
- **Fix**: This is now fixed! Refresh the page.

### **Changes not taking effect**
- **Cause**: Browser cache
- **Fix**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## 📝 Example: Testing Surgical Guide Report

```bash
# 1. Start dev server
cd client
npm run dev

# 2. Open browser to http://localhost:3000

# 3. Login with Google

# 4. On Dashboard:
#    - Click "Groups (0)"
#    - Check "Finance22"
#    - Badge changes to "Groups (1)"

# 5. Navigate to:
#    Finance → Surgical Guide Report

# 6. You should see:
#    ✅ Report interface
#    ✅ Date filters
#    ✅ Data table
#    ✅ Summary cards
#    ✅ Export button

# 7. If you also have Developers22:
#    - Check "Developers22" in simulator
#    - You'll see "API Documentation" button
```

---

## 💡 Pro Tips

1. **Quick Reset**: Click "Reset" in the group dropdown to clear all simulated groups
2. **Persistent State**: Simulated groups persist across page reloads (stored in Pinia)
3. **Visual Feedback**: Yellow banner shows active dev mode settings
4. **Toast Notifications**: Get feedback when adding/removing groups
5. **Console Logs**: Router logs access denials with group requirements

---

## 🎓 Best Practices

### **For Development**
- ✅ Use Group Simulator for feature-specific testing
- ✅ Use Admin View for quick navigation testing
- ✅ Test both "access granted" and "access denied" scenarios
- ✅ Clear simulated groups when testing real user experience

### **For Production**
- ✅ Verify dev mode features are hidden
- ✅ Test with real Google Workspace groups
- ✅ Ensure Casbin policies are correctly configured
- ✅ Monitor access logs for unauthorized attempts

---

## 📚 Related Documentation

- **Surgical Guide Report**: `/docs/SURGICAL_GUIDE_REPORT.md`
- **Access Control**: `/docs/security-guide.md`
- **Casbin Policies**: `/server/src/config/casbin/policy.csv`
- **Dev Mode Store**: `/client/src/stores/devMode.js`

---

## ✅ Summary

**You're now ready to use development mode!**

1. ✅ Router guard updated to support simulated groups
2. ✅ Admin View bypass implemented
3. ✅ Group simulator available in Dashboard
4. ✅ Visual feedback with dev mode banner
5. ✅ Production safety maintained

**Next Steps:**
1. Navigate to Dashboard
2. Click "Groups (0)" → Check "Finance22"
3. Go to Finance → Surgical Guide Report
4. Start testing! 🚀

---

**Need help?** Check the console logs for detailed access control information.

**Happy Testing! 🎉**
