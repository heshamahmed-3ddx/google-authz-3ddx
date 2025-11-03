---
sidebar_position: 1
slug: /api
---

# API Reference

This page documents the main API endpoints and modules for the google-authz-3ddx project.

## Authentication

### `POST /api/auth/login`
Authenticate a user with Google Workspace.

**Request:**
- Google OAuth token

**Response:**
- User session
- User details

---

## User Rights & Permissions

### `GET /api/user/rights`
Returns the resources and permissions available to the authenticated user.

**Response:**
- `rights`: Array of resources and actions
- `groups`: User's Google groups
- `roles`: User's roles

---

## Debug Endpoints

### `GET /api/debug/user-email`
Returns the authenticated user's email and group memberships.

### `GET /api/debug/casbin-test`
Returns a summary of Casbin permissions for the current user.

---

## Modules

- `casbin.js`: Authorization logic
- `api.js`: Express API routes
- `users.json`: User/group configuration
- `policy.csv`: Casbin policy rules

---

For more details, see the source code and additional docs pages.