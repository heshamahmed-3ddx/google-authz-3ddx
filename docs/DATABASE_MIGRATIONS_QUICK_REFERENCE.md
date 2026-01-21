# Database Migrations - Quick Reference

One-page reference for common database migration tasks.

## 🚀 Common Commands

```bash
# Check status
npm run migrate:status

# Run pending migrations
npm run migrate:latest

# Create new migration
npm run migrate:make add_new_feature

# Rollback last batch (dev only, requires permissions)
npm run migrate:rollback
```

## 📝 Create Migration Template

```javascript
/**
 * @file YYYYMMDD_description.cjs
 * @description What this migration does
 */

exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('table_name');
  if (!exists) {
    await knex.schema.createTable('table_name', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.timestamps(true, true);
    });
    console.log('✅ Created table_name table');
  } else {
    console.log('⚠️  table_name already exists, skipping');
  }
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('table_name');
  console.log('✅ Dropped table_name');
};
```

## 🔧 Common Patterns

### Create Table
```javascript
await knex.schema.createTable('users', (table) => {
  table.increments('id').primary();
  table.string('email', 255).notNullable().unique();
  table.timestamps(true, true);
});
```

### Add Column
```javascript
await knex.schema.table('users', (table) => {
  table.string('phone', 50).nullable();
});
```

### Add Index
```javascript
await knex.schema.table('users', (table) => {
  table.index('email', 'idx_users_email');
});
```

### Data Migration
```javascript
await knex('users')
  .where('status', null)
  .update({ status: 'active' });
```

## ⚠️ Important Notes

- **Rollbacks don't work** in production (user lacks DROP permissions)
- Use **forward-only migrations** to fix issues
- Always **check table existence** before creating
- **Test locally** before deploying
- **Backup database** before production migrations

## 📦 File Locations

- **Config:** `/knexfile.js`
- **Migrations:** `/database/migrations/`
- **Migration History:** `knex_migrations` table in database

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Table already exists | Add `hasTable()` check |
| Rollback fails | Use forward-only migration |
| Can't find migration | Check `.cjs` extension |
| Permission denied | Contact DBA for elevated permissions (dev only) |

## 📚 Full Documentation

See [DATABASE_MIGRATIONS.md](./DATABASE_MIGRATIONS.md) for complete guide.

---

**Quick Links:**
- [Knex.js Docs](https://knexjs.org/)
- [Schema Builder](https://knexjs.org/guide/schema-builder.html)
- [Deployment Guide](./deployment-guide.md)
