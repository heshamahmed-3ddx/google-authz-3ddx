# Database Migrations Guide

Complete guide for managing database schema changes with Knex.js migrations in InsightHub.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Migration Commands](#migration-commands)
- [Creating Migrations](#creating-migrations)
- [Running Migrations](#running-migrations)
- [Rollback Strategies](#rollback-strategies)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Overview

InsightHub uses **Knex.js** for database migrations, providing:

- ✅ **Version control** for database schemas
- ✅ **Forward-only migrations** (production safe)
- ✅ **Automated rollback** (development only)
- ✅ **Migration tracking** with `knex_migrations` table
- ✅ **Multi-environment support** (dev, test, production)
- ✅ **Transaction support** for data integrity

### What Are Migrations?

Migrations are version-controlled database schema changes that allow you to:
- Track database changes alongside code
- Deploy database updates consistently
- Roll back changes if needed (in development)
- Share schema changes with team members

## Quick Start

### Check Migration Status

```bash
npm run migrate:status
```

**Output:**
```
Found 2 Completed Migration file/files.
20260121000001_create_casbin_tables.cjs
20260121000003_create_report_access_logs_table.cjs
No Pending Migration file/files.
```

### Apply Pending Migrations

```bash
npm run migrate:latest
```

### Create New Migration

```bash
npm run migrate:make add_user_preferences
```

## Migration Commands

### Core Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run migrate:status` | Check migration status | Before/after deployments |
| `npm run migrate:latest` | Run all pending migrations | Apply new schema changes |
| `npm run migrate:rollback` | Rollback last batch | Undo last deployment (dev only) |
| `npm run migrate:rollback:all` | Rollback all migrations | Reset database (dev only) |
| `npm run migrate:make <name>` | Create new migration | Add new schema changes |
| `npm run migrate:list` | List all migrations | Audit migration history |
| `npm run migrate:up` | Run next pending migration | Incremental testing |
| `npm run migrate:down` | Rollback last migration | Undo specific migration |

### Seed Commands (Data Seeding)

| Command | Description |
|---------|-------------|
| `npm run seed:make <name>` | Create seed file |
| `npm run seed:run` | Run all seed files |

## Creating Migrations

### Migration Naming Convention

Use descriptive names with verb-noun format:

```bash
npm run migrate:make create_users_table
npm run migrate:make add_email_to_users
npm run migrate:make update_casbin_indexes
npm run migrate:make remove_deprecated_column
```

### Migration File Structure

```javascript
/**
 * @file 20260121120000_add_user_preferences.cjs
 * @description Add user preferences table for custom settings
 */

/**
 * Apply migration - Create user_preferences table
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.up = async function(knex) {
  // Check if table already exists
  const tableExists = await knex.schema.hasTable('user_preferences');
  
  if (!tableExists) {
    await knex.schema.createTable('user_preferences', (table) => {
      table.increments('id').primary();
      table.string('user_email', 255).notNullable();
      table.json('settings');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Indexes
      table.index('user_email', 'idx_user_email');
      
      // Constraints
      table.unique(['user_email'], 'uk_user_email');
    });
    
    console.log('✅ Created user_preferences table');
  } else {
    console.log('⚠️  user_preferences table already exists, skipping');
  }
};

/**
 * Rollback migration - Drop user_preferences table
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('user_preferences');
  console.log('✅ Dropped user_preferences table');
};
```

### Migration Patterns

#### Create Table

```javascript
exports.up = async function(knex) {
  await knex.schema.createTable('table_name', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.timestamps(true, true); // created_at, updated_at
  });
};
```

#### Add Column

```javascript
exports.up = async function(knex) {
  await knex.schema.table('table_name', (table) => {
    table.string('new_column', 100).nullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.table('table_name', (table) => {
    table.dropColumn('new_column');
  });
};
```

#### Modify Column

```javascript
exports.up = async function(knex) {
  await knex.schema.alterTable('table_name', (table) => {
    table.string('email', 500).notNullable().alter();
  });
};
```

#### Add Index

```javascript
exports.up = async function(knex) {
  await knex.schema.table('table_name', (table) => {
    table.index('column_name', 'idx_column_name');
  });
};

exports.down = async function(knex) {
  await knex.schema.table('table_name', (table) => {
    table.dropIndex('column_name', 'idx_column_name');
  });
};
```

#### Data Migration

```javascript
exports.up = async function(knex) {
  // Update existing records
  await knex('users')
    .where('status', null)
    .update({ status: 'active' });
};

exports.down = async function(knex) {
  // Revert changes
  await knex('users')
    .where('status', 'active')
    .update({ status: null });
};
```

## Running Migrations

### Development Environment

```bash
# Check what will run
npm run migrate:status

# Run pending migrations
npm run migrate:latest

# Verify success
npm run migrate:status
```

### Test Environment

```bash
# Set environment
NODE_ENV=test npm run migrate:latest
```

### Production Environment

```bash
# ALWAYS check status first
NODE_ENV=production npm run migrate:status

# Run migrations
NODE_ENV=production npm run migrate:latest

# Verify
NODE_ENV=production npm run migrate:status
```

## Rollback Strategies

### ⚠️ Important: Rollback Limitations

**Your database user (`powerbidbuser`) lacks DROP/ALTER permissions**, which means:

- ✅ **Migrations work** - Can create tables and insert data
- ❌ **Rollbacks fail** - Cannot drop or alter existing tables
- ✅ **Production safe** - Prevents accidental data loss

### Development Rollback (Requires Elevated Permissions)

```bash
# Rollback last batch
npm run migrate:rollback

# Rollback all migrations
npm run migrate:rollback:all

# Rollback specific migration
npm run migrate:down
```

### Production Strategy: Forward-Only Migrations

Instead of rollbacks, create **new migrations** to fix issues:

#### ❌ Don't Do This (Can't Rollback)
```javascript
// Migration 001: Create users table
exports.up = async (knex) => {
  await knex.schema.createTable('users', ...);
};

// Later: Oops, need to change column!
// Rollback fails in production
```

#### ✅ Do This (Forward-Only)
```javascript
// Migration 001: Create users table
exports.up = async (knex) => {
  await knex.schema.createTable('users', ...);
};

// Migration 002: Fix users table column
exports.up = async (knex) => {
  await knex.schema.table('users', (table) => {
    table.string('email', 500).alter();
  });
};
```

## Best Practices

### 1. Always Use Transactions

```javascript
exports.up = async function(knex) {
  return knex.transaction(async (trx) => {
    await trx.schema.createTable('users', ...);
    await trx('users').insert({ ... });
  });
};
```

### 2. Check Table Existence

```javascript
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('users');
  if (!exists) {
    // Create table
  }
};
```

### 3. Make Migrations Idempotent

```javascript
exports.up = async function(knex) {
  // Safe to run multiple times
  await knex.schema.createTableIfNotExists('users', ...);
};
```

### 4. Test Migrations Locally First

```bash
# Test on development database
npm run migrate:latest

# Test rollback (if you have permissions)
npm run migrate:rollback

# Re-apply
npm run migrate:latest
```

### 5. Keep Migrations Small

- ✅ One logical change per migration
- ✅ Easy to review and understand
- ✅ Easier to debug if issues arise
- ❌ Don't combine unrelated changes

### 6. Document Complex Migrations

```javascript
/**
 * @file 20260121_complex_migration.cjs
 * @description 
 * This migration performs the following:
 * 1. Adds new user_type column
 * 2. Backfills existing users as 'standard'
 * 3. Adds index on user_type
 * 
 * @warning This may take 5-10 minutes on large databases
 */
```

### 7. Version Lock Your Schema

```javascript
// knexfile.js
module.exports = {
  development: {
    // ...
    migrations: {
      tableName: 'knex_migrations', // Track migrations
      directory: './database/migrations'
    }
  }
};
```

## Troubleshooting

### Migration Fails: "Table Already Exists"

**Cause:** Table was created manually before migration

**Solution:** Add existence check
```javascript
const exists = await knex.schema.hasTable('table_name');
if (!exists) {
  // Create table
}
```

### Rollback Fails: "DROP Command Denied"

**Cause:** Database user lacks DROP permissions

**Solutions:**
1. Use forward-only migrations (recommended)
2. Request DBA to grant permissions (dev only)
3. Manually mark migration as rolled back:
   ```sql
   DELETE FROM knex_migrations WHERE name = 'migration_name.cjs';
   ```

### Migration Hangs or Times Out

**Possible Causes:**
- Large table modifications
- Locked tables
- Missing indexes on large tables

**Solutions:**
- Break into smaller migrations
- Run during low-traffic periods
- Add indexes before data modifications

### "Cannot Find Module" Error

**Cause:** Migration files use wrong format (`.js` vs `.cjs`)

**Solution:** Ensure all migrations use `.cjs` extension
```bash
cd database/migrations
for file in *.js; do mv "$file" "${file%.js}.cjs"; done
```

### Timezone Warning

```
Ignoring invalid timezone passed to Connection: UTC
```

**Impact:** Cosmetic warning only, doesn't affect functionality

**Fix (Optional):** Remove timezone from knexfile.js
```javascript
connection: {
  // Remove: timezone: 'UTC'
}
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] Test migrations on development database
- [ ] Review all SQL that will execute
- [ ] Backup production database
- [ ] Schedule deployment during low-traffic window
- [ ] Have rollback plan ready
- [ ] Notify team of deployment

### Deployment Steps

```bash
# 1. Backup database
mysqldump -u user -p dbname > backup_$(date +%Y%m%d).sql

# 2. Check current state
NODE_ENV=production npm run migrate:status

# 3. Run migrations
NODE_ENV=production npm run migrate:latest

# 4. Verify success
NODE_ENV=production npm run migrate:status

# 5. Test application
curl http://your-app/health

# 6. Monitor logs
tail -f logs/app.log
```

### Rollback Plan (Forward-Only)

If migration causes issues:

1. **Don't rollback** (not possible with current permissions)
2. **Create hotfix migration** to revert changes
3. **Deploy hotfix immediately**

Example:
```bash
# Create fix migration
npm run migrate:make hotfix_revert_user_changes

# Edit migration to undo changes
# Deploy immediately
NODE_ENV=production npm run migrate:latest
```

## Configuration Reference

### knexfile.js

Located at: `/Users/heshamahmed/InsightHub/knexfile.js`

```javascript
module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations',
      extension: 'cjs'
    }
  }
};
```

### Environment Variables

```bash
# server/.env.development
DB_HOST=10.114.0.22
DB_PORT=3306
DB_USER=powerbidbuser
DB_PASSWORD=your_password
DB_NAME=PowerBi_db
```

## Current Migrations

### Completed Migrations

1. **`20260121000001_create_casbin_tables.cjs`**
   - Creates `casbin_rule` table for RBAC policies
   - Creates `casbin_users` table for user metadata

2. **`20260121000003_create_report_access_logs_table.cjs`**
   - Creates `report_access_logs` table for audit trails

## Additional Resources

- [Knex.js Documentation](https://knexjs.org/)
- [Schema Builder API](https://knexjs.org/guide/schema-builder.html)
- [Migration API](https://knexjs.org/guide/migrations.html)
- [InsightHub Architecture](./architecture.md)
- [Deployment Guide](./deployment-guide.md)

## Support

For migration issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review server logs: `logs/app.log`
3. Verify database connection: `npm run migrate:status`
4. Contact development team

---

**Last Updated:** January 21, 2026  
**Version:** 1.0.0  
**Maintained by:** InsightHub Development Team
