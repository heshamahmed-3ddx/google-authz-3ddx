# Manual Testing Guide - Completed Features

**Date**: 2025-01-XX  
**Purpose**: Step-by-step manual testing instructions for all completed features

---

## 🧪 Testing Overview

This guide provides detailed manual testing instructions for all completed features. Follow each section systematically to verify functionality.

---

## 1. Date/Time Format Standardization

### Test Date Formatters (Server-Side)

**Step 1: Run Test Script**
```bash
node scripts/test-date-formatters.js
```

**Expected Results:**
- ✅ Dates format to `31/Dec/2025` format
- ✅ Times format to `hh:mma/p` format (e.g., `10:02p`)
- ✅ DateTime combines both formats
- ✅ Edge cases handled gracefully

**Step 2: Test in Dashboard**
1. Navigate to `/dashboard`
2. Check if date displays are using new format
3. Verify format matches: `31/Dec/2025` and `hh:mma/p`

**Step 3: Test Client-Side Formatters**
1. Open browser console on dashboard
2. Import and test:
```javascript
import { formatDate, formatTime } from '@/utils/dateFormatter';
formatDate(new Date()); // Should format correctly
formatTime(new Date()); // Should format correctly
```

---

## 2. GitHub Repository Link

### Test GitHub Endpoint

**Step 1: Check Server is Running**
```bash
# Make sure server is running on port 3001
curl http://localhost:3001/api/health
```

**Step 2: Test GitHub Endpoint**
```bash
# Test the endpoint directly
curl http://localhost:3001/api/config/github
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "repositoryUrl": "https://github.com/3ddx/InsightHub",
    "repositoryName": "InsightHub",
    "displayInDocs": true
  }
}
```

**Step 3: Test in Browser**
1. Navigate to `/docs/technical` (requires developer access)
2. Look for "Repository" card section
3. Verify GitHub link is visible
4. Click link - should open in new tab
5. Verify link opens correct repository

**Step 4: Test Configuration**
1. Check environment variables:
   - `GITHUB_REPOSITORY_URL`
   - `GITHUB_REPOSITORY_NAME`
   - `GITHUB_DISPLAY_IN_DOCS`
2. Verify defaults work if not set

---

## 3. Report Access Logging (CRITICAL)

### Test Database Schema

**Step 1: Verify Table Exists**
```bash
# Connect to database
mysql -u root -p insighthub

# Check table
SHOW TABLES LIKE 'report_access_logs';

# Check structure
DESCRIBE report_access_logs;

# Check indexes
SHOW INDEXES FROM report_access_logs;
```

**Expected:**
- ✅ Table exists
- ✅ All required fields present
- ✅ Indexes exist (report_id, requester_email, access_time, etc.)

**Step 2: Run Test Script**
```bash
node scripts/test-report-logging.js
```

**Step 3: Test Logging in Action**

1. **Access Report:**
   - Navigate to `/reports/surgical-guide`
   - Apply filters and load report
   - Check network tab for API calls

2. **Check Database:**
   ```sql
   SELECT * FROM report_access_logs 
   ORDER BY access_time DESC 
   LIMIT 5;
   ```

3. **Verify Log Data:**
   - ✅ report_id populated
   - ✅ report_name populated
   - ✅ requester_email populated
   - ✅ access_type is 'manual'
   - ✅ request_duration_ms populated
   - ✅ query_parameters captured
   - ✅ response_status populated
   - ✅ records_returned populated

4. **Test CSV Export:**
   - Export report to CSV
   - Check database for export log entry
   - Verify access_type is 'export'

5. **Test Error Handling:**
   - Trigger an error (invalid date range, etc.)
   - Verify error is logged in error_message field
   - Verify request still completes (non-blocking)

---

## 4. Enhanced Progress Bars

### Test Progress Bar Component

**Step 1: Navigate to Report**
1. Go to `/reports/surgical-guide`
2. Set date filters
3. Click "Load Report"

**Step 2: Observe Progress Bar**
- ✅ Progress bar appears
- ✅ Percentage displays (0-100%)
- ✅ Estimated time displays
- ✅ Current state text shows (Starting, Processing, etc.)
- ✅ Visual progress bar advances

**Step 3: Test Different Scenarios**
1. **Fast Query** (< 1 second):
   - Progress bar should show briefly
   - Time estimate should be reasonable

2. **Slow Query** (> 5 seconds):
   - Progress should update smoothly
   - Time estimate should adjust
   - Stage indicators should change

