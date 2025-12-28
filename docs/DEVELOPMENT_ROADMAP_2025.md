# Development Roadmap 2025

**Project:** InsightHub  
**Version:** v1.1.0  
**Last Updated:** December 17, 2025  
**Status:** Active Development

---

## 🎯 Overview

This roadmap outlines the planned features and improvements for InsightHub. All items are prioritized based on business value, technical dependencies, and user feedback.

---

## 📊 Roadmap Status

| Priority | Feature | Status | Target Date | Owner |
|----------|---------|--------|-------------|-------|
| 🔴 High | Reports Scheduling System | 📋 Planned | Q1 2026 | TBD |
| 🔴 High | Admin Announcements | 📋 Planned | Q1 2026 | TBD |
| 🔴 High | Database Migrations (LiquiBase) | 📋 Planned | Q1 2026 | TBD |
| 🟡 Medium | Frontend Component Tests | 📋 Planned | Q1 2026 | TBD |
| 🟡 Medium | Frontend Test IDs (data-testid) | 📋 Planned | Q1 2026 | TBD |
| 🟢 Low | Advanced Analytics Dashboard | 💡 Backlog | Q2 2026 | TBD |

**Legend:**
- 🔴 High Priority - Critical for business operations
- 🟡 Medium Priority - Important enhancements
- 🟢 Low Priority - Nice-to-have features
- 💡 Backlog - Future consideration
- 📋 Planned - Requirements defined, ready for development
- 🚧 In Progress - Active development
- ✅ Completed - Feature deployed to production

---

## 🔴 High Priority Features

### 1. Reports Scheduling System

**Business Value:** Allow users to schedule automated report generation and delivery, reducing manual effort and ensuring timely data distribution.

#### **Requirements:**
- Schedule reports on recurring basis (daily, weekly, monthly)
- Support multiple report types (Surgical Guide, PowerBI, Grafana)
- Email delivery with PDF/Excel attachments
- Time zone support for global teams
- Report history and audit trail

#### **Technical Specifications:**

**Database Schema:**
```sql
CREATE TABLE report_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) NOT NULL,
  report_type VARCHAR(100) NOT NULL,
  schedule_frequency ENUM('daily', 'weekly', 'monthly', 'custom') NOT NULL,
  schedule_time TIME NOT NULL,
  schedule_timezone VARCHAR(50) DEFAULT 'UTC',
  recipients TEXT NOT NULL, -- JSON array of emails
  format ENUM('pdf', 'excel', 'html') DEFAULT 'pdf',
  filters JSON, -- Report-specific filters
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP NULL,
  next_run_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_next_run (next_run_at, is_active),
  INDEX idx_user (user_id)
);

CREATE TABLE report_schedule_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  schedule_id INT NOT NULL,
  status ENUM('success', 'failed', 'processing') NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NULL,
  error_message TEXT NULL,
  recipients_count INT DEFAULT 0,
  file_size_bytes INT NULL,
  FOREIGN KEY (schedule_id) REFERENCES report_schedules(id) ON DELETE CASCADE,
  INDEX idx_schedule (schedule_id),
  INDEX idx_status (status, started_at)
);
```

**API Endpoints:**
```javascript
// Create schedule
POST /api/reports/schedules
Body: {
  reportType: 'surgical-guide',
  frequency: 'weekly',
  time: '08:00',
  timezone: 'America/New_York',
  recipients: ['user@example.com'],
  format: 'pdf',
  filters: { dateRange: 'last-30-days' }
}

// List user's schedules
GET /api/reports/schedules

// Update schedule
PUT /api/reports/schedules/:id

// Delete schedule
DELETE /api/reports/schedules/:id

// Pause/Resume schedule
PATCH /api/reports/schedules/:id/toggle

// View schedule history
GET /api/reports/schedules/:id/history
```

**Frontend Components:**
```
client/src/views/Reports/
├── ScheduleManagement.vue      # Main schedule management page
├── ScheduleForm.vue             # Create/edit schedule form
└── ScheduleHistory.vue          # View execution history

client/src/components/Reports/
├── ScheduleCard.vue             # Display schedule info
├── FrequencySelector.vue        # Recurring schedule selector
└── RecipientManager.vue         # Manage email recipients
```

