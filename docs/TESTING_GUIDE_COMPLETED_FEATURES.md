# Testing Guide - Completed Features

**Date**: 2025-01-XX  
**Purpose**: Comprehensive testing guide for all completed features  
**Target**: Manual testing and test case documentation

---

## 📋 Testing Overview

This guide provides step-by-step testing instructions for all features completed in this session. Each feature has detailed test cases covering:
- ✅ Happy path scenarios
- ⚠️ Edge cases
- 🐛 Error handling
- 🔒 Security/access control

---

## 1. ✅ Date/Time Format Standardization

### Test Cases

#### TC-1.1: Server-Side Date Formatting
**Objective**: Verify server formats dates as `31/Dec/2025`

**Steps**:
1. Access any server endpoint that returns dates
2. Check response - dates should be in format `DD/Mmm/YYYY`

**Expected Result**:
- Dates display as `31/Dec/2025` format
- Months abbreviated (Jan, Feb, Mar, etc.)
- Year in 4 digits

**Files to Test**:
- `server/src/utils/dateFormatter.js`
- Any API endpoint returning dates

---

#### TC-1.2: Server-Side Time Formatting
**Objective**: Verify server formats times as `hh:mma/p`

**Steps**:
1. Access any server endpoint that returns times
2. Check response - times should be in format `10:02p` or `02:15a`

**Expected Result**:
- Times display as `hh:mma/p` format
- 12-hour format with am/pm indicator
- No leading zero for single digit hours (optional)

**Files to Test**:
- `server/src/utils/dateFormatter.js`
- Dashboard API endpoints

---

#### TC-1.3: Client-Side Date Formatting
**Objective**: Verify client formats dates correctly

**Steps**:
1. Open Dashboard view
2. Check all date displays
3. Verify format matches `31/Dec/2025`

**Expected Result**:
- All dates use consistent format
- Format matches server-side format

**Files to Test**:
- `client/src/utils/dateFormatter.js`
- `client/src/views/DashboardView.vue`

---

#### TC-1.4: Client-Side Time Formatting
**Objective**: Verify client formats times correctly

**Steps**:
1. Open Dashboard view
2. Check all time displays
3. Verify format matches `hh:mma/p`

**Expected Result**:
- All times use consistent format
- Format matches server-side format

**Files to Test**:
- `client/src/utils/dateFormatter.js`
- Dashboard components

---

#### TC-1.5: Edge Cases
**Objective**: Test edge cases for date/time formatting

**Test Scenarios**:
- ✅ Invalid date input (should handle gracefully)
- ✅ Null/undefined dates (should handle gracefully)
- ✅ Different timezones (if applicable)
- ✅ Leap year dates (Feb 29)

**Expected Result**:
- No errors or crashes
- Graceful error handling
- Appropriate fallback values

---

### Manual Testing Steps

```bash
# 1. Test server-side formatting
# Open browser console and check API responses
# Or use curl:
curl http://localhost:3001/api/user/details

# 2. Test client-side formatting
# Open Dashboard and verify all dates/times display correctly

# 3. Check browser console for any errors
```

---

## 2. ✅ GitHub Repository Link

### Test Cases

#### TC-2.1: GitHub Link Display
**Objective**: Verify GitHub link appears in Technical Documentation

**Steps**:
1. Login as developer (admin, SWD, or developers group)
2. Navigate to `/docs/technical`
3. Check for GitHub repository section

**Expected Result**:
- GitHub repository link is visible
- Link opens in new tab
- Repository name displayed correctly

**Files to Test**:
- `client/src/views/Documentation/TechnicalView.vue`
- Server config for GitHub URL

---

#### TC-2.2: GitHub API Endpoint
**Objective**: Verify GitHub config API endpoint works

**Steps**:
1. Login as authenticated user
2. Make GET request to `/api/config/github`
3. Check response

**Expected Result**:
```json
{
  "success": true,
  "data": {
    "repositoryUrl": "https://github.com/...",
    "repositoryName": "InsightHub",
    "displayInDocs": true
  }
}
```

**Files to Test**:
- `server/src/routes/api.routes.js` (GitHub endpoint)
- `server/src/config/config.js` (GitHub config)

---

#### TC-2.3: Conditional Display
**Objective**: Verify GitHub link respects configuration

**Steps**:
1. Set `GITHUB_DISPLAY_IN_DOCS=false` in environment
2. Restart server
3. Check Technical Documentation view

