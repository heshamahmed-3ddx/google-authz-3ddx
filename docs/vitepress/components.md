---
title: Component Reference
---

# Component Reference

> This section documents all major Vue components in the client app, including usage, props, and examples.

## AdminPanel.vue
**Purpose:** Admin dashboard for user & policy management  
**Props:**
- `users` (Array): List of users to display
- `userHeaders` (Array): Table headers for users
**Events:**
- `editUser(item)`: Edit user action  
**Usage Example:**
```vue
<AdminPanel :users="users" :userHeaders="headers" @editUser="editUser" />
```

## DevToolbar.vue
**Purpose:** Development mode settings and toggles  
**Props:**
- None (uses Pinia store)  
**Features:**
- Toggle dev mode, admin view, simulated groups

## LanguageSwitcher.vue
**Purpose:** UI language selection  
**Props:**
- `supportedLanguages` (Array): Available languages
- `currentLocale` (String): Current language code  
**Events:**
- `changeLanguage(code)`: Change language

## NavigationSidebar.vue
**Purpose:** Main sidebar navigation  
**Props:**
- `drawer` (Boolean): Sidebar open/close
- `rail` (Boolean): Compact/expanded mode  
**Slots:**
- Custom header, footer, navigation items

## ThemeToggle.vue
**Purpose:** Light/dark theme switcher  
**Props:**
- `themeStore.currentTheme` (String): Current theme  
**Events:**
- `setTheme(theme)`: Change theme

---
Add more details and usage examples for each component as needed. For full source, see `client/src/components/`.