**Background Job (Node.js Cron):**
```javascript
// server/src/jobs/reportScheduler.js
import cron from 'node-cron';
import { generateReport } from '../services/reportGenerator.js';
import { sendEmail } from '../services/emailService.js';
import ReportSchedule from '../models/reportSchedule.js';

// Run every minute to check for pending reports
cron.schedule('* * * * *', async () => {
  const pendingSchedules = await ReportSchedule.findPendingSchedules();
  
  for (const schedule of pendingSchedules) {
    await executeSchedule(schedule);
  }
});

async function executeSchedule(schedule) {
  try {
    const report = await generateReport(schedule);
    await sendEmail({
      to: schedule.recipients,
      subject: `Scheduled Report: ${schedule.reportType}`,
      attachments: [report]
    });
    await schedule.markSuccess();
  } catch (error) {
    await schedule.markFailed(error.message);
  }
}
```

#### **Implementation Steps:**

1. **Phase 1: Database Setup (Week 1)**
   - [ ] Create migration scripts
   - [ ] Add database schema
   - [ ] Create models (ReportSchedule, ReportScheduleLog)
   - [ ] Add indexes for performance

2. **Phase 2: Backend API (Week 2-3)**
   - [ ] Implement CRUD endpoints for schedules
   - [ ] Create background job scheduler
   - [ ] Implement report generation service
   - [ ] Add email service integration
   - [ ] Write unit tests for services
   - [ ] Write integration tests for APIs

3. **Phase 3: Frontend UI (Week 4-5)**
   - [ ] Create schedule management page
   - [ ] Build schedule creation form
   - [ ] Implement frequency selector
   - [ ] Add recipient management
   - [ ] Create history/logs viewer
   - [ ] Add real-time status updates

4. **Phase 4: Testing & Deployment (Week 6)**
   - [ ] End-to-end testing
   - [ ] Performance testing
   - [ ] Security review
   - [ ] Documentation
   - [ ] Staging deployment
   - [ ] Production deployment

#### **Dependencies:**
- Email service (SendGrid/AWS SES)
- PDF generation library (Puppeteer/PDFKit)
- Excel generation library (ExcelJS)
- Cron job scheduler (node-cron)

#### **Success Metrics:**
- 90%+ successful report deliveries
- Average generation time < 30 seconds
- User adoption rate > 50% within 3 months

---

### 2. Admin Announcements

**Business Value:** Enable administrators to broadcast important messages, system updates, and maintenance notifications to all users.

#### **Requirements:**
- Create, edit, delete announcements
- Target specific user groups
- Schedule announcement visibility (start/end dates)
- Multiple severity levels (info, warning, critical)
- Rich text editor for formatting
- Dismissible vs. persistent announcements
- View count and engagement tracking

#### **Technical Specifications:**

**Database Schema:**
```sql
CREATE TABLE announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
  type ENUM('banner', 'modal', 'toast') DEFAULT 'banner',
  target_groups JSON, -- ['*'] for all, or specific groups
  is_dismissible BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_by VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  dismiss_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active, starts_at, expires_at),
  INDEX idx_target (target_groups)
);

CREATE TABLE announcement_views (
  id INT PRIMARY KEY AUTO_INCREMENT,
  announcement_id INT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dismissed_at TIMESTAMP NULL,
  FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_view (announcement_id, user_id),
  INDEX idx_user (user_id)
);
```

**API Endpoints:**
```javascript
// Admin: Create announcement
POST /api/admin/announcements
Body: {
  title: 'System Maintenance',
  message: 'Scheduled maintenance on Dec 20',
  severity: 'warning',
  type: 'banner',
  targetGroups: ['*'],
  isDismissible: true,
  startsAt: '2025-12-20T00:00:00Z',
  expiresAt: '2025-12-21T00:00:00Z'
}

// Admin: List all announcements
GET /api/admin/announcements

// Admin: Update announcement
PUT /api/admin/announcements/:id

// Admin: Delete announcement
DELETE /api/admin/announcements/:id

// User: Get active announcements
GET /api/announcements/active

// User: Mark announcement as viewed
POST /api/announcements/:id/view

// User: Dismiss announcement
POST /api/announcements/:id/dismiss
```