3. **Error Case**:
   - Progress bar should disappear on error
   - Error message should display
   - No memory leaks (check console)

**Step 4: Check Console**
- Open browser DevTools
- Look for any errors
- Verify cleanup (no interval leaks)

---

## 5. Enhanced API/SQL Logging

### Test Database Query Logging

**Step 1: Check Log Files**
```bash
# Check server logs
tail -f logs/server.log | grep "Database query"
```

**Step 2: Trigger Database Queries**
1. Access reports that query database
2. Watch log output
3. Verify execution times are logged

**Expected Log Format:**
```
[SERVER]|timestamp|INFO|[database.js:XXX]|Database query executed duration=125.50ms rowCount=50
```

**Step 3: Test Slow Query Detection**
1. Create a slow query (add delay if needed)
2. Verify queries >100ms logged at info level
3. Check log levels are correct

### Test API Request Logging

**Step 1: Check Log Files**
```bash
# Check server logs for API requests
tail -f logs/server.log | grep "HTTP Request"
```

**Step 2: Trigger API Requests**
1. Make various API calls
2. Watch log output
3. Verify durations are logged

**Expected Log Format:**
```
[SERVER]|timestamp|INFO|[requestLogger:0]|HTTP Request Completed method=GET url=/api/reports/surgical_guide statusCode=200 duration=1250ms
```

**Step 3: Test Slow Request Detection**
1. Trigger slow API requests (>1s)
2. Verify logged as warnings
3. Check isSlow flag in logs

**Step 4: Test Error Logging**
1. Trigger error responses (400, 500)
2. Verify logged at error level
3. Check error details captured

---

## 6. Developer Documentation Access Control

### Test Route Protection

**Step 1: Test as Developer**
1. Login as user in developer group
2. Try to access:
   - `/docs/api` - Should work
   - `/docs/jsdoc` - Should work
   - `/docs/technical` - Should work
3. Verify all routes accessible

**Step 2: Test as Regular User**
1. Login as regular user (not in developer group)
2. Try to access documentation routes
3. Should be redirected or see 403 error
4. Verify routes are blocked

**Step 3: Test Dashboard Sections**
1. Go to `/dashboard`
2. As developer: Should see API Documentation section
3. As regular user: Should NOT see API Documentation section
4. Verify access control works

---

## ✅ Testing Checklist

Use this checklist to track testing progress:

### Date/Time Format
- [ ] Server-side formatters work correctly
- [ ] Client-side formatters work correctly
- [ ] Formats match specification
- [ ] Edge cases handled
- [ ] Integrated in DashboardView

### GitHub Repository Link
- [ ] API endpoint returns correct data
- [ ] Link displays in TechnicalView
- [ ] Link opens correctly
- [ ] Configuration via env vars works
- [ ] Error handling works

### Report Access Logging
- [ ] Database table exists
- [ ] Table structure correct
- [ ] Indexes created
- [ ] Middleware logs correctly
- [ ] All fields populated
- [ ] Export logging works
- [ ] Error handling non-blocking
- [ ] Logs queryable

### Enhanced Progress Bars
- [ ] Component renders
- [ ] Progress percentage displays
- [ ] Time estimate displays
- [ ] Stage indicators work
- [ ] Updates smoothly
- [ ] Cleanup on completion
- [ ] Error handling works

### Enhanced API/SQL Logging
- [ ] Database queries logged
- [ ] Execution times captured
- [ ] Slow queries detected
- [ ] API requests logged
- [ ] Slow requests detected
- [ ] Error logging works
- [ ] Log format correct

### Developer Documentation Access
- [ ] Routes protected
- [ ] Developer access works
- [ ] Regular user blocked
- [ ] Dashboard sections protected
- [ ] Server-side protection works

---

## 🐛 Troubleshooting

### Date Formatters Not Working
- Check imports are correct
- Verify date objects are valid
- Check browser console for errors

### GitHub Link Not Showing
- Verify server is running
- Check endpoint returns data
- Verify user has developer access
- Check displayInDocs config

### Report Logging Not Working
- Verify database table exists
- Check middleware is applied
- Verify database connection
- Check server logs for errors

### Progress Bar Not Showing
- Check component is imported
- Verify loading state is set
- Check browser console
- Verify Vue component mounted

### Logging Not Appearing
- Check log file location
- Verify log level settings
- Check Winston configuration
- Verify middleware is active

---

**Testing Status**: Ready to Begin  
**Estimated Time**: 1-2 hours  
**Priority**: High (especially Report Access Logging)

