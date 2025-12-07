# Manual Test Script - Report Access Logging

**Feature**: Report Access Logging (CRITICAL)  
**Time Required**: 15-20 minutes  
**Prerequisites**: Database access, test user account

---

## Pre-Test Setup

1. **Ensure database table exists**:
```sql
SHOW TABLES LIKE 'report_access_logs';
DESCRIBE report_access_logs;
```

2. **Verify middleware is active**:
   - Check `server/src/routes/surgicalGuideOrders.routes.js`
   - Verify `reportLoggingMiddleware` is applied

3. **Prepare test user**:
   - User with access to Surgical Guide Report
   - Note the user's email for verification

---

## Test 1: Manual Report Access Logging

### Steps

1. **Login** as test user
2. **Navigate** to Surgical Guide Report page
3. **Set filters**:
   - Start Date: 2024-01-01
   - End Date: 2024-12-31
   - Order Type: (any selection)
4. **Click "Load Report"** or equivalent button
5. **Wait** for report to load

### Verification

Run SQL query:
```sql
SELECT 
    report_id,
    report_name,
    requester_email,
    access_type,
    access_time,
    request_duration_ms,
    query_parameters,
    response_status,
    records_returned,
    ip_address
FROM report_access_logs
WHERE requester_email = 'YOUR_TEST_USER_EMAIL'
ORDER BY access_time DESC
LIMIT 1;
```

### Expected Results

- [ ] Log entry created
- [ ] `report_id` = 'surgical_guide'
- [ ] `report_name` = 'Surgical Guide Report' (or similar)
- [ ] `requester_email` = Your test user email
- [ ] `access_type` = 'manual'
- [ ] `access_time` = Recent timestamp
- [ ] `request_duration_ms` > 0
- [ ] `query_parameters` contains your filter values (JSON)
- [ ] `response_status` = 200
- [ ] `records_returned` > 0 (if data exists)
- [ ] `ip_address` is populated

---

## Test 2: CSV Export Logging

### Steps

1. **Login** as test user
2. **Navigate** to Surgical Guide Report
3. **Set filters** (same as Test 1)
4. **Click "Export to CSV"** button
5. **Wait** for export to complete
6. **Download** CSV file (verify it downloaded)

### Verification

Run SQL query:
```sql
SELECT 
    report_id,
    access_type,
    request_duration_ms,
    metadata,
    records_returned
FROM report_access_logs
WHERE requester_email = 'YOUR_TEST_USER_EMAIL'
  AND access_type = 'export'
ORDER BY access_time DESC
LIMIT 1;
```

### Expected Results

- [ ] Log entry created
- [ ] `access_type` = 'export'
- [ ] `metadata` contains file information (JSON)
- [ ] `request_duration_ms` > 0
- [ ] `records_returned` matches CSV row count

---

## Test 3: Query Parameters Logging

### Steps

1. **Access report** with different filter combinations:
   - Test Case A: Only date range
   - Test Case B: Date range + order type
   - Test Case C: Date range + status filter
   - Test Case D: All filters

### Verification

For each test case, check:
```sql
SELECT query_parameters
FROM report_access_logs
WHERE requester_email = 'YOUR_TEST_USER_EMAIL'
ORDER BY access_time DESC
LIMIT 4;
```

### Expected Results

- [ ] Each access creates separate log entry
- [ ] `query_parameters` JSON contains all applied filters
- [ ] Date format is consistent
- [ ] Filter names match UI field names

**Example JSON**:
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "orderType": "some_type",
  "status": "active"
}
```

---

## Test 4: Error Handling Logging

### Steps

1. **Access report** with invalid parameters:
   - Start date after end date
   - Invalid date format
   - Extremely large date range

### Verification

```sql
SELECT 
    response_status,
    error_message,
    records_returned
FROM report_access_logs
WHERE requester_email = 'YOUR_TEST_USER_EMAIL'
  AND response_status != 200
ORDER BY access_time DESC
LIMIT 5;
```

### Expected Results

- [ ] Error accesses still create log entries
- [ ] `response_status` = 400, 500, etc.
- [ ] `error_message` populated with error details
- [ ] `records_returned` = 0 or NULL
- [ ] Request still completed (no crashes)

---

## Test 5: Performance Metrics

### Steps

1. **Access report** multiple times with same filters
2. **Note** the time it takes to load (approximately)

### Verification

```sql
SELECT 
    AVG(request_duration_ms) as avg_duration,
    MIN(request_duration_ms) as min_duration,
    MAX(request_duration_ms) as max_duration,
    COUNT(*) as total_requests
FROM report_access_logs
WHERE requester_email = 'YOUR_TEST_USER_EMAIL'
  AND access_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

### Expected Results

- [ ] Durations logged accurately
- [ ] Average duration is reasonable
- [ ] Min/max durations make sense
- [ ] All requests logged

---

## Test 6: Multiple Users Concurrent Access

### Steps

1. **Login** as User A
2. **Access report**
3. **Login** as User B (different browser/incognito)
4. **Access same report** simultaneously
5. **Check logs** for both users

### Verification

```sql
SELECT 
    requester_email,
    access_time,
    request_duration_ms,
    records_returned
FROM report_access_logs
WHERE access_time >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
ORDER BY access_time DESC;
```

### Expected Results

- [ ] Both users' accesses logged separately
- [ ] Different `requester_email` values
- [ ] Timestamps reflect actual access times
- [ ] No interference between logs

---

## Test 7: Statistics Query Test

### Steps

Test the statistics query methods (if implemented in service)

### Verification

Check if these methods work:
- Total accesses per report
- Access frequency
- Average duration
- Most active users

---

## Common Issues & Troubleshooting

### Issue: No logs appearing
**Check**:
1. Is middleware applied to routes?
2. Is database connection working?
3. Check server logs for errors
4. Verify table exists and has correct schema

### Issue: Missing fields in logs
**Check**:
1. Review middleware code
2. Check if all fields are being passed
3. Verify database schema matches expected fields

### Issue: Performance impact
**Check**:
1. Is logging non-blocking?
2. Check server response times
3. Monitor database performance

---

## Test Results Template

```markdown
## Report Access Logging Test Results

**Date**: [Date]
**Tester**: [Name]
**Environment**: Development / Staging / Production

### Test 1: Manual Access
- Status: ✅ PASS / ❌ FAIL
- Log Entry Created: Yes / No
- All Fields Populated: Yes / No
- Notes: [Any issues]

### Test 2: Export Logging
- Status: ✅ PASS / ❌ FAIL
- Export Logged: Yes / No
- Metadata Present: Yes / No
- Notes: [Any issues]

### Test 3: Query Parameters
- Status: ✅ PASS / ❌ FAIL
- Parameters Logged: Yes / No
- Format Correct: Yes / No
- Notes: [Any issues]

### Test 4: Error Handling
- Status: ✅ PASS / ❌ FAIL
- Errors Logged: Yes / No
- Error Messages Clear: Yes / No
- Notes: [Any issues]

### Test 5: Performance
- Status: ✅ PASS / ❌ FAIL
- Durations Accurate: Yes / No
- Performance Impact: Minimal / Moderate / High
- Notes: [Any issues]

### Overall Status
- **Total Tests**: 5
- **Passed**: X
- **Failed**: X
- **Overall**: ✅ READY / ⚠️ NEEDS FIXES / ❌ NOT READY

### Issues Found
1. [Issue description and severity]
```

---

**Test Script Created**: 2025-01-XX  
**Last Updated**: 2025-01-XX

