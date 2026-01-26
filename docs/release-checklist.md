# Release Checklist

This document outlines the critical checklist items that must be completed before each release of InsightHub.

## Pre-Release Requirements

### 1. ✅ Make All Tests Pass

All test suites must pass successfully before a release:

**Client Tests:**
```bash
cd client
npm run test
npm run test:unit
```

**Server Tests:**
```bash
cd server
npm test
```

**Coverage Requirements:**
- Aim for >80% code coverage
- All critical paths must be tested
- No failing tests allowed in release branch

**Status:** 🔴 Pending

---

### 2. 📁 Configure File-Based Logging

Logs must be written to files instead of console output for production environments.

**Requirements:**
- Configure Winston or similar logger for file output
- Separate log files for:
  - `error.log` - Error level logs
  - `combined.log` - All logs
  - `access.log` - HTTP access logs
- Log rotation policy (daily or size-based)
- Console logging only in development mode

**Configuration Location:** `server/src/config/logger.js`

**Status:** 🔴 Pending

---

### 3. 📅 Standardize Date Format

All date logging must use the format: **`17/Jan/2026`** (DD/MMM/YYYY)

**Locations to Update:**
- Server logs
- Client logs
- API responses
- Report exports
- Audit trails
- Announcement timestamps

**Standard Format Function:**
```javascript
const formatDate = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};
```

**Status:** 🔴 Pending

---

### 4. 🏷️ Git Tagging for Releases

Every release must be tagged with a semantic version tag.

**Tagging Process:**
```bash
# Format: v{MAJOR}.{MINOR}.{PATCH}
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

**Semantic Versioning:**
- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes

**Automation:**
- Add to CI/CD pipeline
- Create release notes automatically
- Update CHANGELOG.md

**Status:** 🔴 Pending

---

### 5. 🔧 Pre-Commit Linter Setup

Linter must run automatically on each commit to ensure code quality.

**Setup Husky + lint-staged:**

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**Configuration in `package.json`:**
```json
{
  "lint-staged": {
    "*.{js,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix"
    ]
  }
}
```

**Linter Rules:**
- ESLint for JavaScript/Vue
- Prettier for formatting
- Stylelint for CSS/SCSS

**Status:** 🔴 Pending

---

### 6. 📊 Review Prometheus KPIs

Review and document all Prometheus metrics and KPIs being tracked.

**Current Metrics Categories:**
- **System Metrics:**
  - CPU usage
  - Memory usage
  - Disk I/O
  
- **Application Metrics:**
  - Request rate
  - Response time
  - Error rate
  - Active sessions
  
- **Business Metrics:**
  - User logins
  - Report accesses
  - API calls by endpoint
  - Failed authentication attempts

**Grafana Dashboard:**
- Available at: `http://localhost:3002` (dev)
- Production: [Add production URL]

**Review Tasks:**
- [ ] Verify all metrics are being collected
- [ ] Ensure dashboards are up to date
- [ ] Document alert thresholds
- [ ] Add missing KPIs if identified

**Status:** 🔴 Pending

---

## Checklist Summary

| # | Task | Status | Priority |
|---|------|--------|----------|
| 1 | Make all tests pass | 🔴 Pending | Critical |
| 2 | Configure file-based logging | 🔴 Pending | High |
| 3 | Standardize date format | 🔴 Pending | High |
| 4 | Git tagging for releases | 🔴 Pending | Medium |
| 5 | Pre-commit linter setup | 🔴 Pending | Medium |
| 6 | Review Prometheus KPIs | 🔴 Pending | Medium |

---

## Approval Process

Once all items are marked as ✅ Complete:

1. **Code Review:** At least one senior developer review
2. **QA Testing:** Full regression test suite
3. **Staging Deployment:** Deploy to staging environment
4. **Production Release:** Deploy to production after sign-off

---

## Related Documentation

- [CI/CD Implementation Guide](/CI-CD-IMPLEMENTATION)
- [Deployment Guide](/deployment-guide)
- [Testing Guide](/admin-testing-guide)
- [Prometheus Metrics](/BACKEND_PERFORMANCE_OPTIMIZATIONS)

---

*Last Updated: January 26, 2026*
