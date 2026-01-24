/**
 * @file 20260124000001_create_report_scheduling_tables.cjs
 * @description Creates tables for report scheduling system
 * @author InsightHub Development Team
 * @created 2026-01-24
 */

/**
 * Create report scheduling tables
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.up = async function(knex) {
  console.log('Creating report_schedules table...');
  
  // Create report_schedules table
  await knex.schema.createTable('report_schedules', (table) => {
    // Primary key
    table.increments('id').primary();
    
    // User & Report identification
    table.string('user_id', 255).notNullable().comment('Email of user who created the schedule');
    table.string('user_name', 255).nullable().comment('Full name of user');
    table.string('report_type', 100).notNullable().comment('Type of report (surgical_guide, powerbi, etc)');
    table.string('report_name', 255).notNullable().comment('Human-readable report name');
    
    // Schedule configuration
    table.enum('schedule_frequency', ['daily', 'weekly', 'monthly', 'custom'])
      .notNullable()
      .comment('How often to run');
    table.time('schedule_time').notNullable().comment('Time of day to run (HH:MM:SS)');
    table.string('schedule_timezone', 50).notNullable().defaultTo('UTC')
      .comment('Timezone for schedule (e.g., America/New_York)');
    table.string('schedule_days', 100).nullable()
      .comment('For weekly: comma-separated days (Mon,Wed,Fri). For monthly: day numbers (1,15)');
    
    // Recipients & Format
    table.text('recipients').notNullable().comment('JSON array of email addresses');
    table.enum('format', ['pdf', 'excel', 'html']).defaultTo('pdf').comment('Output format');
    
    // Report filters (preserved from manual query)
    table.json('filters').nullable().comment('Report-specific filters (date ranges, search terms, etc)');
    
    // Status & Control
    table.boolean('is_active').defaultTo(true).comment('Schedule enabled/disabled');
    table.boolean('is_processing').defaultTo(false).comment('Currently executing');
    
    // Execution tracking
    table.timestamp('last_run_at').nullable().comment('Last successful execution');
    table.enum('last_run_status', ['success', 'failed', 'partial']).nullable();
    table.text('last_error_message').nullable();
    table.timestamp('next_run_at').notNullable().comment('Next scheduled execution');
    table.integer('execution_count').defaultTo(0).comment('Total successful executions');
    table.integer('failure_count').defaultTo(0).comment('Total failures');
    
    // Metadata
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('created_by', 255).nullable().comment('User who created (same as user_id)');
    table.string('updated_by', 255).nullable().comment('Last user who modified');
    
    // Indexes
    table.index(['next_run_at', 'is_active'], 'idx_next_run');
    table.index('user_id', 'idx_user');
    table.index('report_type', 'idx_report_type');
    table.index(['is_active', 'next_run_at'], 'idx_status');
  });
  
  console.log('✅ Created report_schedules table');
  
  console.log('Creating report_schedule_logs table...');
  
  // Create report_schedule_logs table
  await knex.schema.createTable('report_schedule_logs', (table) => {
    // Primary key
    table.increments('id').primary();
    
    // Foreign key to schedule
    table.integer('schedule_id').unsigned().notNullable();
    table.foreign('schedule_id')
      .references('id')
      .inTable('report_schedules')
      .onDelete('CASCADE');
    
    // Execution details
    table.enum('status', ['success', 'failed', 'processing', 'partial']).notNullable();
    table.timestamp('started_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('completed_at').nullable();
    table.integer('duration_ms').nullable().comment('Execution duration in milliseconds');
    
    // Results
    table.integer('recipients_count').defaultTo(0).comment('Number of recipients');
    table.integer('recipients_sent').defaultTo(0).comment('Emails successfully sent');
    table.integer('recipients_failed').defaultTo(0).comment('Failed email deliveries');
    table.integer('file_size_bytes').nullable().comment('Generated file size');
    table.integer('records_in_report').nullable().comment('Number of data records in report');
    
    // Error tracking
    table.text('error_message').nullable();
    table.string('error_code', 50).nullable();
    table.integer('retry_count').defaultTo(0);
    
    // Execution context
    table.enum('triggered_by', ['scheduled', 'manual', 'retry']).defaultTo('scheduled');
    table.string('executed_at_timezone', 50).nullable();
    
    // Metadata
    table.json('metadata').nullable().comment('Additional execution details');
    
    // Indexes
    table.index('schedule_id', 'idx_schedule');
    table.index(['status', 'started_at'], 'idx_status');
    table.index('started_at', 'idx_started_at');
  });
  
  console.log('✅ Created report_schedule_logs table');
  console.log('✅ Report scheduling tables created successfully');
};

/**
 * Drop report scheduling tables
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.down = async function(knex) {
  console.log('Dropping report scheduling tables...');
  
  await knex.schema.dropTableIfExists('report_schedule_logs');
  console.log('✅ Dropped report_schedule_logs table');
  
  await knex.schema.dropTableIfExists('report_schedules');
  console.log('✅ Dropped report_schedules table');
  
  console.log('✅ Report scheduling tables dropped successfully');
};
