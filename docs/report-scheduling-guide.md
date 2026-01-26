# Report Scheduling System Guide

## Overview

The Report Scheduling System allows users to configure automated report generation and delivery. This system enables scheduled exports of report data in various formats (PDF, Excel, HTML) with automatic email delivery to specified recipients.

## Features

- **Flexible Scheduling**: Configure reports to run daily, weekly, monthly, or custom intervals
- **Multiple Export Formats**: Support for PDF, Excel, and HTML formats
- **Email Delivery**: Automatic email delivery with report attachments
- **Schedule Management**: View, edit, toggle active/inactive, and delete scheduled reports
- **Manual Trigger**: Run any schedule immediately with "Run Now"
- **Execution History**: Complete tracking of all executions with success/failure status
- **Statistics Dashboard**: View total schedules, active count, executions, and success rate
- **Report Filters**: Configure date ranges and status filters for report data
- **Timezone Support**: Schedule in any timezone with automatic conversion

## Accessing the Report Scheduling Interface

1. Navigate to **Reports** → **Schedule Reports** or `/reports/scheduling`
2. Requires authentication (available to all authenticated users)
3. Users can manage their own schedules

## Creating a New Scheduled Report

### Step 1: Report Configuration

1. Click **"Create Schedule"** button
2. Fill in the report configuration:
   - **Schedule Name**: Descriptive name (e.g., "Monthly Surgical Guide Report")
   - **Report Type**: Select from available types:
     - `surgical_guide` - Surgical Guide Orders Report
     - Other report types as configured
   - **Output Format**: Select PDF, Excel, or HTML

### Step 2: Schedule Configuration

Configure when the report should run:

**Frequency Options:**
- **Daily**: Runs every day at the specified time
- **Weekly**: Select specific days of the week (Monday-Sunday)
- **Monthly**: Select specific days of the month (1-31)
- **Custom**: For advanced cron-based scheduling

**Time Configuration:**
- **Time**: Select time of day in 24-hour format (HH:MM)
- **Timezone**: Select your timezone (e.g., America/New_York, UTC, Europe/London)

**Day Selection** (for Weekly/Monthly):
- **Weekly**: Check boxes for Monday through Sunday
- **Monthly**: Select day numbers (1-31) - multiple days supported

### Step 3: Email Recipients

Configure email delivery:

- **Recipient Emails**: Add one or more email addresses
  - Press Enter after each email to add
  - Email validation applied automatically
  - Invalid emails shown in red
  - Valid emails shown in blue chips

### Step 4: Report Filters (Optional)

Configure data filters for the report:

- **Start Date**: Filter data from this date
- **End Date**: Filter data up to this date
- **Status Filter**: (For surgical guide reports)
  - Filter by order status (e.g., pending, completed)
- Additional filters based on report type

### Step 5: Save Schedule

1. Review all configuration
2. Click **"Create"** or **"Save"** to create the schedule
3. Schedule is created as **Active** by default
4. Next run time is automatically calculated

## Managing Scheduled Reports

### Dashboard View

The main interface displays:

**Statistics Cards:**
- **Total Schedules**: Total number of your schedules
- **Active**: Number of active schedules
- **Last 30 Days**: Number of executions in past 30 days
- **Success Rate**: Percentage of successful executions

**Filter Options:**
- **Search**: Search by schedule name or report type
- **Status Filter**: Show All, Active only, or Inactive only

### Schedule List

Each schedule displays:
- **Status Icon**: Green check (active) or gray pause (inactive)
- **Schedule Name**: Name of the schedule
- **Frequency**: How often it runs (e.g., "Daily at 06:00")
- **Format**: Output format (PDF, EXCEL, HTML)
- **Recipients**: Number of email recipients

### Schedule Actions

**Quick Actions:**
- **View History** (🕐): View execution history and statistics
- **Pause/Activate** (⏸/▶️): Toggle schedule on/off
- **Run Now** (▶️): Manually trigger execution immediately
- **Menu** (⋮): Additional options
  - **Edit**: Modify schedule configuration
  - **Delete**: Permanently remove schedule

### Edit Schedule

