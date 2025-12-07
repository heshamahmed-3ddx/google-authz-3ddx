# Testing Checklist - Quick Reference

**Quick checklist for manual testing of completed features**

---

## ✅ Quick Test Checklist

### 1. Date/Time Formatting (5 min)
- [ ] Open Dashboard
- [ ] Check all dates show as `31/Dec/2025` format
- [ ] Check all times show as `hh:mma/p` format
- [ ] Check browser console - no errors

### 2. GitHub Repository Link (2 min)
- [ ] Login as developer
- [ ] Go to `/docs/technical`
- [ ] Verify GitHub link appears
- [ ] Click link - opens in new tab

### 3. Report Access Logging (10 min)
- [ ] Access Surgical Guide Report
- [ ] Check database: `SELECT * FROM report_access_logs ORDER BY access_time DESC LIMIT 1;`
- [ ] Verify all fields populated
- [ ] Export report to CSV
- [ ] Check database again - export logged

### 4. Enhanced Progress Bars (5 min)
- [ ] Open Surgical Guide Report
- [ ] Trigger data load with large date range
- [ ] Verify progress percentage shown
- [ ] Verify time estimate shown
- [ ] Verify stage indicators ("Starting...", "Processing...", etc.)

### 5. Enhanced Logging (5 min)
- [ ] Check server logs: `tail -f logs/app.log`
- [ ] Access report - verify query logged with duration
- [ ] Make API call - verify request logged with duration
- [ ] Look for slow query/request warnings

### 6. Developer Documentation Access (5 min)
- [ ] Login as developer - access `/docs/api` ✅
- [ ] Login as regular user - try `/docs/api` ❌ (should be denied)
- [ ] Logout - try `/docs/api` ❌ (should redirect to login)

---

## 🐛 Quick Issues to Watch For

- Date format inconsistent
- Progress bar not showing
- Logs not appearing in database
- Access denied when should have access
- Console errors

---

**Total Testing Time**: ~30 minutes  
**Status**: Ready for Testing

