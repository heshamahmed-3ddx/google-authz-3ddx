-- ========================================
-- Report Access Logs Table
-- ========================================
-- Stores detailed logs for all report access events
-- Required for troubleshooting and audit trails
-- 
-- Author: InsightHub Development Team
-- Created: 2025-01-XX
-- Version: 1.0.0
-- ========================================

CREATE TABLE IF NOT EXISTS report_access_logs (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique log entry ID',
  report_id VARCHAR(100) NOT NULL COMMENT 'Report identifier (e.g., surgical_guide)',
  report_name VARCHAR(255) NOT NULL COMMENT 'Human-readable report name',
  requester_email VARCHAR(255) NOT NULL COMMENT 'Email of user requesting report',
  requester_username VARCHAR(255) COMMENT 'Username of requester',
  access_type ENUM('manual', 'scheduled', 'export', 'api') NOT NULL DEFAULT 'manual' COMMENT 'Type of access',
  request_method VARCHAR(10) COMMENT 'HTTP method (GET, POST, etc.)',
  request_path VARCHAR(500) COMMENT 'API endpoint path',
  query_parameters JSON COMMENT 'Request query parameters',
  access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp of access',
  request_duration_ms INT COMMENT 'Request duration in milliseconds',
  response_status INT COMMENT 'HTTP response status code',
  records_returned INT COMMENT 'Number of records returned',
  ip_address VARCHAR(45) COMMENT 'Client IP address',
  user_agent TEXT COMMENT 'User agent string',
  error_message TEXT COMMENT 'Error message if request failed',
  metadata JSON COMMENT 'Additional metadata (filters, date ranges, etc.)',
  
  INDEX idx_report_id (report_id),
  INDEX idx_requester_email (requester_email),
  INDEX idx_access_time (access_time),
  INDEX idx_access_type (access_type),
  INDEX idx_report_access_time (report_id, access_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Comprehensive audit log for report access events';

-- ========================================
-- Example Queries
-- ========================================

-- Get all access logs for a specific report
-- SELECT * FROM report_access_logs WHERE report_id = 'surgical_guide' ORDER BY access_time DESC LIMIT 100;

-- Get access logs for a specific user
-- SELECT * FROM report_access_logs WHERE requester_email = 'user@example.com' ORDER BY access_time DESC;

-- Get failed report access attempts
-- SELECT * FROM report_access_logs WHERE response_status >= 400 ORDER BY access_time DESC;

-- Get report access statistics by type
-- SELECT access_type, COUNT(*) as count, AVG(request_duration_ms) as avg_duration 
-- FROM report_access_logs 
-- WHERE access_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
-- GROUP BY access_type;

