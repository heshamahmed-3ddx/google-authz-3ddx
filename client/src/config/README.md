# Dashboard Access Control Configuration

## Overview

The `dashboardAccess.js` file provides a centralized, dynamic configuration system for controlling which user groups have access to different sections of the dashboard.

## Features

- **Centralized Configuration**: All access rules in one place
- **Dynamic Access Control**: Easily modify access without changing component code
- **Group-Based Permissions**: Support for multiple Google Workspace groups
- **Universal Access**: Use `'*'` to allow all authenticated users
- **Extensible**: Easy to add new sections as the application grows

## Configuration File Location

```
client/src/config/dashboardAccess.js
```

## How It Works

### 1. Define Access Rules

In `dashboardAccess.js`, the `DASHBOARD_ACCESS_CONFIG` object defines which groups can access each section:

```javascript
export const DASHBOARD_ACCESS_CONFIG = {
  // All users can access
  userDetails: ['*'],
  
  // Only specific groups can access
  userRights: ['SWD', 'admin', 'developers'],
  technicalInfo: ['SWD', 'admin', 'developers'],
  apiDocumentation: ['SWD', 'admin', 'developers'],
};
```

### 2. Special Values

- **`'*'`**: Universal access - all authenticated users can view this section
- **`['group1', 'group2']`**: Restricted access - only users in these groups can view
- **`[]`**: No access - denies all users (useful for disabling sections temporarily)

### 3. Available Sections

#### Basic User Information (Default: Open to All)
- `userDetails` - User Details & Organization
- `employeeInfo` - Employee Information
- `contactInfo` - Contact Information  
- `groups` - Google Workspace Groups

#### Advanced Features (Default: Restricted)
- `userRights` - User Rights & Permissions (Casbin authorization)
- `technicalInfo` - Technical User Info (Raw JSON data)
- `apiDocumentation` - API Documentation (Swagger & JSDoc)

## Usage Examples

### Allow Only Admin Group

```javascript
userRights: ['admin']
```

### Allow Multiple Groups

```javascript
technicalInfo: ['SWD', 'admin', 'developers', 'security-team']
```

### Allow All Authenticated Users

```javascript
userDetails: ['*']
```

### Temporarily Disable a Section

```javascript
apiDocumentation: []  // No one can access
```

## Making Changes

### To Add a New Group to Existing Section

1. Open `client/src/config/dashboardAccess.js`
2. Find the section you want to modify
3. Add the group name to the array:

```javascript
// Before
userRights: ['SWD', 'admin'],

// After
userRights: ['SWD', 'admin', 'new-group'],
```

### To Remove a Group

Simply remove the group name from the array:

```javascript
// Before
technicalInfo: ['SWD', 'admin', 'developers'],

// After
technicalInfo: ['SWD', 'admin'],  // developers removed
```

### To Add a New Dashboard Section

1. Add the section to `DASHBOARD_ACCESS_CONFIG`:

```javascript
export const DASHBOARD_ACCESS_CONFIG = {
  // ... existing sections ...
  
  /**
   * New Analytics Dashboard
   */
  analytics: ['admin', 'managers'],
};
```

2. Add a computed property in `DashboardView.vue`:

```javascript
const canViewAnalytics = computed(() => hasAccessToSection('analytics'));
```

3. Use the computed property in your template:

```vue
<v-card v-if="canViewAnalytics">
  <!-- Analytics content -->
</v-card>
```

## Helper Functions

### `getRequiredGroupsForRestrictedAccess()`

Returns an array of all groups that have access to restricted features:

```javascript
const groups = getRequiredGroupsForRestrictedAccess();
// Returns: ['SWD', 'admin', 'developers']
```

### `isSectionRestricted(section)`

Check if a section is restricted (not open to all):

```javascript
const isRestricted = isSectionRestricted('userRights');
// Returns: true
```

### `getRestrictedSections()`

Get all restricted section names:

```javascript
const restricted = getRestrictedSections();
// Returns: ['userRights', 'technicalInfo', 'apiDocumentation']
```

## Group Name Requirements

- Group names must match **exactly** with Google Workspace group names
- Names are **case-sensitive**
- Use the group's **display name** or **email prefix**
- The backend `/api/user/rights` endpoint provides the user's groups

## Testing Access Control

### View Current User's Groups

1. Log in to the dashboard
2. View the "Groups" section in User Details & Organization
3. Or check browser console: `userRights.value.groups`

### Test Different Group Access

1. Add/remove user from groups in Google Workspace Admin Console
2. Log out and log back in to refresh group membership
3. Verify section visibility changes accordingly

## Access Restriction Notice

When users have restricted access, they see an informative alert showing:
- Which sections they cannot access
- Which groups they need to join for access

This is automatically generated from the configuration.

## Best Practices

1. **Document Your Changes**: Add comments explaining why specific groups have access
2. **Use Descriptive Group Names**: Make it clear what each group represents
3. **Keep Security in Mind**: Restrict sensitive sections appropriately
4. **Test After Changes**: Verify access control works as expected
5. **Version Control**: Always commit configuration changes with clear messages

## Troubleshooting

### User Can't See a Section They Should

1. Check if user is in the correct Google Workspace group
2. Verify group name in configuration matches exactly
3. Ensure user has logged out and back in (groups are cached)
4. Check browser console for `userRights.value.groups`

### Section Visible to Wrong Users

1. Check configuration for typos in group names
2. Verify you're using an array, not a string: `['admin']` not `'admin'`
3. Ensure `'*'` is only used for public sections

### Changes Not Taking Effect

1. Clear browser cache and hard reload (Cmd/Ctrl + Shift + R)
2. Ensure you're editing the correct file
3. Check for JavaScript syntax errors in the configuration
4. Restart the development server

## Security Considerations

- **Backend Validation**: The configuration controls UI visibility only. Always enforce permissions on the backend.
- **Sensitive Data**: Restrict sections containing PII or technical details
- **Regular Audits**: Review access permissions periodically
- **Least Privilege**: Grant access only to groups that need it

## Future Enhancements

Potential improvements for this system:

- Role-based access in addition to group-based
- Time-based access restrictions
- User-level overrides for specific cases
- Access logging and audit trail
- UI for administrators to modify configuration
- Export/import configuration as JSON

## Support

For questions or issues:
1. Check this README
2. Review `dashboardAccess.js` comments
3. Consult the development team
4. File an issue in the project repository
