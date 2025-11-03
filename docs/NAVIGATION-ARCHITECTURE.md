# Navigation Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Application                       │
│                                                                   │
│  ┌────────────────┐                  ┌────────────────────────┐  │
│  │    App.vue     │                  │   NavigationSidebar    │  │
│  │                │◄─────────────────┤      Component         │  │
│  │  - AppBar      │                  │                        │  │
│  │  - Drawer      │                  │  - User Profile        │  │
│  │  - Main        │                  │  - Hierarchical Menu   │  │
│  └────────┬───────┘                  │  - Rail Mode           │  │
│           │                          │  - Active Highlighting │  │
│           │                          └──────────┬─────────────┘  │
│           │                                     │                │
│           │                          ┌──────────▼─────────────┐  │
│           │                          │  navigationConfig.js   │  │
│           │                          │                        │  │
│           │                          │  - NAVIGATION_CONFIG   │  │
│           │                          │  - filterNavigation()  │  │
│           │                          │  - hasAccess()         │  │
│           │                          │  - getBreadcrumbs()    │  │
│           │                          └──────────┬─────────────┘  │
│           │                                     │                │
│  ┌────────▼───────────────────────────────────▼─────────────┐  │
│  │                    Router (index.js)                       │  │
│  │                                                            │  │
│  │  - Route Definitions with meta.requiredGroups             │  │
│  │  - Navigation Guards (beforeEach)                         │  │
│  │  - Permission Checking                                    │  │
│  │  - Redirect Unauthorized Users                            │  │
│  └────────┬───────────────────────────────────────────────────┘  │
│           │                                                       │
│           ├───────────────┬──────────────┬────────────────────┐  │
│           │               │              │                    │  │
│  ┌────────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐  ┌─────────▼┐ │
│  │ DashboardView │ │ UsersView │ │FinanceView │  │ ... More │ │
│  │               │ │           │ │            │  │   Views  │ │
│  └───────────────┘ └───────────┘ └────────────┘  └──────────┘ │
│                                                                   │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            │ API Calls
                            │
┌───────────────────────────▼───────────────────────────────────────┐
│                         Server Application                         │
│                                                                    │
│  ┌────────────────┐        ┌──────────────────┐                  │
│  │  Auth Store    │◄───────┤  Auth Middleware │                  │
│  │                │        │                  │                  │
│  │  - User Data   │        │  - checkAuth()   │                  │
│  │  - Groups      │        │  - verifyToken() │                  │
│  │  - Permissions │        └────────┬─────────┘                  │
│  └────────┬───────┘                 │                            │
│           │                         │                            │
│           │              ┌──────────▼──────────┐                 │
│           │              │  Casbin Enforcer    │                 │
│           └──────────────►                     │                 │
│                          │  - Policy Rules     │                 │
│                          │  - enforce()        │                 │
│                          │  - Group Checking   │                 │
│                          └─────────────────────┘                 │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Navigation Flow

```
User Logs In
     │
     ▼
┌─────────────────────┐
│  checkAuth()        │
│  - Verify session   │
│  - Get user details │
│  - Get user groups  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Store user data in Auth Store  │
│  - userDetails                   │
│  - userRights                    │
│  - groups: ['admin', 'SWD']      │
└──────────┬──────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│  NavigationSidebar Component Loads     │
│                                        │
│  1. Read NAVIGATION_CONFIG             │
│  2. Get user groups from Auth Store    │
│  3. Call filterNavigationByPermissions()│
└──────────┬─────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│  filterNavigationByPermissions()       │
│                                        │
│  For each navigation item:             │
│    If permissions = ['*']              │
│      → Include (public)                │
│    Else                                │
│      Check if user.groups includes     │
│      any required permission           │
│        → Include if match              │
│        → Exclude if no match           │
│                                        │
│  Process children recursively          │
└──────────┬─────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│  Render Filtered Navigation            │
│                                        │
│  Admin sees:                           │
│    ✅ Home                             │
│    ✅ User Management (all items)      │
│    ✅ Finance (all items)              │
│    ✅ Development (all items)          │
│    ✅ System (all items)               │
│                                        │
│  Regular User sees:                    │
│    ✅ Home                             │
│    ❌ User Management (hidden)         │
│    ❌ Finance (hidden)                 │
│    ❌ Development (hidden)             │
│    ✅ Projects > My Tasks              │
│    ✅ Help & Support                   │
└────────────────────────────────────────┘
```

---

## Route Navigation Flow

