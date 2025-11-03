# Mock User Testing - Quick Reference

## 🎭 Available Mock Users

| User Type | Email | Groups | Dashboard Access |
|-----------|-------|--------|------------------|
| **Admin** | `test.admin@3ddx.com` | admin, SWD, developers | ✅ Full Access |
| **SWD** | `test.developer@3ddx.com` | SWD, developers | ✅ Restricted Sections |
| **Regular** | `test.user@3ddx.com` | users, sales | ⚠️ Basic Info Only |
| **Finance** | `test.finance@3ddx.com` | finance, users | ⚠️ Basic Info Only |
| **Contractor** | `test.contractor@3ddx.com` | contractors, users | ⚠️ Basic Info Only |
| **Suspended** | `test.suspended@3ddx.com` | (none) | ❌ No Access |

## 🚀 Quick Start

### Import Mock Users
```javascript
import { 
  getMockUser, 
  getMockUserRights, 
  generateMockSession 
} from '../fixtures/mockUsers.js';
```

### Get User Data
```javascript
const admin = getMockUser('admin');
const rights = getMockUserRights('admin');
const session = generateMockSession('admin');
```

### Create Mock Services
```javascript
import { 
  MockCasbinEnforcer,
  createMockRequest,
  createMockResponse 
} from '../fixtures/mockGoogleAPI.js';

const enforcer = new MockCasbinEnforcer();
const req = createMockRequest('admin');
const res = createMockResponse();
```

## 📝 Common Test Patterns

### Test Authorization
```javascript
test('admin can manage users', async () => {
  const enforcer = new MockCasbinEnforcer();
  const allowed = await enforcer.enforce(
    'test.admin@3ddx.com',
    'users',
    'manage'
  );
  expect(allowed).toBe(true);
});
```

### Test Dashboard Access
```javascript
test('SWD user sees restricted sections', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('mock-groups', JSON.stringify(['SWD']));
  });
  await page.goto('/dashboard');
  await expect(page.locator('text=User Rights')).toBeVisible();
});
```

### Test API Endpoint
```javascript
test('GET /api/users requires admin', async () => {
  const req = createMockRequest('regular');
  await request(app)
    .get('/api/users')
    .expect(403);
});
```

## 🔍 Dashboard Access Matrix

| Section | Admin | SWD | Regular | Finance | Contractor |
|---------|-------|-----|---------|---------|------------|
| User Details | ✅ | ✅ | ✅ | ✅ | ✅ |
| Employee Info | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contact Info | ✅ | ✅ | ✅ | ✅ | ✅ |
| Groups | ✅ | ✅ | ✅ | ✅ | ✅ |
| **User Rights** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Technical Info** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **API Docs** | ✅ | ✅ | ❌ | ❌ | ❌ |

## ⚡ Run Tests

```bash
# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Specific file
npm run test tests/integration/authorization-mock.test.js

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🎯 User Rights Examples

### Admin Rights
- ✅ Manage users, groups, settings
- ✅ Create, update, delete resources
- ✅ Access all reports

### SWD Rights
- ✅ Access code repositories
- ✅ Read API documentation
- ✅ Create deployments
- ❌ Manage users

### Regular User Rights
- ✅ Read/update own profile
- ✅ Manage sales leads (if in sales group)
- ❌ Access admin features
- ❌ View technical documentation

### Finance Rights
- ✅ Access financial reports
- ✅ Approve invoices
- ✅ Update budgets
- ❌ Access technical features

## 🐛 Debug Tips

### View Mock Data
```javascript
console.log(JSON.stringify(getMockUser('admin'), null, 2));
```

### Playwright Debug
```bash
PWDEBUG=1 npx playwright test
```

### Jest Verbose
```bash
npm run test -- --verbose
```

### Check Enforcer Policies
```javascript
const enforcer = new MockCasbinEnforcer();
console.log(enforcer.policies);
```

## 📚 Common Test Scenarios

### ✅ Should Allow
```javascript
// Admin manages users
enforce('test.admin@3ddx.com', 'users', 'manage') → true

// SWD reads API docs
enforce('test.developer@3ddx.com', 'api-documentation', 'read') → true

// User updates own profile
enforce('test.user@3ddx.com', 'profile', 'update') → true
```

### ❌ Should Deny
```javascript
// Regular user manages users
enforce('test.user@3ddx.com', 'users', 'manage') → false

// Contractor accesses financial data
enforce('test.contractor@3ddx.com', 'financial-reports', 'read') → false

// Suspended user does anything
enforce('test.suspended@3ddx.com', 'profile', 'read') → false
```

## 🔧 Customize Mock User

```javascript
// Create custom user
const customUser = {
  ...getMockUser('regular'),
  groups: ['custom-group'],
  department: 'Custom Dept'
};

// Add custom rights
const customRights = {
  userEmail: 'custom@3ddx.com',
  groups: ['custom-group'],
  rights: [
    { resource: 'custom-resource', actions: ['read', 'write'] }
  ]
};
```

## 📖 Full Documentation

- **Complete Guide**: `tests/README-MOCK-TESTING.md`
- **Mock Users**: `tests/fixtures/mockUsers.js`
- **Mock Services**: `tests/fixtures/mockGoogleAPI.js`
- **Example Tests**: `tests/integration/authorization-mock.test.js`

## 💡 Pro Tips

1. **Always use helper functions** - Don't create users manually
2. **Test positive AND negative cases** - What should and shouldn't work
3. **Clean up after tests** - Clear localStorage/sessionStorage
4. **Use descriptive test names** - Explain what's being tested
5. **Check edge cases** - Suspended users, missing data, etc.

---

**Need help?** Check the full documentation or ask the team!