**Frontend Components:**
```
client/src/views/Admin/
└── AnnouncementManagement.vue   # Admin panel for announcements

client/src/components/Announcements/
├── AnnouncementBanner.vue       # Top banner display
├── AnnouncementModal.vue        # Modal dialog display
├── AnnouncementToast.vue        # Toast notification
└── AnnouncementEditor.vue       # Rich text editor for admins
```

**Frontend Integration:**
```vue
<!-- App.vue - Global announcement display -->
<template>
  <v-app>
    <!-- Display active announcements -->
    <AnnouncementBanner 
      v-for="announcement in activeAnnouncements"
      :key="announcement.id"
      :announcement="announcement"
      @dismiss="dismissAnnouncement"
    />
    
    <router-view />
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAnnouncementStore } from '@/stores/announcement';

const announcementStore = useAnnouncementStore();
const activeAnnouncements = computed(() => 
  announcementStore.getActiveAnnouncements()
);

onMounted(() => {
  announcementStore.fetchActiveAnnouncements();
});
</script>
```

#### **Implementation Steps:**

1. **Phase 1: Database & Backend (Week 1-2)**
   - [ ] Create database schema
   - [ ] Implement models
   - [ ] Create admin CRUD APIs
   - [ ] Create user view/dismiss APIs
   - [ ] Add Casbin policies for admin access
   - [ ] Write unit tests

2. **Phase 2: Admin Panel (Week 3)**
   - [ ] Create announcement management page
   - [ ] Build rich text editor
   - [ ] Add group targeting selector
   - [ ] Implement preview functionality
   - [ ] Add analytics dashboard

3. **Phase 3: User-Facing Components (Week 4)**
   - [ ] Create banner component
   - [ ] Create modal component
   - [ ] Create toast component
   - [ ] Integrate with App.vue
   - [ ] Add dismiss functionality
   - [ ] Implement local storage caching

4. **Phase 4: Testing & Deployment (Week 5)**
   - [ ] E2E testing
   - [ ] Cross-browser testing
   - [ ] Accessibility review
   - [ ] Documentation
   - [ ] Deployment

#### **Dependencies:**
- Rich text editor (TipTap/Quill.js)
- Vuetify components (v-alert, v-dialog, v-snackbar)

#### **Success Metrics:**
- 95%+ announcement view rate
- Average dismiss time > 5 seconds (indicates reading)
- Admin satisfaction with editor usability

---

### 3. Database Migrations with LiquiBase

**Business Value:** Implement version-controlled database schema changes with rollback capability, ensuring safe and consistent database updates across environments.

#### **Requirements:**
- Track all database schema changes
- Support forward and backward migrations
- Environment-specific changesets
- Rollback capability for failed migrations
- Migration history and audit trail
- Integration with CI/CD pipeline
- Support for MySQL/PostgreSQL

#### **Technical Specifications:**

**LiquiBase Installation:**
```bash
# Install LiquiBase CLI
npm install --save-dev liquibase

# Or use Docker
docker pull liquibase/liquibase
```

**Project Structure:**
```
database/
├── migrations/
│   ├── changelog-master.xml          # Master changelog
│   ├── v1.0/
│   │   ├── 001-initial-schema.xml
│   │   ├── 002-casbin-tables.xml
│   │   └── 003-report-tables.xml
│   ├── v1.1/
│   │   ├── 004-add-report-schedules.xml
│   │   └── 005-add-announcements.xml
│   └── v1.2/
│       └── 006-add-user-preferences.xml
├── rollbacks/
│   └── rollback-scripts.xml
├── liquibase.properties              # Configuration
└── liquibase-dev.properties          # Dev environment
```

