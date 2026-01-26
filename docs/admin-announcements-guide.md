# Admin Announcements System Guide

## Overview

The Admin Announcements System enables administrators to create, manage, and broadcast important messages to all users throughout the InsightHub platform. Announcements are displayed to authenticated users based on their active status and date ranges.

## Features

- **Broadcast Messaging**: Send announcements to all authenticated users
- **Date-Based Scheduling**: Set start and end dates for automatic visibility control
- **Severity Levels**: Set urgency levels (Info, Warning, Success, Error)
- **Active Status Management**: Enable or disable announcements
- **Read Tracking**: Track which users have viewed announcements
- **Unread Count**: Users can see how many unread announcements they have

## Accessing the Announcements Interface

1. Navigate to **Admin Panel** → **Announcements**
2. Requires administrator permissions (SWD or admin group)
3. View all announcements with filtering options

## Creating a New Announcement

### Step 1: Basic Information

1. Click **"New Announcement"** button
2. Fill in the announcement form:
   - **Title**: Clear, concise announcement headline (required)
   - **Content**: Detailed message body (required, plain text)
   - **Severity**: Select urgency level:
     - **info** (🔵 Blue): General information, low urgency
     - **warning** (🟡 Orange): Important updates requiring attention
     - **success** (🟢 Green): Positive updates or confirmations
     - **error** (🔴 Red): Critical matters requiring immediate action

### Step 2: Status and Scheduling

Configure visibility:

- **Active Status**: Toggle to enable/disable the announcement
  - Active announcements are visible to users
  - Inactive announcements are hidden but not deleted

- **Start Date**: When the announcement becomes visible (required)
  - Format: `YYYY-MM-DD HH:MM`
  - Announcement only shows to users after this date/time

- **End Date**: When the announcement stops being visible (optional)
  - Format: `YYYY-MM-DD HH:MM`
  - Leave blank for announcements without expiration
  - Announcement automatically hidden after this date/time

### Step 3: Save

1. Click **"Create"** to save the announcement
2. Announcement is immediately saved with the specified settings
3. Active announcements within date range are visible to all users

## Managing Announcements

### View Announcements

The main interface displays all announcements in a data table with:
- **ID**: Unique announcement identifier
- **Title**: Announcement headline
- **Severity**: Visual indicator with color chip
- **Status**: Active/Inactive badge
- **Start Date**: When announcement becomes visible
- **End Date**: When announcement stops being visible (or "No End Date")
- **Actions**: Edit and delete buttons

### Filter Options

- **Show Active Only**: Toggle to display only active announcements
- Table automatically refreshes when filter changes

### Edit Announcement

1. Click **Edit** (pencil icon) on the announcement row
2. Modify any fields in the form:
   - Title
   - Content
   - Severity
   - Active status
   - Start date
   - End date
3. Click **"Update"** to save changes

**Note**: Changes take effect immediately for all users.

### Delete Announcement

1. Click **Delete** (trash icon) on the announcement row
2. Confirm deletion in the dialog
3. Click **"Delete"** to permanently remove

**Warning**: Deletion is permanent and cannot be undone. The announcement and all read tracking data will be removed.

## User View

### How Users See Announcements

Users can view announcements through:
- Dedicated announcements page (`/announcements`)
- AnnouncementDisplay component

### Announcement Display Rules

An announcement is visible to users when:
1. **Active Status** = Active (is_active = 1)
2. **Current Date/Time** ≥ Start Date
3. **Current Date/Time** ≤ End Date (or no end date set)

### Read Tracking

- When a user views an announcement, they can mark it as read
- Read status is tracked per user in the `user_announcement_reads` table
- Unread count API available: `GET /api/announcements/unread-count`
- Users can see which announcements they haven't read yet

## Best Practices

### Writing Effective Announcements

- **Clear Headlines**: Use descriptive, action-oriented titles
- **Concise Content**: Keep messages brief and scannable
- **Action Items**: Clearly state what users should do
- **Timing**: Set appropriate start dates for optimal visibility
- **Frequency**: Avoid announcement fatigue with too many messages

