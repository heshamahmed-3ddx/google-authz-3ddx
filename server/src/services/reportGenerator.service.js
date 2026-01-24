/**
 * @file reportGenerator.service.js
 * @description Generate reports in various formats (PDF, Excel, HTML)
 * @author InsightHub Development Team
 * @created 2026-01-24
 * @version 1.0.0
 * @copyright 2026 InsightHub. All rights reserved.
 */

import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import path from 'path';
import { CONFIG } from '../config/config.js';
import surgicalGuideOrdersService from './surgicalGuideOrders.service.js';
import { createContextLogger } from './logger.js';

const logger = createContextLogger('reportGenerator.service.js');

/**
 * Report Generator Service
 * Generates reports in PDF, Excel, or HTML formats
 */
class ReportGeneratorService {
  constructor() {
    this.tempDir = CONFIG.scheduling.reportGeneration.tempDir;
    this.ensureTempDir();
  }

  /**
   * Ensure temp directory exists
   * @private
   */
  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      logger.info('Temp directory ready', { tempDir: this.tempDir });
    } catch (error) {
      logger.error('Failed to create temp directory', { 
        error: error.message,
        tempDir: this.tempDir
      });
    }
  }

  /**
   * Generate report based on schedule configuration
   * @param {Object} schedule - Schedule configuration
   * @returns {Promise<Object>} Generated report info
   */
  async generateReport(schedule) {
    logger.info('Generating report', { 
      scheduleId: schedule.id,
      format: schedule.format,
      reportType: schedule.report_type
    });

    const startTime = Date.now();
    
    try {
      // Ensure temp directory exists
      await this.ensureTempDir();

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
        records: reportData.data?.length || 0
      });
      
      return {
        filePath,
        fileSize,
        recordsCount: reportData.data?.length || 0,
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
   * Fetch report data based on schedule filters
   * @private
   * @param {Object} schedule - Schedule configuration
   * @returns {Promise<Object>} Report data
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
   * @private
   * @param {Object} schedule - Schedule configuration
   * @param {Object} reportData - Report data
   * @returns {Promise<string>} File path
   */
  async _generatePDF(schedule, reportData) {
    const html = this._generateHTMLContent(schedule, reportData);
    const fileName = `${schedule.report_type}_${schedule.id}_${Date.now()}.pdf`;
    const filePath = path.join(this.tempDir, fileName);
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
      
      await page.pdf({
        path: filePath,
        format: CONFIG.scheduling.pdf.format,
        printBackground: CONFIG.scheduling.pdf.printBackground,
        margin: CONFIG.scheduling.pdf.margin
      });
      
      logger.info('PDF generated', { filePath, scheduleId: schedule.id });
      return filePath;
    } catch (error) {
      logger.error('PDF generation failed', {
        error: error.message,
        scheduleId: schedule.id
      });
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate Excel using ExcelJS
   * @private
   * @param {Object} schedule - Schedule configuration
   * @param {Object} reportData - Report data
   * @returns {Promise<string>} File path
   */
  async _generateExcel(schedule, reportData) {
    const fileName = `${schedule.report_type}_${schedule.id}_${Date.now()}.xlsx`;
    const filePath = path.join(this.tempDir, fileName);
    
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'InsightHub';
      workbook.created = new Date();
      
      const worksheet = workbook.addWorksheet(CONFIG.scheduling.excel.sheetName);
      
      // Add report metadata as first rows
      worksheet.addRow(['Report Name:', schedule.report_name]);
      worksheet.addRow(['Generated:', new Date().toLocaleString()]);
      worksheet.addRow(['Schedule ID:', schedule.id]);
      
      if (reportData.summary) {
        worksheet.addRow(['Total Orders:', reportData.summary.totalOrders || 0]);
        worksheet.addRow(['Total Cost:', `$${(reportData.summary.totalCost || 0).toLocaleString()}`]);
        worksheet.addRow(['Average Cost:', `$${(reportData.summary.avgCost || 0).toLocaleString()}`]);
      }
      
      worksheet.addRow([]); // Empty row
      
      // Add data table
      if (reportData.data && reportData.data.length > 0) {
        const headers = Object.keys(reportData.data[0]);
        const headerRow = worksheet.addRow(headers.map(h => this._formatHeader(h)));
        
        // Style header row
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1976D2' }
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        
        // Add data rows
        reportData.data.forEach(row => {
          const values = Object.values(row).map(val => this._formatExcelValue(val));
          worksheet.addRow(values);
        });
        
        // Auto-fit columns
        worksheet.columns.forEach((column, index) => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, cell => {
            const length = cell.value ? cell.value.toString().length : 10;
            if (length > maxLength) maxLength = length;
          });
          column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });
        
        // Add auto-filter
        if (CONFIG.scheduling.excel.autoFilter) {
          const headerRowNumber = worksheet.rowCount - reportData.data.length;
          worksheet.autoFilter = {
            from: { row: headerRowNumber, column: 1 },
            to: { row: headerRowNumber, column: headers.length }
          };
        }
        
        // Freeze header row
        if (CONFIG.scheduling.excel.freeze) {
          worksheet.views = [{
            state: 'frozen',
            xSplit: CONFIG.scheduling.excel.freeze.column,
            ySplit: worksheet.rowCount - reportData.data.length,
            topLeftCell: 'A' + (worksheet.rowCount - reportData.data.length + 1)
          }];
        }
      }
      
      await workbook.xlsx.writeFile(filePath);
      logger.info('Excel generated', { filePath, scheduleId: schedule.id });
      
      return filePath;
    } catch (error) {
      logger.error('Excel generation failed', {
        error: error.message,
        scheduleId: schedule.id
      });
      throw error;
    }
  }

  /**
   * Generate HTML report
   * @private
   * @param {Object} schedule - Schedule configuration
   * @param {Object} reportData - Report data
   * @returns {Promise<string>} File path
   */
  async _generateHTML(schedule, reportData) {
    const html = this._generateHTMLContent(schedule, reportData);
    const fileName = `${schedule.report_type}_${schedule.id}_${Date.now()}.html`;
    const filePath = path.join(this.tempDir, fileName);
    
    try {
      await fs.writeFile(filePath, html, 'utf8');
      logger.info('HTML generated', { filePath, scheduleId: schedule.id });
      
      return filePath;
    } catch (error) {
      logger.error('HTML generation failed', {
        error: error.message,
        scheduleId: schedule.id
      });
      throw error;
    }
  }

  /**
   * Generate HTML content for report
   * @private
   * @param {Object} schedule - Schedule configuration
   * @param {Object} reportData - Report data
   * @returns {string} HTML content
   */
  _generateHTMLContent(schedule, reportData) {
    const { data = [], summary } = reportData;
    const generatedDate = new Date().toLocaleString();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${schedule.report_name} - ${generatedDate}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #1976d2;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #1976d2;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
    }
    .metadata {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 6px;
    }
    .metadata-item {
      display: flex;
      flex-direction: column;
    }
    .metadata-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .metadata-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary-card {
      padding: 25px;
      border-radius: 8px;
      border-left: 4px solid;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .summary-card.total { 
      border-color: #1976d2; 
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    }
    .summary-card.cost { 
      border-color: #4caf50; 
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    }
    .summary-card.avg { 
      border-color: #ff9800; 
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    }
    .summary-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-value {
      font-size: 36px;
      font-weight: bold;
      color: #333;
    }
    .table-container {
      overflow-x: auto;
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    thead {
      background: #1976d2;
      color: white;
    }
    th {
      padding: 15px 12px;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    tbody tr:hover {
      background: #f5f5f5;
    }
    tbody tr:nth-child(even) {
      background: #fafafa;
    }
    tbody tr:nth-child(even):hover {
      background: #f0f0f0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .footer-logo {
      font-size: 16px;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 10px;
    }
    .no-data {
      text-align: center;
      padding: 60px 20px;
      color: #999;
      font-size: 16px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${this._escapeHtml(schedule.report_name)}</h1>
      <div class="subtitle">Automated Report - Generated on ${generatedDate}</div>
    </div>
    
    <div class="metadata">
      <div class="metadata-item">
        <div class="metadata-label">Schedule ID</div>
        <div class="metadata-value">#${schedule.id}</div>
      </div>
      <div class="metadata-item">
        <div class="metadata-label">Report Type</div>
        <div class="metadata-value">${this._formatReportType(schedule.report_type)}</div>
      </div>
      <div class="metadata-item">
        <div class="metadata-label">Format</div>
        <div class="metadata-value">${schedule.format.toUpperCase()}</div>
      </div>
      <div class="metadata-item">
        <div class="metadata-label">Frequency</div>
        <div class="metadata-value">${this._formatFrequency(schedule.schedule_frequency)}</div>
      </div>
      <div class="metadata-item">
        <div class="metadata-label">Total Records</div>
        <div class="metadata-value">${data.length.toLocaleString()}</div>
      </div>
    </div>
    
    ${summary ? `
    <div class="summary">
      <div class="summary-card total">
        <div class="summary-label">Total Orders</div>
        <div class="summary-value">${(summary.totalOrders || 0).toLocaleString()}</div>
      </div>
      <div class="summary-card cost">
        <div class="summary-label">Total Cost</div>
        <div class="summary-value">$${(summary.totalCost || 0).toLocaleString()}</div>
      </div>
      <div class="summary-card avg">
        <div class="summary-label">Average Cost</div>
        <div class="summary-value">$${(summary.avgCost || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      </div>
    </div>
    ` : ''}
    
    ${data.length > 0 ? `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            ${Object.keys(data[0]).map(key => `<th>${this._formatHeader(key)}</th>`).join('')}
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
    </div>
    ` : '<div class="no-data">No data available for the selected criteria.</div>'}
    
    <div class="footer">
      <div class="footer-logo">InsightHub</div>
      <p>This report was automatically generated by InsightHub Reports Scheduling System</p>
      <p>Schedule ID: ${schedule.id} | Format: ${schedule.format.toUpperCase()} | Records: ${data.length} | Generated: ${generatedDate}</p>
      <p style="margin-top: 10px; font-size: 11px;">&copy; ${new Date().getFullYear()} InsightHub. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Format header text
   * @private
   */
  _formatHeader(key) {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  /**
   * Format cell value for display
   * @private
   */
  _formatValue(value) {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return this._escapeHtml(value.toString());
  }

  /**
   * Format value for Excel
   * @private
   */
  _formatExcelValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  }

  /**
   * Format report type for display
   * @private
   */
  _formatReportType(type) {
    const types = {
      'surgical_guide': 'Surgical Guide Orders',
      'powerbi': 'PowerBI Dashboard',
      'grafana': 'Grafana Monitoring'
    };
    return types[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format frequency for display
   * @private
   */
  _formatFrequency(frequency) {
    const frequencies = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'custom': 'Custom'
    };
    return frequencies[frequency] || frequency;
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
   * Get default start date (1 month ago)
   * @private
   */
  _getDefaultStartDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get default end date (today)
   * @private
   */
  _getDefaultEndDate() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Clean up old temporary files
   * @returns {Promise<number>} Number of files deleted
   */
  async cleanupOldFiles() {
    const retentionMs = CONFIG.scheduling.reportGeneration.retentionHours * 60 * 60 * 1000;
    const now = Date.now();
    let deletedCount = 0;
    
    try {
      const files = await fs.readdir(this.tempDir);
      
      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        try {
          const stats = await fs.stat(filePath);
          
          if (now - stats.mtimeMs > retentionMs) {
            await fs.unlink(filePath);
            deletedCount++;
            logger.info('Cleaned up old report file', { file });
          }
        } catch (error) {
          // Skip files that can't be accessed
          logger.warn('Could not process file for cleanup', { 
            file,
            error: error.message
          });
        }
      }
      
      logger.info('Cleanup completed', { deletedCount, retentionHours: CONFIG.scheduling.reportGeneration.retentionHours });
      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old files', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete a specific report file
   * @param {string} filePath - File path to delete
   * @returns {Promise<void>}
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      logger.info('Report file deleted', { filePath });
    } catch (error) {
      logger.warn('Failed to delete report file', {
        filePath,
        error: error.message
      });
    }
  }
}

export default new ReportGeneratorService();