1. Click **Edit** from the menu
2. Modify any configuration:
   - Schedule name
   - Report type (cannot change after creation)
   - Frequency and time
   - Recipients
   - Filters
3. Click **"Save"** to update
4. Next run time recalculates automatically

### Toggle Active/Inactive

- Click the **Pause/Play** icon
- Active schedules run automatically at scheduled times
- Inactive schedules are paused but not deleted
- Toggle again to reactivate

### Manual Execution (Run Now)

1. Click **Run Now** icon
2. Report generates immediately
3. Email sent to all configured recipients
4. Execution recorded in history
5. Next scheduled run time unchanged

### Delete Schedule

1. Click **Delete** from menu
2. Confirm deletion
3. Schedule and execution history are permanently removed

**Warning**: This cannot be undone. Consider toggling inactive instead.

## Execution History

### Viewing History

1. Click **View History** icon on any schedule
2. History dialog opens showing:
   - **Statistics Summary**
   - **Recent Executions List**

### Statistics Display

- **Total Executions**: All-time execution count
- **Success Count**: Number of successful executions
- **Failed Count**: Number of failed executions
- **Success Rate**: Percentage of successful executions
- **Last Execution**: Date/time of most recent run
- **Next Execution**: Scheduled next run time

### Execution Log Entries

Each log entry shows:
- **Execution Time**: When the report was generated
- **Status Badge**: 
  - 🟢 Success (green)
  - 🔴 Failed (red)
  - 🟡 In Progress (yellow)
- **Duration**: Time taken to generate (e.g., "2.5s")
- **Recipients**: Number of emails sent
- **Error Message**: If failed, displays error details

### Pagination

- History limited to most recent 50 executions by default
- Scroll to view older entries
- Most recent executions shown first

## Email Delivery

### Email Format

Automated emails include:
- **Subject**: `{Report Name} - {Date}`
- **Body**: HTML-formatted email with:
  - Report name and description
  - Generation date/time
  - Report format information
  - Attached report file
- **Attachment**: Report file in requested format
- **From**: System email address (configured in server)

### File Naming

Reports are attached with filename format:
`{report-type}-{YYYY-MM-DD}.{ext}`

Example: `surgical-guide-2026-01-26.pdf`

### Test Email

Before creating schedules, test email configuration:
1. Use the test email function (if available in UI)
2. API endpoint: `POST /api/reports/schedules/system/test-email`
3. Verify email delivery and formatting

## Database Schema

### report_schedules Table

```sql
CREATE TABLE report_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,           -- User email
  user_name VARCHAR(255),                   -- User full name
  report_type VARCHAR(100) NOT NULL,        -- Report type identifier
  report_name VARCHAR(255) NOT NULL,        -- Human-readable name
  schedule_frequency VARCHAR(50) NOT NULL,  -- daily, weekly, monthly, custom
  schedule_time TIME NOT NULL,              -- Time of day (HH:MM:SS)
  schedule_timezone VARCHAR(100),           -- Timezone (e.g., America/New_York)
  schedule_days JSON,                       -- Days array for weekly/monthly
  recipients JSON NOT NULL,                 -- Array of email addresses
  format VARCHAR(20) DEFAULT 'pdf',         -- pdf, excel, html
  filters JSON,                             -- Report filter configuration
  is_active BOOLEAN DEFAULT TRUE,           -- Active status
  next_run_at DATETIME,                     -- Next scheduled execution
  last_run_at DATETIME,                     -- Last execution time
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  INDEX idx_user (user_id),
  INDEX idx_active_next_run (is_active, next_run_at)
);
```

### report_schedule_logs Table

```sql
CREATE TABLE report_schedule_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  schedule_id INT NOT NULL,
  status VARCHAR(20) NOT NULL,              -- success, failed, running
  started_at DATETIME NOT NULL,
  completed_at DATETIME,
  duration_ms INT,                          -- Execution time in milliseconds
  recipients_count INT,                     -- Number of recipients
  error_message TEXT,                       -- Error details if failed
  error_stack TEXT,                         -- Stack trace if failed
  report_file_path VARCHAR(500),            -- Path to generated file
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES report_schedules(id) ON DELETE CASCADE,
  INDEX idx_schedule (schedule_id),
  INDEX idx_status (status),
  INDEX idx_started_at (started_at)
);
```

