-- ========================================
-- Casbin RBAC Database Schema (Alternative - No Unique Constraint)
-- ========================================
-- Use this if the unique constraint causes issues
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
  INDEX idx_ptype_v0_v1 (ptype, v0(100), v1(100))
  -- Note: No unique constraint - application should handle duplicates
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Casbin policy rules and role/group assignments for RBAC';

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