**Expected Result**:
- GitHub link hidden when `displayInDocs: false`
- No errors in console

---

### Manual Testing Steps

```bash
# 1. Test API endpoint
curl -X GET http://localhost:3001/api/config/github \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"

# 2. Test in browser
# Navigate to: http://localhost:5173/docs/technical
# Verify GitHub link appears and works
```

---

## 3. ✅ Report Access Logging (CRITICAL)

### Test Cases

#### TC-3.1: Automatic Logging - Manual Access
**Objective**: Verify report access is automatically logged

**Steps**:
1. Login as user with report access
2. Navigate to Surgical Guide Report
3. Access report with filters
4. Check database for log entry

**Expected Result**:
- Log entry created in `report_access_logs` table
- All fields populated correctly:
  - `report_id`: 'surgical_guide'
  - `report_name`: 'Surgical Guide Report'
  - `requester_email`: User's email
  - `access_type`: 'manual'
  - `access_time`: Current timestamp
  - `request_duration_ms`: Duration in milliseconds
  - `query_parameters`: JSON with filters
  - `response_status`: 200 (or appropriate)

**Files to Test**:
- `server/src/middleware/reportLogging.js`
- `database/report_access_logs_schema.sql`
- `server/src/services/reportLogging.service.js`

---

#### TC-3.2: Automatic Logging - Export Access
**Objective**: Verify CSV export is logged

**Steps**:
1. Login as user with report access
2. Navigate to Surgical Guide Report
3. Export report to CSV
4. Check database for log entry

**Expected Result**:
- Log entry created
- `access_type`: 'export'
- `metadata` contains file size info

**Files to Test**:
- `server/src/controllers/surgicalGuideOrders.controller.js` (exportCSV)
- Export logging code

---

#### TC-3.3: Log Query Parameters
**Objective**: Verify query parameters are logged correctly

**Steps**:
1. Access report with filters:
   - Start date: 2024-01-01
   - End date: 2024-12-31
   - Order type: specific type
2. Check log entry `query_parameters` field

**Expected Result**:
- All query parameters captured in JSON
- Format: `{"startDate": "...", "endDate": "...", ...}`

---

#### TC-3.4: Error Logging
**Objective**: Verify errors are logged when report access fails

**Steps**:
1. Access report with invalid parameters
2. Trigger error (e.g., invalid date format)
3. Check log entry

**Expected Result**:
- Log entry created even on error
- `response_status`: Error status code
- `error_message`: Error details
- `records_returned`: 0 or null

---

#### TC-3.5: Performance Metrics
**Objective**: Verify request duration is logged

**Steps**:
1. Access report (note the time)
2. Check log entry `request_duration_ms`

**Expected Result**:
- Duration logged in milliseconds
- Reasonable values (not 0 or extremely high)

---

### Manual Testing Steps

```bash
# 1. Access report and check database
mysql -u user -p database_name

# Check log entries
SELECT * FROM report_access_logs 
ORDER BY access_time DESC 
LIMIT 10;

# 2. Test with different access types
# - Manual access
# - Export
# - API access (if applicable)

# 3. Verify all fields populated
DESCRIBE report_access_logs;
```

### SQL Queries for Verification

```sql
-- Check recent log entries
SELECT 
    report_name,
    requester_email,
    access_type,
    access_time,
    request_duration_ms,
    response_status,
    records_returned
FROM report_access_logs
ORDER BY access_time DESC
LIMIT 20;

-- Check export logs specifically
SELECT * FROM report_access_logs
WHERE access_type = 'export'
ORDER BY access_time DESC;

-- Performance analysis
SELECT 
    AVG(request_duration_ms) as avg_duration,
    MIN(request_duration_ms) as min_duration,
    MAX(request_duration_ms) as max_duration,
    COUNT(*) as total_requests
FROM report_access_logs
WHERE access_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR);
```

---

## 4. ✅ Enhanced Progress Bars

### Test Cases

#### TC-4.1: Progress Display
**Objective**: Verify progress bar shows percentage

**Steps**:
1. Navigate to Surgical Guide Report
2. Trigger data loading
3. Observe progress bar

**Expected Result**:
- Progress bar displays percentage (0-100%)
- Percentage updates during loading
- Visual progress bar animates

**Files to Test**:
- `client/src/components/ProgressBarEnhanced.vue`
- `client/src/views/Reports/SurgicalGuideReportView.vue`

---

#### TC-4.2: Time Estimation
**Objective**: Verify estimated time remaining is displayed

