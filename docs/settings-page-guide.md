# Settings Page Implementation Guide

## Overview

A comprehensive Settings page has been created with a Security section containing Roles & Permissions management. This follows Vue 3 + Vuetify best practices and integrates with your existing Casbin backend.

## Structure

```
Settings Page (/system/settings)
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

## Files Created

### Main Components
1. **`client/src/views/System/SettingsView.vue`** - Main settings page with tabs
2. **`client/src/components/Settings/SecuritySettings.vue`** - Security tab container
3. **`client/src/components/Settings/RolesPermissionsSection.vue`** - Roles & Permissions management
4. **`client/src/components/Settings/AccessPoliciesSection.vue`** - Access policies management
5. **`client/src/components/Settings/PermissionsMatrix.vue`** - Visual permissions grid
6. **`client/src/components/Settings/SecurityOptionsSection.vue`** - Security utilities

### Supporting Components
7. **`client/src/components/Settings/GeneralSettings.vue`** - General settings (placeholder)
8. **`client/src/components/Settings/NotificationsSettings.vue`** - Notifications (placeholder)
9. **`client/src/components/Settings/IntegrationsSettings.vue`** - Integrations (placeholder)

### Utilities
10. **`client/src/composables/useSnackbar.js`** - Snackbar notification composable

## How It Works

### 1. Accessing Settings

Navigate to: **`/system/settings`** or **`/system/settings?tab=security`**

**Route Protection:**
- Requires authentication
- Requires `admin` group membership

### 2. Security Tab - Roles & Permissions

#### Roles Management
- **View Roles**: See all available roles
- **Add Role**: Create new roles (Note: Currently placeholder - roles are managed through policies)
- **Edit Role**: Modify role details
- **Delete Role**: Remove roles
- **Search**: Filter roles by name or description

#### Permissions Matrix
1. Select a role from dropdown
2. View permissions grid (Resource × Action)
3. Toggle permissions by clicking checkboxes
4. Changes are saved immediately to database

**How Permissions Work:**
- Each checkbox represents: `Role → Resource → Action`
- Example: `admin → users → read` means admin role can read users
- Changes create/delete policies in Casbin database

### 3. Access Policies Section

#### Policy Management
- **View Policies**: Table showing all policies
- **Add Policy**: Create new policy rules
- **Edit Policy**: Modify existing policies
- **Delete Policy**: Remove policies
- **Search**: Filter policies by subject, resource, or action

**Policy Format:**
- **Subject**: Role or group name (e.g., `admin`, `SWD`)
- **Object**: Resource name (e.g., `users`, `projects`)
- **Action**: Action type (e.g., `read`, `write`, `delete`)

### 4. Security Options

#### Cache Management
- **Invalidate Cache**: Clear Casbin policy cache
- Forces reload from database on next request

#### Policy Reload
- **Reload Policies**: Reload all policies from database
- Useful after manual database changes

#### Performance Metrics
- **Cache Hit Rate**: Percentage of cache hits
- **Average Query Time**: Average database query time
- **Operation Counts**: Track policy operations

## API Integration

### Endpoints Used

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

// Cache management
POST /api/admin/casbin/cache/invalidate

// Reload policies
POST /api/admin/casbin/reload

// Get metrics
GET /api/admin/casbin/metrics
```

## Best Practices Implemented

### ✅ Component Architecture
- **Separation of Concerns**: Each section in its own component
- **Reusability**: Components can be used independently
- **Props Down, Events Up**: Proper Vue 3 patterns

### ✅ State Management
- **Local State**: Component-specific state with `ref()`
- **API State**: Loading/error states handled properly
- **Reactive Updates**: UI updates automatically on data changes

### ✅ User Experience
- **Loading States**: Progress indicators during API calls
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Snackbar notifications for actions
- **Confirmation Dialogs**: Confirm destructive actions
- **Search/Filter**: Easy to find items in large lists

### ✅ Security
- **Route Protection**: Admin-only access
- **Backend Validation**: All requests validated server-side
- **Permission Checks**: Verify user has admin access

### ✅ Performance
- **Lazy Loading**: Data loaded on component mount
- **Efficient Rendering**: Only render visible items
- **Caching**: Use Casbin cache for faster operations

## Usage Examples

### Adding a Policy

1. Go to Settings → Security tab
2. Scroll to "Access Policies" section
3. Click "Add Policy" button
4. Fill in:
   - **Subject**: `admin` (role/group)
   - **Object**: `users` (resource)
   - **Action**: `read` (action)
5. Click "Create"
6. Policy is saved to database immediately

### Managing Permissions via Matrix

1. Go to Settings → Security tab
2. Scroll to "Permissions Matrix"
3. Select a role from dropdown (e.g., `admin`)
4. View the grid showing all resources and actions
5. Click checkbox to grant/revoke permission
6. Changes saved automatically

### Invalidating Cache

1. Go to Settings → Security tab
2. Scroll to "Security Options"
3. Click "Invalidate Cache"
4. Cache is cleared, next request will reload from database

## Data Flow

```
User Action (Click/Input)
  ↓
Component Event Handler
  ↓
API Service Call
  ↓
Backend API Endpoint
  ↓
Casbin Service
  ↓
Database (MySQL)
  ↓
Response
  ↓
Component State Update
  ↓
UI Re-render
  ↓
User Feedback (Snackbar)
```

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

## Future Enhancements

1. **Bulk Operations**: Select multiple policies for bulk delete
2. **Import/Export**: Import/export policies as JSON/CSV
3. **Audit Log**: Show change history for policies
4. **Role Templates**: Pre-defined role templates
5. **Permission Testing**: Test permissions before saving
6. **Role Hierarchy**: Support role inheritance

## Testing Checklist

- [ ] Settings page loads correctly
- [ ] Security tab displays properly
- [ ] Roles list loads from API
- [ ] Policies list loads from API
- [ ] Can add new policy
- [ ] Can edit existing policy
- [ ] Can delete policy
- [ ] Permissions matrix displays correctly
- [ ] Can toggle permissions in matrix
- [ ] Cache invalidation works
- [ ] Policy reload works
- [ ] Metrics display correctly
- [ ] Error handling works
- [ ] Loading states display
- [ ] Search/filter works
- [ ] Admin-only access enforced

## Summary

The Settings page provides a comprehensive interface for managing:
- ✅ Roles and their descriptions
- ✅ Permissions via visual matrix
- ✅ Access policies (CRUD operations)
- ✅ Cache management
- ✅ Performance monitoring

All operations are integrated with your Casbin database backend and follow Vue 3 + Vuetify best practices!

