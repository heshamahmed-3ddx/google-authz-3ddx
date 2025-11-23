-- ========================================
-- Casbin RBAC Database Schema
-- ========================================
-- This script creates the required tables for Casbin policy-based access control
-- Run this on the same database as surgical_guides (PowerBI CP test database)
--
-- Author: 3D Diagnostix Development Team
-- Created: 2025-01-XX
-- Version: 1.0.0
-- ========================================

-- ========================================
-- Table: casbin_rule
-- ========================================
-- Stores Casbin policy rules (p) and role/group assignments (g)
-- This table follows the standard Casbin adapter format
-- ========================================

CREATE TABLE IF NOT EXISTS casbin_rule (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique rule identifier',
  ptype VARCHAR(10) NOT NULL COMMENT 'Policy type: p (policy) or g (grouping/role assignment)',
  v0 VARCHAR(255) COMMENT 'Subject (user email or role/group name)',
  v1 VARCHAR(255) COMMENT 'Object (resource) for policies, or role/group name for groupings',
  v2 VARCHAR(255) COMMENT 'Action (read, write, delete, etc.) for policies',
  v3 VARCHAR(255) COMMENT 'Extra field 1 (reserved for future use)',
  v4 VARCHAR(255) COMMENT 'Extra field 2 (reserved for future use)',
  v5 VARCHAR(255) COMMENT 'Extra field 3 (reserved for future use)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  -- Indexes for query performance
  INDEX idx_ptype (ptype),
  INDEX idx_v0 (v0(100)),
  INDEX idx_v0_v1 (v0(100), v1(100)),
  INDEX idx_ptype_v0 (ptype, v0(100)),
  INDEX idx_ptype_v0_v1 (ptype, v0(100), v1(100)),
  
  -- Unique constraint to prevent duplicate policies
  -- Using prefix indexes to avoid key length limit (max 3072 bytes)
  UNIQUE KEY uk_rule (ptype, v0(100), v1(100), v2(100), v3(100), v4(100), v5(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Casbin policy rules and role/group assignments for RBAC';

-- ========================================
-- Table: casbin_users
-- ========================================
-- Stores user information and metadata
-- This is optional but recommended for better user management
-- ========================================

CREATE TABLE IF NOT EXISTS casbin_users (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique user identifier',
  email VARCHAR(255) UNIQUE NOT NULL COMMENT 'User email address (primary identifier)',
  full_name VARCHAR(255) COMMENT 'User full name',
  `groups` TEXT COMMENT 'Array of group names the user belongs to (stored as JSON string)',
  roles TEXT COMMENT 'Array of role names assigned to the user (stored as JSON string)',
  org_unit VARCHAR(255) COMMENT 'Organizational unit from Google Workspace',
  department VARCHAR(255) COMMENT 'Department name',
  two_step_enabled BOOLEAN DEFAULT FALSE COMMENT 'Two-factor authentication status',
  google_raw TEXT COMMENT 'Raw Google user data (optional, stored as JSON string)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  -- Indexes for query performance
  INDEX idx_email (email),
  INDEX idx_department (department),
  INDEX idx_org_unit (org_unit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User information and metadata for Casbin RBAC system';

-- ========================================
-- Verification Queries
-- ========================================

-- Check table structures
DESCRIBE casbin_rule;
DESCRIBE casbin_users;

-- Verify tables were created
SHOW TABLES LIKE 'casbin_%';

-- Check indexes
SHOW INDEX FROM casbin_rule;
SHOW INDEX FROM casbin_users;

-- ========================================
-- Notes
-- ========================================
-- 1. casbin_rule table follows standard Casbin adapter format
-- 2. ptype='p' for policy rules (subject, object, action)
-- 3. ptype='g' for role/group assignments (user, role/group)
-- 4. v0, v1, v2, etc. are flexible fields that map to Casbin model
-- 5. Unique constraint prevents duplicate policies
-- 6. TEXT columns in casbin_users store JSON strings for flexible group/role storage (compatible with older MySQL versions)
-- 7. UTF8MB4 charset for international character support
-- 8. InnoDB engine for transaction support
-- ========================================