**Steps**:
1. Navigate to Surgical Guide Report
2. Trigger data loading
3. Check for "Estimated time: X seconds" display

**Expected Result**:
- Time estimate displayed
- Updates as progress continues
- Shows reasonable estimates

---

#### TC-4.3: Stage Indicators
**Objective**: Verify current state text is displayed

**Steps**:
1. Navigate to Surgical Guide Report
2. Trigger data loading
3. Observe stage indicators

**Expected Result**:
- Stages shown: "Starting...", "Processing...", "Finishing..."
- Stage updates during progress
- Clear indication of current state

---

#### TC-4.4: Progress Completion
**Objective**: Verify progress bar completes correctly

**Steps**:
1. Trigger data loading
2. Wait for completion
3. Check final state

**Expected Result**:
- Progress reaches 100%
- Progress bar hides on completion
- Data loads successfully

---

### Manual Testing Steps

```bash
# 1. Open Surgical Guide Report
# Navigate to: http://localhost:5173/reports/surgical-guide

# 2. Trigger data loading with large date range
# This will show progress bar more clearly

# 3. Observe:
# - Progress percentage
# - Time estimate
# - Stage indicators
# - Smooth transitions
```

---

## 5. ✅ Enhanced API/SQL Logging

### Test Cases

#### TC-5.1: Database Query Logging
**Objective**: Verify database queries log execution times

**Steps**:
1. Trigger database queries (access any report)
2. Check server logs
3. Look for query execution logs

**Expected Result**:
- Query execution times logged
- Format: `"duration": "123.45ms"`
- Row count included
- Slow queries (>100ms) logged at info level

**Files to Test**:
- `server/src/services/database.js`
- Server log files

---

#### TC-5.2: Slow Query Detection
**Objective**: Verify slow queries are highlighted

**Steps**:
1. Trigger a query that takes >100ms
2. Check server logs

**Expected Result**:
- Queries >100ms logged at INFO level
- Duration clearly displayed
- Easy to identify slow queries

---

#### TC-5.3: API Request Logging
**Objective**: Verify API requests log duration

**Steps**:
1. Make API requests
2. Check server logs
3. Look for request completion logs

**Expected Result**:
- Request duration logged
- Format: `"duration": "456ms"`
- Status code included
- User email included

**Files to Test**:
- `server/src/services/logger.js` (requestLogger)
- Server log files

---

#### TC-5.4: Slow API Request Warnings
**Objective**: Verify slow API requests logged as warnings

**Steps**:
1. Trigger API request that takes >1 second
2. Check server logs

**Expected Result**:
- Slow requests (>1s) logged as WARN level
- `isSlow: true` flag in log
- Duration clearly displayed

---

### Manual Testing Steps

```bash
# 1. Check server logs
tail -f logs/app.log

# 2. Trigger various operations:
# - Access reports
# - Make API calls
# - Export data

# 3. Look for log entries with:
# - "Database query executed"
# - "HTTP Request Completed"
# - Duration information
```

### Log Verification

```bash
# Filter for query logs
grep "Database query executed" logs/app.log | tail -20

# Filter for slow queries (>100ms)
grep "duration.*[1-9][0-9][0-9]\+\." logs/app.log

# Filter for slow API requests
grep "isSlow.*true" logs/app.log
```

---

## 6. ✅ Developer Documentation Access Control

### Test Cases

#### TC-6.1: Developer Access
**Objective**: Verify developers can access documentation

**Steps**:
1. Login as user in "developers" group
2. Navigate to `/docs/api`
3. Navigate to `/docs/jsdoc`
4. Navigate to `/docs/technical`

**Expected Result**:
- All documentation routes accessible
- No redirects or access denied errors
- Documentation loads correctly

---

#### TC-6.2: Non-Developer Access Denied
**Objective**: Verify non-developers cannot access documentation

**Steps**:
1. Login as regular user (not in developer groups)
2. Try to navigate to `/docs/api`
3. Try to navigate to `/docs/jsdoc`
4. Try to navigate to `/docs/technical`

**Expected Result**:
- Access denied or redirect to dashboard
- Appropriate error message
- No documentation content visible

---

#### TC-6.3: Unauthenticated Access Denied
**Objective**: Verify unauthenticated users cannot access

**Steps**:
1. Logout
2. Try to navigate to `/docs/api` directly
3. Try to navigate to `/docs/jsdoc` directly

**Expected Result**:
- Redirect to login page
- Cannot access documentation
- Proper authentication check

