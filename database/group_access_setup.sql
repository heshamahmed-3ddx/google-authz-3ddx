-- ========================================
-- Group-Based Access Control Setup
-- ========================================
-- This script sets up group-based access control using the existing casbin_rule table.
-- No new tables needed!
--
-- Super Admin: Members of the "SWD" Google Workspace group
-- Allowed Groups: Stored as policies in casbin_rule
--
-- Author: 3D Diagnostix Development Team
-- Created: 2026-01-11
-- ========================================

-- ========================================
-- Add Initial Allowed Groups
-- ========================================
-- Add the Google Workspace groups that should have access to the application
-- Replace these with your actual Google group names

-- Example: Add Finance group
-- INSERT INTO casbin_rule (ptype, v0, v1, v2)
-- VALUES ('p', 'allowed_group', 'Finance', 'access');

-- Example: Add Engineering group
-- INSERT INTO casbin_rule (ptype, v0, v1, v2)
-- VALUES ('p', 'allowed_group', 'Engineering', 'access');

-- Example: Add Management group
-- INSERT INTO casbin_rule (ptype, v0, v1, v2)
-- VALUES ('p', 'allowed_group', 'Management', 'access');

-- ========================================
-- Verify Setup
-- ========================================

-- Check allowed groups
SELECT v1 as group_name, created_at
FROM casbin_rule
WHERE ptype = 'p' AND v0 = 'allowed_group' AND v2 = 'access';

-- ========================================
-- Notes
-- ========================================
-- 1. Super Admin: Any user in the "SWD" Google Workspace group
--    - No database configuration needed
--    - Automatically checked during login
--    - Super admins always have access (bypass group check)
--
-- 2. Allowed group format: p, allowed_group, <group_name>, access
-- 3. Only users in allowed groups can access the application
-- 4. Group names must match exactly what Google Directory API returns
-- 5. You can also manage groups through the admin API after setup
-- ========================================
