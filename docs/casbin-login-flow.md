# How Casbin Works on Every Login

This document explains the complete flow of how Casbin authorization works when a user logs in to the system.

## Overview

Casbin is integrated into the authentication and authorization flow to:
1. **Sync user groups** from Google Workspace to Casbin
2. **Assign roles** based on group memberships
3. **Evaluate permissions** for authorization checks
4. **Cache user rights** for performance

---

## Complete Login Flow

### Step 1: User Initiates Login

**Frontend:** User clicks "Sign in with Google"

```javascript
// client/src/stores/auth.js
const login = async () => {
  // Get Google OAuth URL from backend
  const { data } = await apiService.get("/auth/google");
  // Redirect to Google
  window.location.href = data.authUrl;
}
```

**Backend:** `/auth/google` endpoint generates OAuth URL

```javascript
// server/src/routes/auth.routes.js
router.get('/google', (req, res) => {
  const client = new OAuth2Client(...);
  const authUrl = client.generateAuthUrl({
    scopes: [
      'userinfo.email',
      'userinfo.profile',
      'admin.directory.user.readonly',
      'admin.directory.group.readonly'  // ← Needed for Casbin
    ]
  });
  res.json({ authUrl });
});
```

---

### Step 2: Google OAuth Callback

**Backend:** `/auth/google/callback` receives authorization code

```javascript
// server/src/routes/auth.routes.js
router.get('/google/callback', async (req, res) => {
  // 1. Exchange code for tokens
  const { tokens } = await client.getToken(code);
  
  // 2. Get user profile from Google
  const userProfile = await directory.users.get({ userKey: email });
  
  // 3. Get user groups from Google Directory API
  const groupsRes = await directory.groups.list({ userKey: email });
  const groups = groupsRes.data.groups.map(g => g.name);
  
  // 4. Store in session
  req.session.user = {
    email: payload.email,
    name: payload.name,
    groups,  // ← Google groups stored here
    orgUnit: userProfile.orgUnitPath,
    department: userProfile.department
  };
  
  // 5. Redirect to dashboard
  res.redirect('/dashboard');
});
```

**At this point:**
- ✅ User is authenticated
- ✅ Google groups are in session
- ⏳ Casbin sync hasn't happened yet

---

### Step 3: Dashboard Loads - User Details Request

**Frontend:** Dashboard requests user details

```javascript
// Frontend calls: GET /api/user/details
```

**Backend:** `/api/user/details` endpoint

```javascript
// server/src/routes/api.routes.js
router.get('/user/details', requireAuth, async (req, res) => {
  const userEmail = req.session.user.email;
  
  // 1. Fetch fresh data from Google Directory API
  const groupsRes = await admin.groups.list({ userKey: userEmail });
  const googleGroups = groupsRes.data.groups.map(g => g.name);
  
  // 2. Extract roles from Google custom schemas
  const userRes = await admin.users.get({ userKey: userEmail });
  const googleRoles = userRes.data.customSchemas?.Roles?.values || [];
  
  // 3. ⭐ SYNC WITH CASBIN ⭐
  await casbinService.syncUserFromGoogle(userEmail, {
    fullName: req.session.user.name,
    groups: googleGroups,      // ← Sync Google groups to Casbin
    roles: googleRoles,        // ← Sync Google roles to Casbin
    orgUnit: userProfile.orgUnitPath,
    department: userProfile.department
  });
  
  // 4. Get user rights from Casbin
  const userRights = await casbinService.getUserRights(userEmail, googleUser);
  
  res.json({ data: { ...userRights } });
});
```

---

### Step 4: Casbin Sync Process

**What happens in `syncUserFromGoogle()`:**

```javascript
// server/src/services/casbin.js
async syncUserFromGoogle(userEmail, googleData) {
  // 1. Get current Casbin group assignments from database
  const allGroupings = await this.enforcer.getGroupingPolicy();
  const currentGroups = allGroupings
    .filter(([user]) => user === userEmail)
    .map(([, group]) => group);
  
  // 2. Define local-only groups (not synced from Google)
  const localOnlyGroups = ['Finance22', 'Developers22', 'admin', 'engineering'];
  
  // 3. Remove user from groups NOT in Google (preserve local groups)
  for (const group of currentGroups) {
    if (!localOnlyGroups.includes(group) && !googleGroups.includes(group)) {
      await this.removeUserFromGroup(userEmail, group);
      // Database: DELETE FROM casbin_rule WHERE ptype='g' AND v0=userEmail AND v1=group
    }
  }
  
  // 4. Add user to Google groups in Casbin
  for (const group of googleData.groups) {
    await this.addUserToGroup(userEmail, group);
    // Database: INSERT INTO casbin_rule (ptype, v0, v1) VALUES ('g', userEmail, group)
    // OR UPDATE if exists
  }
  
  // 5. Auto-save to database (if using database mode)
  if (CONFIG.casbin.autoSave && this.storageType === 'database') {
    await this.enforcer.savePolicy();
  }
}
```