```
User Clicks Menu Item
     │
     ▼
┌─────────────────────┐
│  router.push()      │
│  Navigate to route  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Router beforeEach() Guard      │
│                                 │
│  1. Check if route requires auth│
│  2. Verify user is authenticated│
└──────────┬──────────────────────┘
           │
           ├─── Not Authenticated? ──► Redirect to Home
           │
           ▼
┌─────────────────────────────────┐
│  Check Route Permissions        │
│                                 │
│  meta: {                        │
│    requiredGroups: ['admin']    │
│  }                              │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  hasNavigationAccess()          │
│                                 │
│  userGroups: ['users', 'sales'] │
│  requiredGroups: ['admin']      │
│                                 │
│  Match? NO                      │
└──────────┬──────────────────────┘
           │
           ├─── No Permission? ──► Redirect to Dashboard
           │                        (Show error message)
           │
           ▼
┌─────────────────────────────────┐
│  Permission Granted!            │
│  Load & Render View Component   │
└─────────────────────────────────┘
```

---

## Permission Checking Logic

```
┌─────────────────────────────────────────────────────────────┐
│            hasNavigationAccess(permissions, userGroups)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Check if        │
                    │ permissions     │
                    │ includes '*'    │
                    └────────┬────────┘
                             │
                   ┌─────────┴─────────┐
                   │ YES               │ NO
                   ▼                   ▼
          ┌────────────────┐  ┌────────────────────┐
          │ Return TRUE    │  │ Check if any       │
          │ (Public access)│  │ user group matches │
          └────────────────┘  │ required groups    │
                              └────────┬───────────┘
                                       │
                              ┌────────┴────────┐
                              │ Loop through    │
                              │ userGroups      │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │ For each group: │
                              │ Is it in        │
                              │ permissions[]?  │
                              └────────┬────────┘
                                       │
                              ┌────────┴────────┐
                              │ YES             │ NO
                              ▼                 ▼
                     ┌────────────────┐  ┌─────────────┐
                     │ Return TRUE    │  │ Continue    │
                     │ (Has access)   │  │ checking    │
                     └────────────────┘  └──────┬──────┘
                                                │
                                                ▼
                                       ┌────────────────┐
                                       │ After loop:    │
                                       │ Return FALSE   │
                                       │ (No access)    │
                                       └────────────────┘
```

---

## Data Flow Example: Admin User

```
1. Login
   └─► Email: admin@3ddx.com

2. Server returns user data
   └─► {
         email: 'admin@3ddx.com',
         groups: ['admin', 'SWD', 'developers'],
         isAdmin: true
       }

3. Sidebar loads navigation config
   └─► 70+ navigation items defined

4. Filter navigation by user groups
   └─► For each item:
         permissions: ['admin'] → ✅ User has 'admin'
         permissions: ['finance'] → ❌ User lacks 'finance' (but might have admin)
         permissions: ['*'] → ✅ Public
         permissions: ['SWD'] → ✅ User has 'SWD'

5. Filtered result for Admin
   └─► All 70+ items visible (admin has access to everything)

6. User clicks "Users" menu item
   └─► Route: /users
       Required: ['admin', 'SWD']
       User has: ['admin', 'SWD', 'developers']
       → ✅ Access granted
       → Load UsersView component
```

---

## Data Flow Example: Regular User

```
1. Login
   └─► Email: user@3ddx.com

2. Server returns user data
   └─► {
         email: 'user@3ddx.com',
         groups: ['users', 'sales'],
         isAdmin: false
       }

3. Sidebar loads navigation config
   └─► 70+ navigation items defined

4. Filter navigation by user groups
   └─► For each item:
         permissions: ['admin'] → ❌ User lacks 'admin'
         permissions: ['finance'] → ❌ User lacks 'finance'
         permissions: ['*'] → ✅ Public
         permissions: ['SWD'] → ❌ User lacks 'SWD'

5. Filtered result for Regular User
   └─► Only ~15 items visible (public + user-specific)
       ✅ Home
       ✅ Projects > My Tasks
       ✅ Projects > Timesheets
       ✅ Help & Support
       ❌ User Management (hidden)
       ❌ Finance (hidden)
       ❌ Development (hidden)
       ❌ System (hidden)

6. User tries to access /users directly (via URL)
   └─► Route: /users
       Required: ['admin', 'SWD']
       User has: ['users', 'sales']
       → ❌ Access denied
       → Redirect to /dashboard
       → Console warning logged
```

---

## Component Hierarchy