---

### Manual Testing Steps

```bash
# 1. Test as developer
# Login with developer account
# Navigate to documentation routes

# 2. Test as regular user
# Login with non-developer account
# Try to access documentation routes

# 3. Test unauthenticated
# Logout and try direct URL access
```

---

## 🧪 Comprehensive Testing Checklist

### Pre-Testing Setup

- [ ] Server running on `localhost:3001`
- [ ] Client running on `localhost:5173`
- [ ] Database accessible
- [ ] Test user accounts available:
  - [ ] Developer account (admin/SWD/developers group)
  - [ ] Regular user account
- [ ] Browser dev tools open (console, network)

### Feature Testing Checklist

#### Date/Time Formatting
- [ ] Server dates format as `31/Dec/2025`
- [ ] Server times format as `hh:mma/p`
- [ ] Client dates match server format
- [ ] Client times match server format
- [ ] Edge cases handled (null, invalid dates)

#### GitHub Repository Link
- [ ] Link visible in Technical Documentation
- [ ] Link opens in new tab
- [ ] API endpoint returns correct data
- [ ] Conditional display works

#### Report Access Logging
- [ ] Manual access creates log entry
- [ ] Export creates log entry with type 'export'
- [ ] Query parameters logged correctly
- [ ] Request duration logged
- [ ] Error cases logged
- [ ] All required fields populated

#### Enhanced Progress Bars
- [ ] Progress percentage displayed
- [ ] Time estimate displayed and updates
- [ ] Stage indicators work
- [ ] Progress completes correctly
- [ ] Smooth transitions

#### Enhanced Logging
- [ ] Database queries log execution times
- [ ] Slow queries (>100ms) highlighted
- [ ] API requests log duration
- [ ] Slow API requests (>1s) logged as warnings
- [ ] Log format consistent

#### Developer Documentation Access
- [ ] Developers can access all docs
- [ ] Non-developers cannot access
- [ ] Unauthenticated cannot access
- [ ] Routes properly protected

---

## 🐛 Known Issues & Troubleshooting

### Issue: Dates not formatting correctly
**Solution**: 
- Check `server/src/utils/dateFormatter.js` is imported
- Verify config has correct format settings
- Clear browser cache

### Issue: Progress bar not showing
**Solution**:
- Check loading state is triggered
- Verify `ProgressBarEnhanced` component imported
- Check browser console for errors

### Issue: Logs not appearing in database
**Solution**:
- Verify `report_access_logs` table exists
- Check middleware is applied to routes
- Check database connection
- Review server logs for errors

### Issue: Access denied when should have access
**Solution**:
- Verify user groups in Casbin
- Check router guard logic
- Verify session has correct user data
- Check browser console for errors

---

## 📊 Test Results Template

```markdown
## Test Results - [Date]

### Date/Time Formatting
- ✅ Server dates: PASS / FAIL
- ✅ Server times: PASS / FAIL
- ✅ Client dates: PASS / FAIL
- ✅ Client times: PASS / FAIL

### GitHub Repository Link
- ✅ Link display: PASS / FAIL
- ✅ API endpoint: PASS / FAIL

### Report Access Logging
- ✅ Manual logging: PASS / FAIL
- ✅ Export logging: PASS / FAIL
- ✅ Query params: PASS / FAIL

### Enhanced Progress Bars
- ✅ Progress display: PASS / FAIL
- ✅ Time estimate: PASS / FAIL

### Enhanced Logging
- ✅ Query logging: PASS / FAIL
- ✅ API logging: PASS / FAIL

### Access Control
- ✅ Developer access: PASS / FAIL
- ✅ Non-developer denied: PASS / FAIL

### Issues Found
1. [Issue description]
   - Severity: HIGH / MEDIUM / LOW
   - Status: OPEN / FIXED

### Overall Status
- Total Tests: X
- Passed: X
- Failed: X
- Status: ✅ READY / ⚠️ NEEDS FIXES
```

---

## 🎯 Next Steps After Testing

1. **Document Issues**: Create GitHub issues for any bugs found
2. **Fix Critical Issues**: Address high-severity bugs immediately
3. **Update Documentation**: Update docs based on test results
4. **Deploy to Staging**: Deploy after all tests pass
5. **User Acceptance Testing**: Get stakeholder sign-off

---

**Testing Guide Created**: 2025-01-XX  
**Last Updated**: 2025-01-XX  
**Status**: Ready for Testing