**Database Changes:**
```sql
-- Example: User has groups ['SWD', 'Engineering'] in Google
-- Casbin database gets updated:

-- Remove old groups not in Google
DELETE FROM casbin_rule 
WHERE ptype='g' AND v0='user@example.com' AND v1='OldGroup';

-- Add new Google groups
INSERT INTO casbin_rule (ptype, v0, v1) 
VALUES ('g', 'user@example.com', 'SWD')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

INSERT INTO casbin_rule (ptype, v0, v1) 
VALUES ('g', 'user@example.com', 'Engineering')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
```

---

### Step 5: Get User Rights from Casbin

**What happens in `getUserRights()`:**

```javascript
// server/src/services/casbin.js
async getUserRights(userEmail, sessionUser) {
  // 1. Get user info (from session or users.json)
  const userInfo = this.getUserInfo(userEmail, sessionUser);
  
  // 2. Dynamically assign groups to Casbin enforcer (in-memory)
  for (const group of userInfo.groups) {
    await this.enforcer.addGroupingPolicy(userEmail, group);
    // This adds to in-memory Casbin model, not database
  }
  
  // 3. Get all policies from database/file
  const allPolicies = await this.enforcer.getPolicy();
  // Example policies:
  // ['p', 'SWD', 'dashboard', 'read']
  // ['p', 'SWD', 'projects', 'read']
  // ['p', 'Engineering', 'reports', 'read']
  
  // 4. Filter policies that apply to user's groups
  const relevantPolicies = allPolicies.filter(policy => {
    const [subject] = policy;  // 'SWD', 'Engineering', etc.
    return userInfo.groups.includes(subject);
  });
  
  // 5. Build rights object
  const resourcePermissions = {};
  for (const policy of relevantPolicies) {
    const [, resource, action] = policy;  // 'dashboard', 'read'
    if (!resourcePermissions[resource]) {
      resourcePermissions[resource] = new Set();
    }
    resourcePermissions[resource].add(action);
  }
  
  // 6. Return formatted rights
  return {
    userEmail,
    found: true,
    groups: userInfo.groups,  // ['SWD', 'Engineering']
    rights: [
      { resource: 'dashboard', actions: ['read'] },
      { resource: 'projects', actions: ['read'] },
      { resource: 'reports', actions: ['read'] }
    ]
  };
}
```

**Example Result:**
```json
{
  "userEmail": "user@example.com",
  "found": true,
  "groups": ["SWD", "Engineering"],
  "roles": ["developer"],
  "rights": [
    { "resource": "dashboard", "actions": ["read"] },
    { "resource": "projects", "actions": ["read", "create"] },
    { "resource": "reports", "actions": ["read"] }
  ]
}
```

---

### Step 6: Authorization Checks (On Every Request)

**When user accesses protected resource:**

```javascript
// Example: User tries to access /api/projects
router.get('/projects', requireAuth, async (req, res) => {
  const userEmail = req.session.user.email;
  
  // ⭐ CASBIN AUTHORIZATION CHECK ⭐
  const result = await casbinService.authorize(userEmail, 'projects', 'read');
  
  if (!result.allowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // User has permission, return data
  res.json({ data: projects });
});
```

**What happens in `authorize()`:**

```javascript
// server/src/services/casbin.js
async authorize(userEmail, resource, action) {
  // 1. Get user's groups from session or database
  const userInfo = this.getUserInfo(userEmail);
  const userGroups = userInfo.groups;  // ['SWD', 'Engineering']
  
  // 2. Casbin enforces: g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
  // Translation: User's group matches policy subject AND resource matches AND action matches
  const allowed = await this.enforcer.enforce(userEmail, resource, action);
  
  // 3. How Casbin evaluates:
  // - Check if userEmail is in group 'SWD' (g(userEmail, 'SWD'))
  // - Check if 'SWD' has policy: p('SWD', 'projects', 'read')
  // - If both true → ALLOW
  // - If no match → DENY
  
  return {
    allowed,  // true or false
    userEmail,
    resource,
    action,
    userGroups,
    evaluationTime: duration
  };
}
```

**Casbin Model Evaluation:**
```
Request: enforce('user@example.com', 'projects', 'read')

1. Check groupings (g):
   - g('user@example.com', 'SWD') → true
   - g('user@example.com', 'Engineering') → true

2. Check policies (p):
   - p('SWD', 'projects', 'read') → exists → ALLOW ✅
   - OR
   - p('Engineering', 'projects', 'read') → exists → ALLOW ✅

3. Result: ALLOWED
```

---

## Database vs File Mode

### Database Mode (Current Setup)

**On Login:**
1. ✅ Policies loaded from `casbin_rule` table (cached)
2. ✅ User groups synced to `casbin_rule` table (ptype='g')
3. ✅ Authorization checks use cached policies
4. ✅ Changes auto-saved to database

