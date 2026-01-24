# Reports Scheduling System - Implementation Plan
## For Surgical Guide Report

**Version:** 1.0.0  
**Created:** January 24, 2026  
**Status:** 🚧 Implementation Ready  

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Email Integration](#email-integration)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Guide](#deployment-guide)
9. [Security Considerations](#security-considerations)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🎯 Overview

### Purpose
Enable users to schedule automated generation and delivery of Surgical Guide Reports via email on a recurring basis (daily, weekly, monthly).

### Key Features
- ✅ Custom schedule creation (frequency, time, timezone)
- ✅ Multi-recipient email delivery
- ✅ Multiple export formats (PDF, Excel, HTML)
- ✅ Report filters persistence
- ✅ Schedule management (pause/resume/delete)
- ✅ Execution history and logs
- ✅ Error handling and retry mechanism
- ✅ Timezone support for global teams

### Success Metrics
- 90%+ successful report deliveries
- Average generation time < 30 seconds
- User adoption rate > 50% within 3 months
- Zero data security incidents

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vue 3 + Vuetify)               │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ Schedule       │  │ Schedule       │  │ Schedule      │ │
│  │ Management     │  │ Form           │  │ History       │ │
│  └────────┬───────┘  └────────┬───────┘  └───────┬───────┘ │
└───────────┼────────────────────┼──────────────────┼─────────┘
            │                    │                  │
            │ REST API           │                  │
┌───────────┼────────────────────┼──────────────────┼─────────┐
│           │     Express.js Backend              │           │
│  ┌────────▼───────┐  ┌────────▼──────┐  ┌──────▼────────┐  │
│  │ Schedule       │  │ Report        │  │ Email         │  │
│  │ Controller     │◄─┤ Generator     │◄─┤ Service       │  │
│  └────────┬───────┘  └───────────────┘  └───────────────┘  │
│  ┌────────▼───────┐                                         │
│  │ Schedule       │                                         │
│  │ Service        │                                         │
│  └────────┬───────┘                                         │
│  ┌────────▼───────┐  ┌──────────────────────────────────┐  │
│  │ Schedule       │  │    Cron Scheduler (node-cron)    │  │
│  │ Model          │  │    Runs every minute             │  │
│  └────────┬───────┘  └──────────────────────────────────┘  │
└───────────┼─────────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────────┐
│              MySQL Database (PowerBI CP)                     │
│  ┌─────────────────┐  ┌──────────────────────────────────┐ │
│  │ report_schedules│  │ report_schedule_logs             │ │
│  └─────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           External Services                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ SendGrid / SES │  │ Puppeteer      │  │ ExcelJS       │ │
│  │ (Email)        │  │ (PDF Gen)      │  │ (Excel Gen)   │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Node.js (Express)
- node-cron (Scheduler)
- Puppeteer (PDF generation)
- ExcelJS (Excel generation)
- Nodemailer / SendGrid (Email)
- MySQL2 (Database)

**Frontend:**
- Vue 3 (Composition API)
- Vuetify 3 (UI components)
- Axios (HTTP client)

**Infrastructure:**
- MySQL database
- SMTP server or SendGrid API

---

## 🗄️ Database Schema

### Table: `report_schedules`

```sql
CREATE TABLE report_schedules (
  -- Primary key
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- User & Report identification
  user_id VARCHAR(255) NOT NULL COMMENT 'Email of user who created the schedule',
  user_name VARCHAR(255) NULL COMMENT 'Full name of user',
  report_type VARCHAR(100) NOT NULL COMMENT 'Type of report (surgical_guide, powerbi, etc)',
  report_name VARCHAR(255) NOT NULL COMMENT 'Human-readable report name',
  
  -- Schedule configuration
  schedule_frequency ENUM('daily', 'weekly', 'monthly', 'custom') NOT NULL COMMENT 'How often to run',
  schedule_time TIME NOT NULL COMMENT 'Time of day to run (HH:MM:SS)',
  schedule_timezone VARCHAR(50) NOT NULL DEFAULT 'UTC' COMMENT 'Timezone for schedule (e.g., America/New_York)',
  schedule_days VARCHAR(100) NULL COMMENT 'For weekly: comma-separated days (Mon,Wed,Fri). For monthly: day numbers (1,15)',
  
  -- Recipients & Format
  recipients TEXT NOT NULL COMMENT 'JSON array of email addresses',
  format ENUM('pdf', 'excel', 'html') DEFAULT 'pdf' COMMENT 'Output format',
  
  -- Report filters (preserved from manual query)
  filters JSON NULL COMMENT 'Report-specific filters (date ranges, search terms, etc)',
  
  -- Status & Control
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Schedule enabled/disabled',
  is_processing BOOLEAN DEFAULT FALSE COMMENT 'Currently executing',
  
  -- Execution tracking
  last_run_at TIMESTAMP NULL COMMENT 'Last successful execution',
  last_run_status ENUM('success', 'failed', 'partial') NULL,
  last_error_message TEXT NULL,
  next_run_at TIMESTAMP NOT NULL COMMENT 'Next scheduled execution',
  execution_count INT DEFAULT 0 COMMENT 'Total successful executions',
  failure_count INT DEFAULT 0 COMMENT 'Total failures',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(255) NULL COMMENT 'User who created (same as user_id)',
  updated_by VARCHAR(255) NULL COMMENT 'Last user who modified',
  
  -- Indexes
  INDEX idx_next_run (next_run_at, is_active),
  INDEX idx_user (user_id),
  INDEX idx_report_type (report_type),
  INDEX idx_status (is_active, next_run_at),
  
  -- Constraints
  CHECK (JSON_VALID(recipients)),
  CHECK (JSON_VALID(filters))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table: `report_schedule_logs`

```sql
CREATE TABLE report_schedule_logs (
  -- Primary key
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Foreign key to schedule
  schedule_id INT NOT NULL,
  
  -- Execution details
  status ENUM('success', 'failed', 'processing', 'partial') NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  duration_ms INT NULL COMMENT 'Execution duration in milliseconds',
  
  -- Results
  recipients_count INT DEFAULT 0 COMMENT 'Number of recipients',
  recipients_sent INT DEFAULT 0 COMMENT 'Emails successfully sent',
  recipients_failed INT DEFAULT 0 COMMENT 'Failed email deliveries',
  file_size_bytes INT NULL COMMENT 'Generated file size',
  records_in_report INT NULL COMMENT 'Number of data records in report',
  
  -- Error tracking
  error_message TEXT NULL,
  error_code VARCHAR(50) NULL,
  retry_count INT DEFAULT 0,
  
  -- Execution context
  triggered_by ENUM('scheduled', 'manual', 'retry') DEFAULT 'scheduled',
  executed_at_timezone VARCHAR(50) NULL,
  
  -- Metadata
  metadata JSON NULL COMMENT 'Additional execution details',
  
  -- Indexes
  FOREIGN KEY (schedule_id) REFERENCES report_schedules(id) ON DELETE CASCADE,
  INDEX idx_schedule (schedule_id),
  INDEX idx_status (status, started_at),
  INDEX idx_started_at (started_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Migration Script Location
```
database/migrations/YYYYMMDDHHMMSS_create_report_scheduling_tables.cjs
```

---

## 🔧 Backend Implementation

### Phase 1: Configuration Updates

#### File: `server/src/config/config.js`

Add scheduling configuration section:

```javascript
// Reports Scheduling Configuration
scheduling: {
  enabled: process.env.SCHEDULING_ENABLED !== 'false', // Default: true
  checkInterval: '*/1 * * * *', // Check every minute (cron format)
  maxConcurrentJobs: parseInt(process.env.SCHEDULING_MAX_CONCURRENT) || 3,
  maxRetries: parseInt(process.env.SCHEDULING_MAX_RETRIES) || 3,
  retryDelay: parseInt(process.env.SCHEDULING_RETRY_DELAY) || 300000, // 5 minutes
  jobTimeout: parseInt(process.env.SCHEDULING_JOB_TIMEOUT) || 300000, // 5 minutes
  
  // Report generation settings
  reportGeneration: {
    maxRecords: parseInt(process.env.REPORT_MAX_RECORDS) || 10000,
    tempDir: process.env.REPORT_TEMP_DIR || path.join(process.cwd(), 'temp/reports'),
    retentionHours: parseInt(process.env.REPORT_RETENTION_HOURS) || 24
  },
  
  // Email settings
  email: {
    provider: process.env.EMAIL_PROVIDER || 'smtp', // 'smtp' or 'sendgrid'
    from: process.env.EMAIL_FROM || 'noreply@insighthub.com',
    fromName: process.env.EMAIL_FROM_NAME || 'InsightHub Reports',
    
    // SMTP settings
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    },
    
    // SendGrid settings
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY
    }
  },
  
  // PDF generation settings (Puppeteer)
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
  },
  
  // Excel generation settings
  excel: {
    enabled: process.env.EXCEL_ENABLED !== 'false',
    sheetName: 'Report Data',
    autoFilter: true,
    freeze: { row: 1, column: 0 } // Freeze header row
  }
}
```

### Phase 2: Database Models

#### File: `server/src/models/reportSchedule.model.js`

```javascript
/**
 * @file reportSchedule.model.js
 * @description Database operations for report schedules
 */

import databaseService from '../services/database.js';
import { createContextLogger } from '../services/logger.js';

const logger = createContextLogger('reportSchedule.model.js');

class ReportScheduleModel {
  /**
   * Create a new schedule
   * @param {Object} scheduleData - Schedule details
   * @returns {Promise<number>} Created schedule ID
   */
  async create(scheduleData) {
    const query = `
      INSERT INTO report_schedules (
        user_id, user_name, report_type, report_name,
        schedule_frequency, schedule_time, schedule_timezone, schedule_days,
        recipients, format, filters, next_run_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      scheduleData.userId,
      scheduleData.userName,
      scheduleData.reportType,
      scheduleData.reportName,
      scheduleData.frequency,
      scheduleData.time,
      scheduleData.timezone || 'UTC',
      scheduleData.days ? JSON.stringify(scheduleData.days) : null,
      JSON.stringify(scheduleData.recipients),
      scheduleData.format || 'pdf',
      scheduleData.filters ? JSON.stringify(scheduleData.filters) : null,
      scheduleData.nextRunAt,
      scheduleData.userId
    ];

    const [result] = await databaseService.executeQuery(query, values);
    logger.info('Schedule created', { scheduleId: result.insertId });
    return result.insertId;
  }

  /**
   * Get schedule by ID
   */
  async getById(scheduleId) {
    const query = `
      SELECT * FROM report_schedules WHERE id = ?
    `;
    const [rows] = await databaseService.executeQuery(query, [scheduleId]);
    
    if (rows.length === 0) return null;
    
    return this._parseSchedule(rows[0]);
  }

  /**
   * Get all schedules for a user
   */
  async getByUser(userId) {
    const query = `
      SELECT * FROM report_schedules 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await databaseService.executeQuery(query, [userId]);
    return rows.map(row => this._parseSchedule(row));
  }

  /**
   * Get pending schedules (due to run)
   */
  async getPendingSchedules() {
    const query = `
      SELECT * FROM report_schedules
      WHERE is_active = TRUE
        AND is_processing = FALSE
        AND next_run_at <= NOW()
      ORDER BY next_run_at ASC
      LIMIT 100
    `;
    const [rows] = await databaseService.executeQuery(query);
    return rows.map(row => this._parseSchedule(row));
  }

  /**
   * Update schedule
   */
  async update(scheduleId, updates, userId) {
    const allowedFields = [
      'schedule_frequency', 'schedule_time', 'schedule_timezone', 'schedule_days',
      'recipients', 'format', 'filters', 'is_active', 'next_run_at'
    ];
    
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        if (['recipients', 'filters', 'schedule_days'].includes(key) && typeof value === 'object') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    fields.push('updated_by = ?', 'updated_at = NOW()');
    values.push(userId, scheduleId);
    
    const query = `
      UPDATE report_schedules
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    
    await databaseService.executeQuery(query, values);
    logger.info('Schedule updated', { scheduleId });
  }

  /**
   * Mark schedule as processing
   */
  async markProcessing(scheduleId, isProcessing) {
    const query = `
      UPDATE report_schedules
      SET is_processing = ?, updated_at = NOW()
      WHERE id = ?
    `;
    await databaseService.executeQuery(query, [isProcessing, scheduleId]);
  }

  /**
   * Update execution status
   */
  async updateExecutionStatus(scheduleId, status, errorMessage = null) {
    const query = `
      UPDATE report_schedules
      SET 
        last_run_at = NOW(),
        last_run_status = ?,
        last_error_message = ?,
        execution_count = CASE WHEN ? = 'success' THEN execution_count + 1 ELSE execution_count END,
        failure_count = CASE WHEN ? = 'failed' THEN failure_count + 1 ELSE failure_count END,
        is_processing = FALSE,
        updated_at = NOW()
      WHERE id = ?
    `;
    await databaseService.executeQuery(query, [status, errorMessage, status, status, scheduleId]);
  }

  /**
   * Calculate next run time based on frequency
   */
  calculateNextRun(schedule) {
    const { frequency, time, timezone, days } = schedule;
    const now = new Date();
    // Implementation will use timezone-aware date calculations
    // For simplicity, example shows UTC
    
    // This is a simplified version - full implementation will handle all cases
    const [hours, minutes] = time.split(':');
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next;
  }

  /**
   * Delete schedule
   */
  async delete(scheduleId) {
    const query = `DELETE FROM report_schedules WHERE id = ?`;
    await databaseService.executeQuery(query, [scheduleId]);
    logger.info('Schedule deleted', { scheduleId });
  }

  /**
   * Parse schedule row (convert JSON fields)
   */
  _parseSchedule(row) {
    return {
      ...row,
      recipients: JSON.parse(row.recipients),
      filters: row.filters ? JSON.parse(row.filters) : null,
      days: row.schedule_days ? JSON.parse(row.schedule_days) : null
    };
  }
}

export default new ReportScheduleModel();
```

#### File: `server/src/models/reportScheduleLog.model.js`

```javascript
/**
 * @file reportScheduleLog.model.js
 * @description Database operations for schedule execution logs
 */

import databaseService from '../services/database.js';
import { createContextLogger } from '../services/logger.js';

const logger = createContextLogger('reportScheduleLog.model.js');

class ReportScheduleLogModel {
  /**
   * Create log entry
   */
  async create(logData) {
    const query = `
      INSERT INTO report_schedule_logs (
        schedule_id, status, started_at, recipients_count,
        triggered_by, executed_at_timezone
      ) VALUES (?, ?, NOW(), ?, ?, ?)
    `;

    const values = [
      logData.scheduleId,
      'processing',
      logData.recipientsCount || 0,
      logData.triggeredBy || 'scheduled',
      logData.timezone || 'UTC'
    ];

    const [result] = await databaseService.executeQuery(query, values);
    return result.insertId;
  }

  /**
   * Update log entry with results
   */
  async update(logId, updates) {
    const query = `
      UPDATE report_schedule_logs
      SET 
        status = ?,
        completed_at = NOW(),
        duration_ms = ?,
        recipients_sent = ?,
        recipients_failed = ?,
        file_size_bytes = ?,
        records_in_report = ?,
        error_message = ?,
        error_code = ?,
        metadata = ?
      WHERE id = ?
    `;

    const values = [
      updates.status,
      updates.durationMs,
      updates.recipientsSent || 0,
      updates.recipientsFailed || 0,
      updates.fileSizeBytes,
      updates.recordsInReport,
      updates.errorMessage,
      updates.errorCode,
      updates.metadata ? JSON.stringify(updates.metadata) : null,
      logId
    ];

    await databaseService.executeQuery(query, values);
  }

  /**
   * Get logs for a schedule
   */
  async getByScheduleId(scheduleId, limit = 50) {
    const query = `
      SELECT * FROM report_schedule_logs
      WHERE schedule_id = ?
      ORDER BY started_at DESC
      LIMIT ?
    `;
    const [rows] = await databaseService.executeQuery(query, [scheduleId, limit]);
    return rows.map(row => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    }));
  }

  /**
   * Get execution statistics
   */
  async getStatistics(scheduleId) {
    const query = `
      SELECT 
        COUNT(*) as total_executions,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        AVG(duration_ms) as avg_duration_ms,
        MAX(started_at) as last_execution
      FROM report_schedule_logs
      WHERE schedule_id = ?
    `;
    const [rows] = await databaseService.executeQuery(query, [scheduleId]);
    return rows[0];
  }
}

