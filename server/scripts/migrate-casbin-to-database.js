/**
 * @file migrate-casbin-to-database.js
 * @description Migration script to move Casbin policies and users from files to MySQL database
 * @author 3D Diagnostix Development Team
 * @created 2025-01-XX
 * @version 1.0.0
 * 
 * Usage: node server/scripts/migrate-casbin-to-database.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import databaseService from '../src/services/database.js';
import { CONFIG } from '../src/config/config.js';

/**
 * Parse CSV policy file
 */
function parsePolicyFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const policies = [];
  const groupings = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const parts = trimmed.split(',').map(p => p.trim());
    if (parts.length < 2) continue;

    const [ptype, ...values] = parts;

    if (ptype === 'p') {
      // Policy rule: p, subject, object, action
      policies.push({
        ptype: 'p',
        v0: values[0] || null,
        v1: values[1] || null,
        v2: values[2] || null,
        v3: values[3] || null,
        v4: values[4] || null,
        v5: values[5] || null
      });
    } else if (ptype === 'g' || ptype === 'g2') {
      // Grouping rule: g, user, role/group
      groupings.push({
        ptype: ptype,
        v0: values[0] || null,
        v1: values[1] || null,
        v2: values[2] || null,
        v3: values[3] || null,
        v4: values[4] || null,
        v5: values[5] || null
      });
    }
  }

  return { policies, groupings };
}

/**
 * Parse users JSON file
 */
function parseUsersFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Migrate policies to database
 */
async function migratePolicies() {
  console.log('📋 Migrating policies from CSV to database...');

  const policyPath = CONFIG.casbin.policyPath;
  if (!fs.existsSync(policyPath)) {
    throw new Error(`Policy file not found: ${policyPath}`);
  }

  const { policies, groupings } = parsePolicyFile(policyPath);
  const tableName = CONFIG.casbin.tableName || 'casbin_rule';

  console.log(`   Found ${policies.length} policies and ${groupings.length} groupings`);

  // Clear existing data
  await databaseService.query(`DELETE FROM ${tableName}`);
  console.log('   Cleared existing policies from database');

  // Insert policies
  const insertQuery = `
    INSERT INTO ${tableName} (ptype, v0, v1, v2, v3, v4, v5)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  let inserted = 0;
  for (const policy of [...policies, ...groupings]) {
    const values = [
      policy.ptype,
      policy.v0,
      policy.v1,
      policy.v2,
      policy.v3,
      policy.v4,
      policy.v5
    ];
    await databaseService.query(insertQuery, values);
    inserted++;
  }

  console.log(`   ✅ Migrated ${inserted} policies to database`);
  return { policies: policies.length, groupings: groupings.length };
}

/**
 * Migrate users to database (optional)
 */
async function migrateUsers() {
  console.log('👥 Migrating users from JSON to database...');

  const usersPath = CONFIG.casbin.usersPath;
  if (!fs.existsSync(usersPath)) {
    console.log('   ⚠️  Users file not found, skipping user migration');
    return { users: 0 };
  }

  const usersData = parseUsersFile(usersPath);
  const tableName = CONFIG.casbin.usersTableName || 'casbin_users';

  if (!usersData.users || !Array.isArray(usersData.users)) {
    console.log('   ⚠️  No users found in file, skipping user migration');
    return { users: 0 };
  }

  console.log(`   Found ${usersData.users.length} users`);

  const insertQuery = `
    INSERT INTO ${tableName} (email, full_name, \`groups\`, roles, org_unit, department, two_step_enabled, google_raw)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      \`groups\` = VALUES(\`groups\`),
      roles = VALUES(roles),
      org_unit = VALUES(org_unit),
      department = VALUES(department),
      two_step_enabled = VALUES(two_step_enabled),
      google_raw = VALUES(google_raw),
      updated_at = CURRENT_TIMESTAMP
  `;

  let inserted = 0;
  for (const user of usersData.users) {
    const values = [
      user.email,
      user.fullName || user.name || null,
      JSON.stringify(user.groups || []),
      JSON.stringify(user.roles || []),
      user.orgUnit || null,
      user.department || null,
      user.twoStepEnabled || false,
      user.googleRaw ? JSON.stringify(user.googleRaw) : null
    ];
    await databaseService.query(insertQuery, values);
    inserted++;
  }

  console.log(`   ✅ Migrated ${inserted} users to database`);
  return { users: inserted };
}

/**
 * Verify migration
 */
async function verifyMigration() {
  console.log('🔍 Verifying migration...');

  const tableName = CONFIG.casbin.tableName || 'casbin_rule';
  const usersTableName = CONFIG.casbin.usersTableName || 'casbin_users';

  // Count policies
  const [policyCount] = await databaseService.query(
    `SELECT COUNT(*) as count FROM ${tableName} WHERE ptype = 'p'`
  );
  const [groupingCount] = await databaseService.query(
    `SELECT COUNT(*) as count FROM ${tableName} WHERE ptype IN ('g', 'g2')`
  );

  // Count users
  const [userCount] = await databaseService.query(
    `SELECT COUNT(*) as count FROM ${usersTableName}`
  );

  console.log(`   Policies: ${policyCount.count}`);
  console.log(`   Groupings: ${groupingCount.count}`);
  console.log(`   Users: ${userCount.count}`);

  return {
    policies: policyCount.count,
    groupings: groupingCount.count,
    users: userCount.count
  };
}

/**
 * Main migration function
 */
async function main() {
  try {
    console.log('🚀 Starting Casbin migration to database...\n');

    // Initialize database connection
    console.log('📡 Connecting to database...');
    await databaseService.initialize();
    console.log('   ✅ Database connected\n');

    // Check if tables exist
    const tableName = CONFIG.casbin.tableName || 'casbin_rule';
    const usersTableName = CONFIG.casbin.usersTableName || 'casbin_users';

    try {
      await databaseService.query(`SELECT 1 FROM ${tableName} LIMIT 1`);
      console.log(`   ✅ Table ${tableName} exists`);
    } catch (error) {
      console.error(`   ❌ Table ${tableName} does not exist!`);
      console.error('   Please run the SQL schema file first: database/casbin_schema.sql');
      process.exit(1);
    }

    try {
      await databaseService.query(`SELECT 1 FROM ${usersTableName} LIMIT 1`);
      console.log(`   ✅ Table ${usersTableName} exists\n`);
    } catch (error) {
      console.log(`   ⚠️  Table ${usersTableName} does not exist (optional, skipping user migration)\n`);
    }

    // Migrate policies
    const policyStats = await migratePolicies();
    console.log('');

    // Migrate users (optional)
    let userStats = { users: 0 };
    try {
      userStats = await migrateUsers();
    } catch (error) {
      console.log(`   ⚠️  User migration skipped: ${error.message}`);
    }
    console.log('');

    // Verify migration
    const verification = await verifyMigration();
    console.log('');

    // Summary
    console.log('📊 Migration Summary:');
    console.log(`   Policies migrated: ${policyStats.policies}`);
    console.log(`   Groupings migrated: ${policyStats.groupings}`);
    console.log(`   Users migrated: ${userStats.users}`);
    console.log('');
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('⚠️  Next steps:');
    console.log('   1. Update CONFIG.storage.type to "database" in config.js');
    console.log('   2. Restart the server');
    console.log('   3. Test authorization to ensure everything works');
    console.log('   4. Keep the original files as backup');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await databaseService.close();
  }
}

// Run migration
main();