## API Reference

All API endpoints require authentication via session.

### Create Schedule

```http
POST /api/reports/schedules
Authorization: Session-based (required)
Content-Type: application/json
```

**Request Body:**
```json
{
  "reportType": "surgical_guide",
  "reportName": "Weekly Surgical Guide Report",
  "frequency": "weekly",
  "time": "06:00",
  "timezone": "America/New_York",
  "days": ["Monday", "Wednesday", "Friday"],
  "recipients": ["user@example.com", "manager@example.com"],
  "format": "pdf",
  "filters": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-31",
    "status": "completed"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "report_name": "Weekly Surgical Guide Report",
    "next_run_at": "2026-01-27T06:00:00.000Z",
    ...
  },
  "message": "Schedule created successfully"
}
```

### Get User Schedules

```http
GET /api/reports/schedules?activeOnly=false
Authorization: Session-based (required)
```

**Query Parameters:**
- `activeOnly` (boolean): Filter to active schedules only

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "user@example.com",
      "report_name": "Weekly Surgical Guide Report",
      "report_type": "surgical_guide",
      "schedule_frequency": "weekly",
      "schedule_time": "06:00:00",
      "schedule_timezone": "America/New_York",
      "schedule_days": ["Monday", "Wednesday", "Friday"],
      "recipients": ["user@example.com"],
      "format": "pdf",
      "is_active": true,
      "next_run_at": "2026-01-27T11:00:00.000Z",
      "last_run_at": "2026-01-24T11:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Get Schedule by ID

```http
GET /api/reports/schedules/:id
Authorization: Session-based (required)
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### Update Schedule

```http
PUT /api/reports/schedules/:id
Authorization: Session-based (required)
Content-Type: application/json
```

**Request Body:** (any fields to update)
```json
{
  "reportName": "Updated Report Name",
  "recipients": ["newuser@example.com"],
  "frequency": "daily"
}
```

### Toggle Schedule Active Status

```http
PATCH /api/reports/schedules/:id/toggle
Authorization: Session-based (required)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "is_active": false
  },
  "message": "Schedule toggled successfully"
}
```

### Delete Schedule

```http
DELETE /api/reports/schedules/:id
Authorization: Session-based (required)
```

**Response:**
```json
{
  "success": true,
  "message": "Schedule deleted successfully"
}
```

### Get Schedule History

```http
GET /api/reports/schedules/:id/history?limit=50
Authorization: Session-based (required)
```

**Query Parameters:**
- `limit` (number): Maximum number of log entries (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "schedule": { ... },
    "logs": [
      {
        "id": 1,
        "schedule_id": 1,
        "status": "success",
        "started_at": "2026-01-26T06:00:00.000Z",
        "completed_at": "2026-01-26T06:00:02.500Z",
        "duration_ms": 2500,
        "recipients_count": 2
      }
    ],
    "statistics": {
      "totalExecutions": 10,
      "successCount": 9,
      "failedCount": 1,
      "successRate": 90,
      "avgDuration": 2300
    }
  }
}
```

### Manual Trigger

```http
POST /api/reports/schedules/:id/trigger
Authorization: Session-based (required)
```

**Response:**
```json
{
  "success": true,
  "message": "Schedule triggered successfully",
  "data": {
    "logId": 123
  }
}
```

### Test Email

```http
POST /api/reports/schedules/system/test-email
Authorization: Session-based (required)
Content-Type: application/json
```

