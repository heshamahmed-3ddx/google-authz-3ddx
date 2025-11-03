---
title: Dev Mode Guide
---

# 🔧 Development Mode Guide

## Quick Fix: Access Denied Error

If you're seeing: **"Access denied to /finance/surgical-guide-report"**, follow these steps:

## ✅ Solution (2 Options)

### **Option A: Enable Specific Group (Recommended)**

1. **Navigate to Dashboard** (click "Dashboard" in the sidebar)
2. **Look at the top-left** - you'll see two chips:
   - 🛡️ "Admin View: OFF"
   - 👥 "Groups (0)"
3. **Click "Groups (0)"**
4. **Check "Finance22"** in the dropdown menu
5. **Navigate back to Surgical Guide Report** - You now have access! ✅

### **Option B: Enable Admin View (Full Access)**

1. **Navigate to Dashboard**
2. **Click "Admin View: OFF"** chip
3. It will toggle to **"Admin View: ON"** (green)
4. **You now have access to ALL routes!** ✅

## 🎯 What Just Happened?

The router was checking your **real** Google Workspace groups but wasn't considering the **simulated** groups from dev mode. I've fixed this by:

1. ✅ Updated the router guard to check simulated groups in development mode
2. ✅ Added support for "Admin View" bypass in the router
3. ✅ Enhanced the Surgical Guide Report with a helpful dev mode banner

## 📋 Development Mode Features

### **Group Simulator**
- **Purpose**: Test routes that require specific group memberships
- **Available Groups**:
  - ✅ admin - Full administrative access
  - ✅ Finance22 - Surgical Guide Report access
  - ✅ Developers22 - API Documentation access
  - ✅ SWD - Software Development team
  - ✅ finance - Finance department
  - ✅ hr - Human Resources
  - ✅ And more...

### **Admin View Toggle**
- **Purpose**: Quick access to all routes without checking groups
- **When ON**: Bypasses all group-based restrictions
- **Best For**: Testing navigation and UI without group setup

### **Development Banner**
- **Shows**: Current simulated groups and admin view status
- **Color**: Yellow/warning (to remind you it's dev mode)
- **Auto-hides**: In production builds

## 🔐 Group Requirements by Route

| Route | Required Groups | Description |
|-------|----------------|-------------|
| `/finance/surgical-guide-report` | `admin`, `Finance22` | Surgical guide cases report |
| `/users` | `admin`, `SWD` | User management |
| `/groups` | `admin`, `SWD` | Group management |
| `/roles` | `admin` | Role management |
| `/policies` | `admin` | Policy management |
| `/finance/*` | `admin`, `finance` | Financial routes |
| `/organization/*` | `admin`, `SWD` | Organization routes |

## 🧪 Testing Workflow

1. **Set Up Groups**: Use the group simulator to mimic real user access.
2. **Toggle Admin View**: Switch admin view on or off to test different access levels.
3. **Check Dev Banner**: Ensure the development banner shows the correct simulated groups.
4. **Test Routes**: Navigate to various routes to verify access and functionality.
5. **Review Logs**: Check the console and network logs for any errors or warnings.
6. **Fix Issues**: Based on testing, make necessary code or configuration changes.
7. **Repeat**: Continue testing and refining until the development mode works as expected.

## 📦 Common Issues

- **Access Denied Errors**: Usually fixed by enabling the correct group or turning on admin view.
- **Routes Not Working**: Ensure the group simulator has the right groups checked.
- **Dev Banner Not Showing**: Refresh the page or check if you're in development mode.

## 🔄 Syncing with Production

To ensure your development mode changes are in sync with production:

1. **Regularly Pull Latest Changes**: From the main branch to keep your dev branch up-to-date.
2. **Test After Each Pull**: Verify that your development mode still works after syncing.
3. **Resolve Conflicts Promptly**: Address any merge conflicts that arise during syncing.
4. **Communicate with Team**: Keep the team informed about significant changes or issues.

## 📚 Additional Resources

- [VitePress Documentation](https://vitepress.dev/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Vue 3 Documentation](https://v3.vuejs.org/)

For any unresolved issues, consider reaching out to the development team or consulting the relevant documentation.
