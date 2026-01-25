# Admin Announcements System

## Overview
The Admin Announcements System allows administrators to create, manage, and display system-wide announcements to users.

## Features
- ✅ Create/Edit/Delete announcements (Admin only)
- ✅ Set announcement severity levels (info, warning, success, error)
- ✅ Schedule announcements with start and end dates
- ✅ Enable/Disable announcements
- ✅ Track read/unread status per user
- ✅ Display unread count badge
- ✅ Responsive announcement display with color coding

## Database Schema

### `announcements` Table
- `id`: Primary key
- `title`: Announcement title (255 chars)
- `content`: Announcement text content
- `severity`: Enum (info, warning, success, error)
- `is_active`: Boolean - whether announcement is active
- `start_date`: When announcement becomes visible
- `end_date`: When announcement expires (optional)
- `created_by`: Email of admin who created it
- `created_at`, `updated_at`: Timestamps

### `user_announcement_reads` Table
- `id`: Primary key
- `announcement_id`: Links to announcements table
- `user_email`: User who read the announcement
- `read_at`: Timestamp when marked as read
- Unique constraint on (announcement_id, user_email)

## API Endpoints

### User Endpoints (Authenticated)
- `GET /api/announcements` - Get active announcements for current user
- `GET /api/announcements/unread-count` - Get unread count
- `POST /api/announcements/:id/read` - Mark announcement as read

### Admin Endpoints (Admin only)
- `GET /api/announcements/admin` - Get all announcements (with filters)
- `GET /api/announcements/:id` - Get announcement by ID
- `POST /api/announcements` - Create new announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

## Frontend Components

### Admin Component
**Location:** `/client/src/views/Admin/AnnouncementManagement.vue`

**Features:**
- Data table with all announcements
- Create/Edit dialog with form validation
- Delete confirmation dialog
- Filter by active status
- Color-coded severity badges

**Route:** `/admin/announcements`
**Access:** Admin, SWD groups

### User Display Component
**Location:** `/client/src/components/Announcements/AnnouncementDisplay.vue`

**Features:**
- Card-based announcement display
- Color-coded by severity
- "Mark as read" button
- Auto-refresh capability
- Empty state handling
- Relative date formatting

**Route:** `/announcements`
**Access:** All authenticated users

### Badge Component
**Location:** `/client/src/components/Announcements/AnnouncementBadge.vue`

**Features:**
- Shows unread count
- Auto-refreshing
- Can be embedded in navigation

## Usage Examples

### Creating an Announcement (Admin)
1. Navigate to `/admin/announcements`
2. Click "New Announcement"
3. Fill in:
   - Title
   - Content (supports line breaks)
   - Severity level
   - Start date/time
   - Optional end date/time
   - Active checkbox
4. Click "Create"

### Viewing Announcements (User)
1. Navigate to `/announcements` or view on dashboard
2. Announcements display with severity color coding
3. Click checkmark icon to mark as read
4. Badge in navigation shows unread count

### Using Components in Dashboard

```vue
<template>
  <v-container>
    <!-- Display announcements -->
    <AnnouncementDisplay 
      :autoRefresh="true" 
      :refreshInterval="60000"
      @announcements-loaded="handleLoad"
      @announcement-read="handleRead"
    />
  </v-container>
</template>

<script>
import AnnouncementDisplay from '@/components/Announcements/AnnouncementDisplay.vue';

export default {
  components: { AnnouncementDisplay },
  methods: {
    handleLoad(announcements) {
      console.log('Loaded announcements:', announcements.length);
    },
    handleRead(announcementId) {
      console.log('Marked as read:', announcementId);
    }
  }
};
</script>
```

### Using Badge in Navigation

```vue
<template>
  <v-list-item to="/announcements">
    <v-list-item-icon>
      <AnnouncementBadge />
    </v-list-item-icon>
    <v-list-item-title>Announcements</v-list-item-title>
  </v-list-item>
</template>

<script>
import AnnouncementBadge from '@/components/Announcements/AnnouncementBadge.vue';
export default {
  components: { AnnouncementBadge }
};
</script>
```

## Severity Levels and Colors

| Severity | Color         | Use Case                          |
|----------|---------------|-----------------------------------|
| info     | Blue          | General information, updates      |
| warning  | Orange        | Important notices, upcoming changes|
| success  | Green         | Positive news, completed actions  |
| error    | Red           | Critical issues, urgent notices   |

## Implementation Details

### Backend Model
**File:** `/server/src/models/announcement.model.js`

Key methods:
- `create(announcementData)` - Create announcement
- `findById(id)` - Get single announcement
- `findAll(options)` - Get all announcements (admin)
- `getActiveAnnouncements(userEmail)` - Get active with read status
- `update(id, updateData)` - Update announcement
- `delete(id)` - Delete announcement
- `markAsRead(announcementId, userEmail)` - Mark as read
- `getUnreadCount(userEmail)` - Get unread count

### API Service
**File:** `/client/src/services/announcementService.js`

Provides client-side API methods matching backend endpoints.

## Security Considerations

1. **Admin Routes:** Protected by `requireAdmin` middleware
2. **User Routes:** Require authentication
3. **Read Tracking:** Only tracks for authenticated users
4. **Content Sanitization:** Basic HTML sanitization applied (consider DOMPurify for production)

## Testing the System

### 1. Create Test Announcement
```bash
curl -X POST http://localhost:3001/api/announcements \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{
    "title": "System Maintenance",
    "content": "Scheduled maintenance on Saturday from 2-4 AM",
    "severity": "warning",
    "is_active": true,
    "start_date": "2026-01-25 00:00:00",
    "end_date": "2026-01-27 00:00:00"
  }'
```

### 2. View Active Announcements
```bash
curl http://localhost:3001/api/announcements \
  -H "Cookie: <session-cookie>"
```

### 3. Mark as Read
```bash
curl -X POST http://localhost:3001/api/announcements/1/read \
  -H "Cookie: <session-cookie>"
```

## Future Enhancements

- [ ] Rich text editor for content
- [ ] Attachment support
- [ ] User targeting (specific groups/users)
- [ ] Email notifications for critical announcements
- [ ] Announcement templates
- [ ] Scheduling with cron expressions
- [ ] Analytics (view counts, read rates)
- [ ] Multi-language support

## Troubleshooting

### Announcements not appearing
1. Check `is_active` is `true`
2. Verify `start_date` is in the past
3. Check `end_date` is null or in the future
4. Confirm user is authenticated

### Cannot create announcements
1. Verify user has admin rights
2. Check all required fields are provided
3. Ensure dates are in correct format (YYYY-MM-DD HH:MM:SS)

### Database connection issues
1. Verify database credentials in `.env`
2. Check announcements tables exist
3. Verify user has appropriate permissions
