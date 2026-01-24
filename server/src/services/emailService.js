/**
 * @file emailService.js
 * @description Email delivery service for scheduled reports
 * @author InsightHub Development Team
 * @created 2026-01-24
 * @version 1.0.0
 * @copyright 2026 InsightHub. All rights reserved.
 */

import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import fs from 'fs/promises';
import path from 'path';
import { CONFIG } from '../config/config.js';
import { createContextLogger } from './logger.js';

const logger = createContextLogger('emailService.js');

/**
 * Email Service
 * Handles sending emails via SMTP or SendGrid
 */
class EmailService {
  constructor() {
    this.provider = CONFIG.scheduling.email.provider;
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize email provider
   * @private
   */
  async initialize() {
    if (this.initialized) return;

    try {
      if (this.provider === 'sendgrid') {
        if (!CONFIG.scheduling.email.sendgrid.apiKey) {
          throw new Error('SendGrid API key not configured');
        }
        sgMail.setApiKey(CONFIG.scheduling.email.sendgrid.apiKey);
        logger.info('Email service initialized with SendGrid');
      } else {
        // SMTP
        if (!CONFIG.scheduling.email.smtp.host || !CONFIG.scheduling.email.smtp.user) {
          logger.warn('SMTP not fully configured - email sending will fail');
        }
        
        this.transporter = nodemailer.createTransporter({
          host: CONFIG.scheduling.email.smtp.host,
          port: CONFIG.scheduling.email.smtp.port,
          secure: CONFIG.scheduling.email.smtp.secure,
          auth: {
            user: CONFIG.scheduling.email.smtp.auth.user,
            pass: CONFIG.scheduling.email.smtp.auth.pass
          }
        });
        
        // Verify SMTP connection
        try {
          await this.transporter.verify();
          logger.info('Email service initialized with SMTP', {
            host: CONFIG.scheduling.email.smtp.host,
            port: CONFIG.scheduling.email.smtp.port
          });
        } catch (error) {
          logger.error('SMTP verification failed', { error: error.message });
          throw error;
        }
      }
      
      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize email service', { 
        provider: this.provider,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send scheduled report email
   * @param {Object} schedule - Schedule configuration
   * @param {Object} reportFile - Generated report file info
   * @returns {Promise<Object>} Send results
   */
  async sendScheduledReport(schedule, reportFile) {
    await this.initialize();

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

    try {
      // Read file for attachment
      const fileContent = await fs.readFile(reportFile.filePath);
      const fileName = this._generateFileName(schedule, reportFile);
      
      const emailData = {
        subject: this._generateSubject(schedule),
        html: this._generateEmailHTML(schedule, reportFile),
        attachments: [{
          filename: fileName,
          content: fileContent,
          contentType: this._getContentType(reportFile.filePath)
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
          logger.info('Email sent successfully', { 
            recipient, 
            scheduleId: schedule.id 
          });
        } catch (error) {
          results.failed++;
          results.errors.push({ 
            recipient, 
            error: error.message 
          });
          logger.error('Failed to send email', {
            recipient,
            scheduleId: schedule.id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('Critical error in send scheduled report', {
        scheduleId: schedule.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send with SendGrid
   * @private
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
        type: att.contentType,
        disposition: 'attachment'
      }))
    };

    await sgMail.send(msg);
  }

  /**
   * Send with SMTP
   * @private
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
   * Generate email subject line
   * @private
   */
  _generateSubject(schedule) {
    const date = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `${schedule.report_name} - ${date}`;
  }

  /**
   * Generate filename for attachment
   * @private
   */
  _generateFileName(schedule, reportFile) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const ext = path.extname(reportFile.filePath);
    const baseName = schedule.report_type.replace(/_/g, '-');
    
    return `${baseName}-report-${dateStr}${ext}`;
  }

  /**
   * Generate email HTML content
   * @private
   */
  _generateEmailHTML(schedule, reportFile) {
    const generatedDate = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .message {
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 25px;
      color: #555;
    }
    .info-box {
      background: #f9f9f9;
      border-left: 4px solid #1976d2;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #666;
      font-size: 14px;
    }
    .info-value {
      color: #333;
      font-size: 14px;
    }
    .attachment-notice {
      background: #e3f2fd;
      border: 1px solid #90caf9;
      padding: 15px;
      border-radius: 4px;
      margin: 25px 0;
      text-align: center;
    }
    .attachment-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .attachment-text {
      font-size: 14px;
      color: #1565c0;
      font-weight: 600;
    }
    .note {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 15px;
      margin: 25px 0;
      font-size: 14px;
      color: #e65100;
    }
    .button {
      display: inline-block;
      background: #1976d2;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      background: #f5f5f5;
      padding: 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer-logo {
      font-size: 18px;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 10px;
    }
    .footer p {
      margin: 5px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header {
        padding: 30px 20px;
      }
      .info-row {
        flex-direction: column;
      }
      .info-label {
        margin-bottom: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>📊 ${this._escapeHtml(schedule.report_name)}</h1>
      <p>Scheduled Report Delivery</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hello,
      </div>
      
      <div class="message">
        Your scheduled report has been generated and is ready for review. The report is attached to this email in <strong>${schedule.format.toUpperCase()}</strong> format.
      </div>
      
      <div class="attachment-notice">
        <div class="attachment-icon">📎</div>
        <div class="attachment-text">
          Report file is attached to this email
        </div>
      </div>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Report Name</span>
          <span class="info-value">${this._escapeHtml(schedule.report_name)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Generated</span>
          <span class="info-value">${generatedDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Format</span>
          <span class="info-value">${schedule.format.toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">File Size</span>
          <span class="info-value">${this._formatFileSize(reportFile.fileSize)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Records</span>
          <span class="info-value">${reportFile.recordsCount.toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Schedule</span>
          <span class="info-value">${this._formatSchedule(schedule)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Schedule ID</span>
          <span class="info-value">#${schedule.id}</span>
        </div>
      </div>
      
      <div class="note">
        <strong>📌 Note:</strong> This is an automated email sent according to your schedule preferences. If you need to modify or cancel this schedule, please log in to InsightHub.
      </div>
      
      <div class="message">
        If you have any questions or need assistance, please don't hesitate to contact our support team.
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-logo">InsightHub</div>
      <p><strong>Automated Reports Scheduling System</strong></p>
      <p>© ${new Date().getFullYear()} InsightHub. All rights reserved.</p>
      <p style="margin-top: 15px; color: #999;">
        Schedule ID: ${schedule.id} | User: ${schedule.user_id}
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Format file size for display
   * @private
   */
  _formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /**
   * Format schedule info for display
   * @private
   */
  _formatSchedule(schedule) {
    const freq = schedule.schedule_frequency;
    const time = schedule.schedule_time;
    
    let scheduleText = '';
    
    if (freq === 'daily') {
      scheduleText = `Daily at ${time}`;
    } else if (freq === 'weekly') {
      const days = schedule.days ? schedule.days.join(', ') : 'Weekly';
      scheduleText = `Weekly (${days}) at ${time}`;
    } else if (freq === 'monthly') {
      const days = schedule.days ? `Day ${schedule.days.join(', ')}` : 'Monthly';
      scheduleText = `${days} at ${time}`;
    } else {
      scheduleText = 'Custom schedule';
    }
    
    if (schedule.schedule_timezone && schedule.schedule_timezone !== 'UTC') {
      scheduleText += ` (${schedule.schedule_timezone})`;
    }
    
    return scheduleText;
  }

  /**
   * Get content type for file
   * @private
   */
  _getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const types = {
      '.pdf': 'application/pdf',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
      '.html': 'text/html',
      '.csv': 'text/csv'
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Escape HTML special characters
   * @private
   */
  _escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Send test email to verify configuration
   * @param {string} recipient - Recipient email address
   * @returns {Promise<void>}
   */
  async sendTestEmail(recipient) {
    await this.initialize();

    const emailData = {
      subject: 'InsightHub - Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #1976d2;">Email Service Test</h2>
          <p>This is a test email from InsightHub Reports Scheduling System.</p>
          <p>If you received this email, your email configuration is working correctly!</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            Provider: ${this.provider}<br>
            Timestamp: ${new Date().toISOString()}
          </p>
        </div>
      `,
      attachments: []
    };

    if (this.provider === 'sendgrid') {
      await this._sendWithSendGrid(recipient, emailData);
    } else {
      await this._sendWithSMTP(recipient, emailData);
    }

    logger.info('Test email sent', { recipient, provider: this.provider });
  }

  /**
   * Check if email service is configured
   * @returns {boolean}
   */
  isConfigured() {
    if (this.provider === 'sendgrid') {
      return Boolean(CONFIG.scheduling.email.sendgrid.apiKey);
    } else {
      return Boolean(
        CONFIG.scheduling.email.smtp.host &&
        CONFIG.scheduling.email.smtp.user &&
        CONFIG.scheduling.email.smtp.auth.pass
      );
    }
  }
}

export default new EmailService();