**Database Tables:**
```sql
-- Policies (ptype='p')
SELECT * FROM casbin_rule WHERE ptype='p';
-- Result: ['p', 'SWD', 'projects', 'read'], ['p', 'admin', 'users', 'manage'], ...

-- Groupings (ptype='g')
SELECT * FROM casbin_rule WHERE ptype='g';
-- Result: ['g', 'user@example.com', 'SWD'], ['g', 'user@example.com', 'Engineering'], ...
```

### File Mode (Fallback)

**On Login:**
1. ✅ Policies loaded from `policy.csv`
2. ✅ User groups synced to in-memory Casbin model
3. ✅ Authorization checks use in-memory policies
4. ⚠️ Changes NOT persisted (lost on restart)

---

## Performance Optimizations

### 1. Policy Caching

**First Login:**
- Policies loaded from database → ~100-200ms
- Cached in memory for 1 minute (configurable)

**Subsequent Requests:**
- Policies served from cache → ~0.5ms
- 200-400x faster! 🚀

### 2. User Rights Caching

**First Request:**
- Rights calculated from policies → ~10-20ms
- Cached for 30 minutes

**Subsequent Requests:**
- Rights served from cache → ~0.1ms
- 100-200x faster! 🚀

### 3. Database Query Optimization

- Batch inserts for bulk group updates
- Indexed queries on `ptype`, `v0`, `v1`
- Prepared statements for security

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LOGIN FLOW                          │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Sign in with Google"
   ↓
2. Redirect to Google OAuth
   ↓
3. User authorizes
   ↓
4. Google redirects to /auth/google/callback
   ↓
5. Backend exchanges code for tokens
   ↓
6. Backend fetches user profile + groups from Google Directory API
   ↓
7. Store user info in session
   ↓
8. Redirect to /dashboard
   ↓
9. Frontend calls GET /api/user/details
   ↓
10. Backend fetches fresh groups from Google
    ↓
11. ⭐ CASBIN SYNC ⭐
    - Remove old groups from Casbin database
    - Add new Google groups to Casbin database
    - Save to database (if database mode)
    ↓
12. ⭐ GET USER RIGHTS ⭐
    - Load policies from database (cached)
    - Match user groups to policies
    - Calculate permissions
    - Cache rights for 30 minutes
    ↓
13. Return user rights to frontend
    ↓
14. User accesses protected resource
    ↓
15. ⭐ AUTHORIZATION CHECK ⭐
    - Check if user's group has permission
    - Use cached policies (fast!)
    - Return allow/deny
    ↓
16. If allowed → Return data
    If denied → Return 403 Forbidden
```

---

## Key Points

### ✅ What Happens on Every Login

1. **Google Groups Fetched** - Fresh data from Google Directory API
2. **Casbin Sync** - Groups synced to Casbin database/file
3. **Rights Calculated** - Permissions calculated from policies
4. **Cache Updated** - Rights cached for performance

### ✅ What Happens on Every Request

1. **Authorization Check** - Casbin evaluates permission
2. **Cache Used** - Policies and rights served from cache
3. **Fast Response** - Typically < 2ms for authorization

### ✅ Database Updates

- **On Login:** User groups synced to `casbin_rule` table
- **On Policy Change:** Policies updated in `casbin_rule` table
- **Auto-save:** Changes automatically saved (if enabled)

### ✅ Performance

- **First Load:** ~100-200ms (database query)
- **Cached Load:** ~0.5ms (memory cache)
- **Authorization:** ~0.5-2ms (cached policies)

---

## Troubleshooting

### User Has No Permissions

**Check:**
1. Are groups synced? Check `casbin_rule` table:
   ```sql
   SELECT * FROM casbin_rule WHERE ptype='g' AND v0='user@example.com';
   ```

2. Do policies exist for those groups?
   ```sql
   SELECT * FROM casbin_rule WHERE ptype='p' AND v0='SWD';
   ```

3. Check logs for sync errors:
   ```
   [SERVER]|INFO|Casbin synchronization completed successfully
   ```

### Groups Not Syncing

**Check:**
1. Google Directory API permissions
2. Session has groups: `req.session.user.groups`
3. Sync called: Look for "Casbin synchronization started" in logs

### Slow Authorization

**Check:**
1. Cache enabled? `CASBIN_CACHE_ENABLED=true`
2. Cache hit rate: `GET /api/admin/casbin/metrics`
3. Database connection pool size

---

## Summary

**On Every Login:**
1. ✅ Google groups fetched
2. ✅ Groups synced to Casbin database
3. ✅ User rights calculated
4. ✅ Rights cached for 30 minutes

**On Every Request:**
1. ✅ Authorization check via Casbin
2. ✅ Policies served from cache
3. ✅ Fast response (< 2ms)

**Database Integration:**
- ✅ Groups stored in `casbin_rule` table
- ✅ Policies stored in `casbin_rule` table
- ✅ Auto-save enabled
- ✅ Caching for performance

This ensures that user permissions are always up-to-date with Google Workspace groups while maintaining high performance through caching! 🚀

