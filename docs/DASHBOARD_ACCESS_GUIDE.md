# Quick Guide: Modifying Dashboard Access

## 🚀 Quick Start

### Change Who Can See "User Rights & Permissions"

**File**: `client/src/config/dashboardAccess.js`

```javascript
// Current configuration (line ~44)
userRights: ['SWD', 'admin', 'developers'],

// To add 'managers' group:
userRights: ['SWD', 'admin', 'developers', 'managers'],

// To allow only 'admin':
userRights: ['admin'],

// To allow everyone:
userRights: ['*'],
```

## 📋 Common Scenarios

### Scenario 1: New Team Needs Access
**Requirement**: Give the "qa-team" group access to all restricted sections

```javascript
userRights: ['SWD', 'admin', 'developers', 'qa-team'],
technicalInfo: ['SWD', 'admin', 'developers', 'qa-team'],
apiDocumentation: ['SWD', 'admin', 'developers', 'qa-team'],
```

### Scenario 2: Separate Access Levels
**Requirement**: Developers see API docs but not user rights

```javascript
userRights: ['admin'],                              // Only admins
technicalInfo: ['admin', 'developers'],              // Admins and devs
apiDocumentation: ['admin', 'developers', 'support'], // Most groups
```

### Scenario 3: Make Everything Public
**Requirement**: Open dashboard to all authenticated users

```javascript
userDetails: ['*'],
employeeInfo: ['*'],
contactInfo: ['*'],
groups: ['*'],
userRights: ['*'],           // Changed from restricted
technicalInfo: ['*'],         // Changed from restricted
apiDocumentation: ['*'],      // Changed from restricted
```

### Scenario 4: Temporarily Disable a Section
**Requirement**: Hide API Documentation while updating

```javascript
apiDocumentation: [],  // Empty array = no access for anyone
```

## 🎯 Step-by-Step: Adding a New Group

### Example: Add "security-team" to restricted sections

1. **Open the configuration file**
   ```bash
   code client/src/config/dashboardAccess.js
   ```

2. **Find the section to modify** (around line 44-60)
   ```javascript
   userRights: ['SWD', 'admin', 'developers'],
   ```

3. **Add your group**
   ```javascript
   userRights: ['SWD', 'admin', 'developers', 'security-team'],
   ```

4. **Save the file** (Cmd/Ctrl + S)

5. **Refresh the browser** - Changes take effect immediately!

## 🔍 How to Find Group Names

### Method 1: Check Google Workspace Admin
1. Go to [Google Workspace Admin Console](https://admin.google.com)
2. Navigate to **Directory** > **Groups**
3. Find your group and copy the name

### Method 2: Check Dashboard
1. Log in as a user in that group
2. Scroll to **Groups** section in dashboard
3. The group name is shown in the table

### Method 3: Check User Rights Response
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Look for `/api/user/rights` request
4. Check response: `data.groups` array

## 🛠️ Configuration Template

Copy this template for new sections:

```javascript
/**
 * [Section Name]
 * [Brief description of what this section shows]
 * Access: [Who should see this and why]
 */
sectionName: ['group1', 'group2'],
```

**Example**:
```javascript
/**
 * Audit Logs Section
 * Shows system audit trail and user activity logs
 * Access: Security and compliance teams only
 */
auditLogs: ['admin', 'security-team', 'compliance'],
```

## ⚠️ Important Notes

- **Group names are case-sensitive**: `'Admin'` ≠ `'admin'`
- **Use exact names**: Must match Google Workspace group names exactly
- **Save changes**: File must be saved for changes to apply
- **Restart not needed**: Changes are hot-reloaded in development
- **Backend security**: This only controls UI - backend must also enforce permissions

## 🧪 Testing Your Changes

### Test as Different User
1. Add/remove user from group in Google Workspace
2. Log out of dashboard
3. Log back in (groups are fetched on login)
4. Verify section visibility

### Test Access Restriction Notice
1. Log in as user without restricted groups
2. Should see blue alert explaining limited access
3. Alert shows which groups are needed

### Check Browser Console
```javascript
// View current user's groups
console.log(userRights.value.groups)

// Check if user can access a section
console.log(hasAccessToSection('userRights'))
```

## 📊 Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│  dashboardAccess.js                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  export const DASHBOARD_ACCESS_CONFIG = {               │
│    // Public sections                                   │
│    userDetails: ['*'],        ← Everyone                │
│    employeeInfo: ['*'],       ← Everyone                │
│                                                          │
│    // Restricted sections                               │
│    userRights: ['SWD', 'admin'],  ← Only these groups   │
│    technicalInfo: ['admin'],      ← Only admin          │
│  };                                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────────┐
│  User's Groups: ['users', 'SWD']                        │
├─────────────────────────────────────────────────────────┤
│  ✅ userDetails       (allowed by '*')                  │
│  ✅ employeeInfo      (allowed by '*')                  │
│  ✅ userRights        (user has 'SWD' group)            │
│  ❌ technicalInfo     (user doesn't have 'admin')       │
└─────────────────────────────────────────────────────────┘
```

## 🚨 Common Mistakes

### ❌ Wrong: Using string instead of array
```javascript
userRights: 'admin'  // This won't work!
```

### ✅ Correct: Always use array
```javascript
userRights: ['admin']  // Correct!
```

### ❌ Wrong: Typo in group name
```javascript
userRights: ['SWd', 'Admin']  // Case matters!
```

### ✅ Correct: Exact group name
```javascript
userRights: ['SWD', 'admin']  // Matches exactly
```

## 💡 Pro Tips

1. **Start Restrictive**: Begin with limited access, expand as needed
2. **Document Why**: Add comments explaining access decisions
3. **Regular Review**: Audit group access quarterly
4. **Test First**: Try changes in development before production
5. **Use Git**: Commit configuration changes separately with clear messages

## 📞 Need Help?

- **Can't find group name?** Check Google Workspace Admin or dashboard Groups section
- **Changes not working?** Clear browser cache and hard reload
- **User should have access but doesn't?** Verify they're in the group and logged in recently
- **Want to add new section?** See full README.md for step-by-step guide

---

**Last Updated**: October 27, 2025
**Configuration File**: `client/src/config/dashboardAccess.js`