```
App.vue
│
├─► v-app-bar
│   ├─► v-app-bar-nav-icon (toggle drawer)
│   ├─► v-app-bar-title
│   └─► Actions (LanguageSwitcher, ThemeToggle)
│
├─► NavigationSidebar (v-if="authStore.isAuthenticated")
│   │
│   ├─► Sidebar Header
│   │   ├─► Company Logo & Name
│   │   └─► Rail Toggle Button
│   │
│   ├─► User Info Section
│   │   ├─► User Avatar
│   │   ├─► User Name & Email
│   │   └─► Admin Badge (if admin)
│   │
│   ├─► Navigation Menu (v-list)
│   │   │
│   │   ├─► For each filtered nav item:
│   │   │   │
│   │   │   ├─► v-list-group (if has children)
│   │   │   │   ├─► Parent item with icon
│   │   │   │   └─► Children items
│   │   │   │
│   │   │   └─► v-list-item (if no children)
│   │   │       ├─► Icon
│   │   │       ├─► Title
│   │   │       └─► Badge (optional)
│   │   │
│   │   └─► v-divider (if item.divider)
│   │
│   └─► Sidebar Footer
│       ├─► Settings (admin only)
│       ├─► Logout
│       └─► Version Info
│
└─► v-main
    └─► router-view (current page component)
```

---

## File Dependencies

```
App.vue
  ├─► imports NavigationSidebar.vue
  ├─► imports ThemeToggle.vue
  ├─► imports LanguageSwitcher.vue
  └─► uses useAuthStore()

NavigationSidebar.vue
  ├─► imports navigationConfig.js
  │     ├─► NAVIGATION_CONFIG
  │     └─► filterNavigationByPermissions()
  ├─► uses useAuthStore()
  ├─► uses useRoute()
  └─► uses useRouter()

router/index.js
  ├─► imports navigationConfig.js
  │     └─► hasNavigationAccess()
  ├─► imports all view components
  └─► uses useAuthStore()

navigationConfig.js
  └─► Standalone (no dependencies)
      Pure configuration & utility functions

PlaceholderView.vue
  ├─► imports navigationConfig.js
  │     ├─► getBreadcrumbTrail()
  │     └─► NAVIGATION_CONFIG
  └─► uses useRoute()
```

---

## State Management Flow

```
┌──────────────────────────────────────────────────────────┐
│                     Auth Store (Pinia)                    │
│                                                           │
│  State:                                                   │
│    - user: { email, name, ... }                          │
│    - cachedUserDetails: { full profile }                 │
│    - cachedUserRights: { groups, permissions }           │
│    - isAuthenticated: boolean                            │
│                                                           │
│  Actions:                                                 │
│    - checkAuth() → Fetch user data from server           │
│    - logout() → Clear session & redirect                 │
│                                                           │
│  Used by:                                                 │
│    - App.vue (check if authenticated)                    │
│    - NavigationSidebar.vue (get user groups)             │
│    - Router guards (verify permissions)                  │
│    - DashboardView.vue (display user info)               │
└──────────────────────────────────────────────────────────┘
             │
             │ Updates from
             │
┌────────────▼──────────────────────────────────────────────┐
│                     Server API                            │
│                                                           │
│  Endpoints:                                               │
│    GET /api/auth/status                                   │
│      → Returns: { user, groups, permissions }            │
│                                                           │
│    GET /api/user/details                                  │
│      → Returns: Full user profile                        │
│                                                           │
│    GET /api/user/rights                                   │
│      → Returns: { groups, permissions, rights }          │
│                                                           │
│  Uses:                                                    │
│    - Casbin enforcer for permission checks               │
│    - Google Admin SDK for user data                      │
│    - Session management                                   │
└───────────────────────────────────────────────────────────┘
```

---

## Responsive Behavior

```
Desktop (> 960px)
┌────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌─────────────────────────────┐    │
│  │          │  │                             │    │
│  │          │  │                             │    │
│  │ Sidebar  │  │       Main Content          │    │
│  │ (Permanent)│ │       (router-view)        │    │
│  │          │  │                             │    │
│  │ Can      │  │                             │    │
│  │ toggle   │  │                             │    │
│  │ rail     │  │                             │    │
│  │ mode     │  │                             │    │
│  │          │  │                             │    │
│  └──────────┘  └─────────────────────────────┘    │
└────────────────────────────────────────────────────┘

Mobile (< 960px)
┌────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────┐  │
│  │  [≡]  AppBar                                │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │                                             │  │
│  │         Main Content (Full Width)           │  │
│  │                                             │  │
│  │                                             │  │
│  └─────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘

When [≡] clicked:
┌────────────────────────────────────────────────────┐
│  ┌──────────┐                                      │
│  │          │  ┌─────────────────────────────┐    │
│  │ Sidebar  │  │ Main Content                │    │
│  │ (Drawer) │  │ (Dimmed/Blocked)            │    │
│  │          │  │                             │    │
│  │          │  │                             │    │
│  └──────────┘  └─────────────────────────────┘    │
└────────────────────────────────────────────────────┘
```

---

This architecture diagram shows the complete flow of the navigation system from user login to component rendering!
