# Test Suite

This directory contains the test infrastructure for the Google AuthZ 3DDX project.

## Test Structure

```
tests/
├── unit/           # Unit tests for individual components
├── integration/    # Integration tests for API endpoints
├── e2e/           # End-to-end tests for complete user flows
├── fixtures/      # Test data and mock files
└── utils/         # Test utilities and helpers
```

## Running Tests

### All Tests
```bash
# From project root
./scripts/test-all.sh
```

### Individual Test Suites
```bash
# Server tests
cd server && npm test

# Client tests
cd client && npm test

# Integration tests
cd tests && npm test
```

## Test Types

### Unit Tests
- Individual function and component testing
- Mock external dependencies
- Fast execution

### Integration Tests
- API endpoint testing
- Database integration
- Service interaction testing

### End-to-End Tests
- Complete user workflows
- Browser automation
- Real OAuth flow testing (with test accounts)

## Test Configuration

- **Jest** for server-side testing
- **Vitest** for client-side testing
- **Playwright** for E2E testing
- **Supertest** for API testing

## Writing Tests

### Server Tests
```javascript
// Example server test
import request from 'supertest'
import app from '../src/index.js'

describe('Auth Routes', () => {
  test('GET /auth/google should return auth URL', async () => {
    const response = await request(app)
      .get('/auth/google')
      .expect(200)
    
    expect(response.body.authUrl).toContain('accounts.google.com')
  })
})
```

### Client Tests
```javascript
// Example Vue component test
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import LoginButton from '@/components/LoginButton.vue'

describe('LoginButton', () => {
  it('renders login button', () => {
    const wrapper = mount(LoginButton)
    expect(wrapper.text()).toContain('Login with Google')
  })
})
```

## Coverage Reports

Test coverage reports are generated in:
- `server/coverage/`
- `client/coverage/`
- `tests/coverage/`

## CI/CD Integration

Tests are configured to run in CI/CD pipelines with:
- Automated test execution
- Coverage reporting
- Test result notifications