**Request Body:**
```json
{
  "recipient": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

### System Status (Admin)

```http
GET /api/reports/schedules/system/status
Authorization: Session-based (admin required)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "activeSchedules": 5,
    "totalSchedules": 10,
    "lastExecution": "2026-01-26T06:00:00.000Z"
  }
}
```

## Best Practices

### Scheduling Strategy

- **Off-Peak Hours**: Schedule reports during low-traffic times (e.g., 2-6 AM)
- **Stagger Schedules**: Avoid multiple large reports at the same time
- **Timezone Awareness**: Set timezone to match recipient location
- **Reasonable Frequency**: Daily for urgent data, weekly/monthly for summaries

### Email Configuration

- **Clear Naming**: Use descriptive schedule names (included in email subject)
- **Distribution Lists**: Consider using email distribution lists for multiple recipients
- **Test First**: Use test email function before production deployment
- **Verify Delivery**: Check execution history to confirm emails sent

### Report Parameters

- **Date Ranges**: Use appropriate date ranges to limit data size
  - Daily schedules: Yesterday's data
  - Weekly schedules: Last 7 days
  - Monthly schedules: Previous month
- **Filters**: Apply status and type filters to focus reports
- **Format Selection**: 
  - PDF: Best for reading and presentations
  - Excel: Best for data analysis and manipulation
  - HTML: Best for embedding in web pages

### Monitoring & Maintenance

- **Check Success Rate**: Monitor statistics dashboard regularly
- **Review Failures**: Investigate failed executions promptly
- **Update Recipients**: Keep recipient lists current
- **Archive Unused**: Delete or deactivate unused schedules

## Troubleshooting

### Schedule Not Executing

**Symptoms**: Schedule shows as active but doesn't run at scheduled time

**Diagnostic Steps:**
1. Check `next_run_at` in database - is it in the past?
2. Verify scheduler service is running (check system status API)
3. Check server logs for cron errors
4. Verify timezone conversion is correct

**Solutions:**
- Restart scheduler service
- Toggle schedule inactive then active to recalculate next run
- Check server timezone configuration
- Verify cron pattern for custom schedules

### Report Generation Fails

**Symptoms**: Execution logs show "failed" status

**Diagnostic Steps:**
1. Click on schedule to view execution history
2. Check error message in failed log entry
3. Review server logs around the execution time
4. Verify database connectivity

**Common Errors:**
- **Database timeout**: Reduce date range or add filters
- **Invalid filters**: Check filter configuration
- **Report type not found**: Verify report type is valid
- **Permission errors**: Check user permissions for data access

**Solutions:**
- Reduce date range in filters
- Simplify filter criteria
- Check report type configuration
- Verify user has access to data

### Email Not Delivered

**Symptoms**: Execution successful but recipients don't receive email

**Diagnostic Steps:**
1. Check execution history - does it show recipients_count > 0?
2. Check spam/junk folders
3. Verify email addresses are valid
4. Check server email configuration
5. Review server logs for SMTP errors

**Solutions:**
- Verify SMTP configuration in server environment
- Test email function to confirm delivery
- Check email addresses for typos
- Verify sender email is not blacklisted
- Contact IT to check email server logs

### Wrong Data in Report

**Symptoms**: Report generates successfully but shows incorrect data

**Diagnostic Steps:**
1. Check filter configuration (start date, end date, status)
2. Verify timezone - data may be filtered in UTC
3. Test with manual execution and different filters
4. Check database for expected data

**Solutions:**
- Adjust date range filters
- Account for timezone differences in date filters
- Verify report type matches intended data source
- Update filters to match requirements

### Performance Issues

**Symptoms**: Report takes too long to generate or times out

**Diagnostic Steps:**
1. Check execution duration in history
2. Review date range - how much data?
3. Check database query performance
4. Monitor server resource usage during execution

**Solutions:**
- **Reduce Date Range**: Limit to necessary timeframe
- **Add Filters**: Use status, type, or other filters to reduce data
- **Change Format**: Excel generation may be slower than PDF
- **Stagger Timing**: Move to off-peak hours
- **Split Reports**: Create multiple schedules for different data segments
- **Optimize Database**: Add indexes for common report queries

## Security Considerations

### Access Control

- All endpoints require authentication via session
- Users can only view/modify their own schedules
- Admin endpoints restricted to admin users
- Casbin policies control report data access

### Data Privacy

- Reports respect user access permissions
- Data filtered based on user's group/role
- Sensitive data excluded from reports automatically
- Email delivery logs stored for audit

### Email Security

- Recipient email validation before sending
- Rate limiting on email sending
- SMTP authentication required
- TLS encryption for email transmission

### Input Validation

- Email address format validation
- Frequency validation (daily, weekly, monthly, custom)
- Time format validation (HH:MM)
- Timezone validation against known timezones
- SQL injection protection via parameterized queries

### Audit Trail

- All schedule operations logged with user ID
- Execution history stored permanently
- Failed executions logged with error details
- Server logs include scheduler events

## Advanced Features

### Custom Cron Expressions

For advanced users, custom frequency supports cron expressions:

**Example Cron Patterns:**
- `0 6 * * 1-5` - Weekdays at 6:00 AM
- `0 0 1 * *` - First day of every month at midnight
- `0 */4 * * *` - Every 4 hours
- `0 9,17 * * *` - At 9:00 AM and 5:00 PM daily

**Note**: Cron expression support requires setting frequency to "custom" and providing the expression in the schedule configuration.

### Programmatic Schedule Management

Use the API to create schedules programmatically:

```javascript
// Example: Create schedule via API
const response = await fetch('/api/reports/schedules', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reportType: 'surgical_guide',
    reportName: 'Automated Daily Report',
    frequency: 'daily',
    time: '06:00',
    timezone: 'America/New_York',
    recipients: ['reports@example.com'],
    format: 'excel',
    filters: {
      status: 'completed'
    }
  })
});

