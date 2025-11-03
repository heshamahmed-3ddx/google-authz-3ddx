# Testing Authorization with Mock Users

## Overview

This testing infrastructure provides a comprehensive approach to testing authorization and access control without requiring real Google accounts or API calls. It uses mock user data to simulate different user types and authorization scenarios.

## Architecture

```
tests/
├── fixtures/
│   ├── mockUsers.js          # Mock user profiles and rights
│   └── mockGoogleAPI.js      # Mock Google API services
├── integration/
│   └── authorization-mock.test.js  # Integration tests
└── e2e/
    └── dashboard-access-mock.spec.js  # E2E tests
```

## Mock User Types

### 1. Admin User
- **Email**: `test.admin@3ddx.com`
- **Groups**: `['admin', 'SWD', 'developers']`
- **Access**: Full access to all dashboard sections and admin operations
- **Rights**: Can manage users, groups, settings, reports

### 2. SWD (Software Development) User
- **Email**: `test.developer@3ddx.com`
- **Groups**: `['SWD', 'developers']`
- **Access**: Restricted dashboard sections (User Rights, Technical Info, API Docs)
- **Rights**: Can access code repositories, deployments, API documentation

### 3. Regular User
- **Email**: `test.user@3ddx.com`
- **Groups**: `['users', 'sales']`
- **Access**: Basic user information only
- **Rights**: Can read/update own profile, manage sales leads

### 4. Finance User
- **Email**: `test.finance@3ddx.com`
- **Groups**: `['finance', 'users']`
- **Access**: Basic user information only (no SWD access)
- **Rights**: Can access financial reports, budgets, invoices

### 5. Contractor
- **Email**: `test.contractor@3ddx.com`
- **Groups**: `['contractors', 'users']`
- **Access**: Basic user information only
- **Rights**: Can access project tasks, timesheets

### 6. Suspended User
- **Email**: `test.suspended@3ddx.com`
- **Groups**: `[]`
- **Access**: None (account suspended)
- **Rights**: None

## Usage Examples

### Integration Tests (Jest)

```javascript
import { getMockUser, getMockUserRights } from '../fixtures/mockUsers.js';
import { MockCasbinEnforcer } from '../fixtures/mockGoogleAPI.js';

describe('Authorization Tests', () => {
  let enforcer;

  beforeEach(() => {
    enforcer = new MockCasbinEnforcer();
  });

  it('should allow admin to manage users', async () => {
    const adminRights = getMockUserRights('admin');
    
    const allowed = await enforcer.enforce(
      adminRights.userEmail,
      'users',
      'manage'
    );
    
    expect(allowed).toBe(true);
  });

  it('should deny regular user from accessing admin features', async () => {
    const regularRights = getMockUserRights('regular');
    
    const allowed = await enforcer.enforce(
      regularRights.userEmail,
      'users',
      'manage'
    );
    
    expect(allowed).toBe(false);
  });
});
```

### E2E Tests (Playwright)

```javascript
import { test, expect } from '@playwright/test';

test('admin should see all dashboard sections', async ({ page }) => {
  // Set mock admin session
  await page.evaluate(() => {
    localStorage.setItem('mock-user', JSON.stringify({
      email: 'test.admin@3ddx.com',
      id: 'mock-admin-001'
    }));
    localStorage.setItem('mock-groups', JSON.stringify(['admin', 'SWD']));
    localStorage.setItem('mock-auth-enabled', 'true');
  });

  await page.goto('/dashboard');

  // Verify all sections are visible
  await expect(page.locator('text=User Rights & Permissions')).toBeVisible();
  await expect(page.locator('text=Technical User Info')).toBeVisible();
  await expect(page.locator('text=API Documentation')).toBeVisible();
});

test('regular user should see limited access notice', async ({ page }) => {
  // Set mock regular user session
  await page.evaluate(() => {
    localStorage.setItem('mock-user', JSON.stringify({
      email: 'test.user@3ddx.com',
      id: 'mock-user-001'
    }));
    localStorage.setItem('mock-groups', JSON.stringify(['users']));
    localStorage.setItem('mock-auth-enabled', 'true');
  });

  await page.goto('/dashboard');

  // Verify restriction notice is shown
  await expect(page.locator('text=Limited Access')).toBeVisible();
  
  // Restricted sections should NOT be visible
  await expect(page.locator('text=User Rights & Permissions')).not.toBeVisible();
});
```