**Master Changelog (`changelog-master.xml`):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
  xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">

  <!-- Version 1.0 -->
  <include file="v1.0/001-initial-schema.xml" relativeToChangelogFile="true"/>
  <include file="v1.0/002-casbin-tables.xml" relativeToChangelogFile="true"/>
  <include file="v1.0/003-report-tables.xml" relativeToChangelogFile="true"/>

  <!-- Version 1.1 -->
  <include file="v1.1/004-add-report-schedules.xml" relativeToChangelogFile="true"/>
  <include file="v1.1/005-add-announcements.xml" relativeToChangelogFile="true"/>

  <!-- Version 1.2 (Future) -->
  <include file="v1.2/006-add-user-preferences.xml" relativeToChangelogFile="true"/>

</databaseChangeLog>
```

**Example Changeset (`004-add-report-schedules.xml`):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
  xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">

  <changeSet id="004-report-schedules-table" author="dev-team">
    <createTable tableName="report_schedules">
      <column name="id" type="INT" autoIncrement="true">
        <constraints primaryKey="true" nullable="false"/>
      </column>
      <column name="user_id" type="VARCHAR(255)">
        <constraints nullable="false"/>
      </column>
      <column name="report_type" type="VARCHAR(100)">
        <constraints nullable="false"/>
      </column>
      <column name="schedule_frequency" type="VARCHAR(20)">
        <constraints nullable="false"/>
      </column>
      <column name="schedule_time" type="TIME">
        <constraints nullable="false"/>
      </column>
      <column name="recipients" type="TEXT">
        <constraints nullable="false"/>
      </column>
      <column name="is_active" type="BOOLEAN" defaultValueBoolean="true"/>
      <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP"/>
      <column name="updated_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP"/>
    </createTable>

    <createIndex indexName="idx_user_schedules" tableName="report_schedules">
      <column name="user_id"/>
    </createIndex>

    <rollback>
      <dropTable tableName="report_schedules"/>
    </rollback>
  </changeSet>

  <changeSet id="004-report-schedule-logs-table" author="dev-team">
    <createTable tableName="report_schedule_logs">
      <column name="id" type="INT" autoIncrement="true">
        <constraints primaryKey="true" nullable="false"/>
      </column>
      <column name="schedule_id" type="INT">
        <constraints nullable="false"/>
      </column>
      <column name="status" type="VARCHAR(20)">
        <constraints nullable="false"/>
      </column>
      <column name="started_at" type="TIMESTAMP">
        <constraints nullable="false"/>
      </column>
      <column name="completed_at" type="TIMESTAMP"/>
      <column name="error_message" type="TEXT"/>
    </createTable>

    <addForeignKeyConstraint
      baseTableName="report_schedule_logs"
      baseColumnNames="schedule_id"
      referencedTableName="report_schedules"
      referencedColumnNames="id"
      constraintName="fk_schedule_logs_schedule"
      onDelete="CASCADE"/>

    <rollback>
      <dropTable tableName="report_schedule_logs"/>
    </rollback>
  </changeSet>

</databaseChangeLog>
```

**Configuration (`liquibase.properties`):**
```properties
# Database connection
url=jdbc:mysql://localhost:3306/insighthub
username=${DB_USERNAME}
password=${DB_PASSWORD}
driver=com.mysql.cj.jdbc.Driver

# Changelog
changeLogFile=database/migrations/changelog-master.xml

# LiquiBase settings
liquibase.hub.mode=off
liquibase.showSummary=SUMMARY
```

**NPM Scripts (`package.json`):**
```json
{
  "scripts": {
    "db:status": "liquibase --defaults-file=database/liquibase.properties status",
    "db:update": "liquibase --defaults-file=database/liquibase.properties update",
    "db:rollback": "liquibase --defaults-file=database/liquibase.properties rollback-count 1",
    "db:rollback-to": "liquibase --defaults-file=database/liquibase.properties rollback-to-date",
    "db:validate": "liquibase --defaults-file=database/liquibase.properties validate",
    "db:generate-docs": "liquibase --defaults-file=database/liquibase.properties db-doc ./docs/database",
    "db:tag": "liquibase --defaults-file=database/liquibase.properties tag"
  }
}
```

#### **Implementation Steps:**

