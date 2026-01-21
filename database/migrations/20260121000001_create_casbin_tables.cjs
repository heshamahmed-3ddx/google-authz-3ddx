/**
 * @file 20260121000001_create_casbin_tables.js
 * @description Migration to create Casbin RBAC database tables
 * @author 3D Diagnostix Development Team
 * @created 2026-01-21
 * @version 1.0.0
 */

/**
 * Apply migration - Create casbin_rule and casbin_users tables
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.up = async function(knex) {
  // Create casbin_rule table
  const casbinRuleExists = await knex.schema.hasTable('casbin_rule');
  if (!casbinRuleExists) {
    await knex.schema.createTable('casbin_rule', (table) => {
    table.increments('id').primary().comment('Unique rule identifier');
    table.string('ptype', 10).notNullable().comment('Policy type: p (policy) or g (grouping/role assignment)');
    table.string('v0', 255).comment('Subject (user email or role/group name)');
    table.string('v1', 255).comment('Object (resource) for policies, or role/group name for groupings');
    table.string('v2', 255).comment('Action (read, write, delete, etc.) for policies');
    table.string('v3', 255).comment('Extra field 1 (reserved for future use)');
    table.string('v4', 255).comment('Extra field 2 (reserved for future use)');
    table.string('v5', 255).comment('Extra field 3 (reserved for future use)');
    table.timestamp('created_at').defaultTo(knex.fn.now()).comment('Record creation timestamp');
    table.timestamp('updated_at').defaultTo(knex.fn.now()).comment('Last update timestamp');

    // Indexes for query performance
    table.index('ptype', 'idx_ptype');
    table.index(['v0'], 'idx_v0');
    table.index(['v0', 'v1'], 'idx_v0_v1');
    table.index(['ptype', 'v0'], 'idx_ptype_v0');
    table.index(['ptype', 'v0', 'v1'], 'idx_ptype_v0_v1');

    // Unique constraint to prevent duplicate policies
    table.unique(['ptype', 'v0', 'v1', 'v2', 'v3', 'v4', 'v5'], 'uk_rule');

    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');
    table.comment('Casbin policy rules and role/group assignments for RBAC');
  });
  } else {
    console.log('   ⚠️  casbin_rule table already exists, skipping');
  }

  // Create casbin_users table
  const casbinUsersExists = await knex.schema.hasTable('casbin_users');
  if (!casbinUsersExists) {
    await knex.schema.createTable('casbin_users', (table) => {
    table.increments('id').primary().comment('Unique user identifier');
    table.string('email', 255).notNullable().unique().comment('User email address (primary identifier)');
    table.string('full_name', 255).comment('User full name');
    table.text('groups').comment('Array of group names the user belongs to (stored as JSON string)');
    table.text('roles').comment('Array of role names assigned to the user (stored as JSON string)');
    table.string('org_unit', 255).comment('Organizational unit from Google Workspace');
    table.string('department', 255).comment('Department name');
    table.boolean('two_step_enabled').defaultTo(false).comment('Two-factor authentication status');
    table.text('google_raw').comment('Raw Google user data (optional, stored as JSON string)');
    table.timestamp('created_at').defaultTo(knex.fn.now()).comment('Record creation timestamp');
    table.timestamp('updated_at').defaultTo(knex.fn.now()).comment('Last update timestamp');

    // Indexes for query performance
    table.index('email', 'idx_email');
    table.index('department', 'idx_department');
    table.index('org_unit', 'idx_org_unit');

    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');
    table.comment('User information and metadata for Casbin RBAC system');
  });
    console.log('✅ Created casbin_users table');
  } else {
    console.log('   ⚠️  casbin_users table already exists, skipping');
  }

  console.log('✅ Casbin tables migration completed');
}

/**
 * Rollback migration - Drop casbin tables
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('casbin_users');
  await knex.schema.dropTableIfExists('casbin_rule');
  console.log('✅ Dropped casbin_rule and casbin_users tables');
}
