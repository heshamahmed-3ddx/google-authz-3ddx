# Report Scheduling - User Guide

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Creating a Schedule](#creating-a-schedule)
- [Managing Schedules](#managing-schedules)
- [Viewing Execution History](#viewing-execution-history)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Overview

The Report Scheduling System allows you to automate report generation and email delivery. Set up schedules to send reports to multiple recipients at specified intervals, saving time and ensuring consistent report distribution.

### Key Features
- **Multiple Report Types**: Surgical Guide Report, Power BI, and more
- **Flexible Scheduling**: Daily, weekly, or monthly schedules with custom times
- **Multiple Formats**: Generate reports as PDF, Excel, or HTML
- **Email Distribution**: Automatically deliver reports to multiple recipients
- **Execution History**: Track all past executions with detailed logs
- **Manual Triggers**: Run any schedule on-demand without waiting for the next scheduled time

## Getting Started

### Accessing Report Scheduling

1. Log into InsightHub
2. Navigate to **Reports** → **Scheduling** from the sidebar
3. You'll see the Report Scheduling dashboard with all your schedules

### Prerequisites

- Active InsightHub account with appropriate permissions
- Access to the report type you want to schedule
- Valid email addresses for recipients

## Creating a Schedule

### Step 1: Open Create Dialog

Click the **"Create Schedule"** button in the top-right corner of the scheduling dashboard.

### Step 2: Configure Report Settings

#### Schedule Name
Give your schedule a descriptive name that helps you identify it later.

**Example**: "Monthly Surgical Guide Report - Management Team"

#### Report Type
Select the type of report to generate:
- **Surgical Guide Report**: Comprehensive surgical orders report
- **Power BI Report**: Business intelligence dashboards
- **Custom Report**: Other report types

#### Output Format
Choose the format for your report:
- **PDF**: Professional document format (recommended for printing)
- **Excel (XLSX)**: Spreadsheet format (great for data analysis)
- **HTML**: Web page format (best for email viewing)

### Step 3: Set Schedule Frequency

#### Daily Schedule
- Runs every day at the specified time
- Example: "Daily at 08:00" - runs every morning at 8 AM

#### Weekly Schedule
- Runs on specific days of the week
- Select one or more days: Monday, Tuesday, Wednesday, etc.
- Example: "Weekly on Mon, Wed, Fri at 09:00"

#### Monthly Schedule
- Runs on specific days of the month
- Select one or more days: 1st, 2nd, 3rd, etc.
- Example: "Monthly on 1st, 15th at 10:00"

#### Time and Timezone
- Set the time using 24-hour format (HH:MM)
- Select your timezone (defaults to Eastern Time)
- **Important**: The schedule will run according to the selected timezone

### Step 4: Add Recipients

Enter email addresses for people who should receive the report:

1. Type an email address
2. Press **Enter** to add it
3. Repeat for additional recipients
4. Invalid emails will be highlighted in red

**Tips:**
- You can add unlimited recipients
- Each recipient receives an individual email with the report attached
- Recipients don't need InsightHub accounts

### Step 5: Configure Filters (Optional)

Apply filters to customize the report data:

#### Date Range
- **Start Date**: Include data from this date onward
- **End Date**: Include data up to this date
- Leave blank to use default date range

#### Status Filter (for Surgical Guide Report)
- Filter orders by status: Pending, In Progress, Completed, Cancelled
- Leave blank to include all statuses

### Step 6: Save Schedule

1. Review all settings
2. Click **"Create"** button
3. Your schedule is now active and will run at the next scheduled time

## Managing Schedules

### Schedule Dashboard

The main dashboard shows all your schedules with key information:

- **Status Indicator**: Green (active) or Gray (paused)
- **Schedule Name**: Quick identification
- **Frequency**: When the schedule runs
- **Format**: Output file type
- **Recipients Count**: Number of email recipients

### Schedule Actions

#### Pause/Activate
Click the **pause** or **play** icon to temporarily disable or re-enable a schedule.

**When to pause:**
- Temporary hold on report distribution
- Testing other schedules
- Updating report configuration

#### Run Now
Click the **play circle** icon to trigger immediate execution.

**Use cases:**
- Test a new schedule before waiting for scheduled time
- Generate an ad-hoc report for stakeholders
- Verify changes after editing a schedule

#### Edit Schedule
1. Click the **three dots** menu
2. Select **"Edit"**
3. Modify any settings
4. Click **"Update"** to save changes

**Note**: Editing a schedule recalculates the next run time based on new settings.

#### Delete Schedule
1. Click the **three dots** menu
2. Select **"Delete"**
3. Confirm deletion

**Warning**: This action cannot be undone. All execution history for the schedule will be preserved but the schedule cannot be recovered.

### Filtering Schedules

Use the search and filter tools to find specific schedules:

- **Search Bar**: Filter by schedule name or report type
- **Status Filter**: Show all, active only, or inactive only

## Viewing Execution History

### Opening History

Click the **history icon** on any schedule to view its execution history.

### Understanding Execution Logs

Each log entry shows:

#### Status Badge
- **Completed** (Green): Report generated and emailed successfully
- **Failed** (Red): Execution encountered an error
- **Running** (Blue): Currently executing
- **Pending** (Yellow): Scheduled but not started

#### Execution Details
- **Date & Time**: When the execution started
- **Duration**: How long it took to complete
- **File Name**: Generated report filename
- **File Size**: Report file size in KB or MB
- **Email Status**: Whether email was sent successfully

#### Error Messages
Failed executions show error details to help diagnose issues.

### Statistics Summary

At the top of the history dialog, you'll see:

- **Total Runs**: All-time execution count
- **Successful**: Successfully completed executions
- **Failed**: Failed executions
- **Success Rate**: Percentage of successful executions

## Troubleshooting

### Schedule Not Running

**Possible causes:**

1. **Schedule is Paused**
   - Check the status indicator (should be green)
   - Click the play icon to reactivate

2. **Next Run Time in the Future**
   - Check "Next Run" field on schedule
   - Wait for scheduled time or use "Run Now"

3. **Server Scheduler Not Running**
   - Contact administrator to verify scheduler service status

### Failed Executions

Check the execution history error message for details:

#### "Email configuration not available"
- Email system not configured on server
- Contact administrator to configure SMTP or SendGrid

#### "No data available for report"
- Date range filters may be too restrictive
- Report data source may be empty
- Try adjusting filters or date range

#### "Report generation timeout"
- Large dataset causing timeout
- Try narrowing date range
- Contact administrator to increase timeout settings

#### "Failed to send email to one or more recipients"
- One or more recipient email addresses invalid
- Edit schedule and verify all recipient emails
- Check for typos in email addresses

### Email Not Received

If a recipient doesn't receive the scheduled report:

1. **Check Execution History**
   - Verify execution completed successfully
   - Look for "Email sent" confirmation

2. **Check Spam/Junk Folder**
   - Reports may be filtered as spam
   - Add sender to safe senders list

3. **Verify Recipient Email**
   - Ensure email address is spelled correctly
   - Confirm recipient has access to mailbox

4. **Check Email Quotas**
   - Recipient mailbox may be full
   - Large attachments may be blocked

## FAQ

### Can I schedule the same report with different configurations?

Yes! Create multiple schedules for the same report type with different:
- Frequencies (e.g., daily summary + monthly detailed)
- Recipients (e.g., executives vs. operations team)
- Filters (e.g., different date ranges or status filters)
- Formats (e.g., PDF for management, Excel for analysts)

### What's the maximum number of recipients?

There's no hard limit, but consider:
- Each recipient receives an individual email
- Large recipient lists may take longer to send
- Recommended: Under 50 recipients per schedule
- For larger distributions, consider groups or mailing lists

### Can I schedule reports outside business hours?

Yes! Schedules can run 24/7. Common patterns:
- **Early Morning** (6-8 AM): Reports ready when employees arrive
- **End of Day** (5-6 PM): Daily summaries after business closes
- **Overnight** (2-4 AM): Large reports during low-traffic hours

### How far in advance are schedules calculated?

The system calculates the next run time immediately after:
- Creating a new schedule
- Editing an existing schedule
- Completing a scheduled execution

### What happens if a schedule fails?

The system automatically:
1. Logs the failure with error details
2. Attempts up to 3 retries (5 minutes apart)
3. Records final status after retries exhausted
4. Continues to next scheduled run time

You can view all failures in execution history.

### Can I test a schedule before activating it?

Yes! Best practice:

1. Create schedule and save
2. Verify next run time is correct
3. Use "Run Now" to test immediately
4. Check execution history for success
5. Verify recipients received email
6. If everything works, leave schedule active

### How long is execution history retained?

- Recent logs are kept indefinitely
- Detailed logs older than 90 days may be archived
- Statistics remain available for all schedules
- Contact administrator for archived log retrieval

### Can recipients reply to scheduled emails?

By default, scheduled reports come from a "noreply" address. Recipients should:
- Contact the schedule creator directly with questions
- Not reply to the automated email
- Refer to report metadata for creator information

### What timezone should I use?

Choose the timezone where:
- Most recipients are located
- Your business primarily operates
- The schedule creator is located

**Note**: All scheduled times display in the configured timezone, not the viewer's local time.

### Can I see other users' schedules?

No. Schedules are private to the creator. You can only:
- View schedules you created
- Edit schedules you created
- Delete schedules you created

For shared reporting needs, consider:
- Creating schedules with appropriate recipient lists
- Coordinating with team members on schedule timing

## Need More Help?

- **Technical Issues**: Contact your system administrator
- **Feature Requests**: Submit feedback through InsightHub support
- **Training**: Request training sessions for your team
- **API Documentation**: See `/api-docs` for programmatic access

---

**Document Version**: 1.0.0  
**Last Updated**: January 24, 2026  
**Maintained By**: InsightHub Development Team
