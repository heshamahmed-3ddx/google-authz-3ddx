# Casbin User Management Guide

## Overview

This guide explains how to manage users in the Google OAuth Authorization system using Casbin for role-based access control (RBAC). The system uses a JSON-based user configuration that defines user permissions, groups, and organizational structure.

## User Configuration Structure

### File Location
The user configuration is stored in:
```
server/src/config/casbin/users.json
```

### User Object Structure

Each user in the system follows this JSON structure:

```json
{
  "email": "user@example.com",
  "fullName": "User Full Name",
  "groups": ["group1", "group2"],
  "orgUnit": "Department/Team",
  "roles": ["role1", "role2"],
  "twoStepEnabled": true,
  "department": "Department Name"
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | User's email address (primary identifier) |
| `fullName` | string | ✅ | User's display name |
| `groups` | array | ✅ | Groups the user belongs to (used for permissions) |
| `orgUnit` | string | ✅ | Organizational unit path |
| `roles` | array | ✅ | User roles within the organization |
| `twoStepEnabled` | boolean | ✅ | Whether 2FA is enabled for the user |
| `department` | string | ✅ | Department name for organizational grouping |

## Adding Users for Admin Testing

### Example: Adding a Test Admin User

To test admin features, add a user with admin privileges:

```json
{
  "email": "testadmin@yourdomain.com",
  "fullName": "Test Administrator",
  "groups": ["admin", "engineering"],
  "orgUnit": "IT/Administration",
  "roles": ["admin", "system-admin"],
  "twoStepEnabled": true,
  "department": "IT"
}
```

### Example: Adding a Regular User

To test regular user functionality:

```json
{
  "email": "testuser@yourdomain.com",
  "fullName": "Test User",
  "groups": ["default"],
  "orgUnit": "General",
  "roles": ["user"],
  "twoStepEnabled": false,
  "department": "General"
}
```

### Example: Adding a Developer User

To test developer-level access:

```json
{
  "email": "testdev@yourdomain.com",
  "fullName": "Test Developer",
  "groups": ["engineering"],
  "orgUnit": "Engineering/Software",
  "roles": ["developer", "senior-developer"],
  "twoStepEnabled": true,
  "department": "Engineering"
}
```

## Available Groups

The system defines the following groups with different permission levels:

| Group | Description | Access Level |
|-------|-------------|--------------|
| `admin` | Full system administration | **High** - All resources |
| `engineering` | Software development team | **Medium** - Development resources |
| `platform` | Platform engineering team | **Medium** - Infrastructure resources |
| `finance` | Financial operations team | **Medium** - Financial resources |
| `default` | Standard user access | **Low** - Basic resources |

## Available Roles

| Role | Description | Typical Permissions |
|------|-------------|-------------------|
| `admin` | System administrator | Full access to all resources |
| `system-admin` | Technical administrator | System-level operations |
| `developer` | Software developer | Code and project access |
| `senior-developer` | Senior developer | Extended development privileges |
| `platform-engineer` | Platform engineer | Infrastructure management |
| `accountant` | Financial operations | Invoice and financial data access |
| `user` | Standard user | Basic application access |

## Complete Example: Adding Your Gmail for Admin Testing

If you want to add your Gmail account (`heshamahmed8877@gmail.com`) with full admin privileges for testing:

```json
{
  "email": "heshamahmed8877@gmail.com",
  "fullName": "Hesham Ahmed (Admin)",
  "groups": ["admin", "engineering"],
  "orgUnit": "IT/Administration",
  "roles": ["admin", "system-admin", "developer"],
  "twoStepEnabled": true,
  "department": "IT"
}
```

## Auto-User Registration

The system also supports automatic user registration for new Google OAuth users. When a user logs in for the first time, they are automatically assigned:

- **Groups**: `["default"]`
- **Roles**: `["user"]`
- **OrgUnit**: `"General"`
- **Department**: `"General"`
- **TwoStepEnabled**: `false`

## Testing Admin Features

### 1. User Management
Admin users can:
- View all users in the system
- Manage user group assignments
- Edit user permissions
- View user details and organizational information

### 2. Policy Management
Admin users can:
- Add new authorization policies
- Remove existing policies
- View all system policies
- Test authorization rules

### 3. Group Management
Admin users can:
- Assign users to groups
- Remove users from groups
- Manage group-based permissions

## Step-by-Step: Adding a Test User

1. **Open the users configuration file:**
   ```bash
   nano server/src/config/casbin/users.json
   ```

2. **Add your test user to the users array:**
   ```json
   {
     "users": [
       // ... existing users ...
       {
         "email": "your-test-email@gmail.com",
         "fullName": "Your Test Name",
         "groups": ["admin"],
         "orgUnit": "IT/Administration",
         "roles": ["admin"],
         "twoStepEnabled": true,
         "department": "IT"
       }
     ],
     // ... rest of configuration ...
   }
   ```

3. **Restart the server to load new configuration:**
   ```bash
   npm run dev:server
   ```

4. **Test the login:**
   - Navigate to the application
   - Click "Login with Google"
   - Use the email you added
   - Verify admin panel access in the dashboard

## Security Considerations

### Production Environment
- ⚠️ **Never commit real user emails to version control**
- 🔒 **Use environment-based user management in production**
- 🛡️ **Implement proper user verification processes**
- 🔐 **Enable 2FA for all admin users**

### Development Environment
- ✅ **Use test emails for development**
- ✅ **Document test user credentials**
- ✅ **Regularly clean up test users**
- ✅ **Use separate configurations for dev/prod**

## Troubleshooting

### User Not Found
If a user logs in but isn't found in the configuration:
1. Check the email spelling in `users.json`
2. Restart the server after configuration changes
3. Verify the user is authenticating with the correct Google account

### Admin Panel Not Visible
If admin features aren't showing:
1. Verify the user has `"admin"` in their groups array
2. Check that the user's roles include admin privileges
3. Clear browser cache and re-login

### Permission Denied
If users can't access expected resources:
1. Check group assignments in `users.json`
2. Verify policy rules in `policy.csv`
3. Test authorization using the dashboard's test features

## API Integration

The user configuration integrates with these API endpoints:

- `GET /api/admin/users` - List all users
- `GET /api/user/details` - Get current user details
- `GET /api/user/rights` - Get user permissions
- `POST /api/admin/user-groups` - Add user to group
- `DELETE /api/admin/user-groups` - Remove user from group

## Example Complete Configuration

Here's a complete example `users.json` for testing:

```json
{
  "users": [
    {
      "email": "admin@test.com",
      "fullName": "Test Admin",
      "groups": ["admin"],
      "orgUnit": "IT/Administration",
      "roles": ["admin", "system-admin"],
      "twoStepEnabled": true,
      "department": "IT"
    },
    {
      "email": "dev@test.com",
      "fullName": "Test Developer",
      "groups": ["engineering"],
      "orgUnit": "Engineering/Software",
      "roles": ["developer"],
      "twoStepEnabled": true,
      "department": "Engineering"
    },
    {
      "email": "user@test.com",
      "fullName": "Test User",
      "groups": ["default"],
      "orgUnit": "General",
      "roles": ["user"],
      "twoStepEnabled": false,
      "department": "General"
    }
  ],
  "departments": [
    {
      "name": "IT",
      "orgUnit": "IT",
      "description": "Information technology and administration"
    },
    {
      "name": "Engineering",
      "orgUnit": "Engineering",
      "description": "Software development"
    },
    {
      "name": "General",
      "orgUnit": "General",
      "description": "General users"
    }
  ],
  "roles": [
    {
      "name": "admin",
      "description": "System administrator with full access"
    },
    {
      "name": "system-admin",
      "description": "Technical system administrator"
    },
    {
      "name": "developer",
      "description": "Software developer"
    },
    {
      "name": "user",
      "description": "Standard user access"
    }
  ]
}
```

This configuration provides a complete testing environment for all user types and admin features.