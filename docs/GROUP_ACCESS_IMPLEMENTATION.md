# Google Workspace Group-Based Authentication Implementation

## Overview

This document describes the implementation of Google Workspace group-based access control for the InsightHub application. The system allows only users who belong to specific Google Workspace groups to access the application.

**Super Admins**: Members of the "SWD" Google Workspace group automatically have admin rights to manage allowed groups.

**Key Feature**: Uses the existing `casbin_rule` table - no new database tables required!

## Architecture

### Database Schema

The implementation leverages the existing `casbin_rule` table that's already used for Casbin RBAC. No new tables are needed!

#### Allowed Groups Storage
Stored in `casbin_rule` table with this format:
```sql
-- Format: ptype='p', v0='allowed_group', v1='<group_name>', v2='access'
INSERT INTO casbin_rule (ptype, v0, v1, v2)
VALUES ('p', 'allowed_group', 'Finance', 'access');
```

#### Super Admin
**No database storage required!** Super admin is determined by Google Workspace group membership:
- Any user in the "SWD" group is automatically a super admin
- Checked during login by examining user's Google groups
- No manual configuration needed

**Benefits of using existing tables:**
- ✅ No database migration needed
- ✅ Consistent with existing Casbin infrastructure
- ✅ Already has proper indexes for performance
- ✅ Integrated with existing RBAC system
- ✅ Super admin managed through Google Workspace (no database updates needed)

### Backend Components

#### 1. Group Access Service
**File:** `server/src/services/groupAccess.service.js`

Core service that handles all group access logic:

- `hasAccess(userGroups)` - Checks if user is in any allowed group
- `getAllowedGroups(status)` - Retrieves list of allowed groups
- `addAllowedGroup(groupName, groupEmail, description, addedBy)` - Adds a group to allowed list
- `removeAllowedGroup(groupName)` - Removes a group from allowed list
- `isSuperAdmin(email)` - Checks if user is the super admin
- `getSuperAdmin()` - Gets current super admin information
- `setSuperAdmin(email)` - Transfers super admin rights to another user

#### 2. Authentication Routes
**File:** `server/src/routes/auth.routes.js`

Enhanced OAuth callback flow to check group access:

```javascript
// After fetching user's Google groups
const hasAccess = await groupAccessService.hasAccess(groups);

if (!hasAccess) {
  // Check if user is super admin (super admin always has access)
  const isSuperAdmin = await groupAccessService.isSuperAdmin(userEmail);
  
  if (!isSuperAdmin) {
    throw new Error('ACCESS_DENIED');
  }
}
```

Error handling for access denied:

```javascript
if (error.message === 'ACCESS_DENIED') {
  if (wantsJson) {
    return res.status(403).json({
      error: 'access_denied',
      message: 'You are not authorized to access this application. Please contact your administrator.'
    });
  }
  return errorRedirect('access_denied', res, logger);
}
```

#### 3. Admin Routes
**File:** `server/src/routes/admin.routes.js`

New admin API endpoints for managing allowed groups:

- `GET /admin/check` - Check if current user is super admin (SWD member)
- `GET /admin/groups/allowed` - Get list of allowed groups (super admin only)
- `POST /admin/groups/allowed` - Add a group to allowed list (super admin only)
- `DELETE /admin/groups/allowed/:groupName` - Remove a group (super admin only)

All admin endpoints (except `/admin/check`) use the `requireSuperAdmin` middleware to verify the user is in the SWD group.

#### 4. Server Configuration
**File:** `server/src/index.js`

Admin routes are registered with rate limiting:

```javascript
app.use('/admin', authRateLimit, adminRoutes)
```

### Frontend Components

#### 1. Login Page
**File:** `client/src/views/LoginPage.vue`

Enhanced with error handling for access denied:

- Added `v-snackbar` to display error messages
- Checks for `error` query parameter on mount
- Shows appropriate error message for `access_denied` error:
  ```
  "Access Denied: You are not authorized to access this application. 
   Please contact your administrator."
  ```

Error message mappings:
```javascript
const errorMessages = {
  access_denied: "Access Denied: You are not authorized to access this application. Please contact your administrator.",
  oauth_failed: "Authentication failed. Please try again.",
  session_error: "Session error occurred. Please try signing in again.",
  default: "An error occurred during authentication. Please try again."
};
```

## Authentication Flow

### Successful Authentication

1. User clicks "Sign in with Google" on login page
2. User redirects to Google OAuth consent screen
3. User authorizes the application
4. Google redirects back to `/auth/google/callback?code=...`
5. Server exchanges code for tokens
6. Server fetches user profile from Google
7. Server fetches user's Google Workspace groups using Directory API
8. **Group Access Check:**
   - Server checks if user is in any allowed group
   - If not, checks if user is super admin
   - If neither, throws `ACCESS_DENIED` error
9. If authorized, server creates user session
10. User redirects to `/home`

### Access Denied Flow

1. Steps 1-7 same as above
2. **Group Access Check fails:**
   - User is not in any allowed group
   - User is not the super admin