1. **Phase 1: Setup & Configuration (Week 1)**
   - [ ] Install LiquiBase
   - [ ] Create directory structure
   - [ ] Configure properties files
   - [ ] Create master changelog
   - [ ] Add NPM scripts
   - [ ] Test basic migration

2. **Phase 2: Convert Existing Schemas (Week 2)**
   - [ ] Convert casbin_schema.sql to LiquiBase XML
   - [ ] Convert report_access_logs_schema.sql
   - [ ] Convert surgical_guides_schema.sql
   - [ ] Test migrations on clean database
   - [ ] Verify rollback functionality

3. **Phase 3: CI/CD Integration (Week 3)**
   - [ ] Add migration step to deployment pipeline
   - [ ] Configure environment-specific properties
   - [ ] Add pre-deployment validation
   - [ ] Setup rollback procedure
   - [ ] Document deployment process

4. **Phase 4: New Feature Migrations (Week 4)**
   - [ ] Create report schedules migration
   - [ ] Create announcements migration
   - [ ] Test forward/backward migrations
   - [ ] Update documentation

#### **Usage Examples:**

**Check Migration Status:**
```bash
npm run db:status
```

**Apply Pending Migrations:**
```bash
npm run db:update
```

**Rollback Last Migration:**
```bash
npm run db:rollback
```

**Tag Current State:**
```bash
npm run db:tag -- v1.1.0
```

**Rollback to Specific Tag:**
```bash
liquibase --defaults-file=database/liquibase.properties rollback v1.0.0
```

**Generate Database Documentation:**
```bash
npm run db:generate-docs
```

#### **Dependencies:**
- LiquiBase CLI or Docker image
- JDBC driver (MySQL/PostgreSQL)
- Node.js script integration

#### **Success Metrics:**
- 100% migration success rate
- Zero data loss during migrations
- < 5 minutes downtime during deployments
- Complete rollback capability

---

## 🟡 Medium Priority Features

### 4. Frontend Component Tests

**Target:** Increase component test coverage from 1.4% to 80%+

**Scope:**
- Add unit tests for all Vue components
- Test component props, events, and slots
- Mock Vuetify components
- Test computed properties and methods

**Estimated Effort:** 3-4 weeks

---

### 5. Frontend Test IDs (data-testid)

**Target:** Add data-testid attributes to all interactive elements

**Scope:**
- Add test IDs to buttons, forms, inputs
- Add test IDs to navigation elements
- Update E2E tests to use test IDs
- Document test ID naming conventions

**Estimated Effort:** 1-2 weeks

---

## 🟢 Low Priority / Backlog

### Advanced Analytics Dashboard
- Custom widget builder
- Drag-and-drop layout
- Real-time data updates
- Export capabilities

### Multi-language Support Expansion
- Add Spanish, French, German
- Dynamic language switching
- RTL support improvements

### Audit Log Enhancements
- Advanced filtering
- Export to CSV/Excel
- Retention policies
- Compliance reports

---

## 📅 Timeline

### Q1 2026 (January - March)
- ✅ Complete Reports Scheduling System
- ✅ Complete Admin Announcements
- ✅ Complete LiquiBase Integration
- 🚧 Start Frontend Component Tests

### Q2 2026 (April - June)
- ✅ Complete Frontend Component Tests
- ✅ Complete Frontend Test IDs
- 🚧 Start Advanced Analytics Dashboard

### Q3 2026 (July - September)
- Review and prioritize backlog items
- Plan next quarter features

---

## 🎓 Resources

### Documentation
- [LiquiBase Documentation](https://docs.liquibase.com/)
- [Node-Cron Documentation](https://www.npmjs.com/package/node-cron)
- [Vue Test Utils](https://test-utils.vuejs.org/)

### Best Practices
- Database Migration Best Practices
- Announcement UX Patterns
- Test Coverage Guidelines

---

## 📝 Notes

- All features require approval before development begins
- Timeline estimates are subject to change based on team capacity
- Dependencies must be resolved before starting implementation
- Security and performance reviews required before production deployment

---

**Last Updated:** December 17, 2025  
**Next Review:** January 15, 2026
