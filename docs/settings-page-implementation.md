# Settings Page Implementation Guide

## Overview

This document outlines the proper way to implement a Settings page with a Security section containing Roles & Permissions management.

## Architecture

### Structure
```
Settings Page
├── Tabs Navigation
│   ├── General
│   ├── Security ⭐ (Our focus)
│   │   ├── Roles & Permissions
│   │   ├── Access Policies
│   │   └── Security Options
│   ├── Notifications
│   └── Integrations
└── Content Area (Tab Panels)
```

### Components Hierarchy
```
SettingsView.vue (Main Page)
└── SecuritySettings.vue (Security Tab Content)
    ├── RolesPermissionsSection.vue
    │   ├── RolesList.vue
    │   └── PermissionsMatrix.vue
    └── AccessPoliciesSection.vue
        ├── PoliciesList.vue
        └── PolicyEditor.vue
```

## Best Practices

### 1. Component Organization
- **Separate concerns**: Each section in its own component
- **Reusable components**: Create shared components for common patterns
- **Props down, events up**: Follow Vue 3 composition API patterns

### 2. State Management
- **Local state**: Use `ref()` for component-specific state
- **Shared state**: Use Pinia stores for cross-component data
- **API state**: Use composables for API calls

### 3. API Integration
- **Service layer**: Use `apiService` from `@/services/api`
- **Error handling**: Consistent error handling with user feedback
- **Loading states**: Show loading indicators during API calls
- **Optimistic updates**: Update UI immediately, rollback on error

### 4. User Experience
- **Validation**: Client-side validation before API calls
- **Feedback**: Success/error messages for all actions
- **Confirmation**: Confirm destructive actions (delete, remove)
- **Auto-save**: Save changes automatically or with explicit save button

### 5. Security
- **Permission checks**: Verify user has admin access
- **Route guards**: Protect routes with `requiredGroups: ['admin']`
- **API validation**: Backend validates all requests

## Implementation Steps

### Step 1: Create Main Settings Page
- Tabbed interface using Vuetify `v-tabs`
- Route: `/settings` or `/system/settings`
- Meta: `requiresAuth: true, requiredGroups: ['admin']`

### Step 2: Create Security Settings Component
- Security-specific settings
- Sub-sections for different security features
- Roles & Permissions as primary section

### Step 3: Create Roles & Permissions Component
- Display roles list
- Display permissions matrix
- Add/Edit/Delete roles
- Assign permissions to roles

### Step 4: Create Access Policies Component
- Display policies list
- Add/Edit/Delete policies
- Test policy enforcement
- Policy validation

### Step 5: API Integration
- Connect to existing backend APIs
- Handle loading/error states
- Implement CRUD operations

### Step 6: Testing
- Test all CRUD operations
- Test permission checks
- Test error handling
- Test UI responsiveness

## API Endpoints Used

### Roles & Permissions
- `GET /api/admin/users` - Get all users, groups, roles
- `GET /api/admin/policies` - Get all policies
- `POST /api/admin/policies` - Add policy
- `DELETE /api/admin/policies` - Remove policy
- `POST /api/admin/users/groups` - Add user to group
- `DELETE /api/admin/users/groups` - Remove user from group

### Casbin Management
- `GET /api/admin/casbin/metrics` - Get performance metrics
- `POST /api/admin/casbin/cache/invalidate` - Invalidate cache
- `POST /api/admin/casbin/reload` - Reload policies

## Component Props & Events

### RolesPermissionsSection
**Props:**
- `roles: Array` - List of roles
- `policies: Array` - List of policies
- `loading: Boolean` - Loading state

**Events:**
- `@role-added` - Role added
- `@role-updated` - Role updated
- `@role-deleted` - Role deleted
- `@permission-changed` - Permission changed

### AccessPoliciesSection
**Props:**
- `policies: Array` - List of policies
- `loading: Boolean` - Loading state

**Events:**
- `@policy-added` - Policy added
- `@policy-updated` - Policy updated
- `@policy-deleted` - Policy deleted

## Data Flow

```
User Action
  ↓
Component Event
  ↓
API Service Call
  ↓
Backend API
  ↓
Casbin Service
  ↓
Database Update
  ↓
Response
  ↓
UI Update
```

## Error Handling

1. **Network Errors**: Show user-friendly message
2. **Validation Errors**: Show field-specific errors
3. **Permission Errors**: Redirect to unauthorized page
4. **Server Errors**: Show generic error with retry option

## Performance Considerations

1. **Lazy Loading**: Load data on tab activation
2. **Pagination**: Paginate large lists
3. **Debouncing**: Debounce search/filter inputs
4. **Caching**: Cache API responses where appropriate
5. **Virtual Scrolling**: Use for large lists

## Accessibility

1. **Keyboard Navigation**: Full keyboard support
2. **ARIA Labels**: Proper labels for screen readers
3. **Focus Management**: Manage focus on modals/dialogs
4. **Color Contrast**: Ensure sufficient contrast

## Future Enhancements

1. **Bulk Operations**: Select multiple items for bulk actions
2. **Import/Export**: Import/export roles and policies
3. **Audit Log**: Show change history
4. **Templates**: Pre-defined role templates
5. **Role Hierarchy**: Support role inheritance

