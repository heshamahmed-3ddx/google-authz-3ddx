-- ========================================
-- Surgical Guide Report Database Schema
-- ========================================
-- This script creates the required table for the Surgical Guide Report feature
-- Run this on the PowerBI CP test database (MySQL)
--
-- Author: 3D Diagnostix Development Team
-- Created: 2025-10-27
-- Version: 1.0.0
-- ========================================

-- Drop table if exists (use with caution in production!)
-- DROP TABLE IF EXISTS surgical_guides;

-- Create surgical_guides table
CREATE TABLE IF NOT EXISTS surgical_guides (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique case identifier',
  case_number VARCHAR(50) NOT NULL COMMENT 'Human-readable case number (e.g., SG-2024-001)',
  date DATE NOT NULL COMMENT 'Date of the surgical guide case',
  doctor_name VARCHAR(255) NOT NULL COMMENT 'Full name of the doctor',
  patient_name VARCHAR(255) NOT NULL COMMENT 'Patient full name',
  cost DECIMAL(10, 2) NOT NULL COMMENT 'Total cost in USD',
  procedure_type VARCHAR(100) COMMENT 'Type of procedure (Full Arch, Implant Guide, etc.)',
  status VARCHAR(50) COMMENT 'Case status (Completed, In Progress, Pending, Cancelled)',
  notes TEXT COMMENT 'Additional notes or comments',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  -- Indexes for query performance
  INDEX idx_date (date),
  INDEX idx_doctor (doctor_name),
  INDEX idx_status (status),
  INDEX idx_case_number (case_number),
  
  -- Constraints
  CONSTRAINT chk_cost_positive CHECK (cost >= 0),
  CONSTRAINT chk_status_valid CHECK (status IN ('Completed', 'In Progress', 'Pending', 'Cancelled', NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Surgical guide cases for financial reporting and analytics';

-- ========================================
-- Sample Data for Testing
-- ========================================

INSERT INTO surgical_guides (case_number, date, doctor_name, patient_name, cost, procedure_type, status) VALUES
-- January 2024
('SG-2024-001', '2024-01-05', 'Dr. John Smith', 'Jane Doe', 1500.00, 'Full Arch', 'Completed'),
('SG-2024-002', '2024-01-10', 'Dr. Sarah Johnson', 'Bob Wilson', 2000.00, 'Implant Guide', 'Completed'),
('SG-2024-003', '2024-01-15', 'Dr. John Smith', 'Alice Brown', 1800.00, 'Partial Guide', 'Completed'),
('SG-2024-004', '2024-01-20', 'Dr. Michael Lee', 'Charlie Davis', 1650.00, 'Full Arch', 'Completed'),
('SG-2024-005', '2024-01-25', 'Dr. Emily Chen', 'Diana Martinez', 2200.00, 'Full Arch', 'Completed'),

-- February 2024
('SG-2024-006', '2024-02-01', 'Dr. Sarah Johnson', 'Edward Thompson', 1900.00, 'Implant Guide', 'Completed'),
('SG-2024-007', '2024-02-05', 'Dr. John Smith', 'Fiona Garcia', 1700.00, 'Partial Guide', 'Completed'),
('SG-2024-008', '2024-02-10', 'Dr. Michael Lee', 'George Rodriguez', 1550.00, 'Implant Guide', 'Completed'),
('SG-2024-009', '2024-02-15', 'Dr. Emily Chen', 'Helen White', 2100.00, 'Full Arch', 'Completed'),
('SG-2024-010', '2024-02-20', 'Dr. David Park', 'Ian Anderson', 1850.00, 'Full Arch', 'Completed'),

-- March 2024
('SG-2024-011', '2024-03-01', 'Dr. John Smith', 'Julia Martin', 1600.00, 'Partial Guide', 'Completed'),
('SG-2024-012', '2024-03-05', 'Dr. Sarah Johnson', 'Kevin Brown', 1950.00, 'Implant Guide', 'Completed'),
('SG-2024-013', '2024-03-10', 'Dr. Michael Lee', 'Laura Davis', 1750.00, 'Full Arch', 'Completed'),
('SG-2024-014', '2024-03-15', 'Dr. Emily Chen', 'Mark Wilson', 2050.00, 'Full Arch', 'Completed'),
('SG-2024-015', '2024-03-20', 'Dr. David Park', 'Nancy Garcia', 1800.00, 'Implant Guide', 'Completed'),

-- April 2024 (mix of statuses)
('SG-2024-016', '2024-04-01', 'Dr. John Smith', 'Oliver Thompson', 1650.00, 'Partial Guide', 'Completed'),
('SG-2024-017', '2024-04-05', 'Dr. Sarah Johnson', 'Patricia Lee', 1900.00, 'Implant Guide', 'Completed'),
('SG-2024-018', '2024-04-10', 'Dr. Michael Lee', 'Quinn Martinez', 1700.00, 'Full Arch', 'In Progress'),
('SG-2024-019', '2024-04-15', 'Dr. Emily Chen', 'Rachel White', 2150.00, 'Full Arch', 'Pending'),
('SG-2024-020', '2024-04-20', 'Dr. David Park', 'Samuel Anderson', 1850.00, 'Implant Guide', 'In Progress'),

-- May 2024
('SG-2024-021', '2024-05-01', 'Dr. John Smith', 'Teresa Brown', 1700.00, 'Partial Guide', 'Completed'),
('SG-2024-022', '2024-05-05', 'Dr. Sarah Johnson', 'Ursula Davis', 2000.00, 'Implant Guide', 'Completed'),
('SG-2024-023', '2024-05-10', 'Dr. Michael Lee', 'Victor Wilson', 1800.00, 'Full Arch', 'Completed'),
('SG-2024-024', '2024-05-15', 'Dr. Emily Chen', 'Wendy Garcia', 2100.00, 'Full Arch', 'Completed'),
('SG-2024-025', '2024-05-20', 'Dr. David Park', 'Xavier Rodriguez', 1950.00, 'Implant Guide', 'Completed'),

-- Recent cases (June 2024)
('SG-2024-026', '2024-06-01', 'Dr. John Smith', 'Yolanda Martinez', 1650.00, 'Partial Guide', 'Completed'),
('SG-2024-027', '2024-06-05', 'Dr. Sarah Johnson', 'Zachary Lee', 1900.00, 'Implant Guide', 'Completed'),
('SG-2024-028', '2024-06-10', 'Dr. Michael Lee', 'Amy Thompson', 1750.00, 'Full Arch', 'Completed'),
('SG-2024-029', '2024-06-15', 'Dr. Emily Chen', 'Brian Wilson', 2200.00, 'Full Arch', 'In Progress'),
('SG-2024-030', '2024-06-20', 'Dr. David Park', 'Catherine Davis', 1850.00, 'Implant Guide', 'Pending');

-- ========================================
-- Verification Queries
-- ========================================

-- Check table structure
DESCRIBE surgical_guides;

-- Verify data insertion
SELECT COUNT(*) as total_records FROM surgical_guides;

-- Check date range
SELECT 
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  COUNT(*) as total_cases
FROM surgical_guides;

-- Doctor summary
SELECT 
  doctor_name,
  COUNT(*) as case_count,
  SUM(cost) as total_cost,
  AVG(cost) as average_cost
FROM surgical_guides
GROUP BY doctor_name
ORDER BY total_cost DESC;

-- Status breakdown
SELECT 
  status,
  COUNT(*) as count,
  SUM(cost) as total_cost
FROM surgical_guides
GROUP BY status;

-- ========================================
-- Performance Testing
-- ========================================

-- Test query performance (should use idx_date index)
EXPLAIN SELECT * FROM surgical_guides 
WHERE date >= '2024-01-01' AND date <= '2024-12-31'
ORDER BY date DESC
LIMIT 50;

-- Test doctor filter (should use idx_doctor index)
EXPLAIN SELECT * FROM surgical_guides 
WHERE doctor_name = 'Dr. John Smith'
AND date >= '2024-01-01';

-- ========================================
-- Maintenance Queries
-- ========================================

-- Analyze table for query optimization
ANALYZE TABLE surgical_guides;

-- Check table statistics
SHOW TABLE STATUS LIKE 'surgical_guides';

-- Check index usage
SHOW INDEX FROM surgical_guides;

-- ========================================
-- Cleanup (if needed)
-- ========================================

-- Remove sample data (use with caution!)
-- DELETE FROM surgical_guides WHERE case_number LIKE 'SG-2024-%';

-- Drop table (use with extreme caution!)
-- DROP TABLE IF EXISTS surgical_guides;

-- ========================================
-- Notes
-- ========================================
-- 1. Indexes are created for common query patterns
-- 2. Sample data covers 6 months with 30 records
-- 3. Multiple doctors for realistic breakdowns
-- 4. Mix of statuses for testing filters
-- 5. Costs range from $1,500 to $2,200
-- 6. UTF8MB4 charset for international character support
-- 7. InnoDB engine for transaction support and foreign keys (if needed)
-- ========================================
