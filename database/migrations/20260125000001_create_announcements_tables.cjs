/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('announcements', (table) => {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.text('content').notNullable();
      table.enum('severity', ['info', 'warning', 'success', 'error']).defaultTo('info');
      table.boolean('is_active').defaultTo(true);
      table.datetime('start_date').notNullable();
      table.datetime('end_date').nullable();
      table.string('created_by', 255).notNullable(); // email of admin who created it
      table.timestamps(true, true); // created_at, updated_at
      
      table.index('is_active');
      table.index(['start_date', 'end_date']);
    })
    .createTable('user_announcement_reads', (table) => {
      table.increments('id').primary();
      table.integer('announcement_id').unsigned().notNullable();
      table.string('user_email', 255).notNullable();
      table.timestamp('read_at').defaultTo(knex.fn.now());
      
      table.foreign('announcement_id')
        .references('id')
        .inTable('announcements')
        .onDelete('CASCADE');
      
      table.unique(['announcement_id', 'user_email']);
      table.index('user_email');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('user_announcement_reads')
    .dropTableIfExists('announcements');
};
