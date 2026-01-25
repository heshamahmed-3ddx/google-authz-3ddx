/**
 * @file 20260124000002_create_report_scheduling_tables_no_indexes.cjs
 * @description Alternative migration for report scheduling tables without indexes
 * @author InsightHub Development Team
 * @created 2026-01-24
 */

/**
 * Create report scheduling tables (without indexes for limited permissions)
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  console.log('Creating report_schedules table (no indexes)...');
  
  // Create report_schedules table
  await knex.schema.createTable('report_schedules', (table) => {
    table.increments('id').primary();
    table.string('user_id', 255).notNullable().comment('User email who created the schedule');
    table.string('report_type', 100).notNullable().comment('Type of report (surgical_guide, powerbi, etc)');
    table.string('report_name', 255).notNullable().comment('Human-readable report name');
    table.enum('schedule_frequency', ['daily', 'weekly', 'monthly', 'custom']).notNullable().comment('How often to run');
    table.time('schedule_time').notNullable().comment('Time of day to run (HH:MM:SS)');
    table.string('schedule_timezone', 100).notNullable().defaultTo('America/New_York').comment('Timezone for schedule');
    table.json('schedule_days').nullable().comment('Days for weekly (Mon,Tue) or monthly (1,15) schedules');
    table.json('recipients').notNullable().comment('Array of recipient email addresses');
    table.string('format', 20).notNullable().defaultTo('pdf').comment('Output format: pdf, excel, html');
    table.json('filters').nullable().comment('Report-specific filters');
    table.boolean('is_active').notNullable().defaultTo(true).comment('Whether schedule is active');
    table.datetime('next_run_at').nullable().comment('Next scheduled run time');
    table.datetime('last_run_at').nullable().comment('Last execution time');
    table.integer('execution_count').notNullable().defaultTo(0).comment('Successful executions');
    table.integer('failure_count').notNullable().defaultTo(0).comment('Failed executions');
    table.timestamps(true, true);
  });

  console.log('Creating report_schedule_logs table (no indexes)...');
  
  // Create report_schedule_logs table
  await knex.schema.createTable('report_schedule_logs', (table) => {
    table.increments('id').primary();
    table.integer('schedule_id').unsigned().notNullable().comment('References report_schedules.id');
    table.enum('status', ['pending', 'running', 'completed', 'failed']).notNullable().defaultTo('pending');
    table.datetime('started_at').notNullable().comment('When execution started');
    table.datetime('completed_at').nullable().comment('When execution finished');
    table.integer('duration_ms').nullable().comment('Execution duration in milliseconds');
    table.string('file_path', 500).nullable().comment('Path to generated report file');
    table.bigInteger('file_size').nullable().comment('File size in bytes');
    table.boolean('email_sent').notNullable().defaultTo(false).comment('Whether email was sent');
    table.json('email_recipients').nullable().comment('Actual recipients list');
    table.datetime('email_sent_at').nullable().comment('When email was sent');
    table.text('error_message').nullable().comment('Error message if failed');
    table.integer('retry_count').notNullable().defaultTo(0).comment('Number of retry attempts');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Foreign key
    table.foreign('schedule_id').references('report_schedules.id').onDelete('CASCADE');
  });

  console.log('Report scheduling tables created successfully (without indexes)!');
  console.log('Note: For better performance, ask your DBA to add indexes:');
  console.log('  - report_schedules: (user_id), (is_active), (next_run_at, is_active), (schedule_frequency)');
  console.log('  - report_schedule_logs: (schedule_id, created_at), (status), (started_at)');
};

/**
 * Drop report scheduling tables
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('report_schedule_logs');
  await knex.schema.dropTableIfExists('report_schedules');
};
