# Testing Quick Start Guide

**Date**: 2025-01-XX  
**Purpose**: Quick reference for testing completed features

---

## 🚀 QUICK START

### 1. Test Date Formatters ✅

**Quick Test:**
```bash
node -e "import('./server/src/utils/dateFormatter.js').then(m => { const d = new Date('2025-12-31T22:02:00'); console.log('Date:', m.formatDate(d)); console.log('Time:', m.formatTime(d)); console.log('DateTime:', m.formatDateTime(d)); })"
```

**Expected Output:**
```
Date: 31/Dec/2025
Time: 10:02p
DateTime: 31/Dec/2025 10:02p
```

**Full Test Script:**
```bash
node scripts/test-date-formatters.js
```

---

### 2. Test GitHub Repository Link

**Check Endpoint:**
```bash
# Make sure server is running first
curl http://localhost:3001/api/config/github
```

**Or use test script:**
```bash
node scripts/test-github-endpoint.js
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

**Manual Test:**
1. Start server: `cd server && npm start`
2. Navigate to: `http://localhost:5173/docs/technical`
3. Verify GitHub link is visible and clickable

---

### 3. Test Report Access Logging (CRITICAL)

**Check Database Table:**
```bash
mysql -u root -p insighthub -e "DESCRIBE report_access_logs;"
```

**Check Table Exists:**
```bash
mysql -u root -p insighthub -e "SHOW TABLES LIKE 'report_access_logs';"
```

**Run Test Script:**
```bash
node scripts/test-report-logging.js
```

**Manual Test:**
1. Navigate to: `http://localhost:5173/reports/surgical-guide`
2. Load a report
3. Check database:
```sql
SELECT * FROM report_access_logs ORDER BY access_time DESC LIMIT 1;
```

---

### 4. Test Enhanced Progress Bars

**Manual Test:**
1. Navigate to: `http://localhost:5173/reports/surgical-guide`
2. Set date filters (use a large range for slower query)
3. Click "Load Report"
4. Observe:
   - ✅ Progress bar appears
   - ✅ Percentage displays
   - ✅ Time estimate shows
   - ✅ Stage indicators update

**Check Console:**
- Open browser DevTools
- Look for errors
- Verify progress updates

---

### 5. Test Enhanced API/SQL Logging

**Check Server Logs:**
```bash
tail -f logs/server.log | grep -E "(Database query|HTTP Request)"
```

**Test Database Query Logging:**
1. Access any report that queries database
2. Check logs for: `Database query executed duration=XXXms`

**Test API Request Logging:**
1. Make API calls (access reports)
2. Check logs for: `HTTP Request Completed duration=XXXms`

**Test Slow Query Detection:**
- Queries >100ms should log at INFO level
- API requests >1s should log as WARNING

---

## ✅ TESTING CHECKLIST

### Quick Verification

- [ ] Date formatter outputs correct format
- [ ] GitHub endpoint returns data
- [ ] Report logging table exists
- [ ] Progress bar shows in browser
- [ ] Server logs show query/request times

### Detailed Testing

See `docs/MANUAL_TESTING_GUIDE.md` for comprehensive testing instructions.

---

## 🐛 TROUBLESHOOTING

### Date Formatter Not Working
- Verify Node.js version supports ES modules
- Check import paths are correct

### GitHub Link Not Showing
- Verify server is running
- Check user has developer access
- Verify endpoint returns data

### Report Logging Not Working
- Verify database table exists (run schema SQL)
- Check database connection
- Verify middleware is applied

### Progress Bar Not Showing
- Check browser console for errors
- Verify component is imported
- Check loading state is set

---

## 📚 FULL DOCUMENTATION

- **Test Plan**: `docs/TESTING_PLAN_COMPLETED_FEATURES.md`
- **Manual Testing**: `docs/MANUAL_TESTING_GUIDE.md`
- **Execution Summary**: `docs/TESTING_EXECUTION_SUMMARY.md`

---

**Status**: Ready for Testing  
**Next Step**: Run quick tests above, then proceed to detailed testing