### API Endpoint Tests (Supertest)

```javascript
import request from 'supertest';
import app from '../../server/src/index.js';
import { createMockRequest, createMockResponse } from '../fixtures/mockGoogleAPI.js';

describe('API Authorization', () => {
  it('should allow admin to access user list', async () => {
    const req = createMockRequest('admin');
    
    const response = await request(app)
      .get('/api/users')
      .set('Cookie', [`session=${req.session.id}`])
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.users).toBeDefined();
  });

  it('should deny regular user from accessing user list', async () => {
    const req = createMockRequest('regular');
    
    await request(app)
      .get('/api/users')
      .set('Cookie', [`session=${req.session.id}`])
      .expect(403);
  });
});
```

## Mock Services

### MockGoogleOAuth2

Simulates Google OAuth2 authentication:

```javascript
import { MockGoogleOAuth2 } from '../fixtures/mockGoogleAPI.js';

const oauth2 = new MockGoogleOAuth2();

// Get token for admin user
const { tokens } = await oauth2.getToken('auth-code-admin');

// Verify token
const payload = await oauth2.verifyIdToken(tokens.access_token);
console.log(payload.getPayload().email); // test.admin@3ddx.com
```

### MockGoogleAdminSDK

Simulates Google Admin SDK:

```javascript
import { MockGoogleAdminSDK } from '../fixtures/mockGoogleAPI.js';

const adminSDK = new MockGoogleAdminSDK();

// Get user details
const { data: user } = await adminSDK.getUser('test.admin@3ddx.com');
console.log(user.fullName); // Test Admin User

// List user groups
const { data: groups } = await adminSDK.listUserGroups('test.admin@3ddx.com');
console.log(groups.groups); // [{email: 'admin@3ddx.com', ...}]
```

### MockCasbinEnforcer

Simulates Casbin authorization:

```javascript
import { MockCasbinEnforcer } from '../fixtures/mockGoogleAPI.js';

const enforcer = new MockCasbinEnforcer();

// Check authorization
const allowed = await enforcer.enforce(
  'test.admin@3ddx.com',  // subject
  'users',                 // resource
  'manage'                 // action
);

console.log(allowed); // true for admin, false for others
```

## Helper Functions

### generateMockSession()

Create a complete mock session for testing:

```javascript
import { generateMockSession } from '../fixtures/mockUsers.js';

const adminSession = generateMockSession('admin');
/*
{
  user: { email: 'test.admin@3ddx.com', ... },
  rights: { groups: ['admin', 'SWD'], ... },
  accessToken: 'mock-token-admin-...',
  refreshToken: 'mock-refresh-admin-...',
  expiresAt: 1234567890,
  sessionId: 'mock-session-admin-...'
}
*/
```

### createMockRequest() & createMockResponse()

Create Express-like request/response objects:

```javascript
import { createMockRequest, createMockResponse } from '../fixtures/mockGoogleAPI.js';

const req = createMockRequest('admin', {
  body: { resource: 'users', action: 'read' },
  query: { page: 1 },
  method: 'POST'
});

const res = createMockResponse();

// Use in middleware tests
await authorizationMiddleware(req, res, next);

console.log(res.statusCode); // 200
console.log(res.body); // { success: true, ... }
```

## Testing Scenarios

### Dashboard Access Control

#### Test: Admin Access
- ✅ Should see all dashboard sections
- ✅ Should NOT see "Limited Access" notice
- ✅ Should see admin badge
- ✅ Can test authorization
- ✅ Can view technical info