const result = await response.json();
console.log('Schedule ID:', result.data.id);
```

## Support

### Getting Help

- **Documentation**: This guide and API reference
- **System Administrators**: Contact for server-level issues
- **Email Issues**: Check with IT department for SMTP configuration
- **Bug Reports**: Submit through issue tracking system

### Useful Resources

- Server logs: `/logs/server-*.log`
- Database tables: `report_schedules`, `report_schedule_logs`
- Email service logs: Check server logs for email delivery details
- Scheduler status: Use system status API endpoint

## Common Use Cases

### 1. Daily Morning Report

```json
{
  "reportName": "Daily Surgical Guide Summary",
  "reportType": "surgical_guide",
  "frequency": "daily",
  "time": "06:00",
  "timezone": "America/New_York",
  "recipients": ["team@example.com"],
  "format": "pdf",
  "filters": {
    "startDate": "yesterday",
    "status": "completed"
  }
}
```

### 2. Weekly Management Report

```json
{
  "reportName": "Weekly Operations Report",
  "reportType": "surgical_guide",
  "frequency": "weekly",
  "time": "08:00",
  "timezone": "America/New_York",
  "days": ["Monday"],
  "recipients": ["management@example.com"],
  "format": "excel",
  "filters": {
    "startDate": "last_7_days"
  }
}
```

### 3. Monthly Executive Summary

```json
{
  "reportName": "Monthly Executive Summary",
  "reportType": "surgical_guide",
  "frequency": "monthly",
  "time": "09:00",
  "timezone": "America/New_York",
  "days": [1],
  "recipients": ["executives@example.com"],
  "format": "pdf",
  "filters": {
    "startDate": "last_month"
  }
}
```

## Appendix

### File Locations

- **Frontend View**: `/client/src/views/Reports/ReportSchedulingView.vue`
- **Form Component**: `/client/src/components/Scheduling/ScheduleFormDialog.vue`
- **History Component**: `/client/src/components/Scheduling/ScheduleHistoryDialog.vue`
- **Service**: `/client/src/services/reportScheduling.js`
- **Backend Controller**: `/server/src/controllers/reportSchedule.controller.js`
- **Model**: `/server/src/models/reportSchedule.model.js`
- **Scheduler Service**: `/server/src/services/reportScheduler.service.js`
- **Email Service**: `/server/src/services/emailService.js`
- **Routes**: `/server/src/routes/reportSchedule.routes.js`

### Supported Timezones

Common timezones (full list available in UI):
- `America/New_York` (EST/EDT)
- `America/Chicago` (CST/CDT)
- `America/Denver` (MST/MDT)
- `America/Los_Angeles` (PST/PDT)
- `Europe/London` (GMT/BST)
- `Europe/Paris` (CET/CEST)
- `Asia/Tokyo` (JST)
- `UTC` (Coordinated Universal Time)

### Format Extensions

- **PDF**: `.pdf`
- **Excel**: `.xlsx`
- **HTML**: `.html`

### Frequency Values

- `daily` - Every day
- `weekly` - Specific days of week
- `monthly` - Specific days of month
- `custom` - Custom cron expression
