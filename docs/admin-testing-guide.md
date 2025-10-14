# Quick Admin Testing Guide

## Adding Email Addresses for Admin Testing

### Your Current Admin Setup
Your Gmail account is already configured with admin privileges:

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

### Quick Test User Templates

#### 1. Additional Admin User
```json
{
  "email": "admin-test@gmail.com",
  "fullName": "Test Admin User",
  "groups": ["admin"],
  "orgUnit": "IT/Administration",
  "roles": ["admin", "system-admin"],
  "twoStepEnabled": true,
  "department": "IT"
}
```

#### 2. Regular User for Testing
```json
{
  "email": "user-test@gmail.com", 
  "fullName": "Test Regular User",
  "groups": ["default"],
  "orgUnit": "General",
  "roles": ["user"],
  "twoStepEnabled": false,
  "department": "General"
}
```

#### 3. Developer User for Testing
```json
{
  "email": "dev-test@gmail.com",
  "fullName": "Test Developer",
  "groups": ["engineering"],
  "orgUnit": "Engineering/Software",
  "roles": ["developer"],
  "twoStepEnabled": true,
  "department": "Engineering"
}
```

## Admin Features to Test

### 1. User Management Tab
- ✅ View all users in the system
- ✅ See user groups and roles
- ✅ Edit user group assignments
- ✅ View user organizational details

### 2. Policy Management Tab  
- ✅ Add new authorization policies
- ✅ Remove existing policies
- ✅ View all system policies
- ✅ Test policy effects

### 3. Group Management Tab
- ✅ Assign users to groups
- ✅ Remove users from groups
- ✅ View group assignments

## Testing Workflow

1. **Login with Admin Account**
   - Use `heshamahmed8877@gmail.com`
   - Should see admin panel in dashboard

2. **Test User Management**
   - Navigate to Users tab in admin panel
   - Verify you can see all users
   - Try editing a user's groups

3. **Test Policy Management**
   - Go to Policies tab
   - Try adding a test policy
   - Verify policy appears in list

4. **Test Group Management**
   - Go to Groups tab
   - Try assigning users to different groups
   - Test removing group assignments

## File Location for Edits
```
server/src/config/casbin/users.json
```

## Restart After Changes
```bash
cd /Users/heshamahmed/google-authz-3ddx
npm run dev:server
```

## Current Admin Permissions
With your current setup, you have access to:
- 👑 **Full Admin Panel** (admin group)
- 🔧 **System Administration** (system-admin role)  
- 💻 **Development Resources** (developer role + engineering group)
- 📊 **All Dashboard Features**
- 🛠️ **User & Policy Management**

## Adding More Test Users

Simply add to the `users` array in `users.json`:

```json
{
  "users": [
    // ... existing users ...
    {
      "email": "your-new-test-email@domain.com",
      "fullName": "Test User Name",
      "groups": ["admin"],  // or ["default"] for regular user
      "orgUnit": "IT/Administration",
      "roles": ["admin"],   // or ["user"] for regular user  
      "twoStepEnabled": true,
      "department": "IT"
    }
  ]
}
```

## Security Note
🚨 **Remember**: These are test configurations. In production, implement proper user verification and never commit real user data to version control.