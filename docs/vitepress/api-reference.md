---
title: Backend API Reference
---

# 3D Diagnostix Authorization API Documentation

## Overview

The 3D Diagnostix Authorization API provides enterprise-grade authentication and authorization services for the platform. It integrates Google Workspace SSO with Casbin-based RBAC (Role-Based Access Control) to deliver comprehensive security and audit capabilities.

## Table of Contents

- [Authentication](#authentication)
- [Authorization](#authorization)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Audit Logging](#audit-logging)
- [Code Examples](#code-examples)

## Authentication

### Overview
The API uses session-based authentication with Google OAuth 2.0. Users must authenticate via the Google OAuth flow before accessing protected resources.

### Authentication Flow
1. User initiates login via `/auth/google`
2. Google OAuth consent and authentication
3. User redirected to `/auth/callback` with authorization code
4. Server exchanges code for access tokens
5. Session established with user context
6. Subsequent API calls include session cookie

### Session Management
- Sessions are stored server-side using express-session
- Session cookies are HTTP-only and secure in production
- Sessions include user profile and OAuth tokens
- Automatic session refresh using Google refresh tokens

## Authorization

### Casbin RBAC Model
The authorization system uses Casbin with an RBAC model supporting:

- **Subjects**: Users identified by email addresses
- **Objects**: Resources like `patient_data`, `financial_reports`, `admin_panel`
- **Actions**: Operations like `read`, `write`, `delete`, `approve`
- **Groups**: User groups like `Engineering`, `Finance`, `Admin`
- **Roles**: Organizational roles like `engineer`, `manager`, `admin`

### Policy Structure
```
# Format: subject, object, action
Engineering, patient_data, read
Engineering, patient_data, write
Finance, financial_reports, read
Finance, financial_reports, write
Admin, admin_panel, read
Admin, admin_panel, write
```

### User-Group Mapping
Users are mapped to groups via the `users.json` configuration:
```json
{
  "users": [
    {
      "email": "john.doe@3ddiagnostix.com",
      "fullName": "John Doe",
      "groups": ["Engineering"],
      "roles": ["engineer"],
      "orgUnit": "Software Development",
      "department": "Engineering"
    }
  ]
}
```

## API Endpoints

### User Data Endpoints

#### GET /api/profile
Retrieve user profile from Google API.

...existing content continues...