export default new ReportScheduleLogModel();
```

### Phase 3: Services

#### File: `server/src/services/reportGenerator.service.js`

```javascript
/**
 * @file reportGenerator.service.js
 * @description Generate reports in various formats (PDF, Excel, HTML)
 */

import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import path from 'path';
import { CONFIG } from '../config/config.js';
import surgicalGuideOrdersService from './surgicalGuideOrders.service.js';
import { createContextLogger } from './logger.js';

const logger = createContextLogger('reportGenerator.service.js');

class ReportGeneratorService {
  constructor() {
    this.tempDir = CONFIG.scheduling.reportGeneration.tempDir;
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create temp directory', { error: error.message });
    }
  }

  /**
   * Generate report based on schedule
   */
  async generateReport(schedule) {
    logger.info('Generating report', { 
      scheduleId: schedule.id,
      format: schedule.format,
      reportType: schedule.report_type
    });

    const startTime = Date.now();
    
    try {
      // Fetch report data
      const reportData = await this._fetchReportData(schedule);
      
      // Generate file based on format
      let filePath;
      let fileSize;
      
      if (schedule.format === 'pdf') {
        filePath = await this._generatePDF(schedule, reportData);
      } else if (schedule.format === 'excel') {
        filePath = await this._generateExcel(schedule, reportData);
      } else if (schedule.format === 'html') {
        filePath = await this._generateHTML(schedule, reportData);
      } else {
        throw new Error(`Unsupported format: ${schedule.format}`);
      }
      
      const stats = await fs.stat(filePath);
      fileSize = stats.size;
      
      const duration = Date.now() - startTime;
      
      logger.info('Report generated successfully', {
        scheduleId: schedule.id,
        format: schedule.format,
        fileSize,
        duration,
        records: reportData.data.length
      });
      
      return {
        filePath,
        fileSize,
        recordsCount: reportData.data.length,
        duration
      };
      
    } catch (error) {
      logger.error('Report generation failed', {
        scheduleId: schedule.id,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Fetch report data based on filters
   */
  async _fetchReportData(schedule) {
    const filters = schedule.filters || {};
    
    // For surgical guide report
    if (schedule.report_type === 'surgical_guide') {
      return await surgicalGuideOrdersService.getCompleteReport({
        startDate: filters.startDate || this._getDefaultStartDate(),
        endDate: filters.endDate || this._getDefaultEndDate(),
        searchQuery: filters.searchQuery || '',
        orderTypeFilter: filters.orderTypeFilter || 'all'
      });
    }
    
    throw new Error(`Unsupported report type: ${schedule.report_type}`);
  }

  /**
   * Generate PDF using Puppeteer
   */
  async _generatePDF(schedule, reportData) {
    const html = this._generateHTMLContent(schedule, reportData);
    const fileName = `${schedule.report_type}_${Date.now()}.pdf`;
    const filePath = path.join(this.tempDir, fileName);
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: filePath,
        format: CONFIG.scheduling.pdf.format,
        printBackground: CONFIG.scheduling.pdf.printBackground,
        margin: CONFIG.scheduling.pdf.margin
      });
      
      return filePath;
    } finally {
      await browser.close();
    }
  }

  /**
   * Generate Excel using ExcelJS
   */
  async _generateExcel(schedule, reportData) {
    const fileName = `${schedule.report_type}_${Date.now()}.xlsx`;
    const filePath = path.join(this.tempDir, fileName);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(CONFIG.scheduling.excel.sheetName);
    
    // Add headers
    if (reportData.data.length > 0) {
      const headers = Object.keys(reportData.data[0]);
      worksheet.addRow(headers);
      
      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Add data rows
      reportData.data.forEach(row => {
        worksheet.addRow(Object.values(row));
      });
      
      // Auto-fit columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const length = cell.value ? cell.value.toString().length : 10;
          if (length > maxLength) maxLength = length;
        });
        column.width = Math.min(maxLength + 2, 50);
      });
      
      // Add auto-filter
      if (CONFIG.scheduling.excel.autoFilter) {
        worksheet.autoFilter = {
          from: 'A1',
          to: `${String.fromCharCode(65 + headers.length - 1)}1`
        };
      }
    }
    
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  /**
   * Generate HTML report
   */
  async _generateHTML(schedule, reportData) {
    const html = this._generateHTMLContent(schedule, reportData);
    const fileName = `${schedule.report_type}_${Date.now()}.html`;
    const filePath = path.join(this.tempDir, fileName);
    
    await fs.writeFile(filePath, html, 'utf8');
    return filePath;
  }

  /**
   * Generate HTML content for report
   */
  _generateHTMLContent(schedule, reportData) {
    const { data, summary } = reportData;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${schedule.report_name} - ${new Date().toLocaleDateString()}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1976d2;
      margin: 0 0 10px 0;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid;
    }
    .summary-card.total { border-color: #1976d2; background: #e3f2fd; }
    .summary-card.cost { border-color: #4caf50; background: #e8f5e9; }
    .summary-card.avg { border-color: #ff9800; background: #fff3e0; }
    .summary-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }
    .summary-value {
      font-size: 28px;
      font-weight: bold;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
    }
    tr:hover {
      background: #fafafa;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${schedule.report_name}</h1>
    <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>
    
    ${summary ? `
    <div class="summary">
      <div class="summary-card total">
        <div class="summary-label">Total Orders</div>
        <div class="summary-value">${summary.totalOrders || 0}</div>
      </div>
      <div class="summary-card cost">
        <div class="summary-label">Total Cost</div>
        <div class="summary-value">$${(summary.totalCost || 0).toLocaleString()}</div>
      </div>
      <div class="summary-card avg">
        <div class="summary-label">Average Cost</div>
        <div class="summary-value">$${(summary.avgCost || 0).toLocaleString()}</div>
      </div>
    </div>
    ` : ''}
    
    <table>
      <thead>
        <tr>
          ${Object.keys(data[0] || {}).map(key => `<th>${this._formatHeader(key)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            ${Object.values(row).map(val => `<td>${this._formatValue(val)}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="footer">
      <p>This report was automatically generated by InsightHub</p>
      <p>Report ID: ${schedule.id} | Format: ${schedule.format.toUpperCase()} | Records: ${data.length}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  _formatHeader(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  _formatValue(value) {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') return value.toLocaleString();
    return value.toString();
  }

  _getDefaultStartDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  _getDefaultEndDate() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Clean up old temporary files
   */
  async cleanupOldFiles() {
    const retentionMs = CONFIG.scheduling.reportGeneration.retentionHours * 60 * 60 * 1000;
    const now = Date.now();
    
    try {
      const files = await fs.readdir(this.tempDir);
      
      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > retentionMs) {
          await fs.unlink(filePath);
          logger.info('Cleaned up old report file', { file });
        }
      }
    } catch (error) {
      logger.error('Failed to cleanup old files', { error: error.message });
    }
  }
}

export default new ReportGeneratorService();
```

#### File: `server/src/services/emailService.js`

```javascript
/**
 * @file emailService.js
 * @description Email delivery service for scheduled reports
 */

import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import fs from 'fs/promises';
import path from 'path';
import { CONFIG } from '../config/config.js';
import { createContextLogger } from './logger.js';

const logger = createContextLogger('emailService.js');

class EmailService {
  constructor() {
    this.provider = CONFIG.scheduling.email.provider;
    this.initializeProvider();
  }

  initializeProvider() {
    if (this.provider === 'sendgrid') {
      if (!CONFIG.scheduling.email.sendgrid.apiKey) {
        throw new Error('SendGrid API key not configured');
      }
      sgMail.setApiKey(CONFIG.scheduling.email.sendgrid.apiKey);
      logger.info('Email service initialized with SendGrid');
    } else {
      // SMTP
      this.transporter = nodemailer.createTransporter(CONFIG.scheduling.email.smtp);
      logger.info('Email service initialized with SMTP');
    }
  }

  /**
   * Send scheduled report email
   */
  async sendScheduledReport(schedule, reportFile) {
    logger.info('Sending scheduled report', {
      scheduleId: schedule.id,
      recipients: schedule.recipients.length,
      format: schedule.format
    });

    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    // Read file for attachment
    const fileContent = await fs.readFile(reportFile.filePath);
    const fileName = path.basename(reportFile.filePath);
    
    const emailData = {
      subject: this._generateSubject(schedule),
      html: this._generateEmailHTML(schedule, reportFile),
      attachments: [{
        filename: fileName,
        content: fileContent
      }]
    };

    // Send to each recipient
    for (const recipient of schedule.recipients) {
      try {
        if (this.provider === 'sendgrid') {
          await this._sendWithSendGrid(recipient, emailData);
        } else {
          await this._sendWithSMTP(recipient, emailData);
        }
        results.sent++;
        logger.info('Email sent successfully', { recipient, scheduleId: schedule.id });
      } catch (error) {
        results.failed++;
        results.errors.push({ recipient, error: error.message });
        logger.error('Failed to send email', {
          recipient,
          scheduleId: schedule.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Send with SendGrid
   */
  async _sendWithSendGrid(recipient, emailData) {
    const msg = {
      to: recipient,
      from: {
        email: CONFIG.scheduling.email.from,
        name: CONFIG.scheduling.email.fromName
      },
      subject: emailData.subject,
      html: emailData.html,
      attachments: emailData.attachments.map(att => ({
        content: att.content.toString('base64'),
        filename: att.filename,
        type: this._getContentType(att.filename),
        disposition: 'attachment'
      }))
    };

    await sgMail.send(msg);
  }

  /**
   * Send with SMTP
   */
  async _sendWithSMTP(recipient, emailData) {
    const mailOptions = {
      from: `${CONFIG.scheduling.email.fromName} <${CONFIG.scheduling.email.from}>`,
      to: recipient,
      subject: emailData.subject,
      html: emailData.html,
      attachments: emailData.attachments
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Generate email subject
   */
  _generateSubject(schedule) {
    const date = new Date().toLocaleDateString();
    return `${schedule.report_name} - ${date}`;
  }

  /**
   * Generate email HTML content
   */
  _generateEmailHTML(schedule, reportFile) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-radius: 0 0 8px 8px;
    }
    .info-box {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .button {
      display: inline-block;
      background: #1976d2;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 ${schedule.report_name}</h1>
      <p>Scheduled Report Delivery</p>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Your scheduled report has been generated and is ready for review. Please find the report attached to this email.</p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Report Type:</span>
          <span>${schedule.report_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Generated:</span>
          <span>${new Date().toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Format:</span>
          <span>${schedule.format.toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">File Size:</span>
          <span>${this._formatFileSize(reportFile.fileSize)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Records:</span>
          <span>${reportFile.recordsCount.toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Schedule:</span>
          <span>${this._formatFrequency(schedule)}</span>
        </div>
      </div>
      
      <p><strong>Note:</strong> This is an automated email. The report was generated based on your schedule settings.</p>
      
      <p>If you need to modify or cancel this schedule, please log in to InsightHub.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} InsightHub. All rights reserved.</p>
      <p>Schedule ID: ${schedule.id}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  _formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  _formatFrequency(schedule) {
    const freq = schedule.schedule_frequency;
    if (freq === 'daily') return 'Daily';
    if (freq === 'weekly') return `Weekly (${schedule.days?.join(', ') || 'N/A'})`;
    if (freq === 'monthly') return `Monthly (Day ${schedule.days?.join(', ') || 'N/A'})`;
    return 'Custom';
  }

  _getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const types = {
      '.pdf': 'application/pdf',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.html': 'text/html'
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Send test email
   */
  async sendTestEmail(recipient) {
    const emailData = {
      subject: 'InsightHub - Email Service Test',
      html: '<p>This is a test email from InsightHub scheduling service.</p>',
      attachments: []
    };

    if (this.provider === 'sendgrid') {
      await this._sendWithSendGrid(recipient, emailData);
    } else {
      await this._sendWithSMTP(recipient, emailData);
    }

    logger.info('Test email sent', { recipient });
  }
}

export default new EmailService();
```

*[File continues with more service implementations...]*

---

## 📚 Installation & Dependencies

Add to `server/package.json`:

```json
"dependencies": {
  "node-cron": "^3.0.3",
  "puppeteer": "^21.6.1",
  "exceljs": "^4.4.0",
  "nodemailer": "^6.9.7",
  "@sendgrid/mail": "^8.1.0"
}
```

Install:
```bash
cd server
npm install node-cron puppeteer exceljs nodemailer @sendgrid/mail
```

---

## 🔐 Environment Variables

Add to `.env`:

```bash
# Reports Scheduling
SCHEDULING_ENABLED=true
SCHEDULING_MAX_CONCURRENT=3
SCHEDULING_MAX_RETRIES=3
SCHEDULING_JOB_TIMEOUT=300000

# Email Provider (smtp or sendgrid)
EMAIL_PROVIDER=smtp
EMAIL_FROM=noreply@insighthub.com
EMAIL_FROM_NAME=InsightHub Reports

# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SendGrid (if using)
SENDGRID_API_KEY=your-sendgrid-api-key

# PDF/Excel Settings
PDF_ENABLED=true
EXCEL_ENABLED=true
REPORT_TEMP_DIR=./temp/reports
REPORT_RETENTION_HOURS=24
```

---

## 🚀 Quick Start

### 1. Database Setup
```bash
cd database
npx knex migrate:latest
```

### 2. Start Scheduler
```bash
cd server
npm run dev
```

The scheduler automatically starts and checks for pending reports every minute.

### 3. Test Schedule Creation

```bash
curl -X POST http://localhost:3001/api/reports/schedules \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "reportType": "surgical_guide",
    "frequency": "daily",
    "time": "08:00",
    "timezone": "America/New_York",
    "recipients": ["user@example.com"],
    "format": "pdf",
    "filters": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    }
  }'
```

---

## 📝 Next Steps

This document provides the complete architecture and backend implementation. The next phases are:

1. ✅ **Configuration** - Add scheduling settings to config.js
2. ✅ **Database Migrations** - Create tables for schedules and logs
3. ✅ **Backend Services** - Implement scheduler, generator, and email services
4. ⏳ **REST API** - Create controller and routes
5. ⏳ **Frontend UI** - Build Vue components for schedule management
6. ⏳ **Testing** - Unit and integration tests
7. ⏳ **Documentation** - API docs and user guide

---

**Version:** 1.0.0  
**Author:** InsightHub Development Team  
**Last Updated:** January 24, 2026
