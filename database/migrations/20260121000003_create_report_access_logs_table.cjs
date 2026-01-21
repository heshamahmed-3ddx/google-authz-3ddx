/**
 * @file 20260121000003_create_report_access_logs_table.js
 * @description Migration to create report_access_logs table for audit trails
 * @author 3D Diagnostix Development Team
 * @created 2026-01-21
 * @version 1.0.0
 */

/**
 * Apply migration - Create report_access_logs table
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.up = async function(knex) {
  const tableExists = await knex.schema.hasTable('report_access_logs');
  
  if (!tableExists) {
    await knex.schema.createTable('report_access_logs', (table) => {
    table.increments('id').primary().comment('Unique log entry ID');
    table.string('report_id', 100).notNullable().comment('Report identifier (e.g., surgical_guide)');
    table.string('report_name', 255).notNullable().comment('Human-readable report name');
    table.string('requester_email', 255).notNullable().comment('Email of user requesting report');
    table.string('requester_username', 255).comment('Username of requester');
    table.enum('access_type', ['manual', 'scheduled', 'export', 'api']).notNullable().defaultTo('manual').comment('Type of access');
    table.string('request_method', 10).comment('HTTP method (GET, POST, etc.)');
    table.string('request_path', 500).comment('API endpoint path');
    table.json('query_parameters').comment('Request query parameters');
    table.timestamp('access_time').defaultTo(knex.fn.now()).comment('Timestamp of access');
    table.integer('request_duration_ms').comment('Request duration in milliseconds');
    table.integer('response_status').comment('HTTP response status code');
    table.integer('records_returned').comment('Number of records returned');
    table.string('ip_address', 45).comment('Client IP address');
    table.text('user_agent').comment('User agent string');
    table.text('error_message').comment('Error message if request failed');
    table.json('metadata').comment('Additional metadata (filters, date ranges, etc.)');

    // Indexes for query performance
    table.index('report_id', 'idx_report_id');
    table.index('requester_email', 'idx_requester_email');
    table.index('access_time', 'idx_access_time');
    table.index('access_type', 'idx_access_type');
    table.index(['report_id', 'access_time'], 'idx_report_access_time');

    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');
    table.comment('Comprehensive audit log for report access events');
  });

  console.log('✅ Created report_access_logs table');
  } else {
    console.log('   ⚠️  report_access_logs table already exists, skipping');
  }
};

/**
 * Rollback migration - Drop report_access_logs table
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('report_access_logs');
  console.log('✅ Dropped report_access_logs table');
};
