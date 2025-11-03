---
title: Casbin User Management
---

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

To test developer-specific features:

```json
{
  "email": "testdev@yourdomain.com",
  "fullName": "Test Developer",
  "groups": ["engineering"],
  "orgUnit": "IT/Development",
  "roles": ["developer"],
  "twoStepEnabled": true,
  "department": "Engineering"
}
```

## Managing User Roles and Permissions

### Overview of Role-Based Access Control (RBAC)

RBAC is used to manage user permissions based on roles assigned to users. Roles are defined in the system with specific permissions, and users are assigned to these roles.

### Example: Defining Roles and Permissions

Roles are defined in the same `users.json` file under a `roles` key. For example:

```json
{
  "roles": {
    "admin": {
      "permissions": ["*"]
    },
    "user": {
      "permissions": ["read"]
    },
    "developer": {
      "permissions": ["read", "write", "execute"]
    }
  }
}
```

In this example, the `admin` role has all permissions, the `user` role has read permissions, and the `developer` role has read, write, and execute permissions.

### Assigning Roles to Users

To assign a role to a user, add the role to the user's `roles` array in the `users.json` file. For example, to assign the `developer` role to a user:

```json
{
  "email": "user@example.com",
  "roles": ["developer"]
}
```

## Testing User Management Changes

After making changes to the `users.json` file, test the changes by logging in with the affected user accounts and verifying the correct permissions and access levels.

## Common Issues and Troubleshooting

- **User cannot access certain features**: Check the user's role and permissions in the `users.json` file.
- **Error: Invalid JSON format**: Ensure the `users.json` file is valid JSON. Use a JSON validator if necessary.
- **Changes not taking effect**: Restart the server to apply changes from the `users.json` file.

## Conclusion

This guide provided an overview of managing users in the Google OAuth Authorization system using Casbin. For further details, refer to the [Casbin documentation](https://casbin.org/docs/en/overview).
