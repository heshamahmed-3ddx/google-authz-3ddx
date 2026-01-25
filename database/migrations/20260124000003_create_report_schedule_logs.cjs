/**
 * @file 20260124000003_create_report_schedule_logs.cjs
 * @description Create only report_schedule_logs table
 * @author InsightHub Development Team
 * @created 2026-01-24
 */

/**
 * Create report_schedule_logs table
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  console.log('Creating report_schedule_logs table...');
  
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
    
    // Note: Foreign key omitted due to ALTER permission restrictions
    // schedule_id references report_schedules.id (enforced at application level)
  });

  console.log('report_schedule_logs table created successfully (without foreign key)!');
  console.log('Note: schedule_id references report_schedules.id (enforced at application level)');
};

/**
 * Drop report_schedule_logs table
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('report_schedule_logs');
};
