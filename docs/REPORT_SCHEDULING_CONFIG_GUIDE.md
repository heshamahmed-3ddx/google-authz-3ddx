# Report Scheduling - Configuration Guide

## Table of Contents
- [Overview](#overview)
- [Environment Variables](#environment-variables)
- [Email Configuration](#email-configuration)
- [Report Generation Settings](#report-generation-settings)
- [Scheduler Settings](#scheduler-settings)
- [Security Configuration](#security-configuration)
- [Database Setup](#database-setup)
- [Testing Configuration](#testing-configuration)
- [Production Deployment](#production-deployment)

## Overview

This guide covers the configuration required to set up and run the Report Scheduling System in your InsightHub environment.

## Environment Variables

### Required Variables

```bash
# Database (Required for scheduling to work)
DB_HOST=localhost
DB_NAME=insighthub
DB_USER=your_user
DB_PASSWORD=your_password
DB_PORT=3306

# Email Provider Configuration (Choose ONE)
# Option 1: SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false  # true for port 465, false for other ports
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Option 2: SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Email Settings
EMAIL_PROVIDER=smtp  # 'smtp' or 'sendgrid'
EMAIL_FROM=noreply@insighthub.com
EMAIL_FROM_NAME=InsightHub Reports
```

### Optional Variables

```bash
# Scheduling Configuration
SCHEDULING_ENABLED=true
SCHEDULING_MAX_CONCURRENT=3
SCHEDULING_MAX_RETRIES=3
SCHEDULING_RETRY_DELAY=300000  # 5 minutes in milliseconds
SCHEDULING_JOB_TIMEOUT=300000   # 5 minutes in milliseconds

# Report Generation
REPORT_MAX_RECORDS=10000
REPORT_TEMP_DIR=/tmp/reports
REPORT_RETENTION_HOURS=24

# PDF Generation
PDF_ENABLED=true

# Excel Generation
EXCEL_ENABLED=true
```

## Email Configuration

### Option 1: SMTP Configuration

#### Gmail Example

1. **Enable 2-Factor Authentication** in your Google Account

2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail" on "Other (Custom name)"

3. **Configure Environment Variables**:
   ```bash
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=InsightHub Reports
   ```

#### Office 365 Example

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
EMAIL_FROM=your-email@company.com
EMAIL_FROM_NAME=InsightHub Reports
```

#### Custom SMTP Server

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=mail.yourcompany.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=reports@yourcompany.com
SMTP_PASS=your-secure-password
EMAIL_FROM=reports@yourcompany.com
EMAIL_FROM_NAME=Company Reports
```

### Option 2: SendGrid Configuration

1. **Create SendGrid Account** at https://sendgrid.com

2. **Generate API Key**:
   - Dashboard → Settings → API Keys
   - Create API Key with "Mail Send" permission
   - Copy the key (shown only once)

3. **Verify Sender Domain**:
   - Settings → Sender Authentication
   - Verify your domain or single sender email

4. **Configure Environment Variables**:
   ```bash
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   EMAIL_FROM=verified-email@yourdomain.com
   EMAIL_FROM_NAME=InsightHub Reports
   ```

### Testing Email Configuration

Use the test email endpoint:

```bash
curl -X POST http://localhost:3001/api/reports/schedules/system/test-email \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"recipient": "test@example.com"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

## Report Generation Settings

### PDF Generation (Puppeteer)

The system uses Puppeteer for PDF generation. Configuration is in `config.js`:

```javascript
pdf: {
  enabled: process.env.PDF_ENABLED !== 'false',
  format: 'A4',
  printBackground: true,
  margin: {
    top: '20px',
    right: '20px',
    bottom: '20px',
    left: '20px'
  }
}
```

#### Puppeteer Dependencies

**Ubuntu/Debian**:
```bash
sudo apt-get install -y \
  chromium-browser \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  libnss3 \
  libcups2 \
  libxss1 \
  libxrandr2 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libgtk-3-0
```

**CentOS/RHEL**:
```bash
sudo yum install -y \
  chromium \
  libX11-xcb \
  libXcomposite \
  libXcursor \
  libXdamage \
  libXi \
  libXtst \
  cups-libs \
  libXScrnSaver \
  libXrandr \
  alsa-lib \
  pango \
  atk \
  at-spi2-atk \
  gtk3
```

**Docker**:
```dockerfile
FROM node:18-slim

# Install Puppeteer dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

### Excel Generation (ExcelJS)

No special dependencies required. Configuration in `config.js`:

```javascript
excel: {
  enabled: process.env.EXCEL_ENABLED !== 'false',
  sheetName: 'Report Data',
  autoFilter: true,
  freeze: { row: 1, column: 0 } // Freeze header row
}
```

### Temporary Files

Reports are generated in a temporary directory and cleaned up automatically:

```bash
# Set custom temp directory
REPORT_TEMP_DIR=/var/insighthub/reports

# Set retention period (hours)
REPORT_RETENTION_HOURS=24
```

**Important**:
- Directory must exist and be writable by Node.js process
- Old files are cleaned daily at 2 AM
- Files older than retention period are deleted

## Scheduler Settings

### Cron Schedule

The scheduler checks for pending schedules every minute by default. To change:

```javascript
// In server/src/config/config.js
scheduling: {
  checkInterval: '*/5 * * * *', // Every 5 minutes
  // or
  checkInterval: '0 * * * *',   // Every hour
}
```

**Cron Format**: `minute hour day month dayOfWeek`

Examples:
- `*/1 * * * *` - Every minute
- `*/5 * * * *` - Every 5 minutes
- `0 */2 * * *` - Every 2 hours
- `0 0 * * *` - Daily at midnight

### Concurrency Limits

Control how many schedules can run simultaneously:

```bash
SCHEDULING_MAX_CONCURRENT=3  # Max 3 schedules running at once
```

**Recommendations**:
- Small servers: 1-2
- Medium servers: 3-5
- Large servers: 5-10

### Retry Configuration

Configure automatic retry behavior for failed schedules:

```bash
SCHEDULING_MAX_RETRIES=3           # Retry up to 3 times
SCHEDULING_RETRY_DELAY=300000      # Wait 5 minutes between retries (milliseconds)
```

### Job Timeout

Maximum time a schedule can run before being terminated:

```bash
SCHEDULING_JOB_TIMEOUT=300000  # 5 minutes (milliseconds)
```

Adjust based on:
- Report complexity
- Data volume
- Server performance

## Security Configuration

### Authentication

All scheduling endpoints require authentication. Users must be logged in to:
- Create schedules
- View their schedules
- Edit/delete their schedules

### Authorization

- **Regular Users**: Can only manage their own schedules
- **Admin Users**: Can view system status via `/api/reports/schedules/system/status`

### Rate Limiting

API endpoints inherit global rate limiting from InsightHub configuration:

```javascript
rateLimit: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
}
```

### Email Security

**Best Practices**:
1. Use app-specific passwords, not account passwords
2. Enable 2FA on email accounts
3. Restrict SMTP access to application IP
4. Use TLS/SSL for SMTP connections
5. Rotate API keys regularly (SendGrid)

## Database Setup

### Running Migrations

Execute the scheduling tables migration:

```bash
# From project root
cd database
npx knex migrate:up 20260124000001_create_report_scheduling_tables.cjs
```

### Verifying Tables

```sql
-- Check tables exist
SHOW TABLES LIKE 'report_schedule%';

-- Expected output:
-- report_schedules
-- report_schedule_logs

-- Check indexes
SHOW INDEX FROM report_schedules;
SHOW INDEX FROM report_schedule_logs;
```

### Database Maintenance

**Cleanup Old Logs** (runs automatically daily at 2 AM):
```sql
-- Manual cleanup if needed
DELETE FROM report_schedule_logs 
WHERE started_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

**Monitor Table Sizes**:
```sql
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES 
WHERE table_schema = 'insighthub' 
  AND table_name LIKE 'report_schedule%';
```

## Testing Configuration

### Health Check

Verify scheduler is running:

```bash
curl http://localhost:3001/api/reports/schedules/system/status \
  -H "Cookie: your-session-cookie"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "running": true,
    "uptime": 3600,
    "activeJobs": 0,
    "totalExecutions": 42,
    "health": {
      "status": "healthy",
      "lastCheck": "2026-01-24T10:00:00.000Z"
    }
  }
}
```

### Test Schedule Creation

```bash
curl -X POST http://localhost:3001/api/reports/schedules \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "reportType": "surgical_guide",
    "reportName": "Test Schedule",
    "frequency": "daily",
    "time": "08:00",
    "timezone": "America/New_York",
    "recipients": ["test@example.com"],
    "format": "pdf",
    "filters": {}
  }'
```

### Manual Trigger Test

```bash
curl -X POST http://localhost:3001/api/reports/schedules/{id}/trigger \
  -H "Cookie: your-session-cookie"
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] Database migrations executed
- [ ] Email configuration tested
- [ ] Environment variables set
- [ ] Puppeteer dependencies installed
- [ ] Temp directory created and writable
- [ ] SMTP/SendGrid credentials verified
- [ ] Test schedule created and executed
- [ ] Logs directory writable
- [ ] System timezone configured correctly

### Docker Deployment

**docker-compose.yml**:
```yaml
services:
  insighthub:
    image: insighthub:latest
    environment:
      - DB_HOST=mysql
      - DB_NAME=insighthub
      - DB_USER=insighthub
      - DB_PASSWORD=${DB_PASSWORD}
      - EMAIL_PROVIDER=smtp
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - EMAIL_FROM=${EMAIL_FROM}
      - SCHEDULING_ENABLED=true
      - REPORT_TEMP_DIR=/app/temp/reports
    volumes:
      - reports-temp:/app/temp/reports
    depends_on:
      - mysql

volumes:
  reports-temp:
```

### Process Management (PM2)

**ecosystem.config.js**:
```javascript
module.exports = {
  apps: [{
    name: 'insighthub',
    script: './server/src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      SCHEDULING_ENABLED: 'true'
    }
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Monitoring

**Key Metrics to Monitor**:
- Scheduler uptime
- Active jobs count
- Failed executions rate
- Email delivery rate
- Disk space (temp directory)
- Database table sizes

**Logging**:
- Scheduler logs: `server/logs/scheduler.log`
- Email logs: `server/logs/email.log`
- Report generation logs: `server/logs/reports.log`

### Backup Strategy

**Database**:
```bash
# Daily backup of scheduling tables
mysqldump insighthub \
  report_schedules \
  report_schedule_logs \
  > backup_$(date +%Y%m%d).sql
```

**Configuration**:
- Keep `.env` file in secure backup
- Document custom configuration changes
- Version control configuration files

---

**Document Version**: 1.0.0  
**Last Updated**: January 24, 2026  
**Maintained By**: InsightHub Development Team