#### Test: SWD Member Access
- ✅ Should see restricted sections
- ✅ Should NOT see "Limited Access" notice
- ✅ Should see SWD group membership
- ✅ Can access API documentation

#### Test: Regular User Access
- ✅ Should only see public sections
- ✅ Should see "Limited Access" notice
- ✅ Should NOT see restricted sections
- ✅ Notice explains required groups

### Authorization Enforcement

#### Test: Resource Access
```javascript
// Admin can manage users
enforce('test.admin@3ddx.com', 'users', 'manage') → true

// SWD can read code repositories
enforce('test.developer@3ddx.com', 'code-repositories', 'read') → true

// Regular user cannot manage users
enforce('test.user@3ddx.com', 'users', 'manage') → false

// Finance can approve invoices
enforce('test.finance@3ddx.com', 'invoices', 'approve') → true

// Contractor cannot access financial data
enforce('test.contractor@3ddx.com', 'financial-reports', 'read') → false
```

## Running Tests

### Integration Tests (Jest)
```bash
# Run all integration tests
npm run test:integration

# Run specific test file
npm run test tests/integration/authorization-mock.test.js

# Run with coverage
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/dashboard-access-mock.spec.js

# Run in headed mode (see browser)
npx playwright test --headed

# Run in UI mode (interactive)
npx playwright test --ui
```

### Watch Mode
```bash
# Jest watch mode
npm run test:watch

# Playwright watch mode
npx playwright test --ui
```

## Best Practices

### 1. Use Descriptive Test Names
```javascript
// ✅ Good
test('admin should be able to delete users from system', ...)

// ❌ Bad
test('test delete', ...)
```

### 2. Test Both Positive and Negative Cases
```javascript
// Test what should work
test('admin can access admin panel', ...)

// Test what should NOT work
test('regular user cannot access admin panel', ...)
```

### 3. Clean Up After Tests
```javascript
afterEach(async ({ page }) => {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});
```

### 4. Use Mock Data Consistently
```javascript
// Always use the helper functions
const admin = getMockUser('admin');

// Don't create ad-hoc mock data
// ❌ const admin = { email: 'admin@example.com', ... }
```

### 5. Test Edge Cases
```javascript
test('should handle suspended user gracefully', ...)
test('should handle missing user rights', ...)
test('should handle expired session', ...)
```

## Debugging

### View Mock Data
```javascript
import { getMockUser } from '../fixtures/mockUsers.js';

const admin = getMockUser('admin');
console.log(JSON.stringify(admin, null, 2));
```

### Playwright Debug Mode
```bash
# Open Playwright inspector
PWDEBUG=1 npx playwright test

# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Jest Verbose Output
```bash
npm run test -- --verbose
```

## Troubleshooting

### Issue: Tests failing due to timing
**Solution**: Use Playwright's built-in waiting
```javascript
await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
```

### Issue: Mock session not persisting
**Solution**: Ensure localStorage is set before navigation
```javascript
await page.goto('/');
await setMockUserSession(page, 'admin');
await page.goto('/dashboard'); // Navigate AFTER setting session
```

### Issue: Authorization tests failing
**Solution**: Check mock policies are initialized correctly
```javascript
const enforcer = new MockCasbinEnforcer();
console.log(enforcer.policies); // Verify policies exist
```

## Adding New Mock Users

1. Add user profile to `mockUsers.js`:
```javascript
export const mockNewUser = {
  email: 'test.new@3ddx.com',
  groups: ['new-group'],
  // ... other properties
};
```

2. Add rights to `mockUserRights`:
```javascript
newUser: {
  userEmail: 'test.new@3ddx.com',
  groups: ['new-group'],
  rights: [...]
}
```

3. Update helper functions:
```javascript
export function getMockUser(userType) {
  const users = {
    // ... existing users
    newUser: mockNewUser
  };
  return users[userType] || mockRegularUser;
}
```

4. Write tests for the new user type.

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

## Support

For issues or questions about the testing infrastructure:
1. Check this documentation
2. Review example tests in `tests/` directory
3. Consult the team
4. File an issue in the project repository
