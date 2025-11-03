---
title: Client API Reference
---

# Client API Reference

> This section documents client-side services and stores. For backend API, see [Backend API Reference](../api-reference).

## Services
- **apiService**: Handles HTTP requests to the backend (GET, POST, PUT, DELETE)
- **logger**: Client-side logging utility (info, warn, error)

## Stores
- **auth**: Authentication state, login/logout, user info
- **devMode**: Development mode toggles, simulated groups, admin view
- **theme**: Theme management (light/dark)

## Usage Example
```js
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();
auth.login(email, password);
```

Refer to JSDoc comments in each file for detailed usage and method signatures.