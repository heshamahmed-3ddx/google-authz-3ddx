# Settings Page Guide

## Overview

The Settings page provides a comprehensive interface for managing system settings, with a focus on Security settings including Roles & Permissions management.

## Access

**Route:** `/system/settings` or `/system/settings?tab=security`

**Access Control:**
- **View:** All authenticated users
- **Edit:** Admin users only (non-admins see read-only mode)

## Page Structure

```
Settings Page
├── General Tab
├── Security Tab ⭐
│   ├── Roles & Permissions Section
│   │   ├── Roles List (View/Add/Edit/Delete)
│   │   └── Permissions Matrix (Visual grid)
│   ├── Access Policies Section
│   │   └── Policies Table (View/Add/Edit/Delete)
│   └── Security Options Section
│       ├── Cache Management
│       ├── Policy Reload
│       └── Performance Metrics
├── Notifications Tab
└── Integrations Tab
```

## Security Tab

### Roles & Permissions Section

#### Viewing Roles

The roles list displays all available roles in the system:

- **Role Name**: The name of the role
- **Description**: Optional description of the role
- **Actions**: Edit and Delete buttons (admin only)

#### Adding a Role

1. Click "Add Role" button (admin only)
2. Fill in:
   - **Role Name**: Required
   - **Description**: Optional
3. Click "Create"

#### Editing a Role

1. Click the edit icon next to the role
2. Modify the role name or description
3. Click "Update"

#### Deleting a Role

1. Click the delete icon next to the role
2. Confirm deletion in the dialog
3. Role is removed from the system

#### Permissions Matrix

The permissions matrix provides a visual way to manage role permissions:

1. **Select a Role**: Choose a role from the dropdown
2. **View Permissions**: See a grid of Resources × Actions
3. **Toggle Permissions**: Click checkboxes to grant/revoke permissions
4. **Auto-Save**: Changes are saved immediately

**Permission Format:**
- **Resource**: The object/resource (e.g., `users`, `projects`)
- **Action**: The action type (e.g., `read`, `write`, `delete`)

### Access Policies Section

#### Viewing Policies

Policies are displayed in a table showing:
- **Subject**: Role or group name
- **Resource**: The resource being accessed
- **Action**: The action allowed

#### Adding a Policy

1. Click "Add Policy" button (admin only)
2. Fill in:
   - **Subject**: Select role/group from dropdown
   - **Object**: Enter resource name
   - **Action**: Select action from dropdown
3. Click "Create"

#### Editing a Policy

1. Click the edit icon in the policies table
2. Modify the policy details
3. Click "Update"

#### Deleting a Policy

1. Click the delete icon in the policies table
2. Confirm deletion
3. Policy is removed

### Security Options Section

**Admin Only** - This section is only visible to administrators.

#### Cache Management

- **Invalidate Cache**: Clears the Casbin policy cache
- Forces reload from database on next request

#### Policy Reload

- **Reload Policies**: Reloads all policies from database
- Useful after manual database changes

#### Performance Metrics

Displays:
- **Cache Hit Rate**: Percentage of cache hits
- **Average Query Time**: Average database query time
- **Policies Loaded**: Count of policy load operations
- **Policies Saved**: Count of policy save operations

## API Endpoints

### Roles & Permissions

```javascript
// Get roles and groups
GET /api/admin/users
Response: { data: { roles: [...], groups: [...] } }

// Get policies
GET /api/admin/policies
Response: { data: { policies: [[subject, object, action], ...] } }

// Add policy
POST /api/admin/policies
Body: { subject, object, action }

// Delete policy
DELETE /api/admin/policies
Body: { subject, object, action }
```

### Casbin Management

```javascript
// Cache management
POST /api/admin/casbin/cache/invalidate

// Reload policies
POST /api/admin/casbin/reload

// Get metrics
GET /api/admin/casbin/metrics
Response: { data: { metrics: {...} } }
```

## View-Only Mode (Non-Admins)

When a non-admin user accesses the Settings page:

- ✅ Can view all roles and policies
- ✅ Can browse permissions matrix
- ❌ Cannot make any changes
- ❌ Edit buttons are hidden
- ❌ "View Only Mode" indicator is displayed

## Components

### Main Components

- **`SettingsView.vue`** - Main settings page with tabs
- **`SecuritySettings.vue`** - Security tab container
- **`RolesPermissionsSection.vue`** - Roles & Permissions management
- **`AccessPoliciesSection.vue`** - Access policies management
- **`PermissionsMatrix.vue`** - Visual permissions grid
- **`SecurityOptionsSection.vue`** - Security utilities

## Best Practices

1. **Test Changes**: Always test policy changes before applying to production
2. **Document Policies**: Add descriptions to roles for clarity
3. **Review Regularly**: Periodically review and audit policies
4. **Use Groups**: Prefer groups over individual user policies
5. **Cache Management**: Invalidate cache after bulk policy changes

## Troubleshooting

### Policies Not Loading

**Check:**
1. User has admin access
2. Backend API is running
3. Database connection is active
4. Check browser console for errors

### Permissions Not Saving

**Check:**
1. Backend API endpoint is working
2. Database connection is active
3. User has admin permissions
4. Check network tab for API errors

### Cache Not Invalidating

**Check:**
1. Enhanced adapter is enabled
2. Backend endpoint exists: `/api/admin/casbin/cache/invalidate`
3. Check server logs for errors

## Related Documentation

- [Compact UI Style Guide](./compact-ui-style-guide.md)
- [Casbin User Management](./casbin-user-management.md)
- [Usage Guides](./usage-guides.md)