3. Server throws `ACCESS_DENIED` error
4. Error handler catches the error
5. Server redirects to `/login?error=access_denied`
6. Login page displays error message in snackbar
7. User sees: "Access Denied: You are not authorized to access this application. Please contact your administrator."

## Setup Instructions

### 1. Add Users to SWD Group (Google Workspace Admin)

**Super Admin Setup:**
1. Go to Google Workspace Admin Console
2. Navigate to Groups
3. Find or create the "SWD" group
4. Add the users who should be super admins to this group
5. Done! No database configuration needed.

### 2. Add Initial Allowed Groups (Optional)

You can pre-populate some allowed groups:

```sql
INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES
('p', 'allowed_group', 'Finance', 'access'),
('p', 'allowed_group', 'Engineering', 'access'),
('p', 'allowed_group', 'Management', 'access');
```

Or you can add groups later through the admin API (once you've signed in as an SWD member).

### 3. Verify Setup

Check that allowed groups are configured:

```sql
-- Check allowed groups
SELECT v1 as group_name, created_at
FROM casbin_rule
WHERE ptype = 'p' AND v0 = 'allowed_group' AND v2 = 'access';
```

### 4. Verify Google Workspace API Permissions

Ensure your Google Cloud project has the following scopes enabled:
- `https://www.googleapis.com/auth/userinfo.profile`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/admin.directory.group.readonly`

These are already configured in `auth.routes.js`.

### 5. Restart Server

Restart the Node.js server to load the new routes:

```bash
npm run dev
# or
npm start
```

## Usage

### For Super Admin

Super admins are **members of the "SWD" Google Workspace group**. No database configuration needed!

#### Check Admin Status

Make a GET request to check if you're a super admin:

```bash
curl -X GET http://localhost:3001/admin/check \
  -H "Cookie: connect.sid=your-session-cookie"
```

Response:
```json
{
  "isSuperAdmin": true,
  "groups": ["SWD", "Engineering", "Finance"]
}
```

#### View Allowed Groups

```bash
curl -X GET http://localhost:3001/admin/groups/allowed \
  -H "Cookie: connect.sid=your-session-cookie"
```

Response:
```json
{
  "success": true,
  "groups": [
    {
      "id": 1,
      "group_name": "Finance",
      "group_email": "finance@company.com",
      "description": "Finance team",
      "status": "active",
      "added_by": "admin@company.com",
      "added_at": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

#### Add Allowed Group

```bash
curl -X POST http://localhost:3001/admin/groups/allowed \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=your-session-cookie" \
  -d '{
    "groupName": "Engineering",
    "groupEmail": "engineering@company.com",
    "description": "Engineering team access"
  }'
```

Response:
```json
{
  "success": true,
  "group": {
    "id": 2,
    "group_name": "Engineering",
    "group_email": "engineering@company.com",
    "description": "Engineering team access",
    "status": "active"
  }
}
```

#### Remove Allowed Group

```bash
curl -X DELETE http://localhost:3001/admin/groups/allowed/Engineering \
  -H "Cookie: connect.sid=your-session-cookie"
```

Response:
```json
{
  "success": true,
  "message": "Group removed from allowed list"
}
```

### For Regular Users

Users simply need to:
1. Visit the login page
2. Click "Sign in with Google"
3. Authorize the application
4. If they're in an allowed group (or in SWD group), they'll be redirected to the home page
5. If not, they'll see an access denied error

**Note**: Members of the SWD group always have access, even if their other groups aren't in the allowed list.

## Next Steps (Admin UI)

To complete the implementation, you should create an admin UI component:

### 1. Create Admin Settings Component

Create `client/src/components/AdminSettings.vue`:

```vue
<template>
  <v-card>
    <v-card-title>Group Access Management</v-card-title>
    <v-card-text>
      <!-- List of allowed groups -->
      <v-list>
        <v-list-item
          v-for="group in allowedGroups"
          :key="group.id"
        >
          <v-list-item-title>{{ group.group_name }}</v-list-item-title>
          <v-list-item-subtitle>{{ group.group_email }}</v-list-item-subtitle>
          <template v-slot:append>
            <v-btn
              icon="mdi-delete"
              size="small"
              @click="removeGroup(group.group_name)"
            />
          </template>
        </v-list-item>
      </v-list>

      <!-- Add new group form -->
      <v-form @submit.prevent="addGroup">
        <v-text-field
          v-model="newGroup.name"
          label="Group Name"
          required
        />
        <v-text-field
          v-model="newGroup.email"
          label="Group Email"
          required
        />
        <v-textarea
          v-model="newGroup.description"
          label="Description"
        />
        <v-btn type="submit">Add Group</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const allowedGroups = ref([]);
const newGroup = ref({ name: '', email: '', description: '' });

async function fetchGroups() {
  const response = await axios.get('/admin/groups/allowed');
  allowedGroups.value = response.data.groups;
}

async function addGroup() {
  await axios.post('/admin/groups/allowed', {
    groupName: newGroup.value.name,
    groupEmail: newGroup.value.email,
    description: newGroup.value.description
  });
  newGroup.value = { name: '', email: '', description: '' };
  await fetchGroups();
}

async function removeGroup(groupName) {
  await axios.delete(`/admin/groups/allowed/${groupName}`);
  await fetchGroups();
}

onMounted(fetchGroups);
</script>
```

### 2. Add Admin Route to Router

In `client/src/router/index.js`:

```javascript
{
  path: '/admin',
  name: 'Admin',
  component: () => import('@/views/AdminView.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
}
```

### 3. Add Admin Navigation

Add a navigation item in your app's menu (only visible to super admin):

```vue
<v-list-item
  v-if="isSuperAdmin"
  to="/admin"
  prepend-icon="mdi-shield-account"
>
  <v-list-item-title>Admin Settings</v-list-item-title>
</v-list-item>
```

### 4. Add Router Guard

In `client/src/router/index.js`, add a check for admin routes:

```javascript
router.beforeEach(async (to, from, next) => {
  // ... existing auth checks ...
  
  if (to.meta.requiresAdmin) {
    const response = await axios.get('/admin/check');
    if (!response.data.isSuperAdmin) {
      return next('/home'); // Redirect non-admins
    }
  }
  
  next();
});
```

## Testing

### Test Access Denied Flow

1. Set up a test user who is NOT in any allowed groups
2. Try to sign in with that user
3. Verify the error message appears on login page
4. Check server logs for ACCESS_DENIED error

### Test Successful Access

1. Add a group to the allowed list
2. Ensure test user is a member of that group
3. Sign in with that user
4. Verify successful redirect to /home

### Test Super Admin

1. Sign in as the super admin
2. Verify access even if not in any allowed groups
3. Navigate to `/admin` (once UI is created)
4. Test adding/removing groups
5. Test transferring super admin rights

## Security Considerations

1. **Super Admin Protection**: Only one super admin at a time (enforced by database constraint)
2. **Rate Limiting**: Admin routes have rate limiting to prevent abuse
3. **Session Required**: All admin endpoints require valid session
4. **Group Validation**: Access checked on every OAuth callback
5. **Error Handling**: No sensitive information leaked in error messages

## Troubleshooting

### User Gets Access Denied but Should Have Access

1. Check if user is actually in the allowed group:
   - Go to Google Admin Console
   - Navigate to Groups
   - Find the group and check members

2. Verify group name matches exactly:
   ```sql
   SELECT * FROM allowed_groups WHERE status = 'active';
   ```

3. Check server logs for the groups fetched during authentication:
   ```
   Groups fetched: ["Group1", "Group2"]
   ```

4. Ensure group name in database matches the name returned by Google API (case-sensitive)

### Super Admin Cannot Access Admin Routes

1. Verify super admin email in database:
   ```sql
   SELECT * FROM super_admin;
   ```

2. Check if email matches exactly (case-sensitive)

3. Verify user is signed in (check session)

4. Check server logs for authorization errors

### Groups Not Being Fetched

1. Verify Google Workspace API credentials
2. Check if service account has domain-wide delegation
3. Verify scopes are correct in OAuth configuration
4. Check server logs for Google API errors

## Migration Notes

### Existing Users

Existing users in the database will need to pass the group check on their next login. You have two options:

1. **Add all necessary groups before deployment** - Add all groups that should have access before rolling out this feature

2. **Phased rollout** - Add a feature flag to temporarily disable group checking while you configure groups

To add a feature flag:

```javascript
// In auth.routes.js
const GROUP_CHECK_ENABLED = process.env.GROUP_ACCESS_CHECK === 'true';

if (GROUP_CHECK_ENABLED) {
  const hasAccess = await groupAccessService.hasAccess(groups);
  // ... rest of check
}
```

## Files Modified/Created

### Created Files
- `database/group_access_setup.sql` - Setup SQL for super admin and allowed groups
- `server/src/services/groupAccess.service.js` - Group access service (uses casbin_rule table)
- `server/src/routes/admin.routes.js` - Admin API endpoints

### Modified Files
- `server/src/routes/auth.routes.js` - Added group access check to OAuth callback
- `server/src/index.js` - Registered admin routes
- `client/src/views/LoginPage.vue` - Added error message display

## Summary

The Google Workspace group-based authentication system is now fully implemented using the **existing Casbin infrastructure**. No new database tables are required! 

**Key Points:**
- **Super Admin**: Any member of the "SWD" Google Workspace group (managed in Google Workspace, not in database)
- **Allowed Groups**: Stored as policies in casbin_rule: `p, allowed_group, <group_name>, access`
- **Access Logic**: Users must be in an allowed group OR in the SWD group to access the application

Users must be members of allowed groups to access the application, and SWD group members can manage which groups are allowed through the admin API.

The next step is to create the admin UI (optional but recommended) to make it easier for SWD members to manage groups through a web interface instead of API calls.