### Severity Level Guidelines

- **Info**: Regular updates, non-urgent information, tips, general notices
- **Warning**: Important deadlines, policy changes, scheduled maintenance
- **Success**: Successful deployments, positive updates, achievements
- **Error**: Critical security issues, system outages, urgent actions required

### Date Management

- **Start Dates**: Set to current time for immediate visibility, or future date for scheduled announcements
- **End Dates**: Use end dates for time-sensitive announcements (maintenance windows, deadlines)
- **No End Date**: Use for ongoing announcements that will be manually disabled later
- **Consider Time Zones**: Remember dates are stored in UTC, plan accordingly

### Content Guidelines

- Keep content under 500 characters for better readability
- Avoid HTML or special formatting (plain text only)
- Include contact information if users need to follow up
- Proofread before publishing

## Database Schema

### announcements Table

```sql
CREATE TABLE announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  severity ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATETIME NOT NULL,
  end_date DATETIME NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### user_announcement_reads Table

```sql
CREATE TABLE user_announcement_reads (
  announcement_id INT,
  user_email VARCHAR(255),
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (announcement_id, user_email),
  FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE
);
```

## API Reference

### Get Active Announcements (User)

```http
GET /api/announcements
Authorization: Required (Session-based)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "System Maintenance",
      "content": "Scheduled maintenance on Sunday, 2-4 AM EST",
      "severity": "warning",
      "is_active": 1,
      "start_date": "2026-01-26 00:00:00",
      "end_date": "2026-01-27 23:59:59",
      "is_read": 0
    }
  ]
}
```

### Get All Announcements (Admin)

```http
GET /api/announcements/admin?limit=50&offset=0&activeOnly=false
Authorization: Required (SWD or admin group)
```

**Query Parameters:**
- `limit`: Number of records (default: 50)
- `offset`: Pagination offset (default: 0)
- `activeOnly`: Filter active only (default: false)

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

### Get Unread Count

```http
GET /api/announcements/unread-count
Authorization: Required (Session-based)
```

**Response:**
```json
{
  "success": true,
  "count": 3
}
```

### Create Announcement (Admin)

```http
POST /api/announcements
Authorization: Required (SWD or admin group)
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "System Maintenance Notice",
  "content": "Scheduled maintenance on Sunday, 2-4 AM EST",
  "severity": "warning",
  "is_active": true,
  "start_date": "2026-02-01 00:00:00",
  "end_date": "2026-02-02 00:00:00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    ...
  }
}
```

### Update Announcement (Admin)

```http
PUT /api/announcements/:id
Authorization: Required (SWD or admin group)
Content-Type: application/json
```

**Request Body:** (any fields to update)
```json
{
  "title": "Updated Title",
  "is_active": false
}
```

### Delete Announcement (Admin)

```http
DELETE /api/announcements/:id
Authorization: Required (SWD or admin group)
```

**Response:**
```json
{
  "success": true,
  "message": "Announcement deleted successfully"
}
```

### Mark as Read (User)

```http
POST /api/announcements/:id/read
Authorization: Required (Session-based)
```

**Response:**
```json
{
  "success": true,
  "message": "Announcement marked as read"
}
```

## Troubleshooting

### Announcement Not Displaying

**Symptoms**: Users report not seeing an active announcement

**Solutions**:
1. Verify announcement status is "Active" (is_active = 1)
2. Check start date is in the past (start_date <= current time)
3. Check end date hasn't passed (end_date >= current time or NULL)
4. Verify user is authenticated
5. Check browser console for errors

### Wrong Date/Time Display

**Symptoms**: Dates showing incorrectly in admin panel

**Solutions**:
1. Database stores dates in MySQL datetime format
2. Check timezone settings in browser
3. Use datetime-local input format: `YYYY-MM-DDTHH:MM`
4. Verify date conversion in `formatDateTimeForDb()` method

### Read Tracking Not Working

**Symptoms**: Announcements not marked as read

**Solutions**:
1. Verify user is authenticated (user email available)
2. Check `user_announcement_reads` table exists
3. Verify API endpoint `/api/announcements/:id/read` is called
4. Check for database errors in server logs

### Changes Not Appearing

**Symptoms**: Edits don't show up for users

**Solutions**:
1. Clear browser cache and refresh
2. Verify announcement service is loading fresh data
3. Check if edit was actually saved (check database)
4. Ensure no caching layer is interfering

## Security Considerations

### Access Control

- **Admin Access**: Only users in SWD or admin groups can create/edit/delete
- **User Access**: All authenticated users can view active announcements
- **Authentication**: All endpoints require valid session

### Data Validation

- Title and content are required fields
- Severity must be one of: info, warning, success, error
- Dates are validated and formatted before database insertion
- SQL injection protection via parameterized queries

### Audit Trail

- `created_by` field tracks who created announcements
- `created_at` and `updated_at` timestamps track when
- Server logs record all create/update/delete operations
- Read tracking provides user engagement metrics

## Future Enhancements

The following features are **not currently implemented** but may be added in future versions:

- **Audience Targeting**: Target specific groups or roles
- **Rich Content**: Markdown formatting, attachments, embedded media
- **Display Options**: Banner, modal, email delivery options
- **Templates**: Predefined announcement templates
- **Multi-language**: Translation support
- **Analytics**: Detailed read statistics and reports
- **Approval Workflow**: Multi-step approval process
- **Archive Function**: Archive instead of delete
- **Duplicate Function**: Clone existing announcements
- **Integration**: Slack, Teams, calendar integration

## Support

For assistance with the Announcement System:
- Contact system administrators
- Check server logs: `/logs/server-*.log`
- Review database tables: `announcements`, `user_announcement_reads`
- Submit issues through admin panel
- Consult API documentation above

## Common Use Cases

### 1. System Maintenance Notification

```json
{
  "title": "Scheduled Maintenance - Sunday 2-4 AM",
  "content": "The system will be unavailable for scheduled maintenance on Sunday, January 28 from 2:00 AM to 4:00 AM EST. Please save your work and log out before this time.",
  "severity": "warning",
  "is_active": true,
  "start_date": "2026-01-27 08:00:00",
  "end_date": "2026-01-28 06:00:00"
}
```

### 2. New Feature Announcement

```json
{
  "title": "New Report Scheduling Feature Available",
  "content": "We've added automated report scheduling! Visit the Reports section to schedule your recurring reports.",
  "severity": "success",
  "is_active": true,
  "start_date": "2026-01-26 09:00:00",
  "end_date": null
}
```

### 3. Security Alert

```json
{
  "title": "Action Required: Password Update",
  "content": "For security reasons, all users must update their passwords within 7 days. Go to Settings > Security to update your password.",
  "severity": "error",
  "is_active": true,
  "start_date": "2026-01-26 00:00:00",
  "end_date": "2026-02-02 23:59:59"
}
```

### 4. General Information

```json
{
  "title": "Office Holiday Schedule",
  "content": "Our offices will be closed on Monday, February 12 for Presidents Day. Regular operations resume Tuesday, February 13.",
  "severity": "info",
  "is_active": true,
  "start_date": "2026-02-01 00:00:00",
  "end_date": "2026-02-13 09:00:00"
}
```

## Appendix

### Severity Level Colors

The UI displays severity levels with these colors:
- **info** → Blue (`#2196F3`)
- **warning** → Orange (`#FF9800`)
- **success** → Green (`#4CAF50`)
- **error** → Red (`#F44336`)

### Date Format Reference

- **Database Format**: `YYYY-MM-DD HH:MM:SS` (MySQL datetime)
- **Input Format**: `YYYY-MM-DDTHH:MM` (datetime-local)
- **Display Format**: Localized using `toLocaleDateString()` and `toLocaleTimeString()`

### File Locations

- **Frontend Component**: `/client/src/views/Admin/AnnouncementManagement.vue`
- **Service**: `/client/src/services/announcementService.js`
- **Backend Controller**: `/server/src/controllers/announcement.controller.js`
- **Model**: `/server/src/models/announcement.model.js`
- **Routes**: `/server/src/routes/announcement.routes.js`
