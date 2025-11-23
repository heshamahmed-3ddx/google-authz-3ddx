# Casbin Database Migration Guide

This guide explains how to migrate Casbin from file-based storage (CSV/JSON) to MySQL database storage for dynamic role and policy management.

## Overview

The application now supports two storage modes for Casbin:
- **File Mode** (default): Policies stored in `policy.csv`, users in `users.json`
- **Database Mode**: Policies and users stored in MySQL database tables

## Benefits of Database Mode

- ✅ **Dynamic Management**: Add/remove policies and roles without editing files
- ✅ **Better Performance**: Faster queries for large datasets
- ✅ **Transaction Support**: Atomic operations for policy changes
- ✅ **Multi-Instance**: Share policies across multiple server instances
- ✅ **Easier Backup**: Standard database backup procedures
- ✅ **Real-time Updates**: Changes reflect immediately across all instances

## Prerequisites

1. MySQL database connection configured (same database as `surgical_guides`)
2. Database user has CREATE TABLE permissions
3. Environment variables set:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`

## Step 1: Create Database Tables

Run the SQL schema file to create the required tables:

```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < database/casbin_schema.sql
```

Or connect to your database and run the SQL manually:

```sql
-- See database/casbin_schema.sql for full schema
CREATE TABLE IF NOT EXISTS casbin_rule (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ptype VARCHAR(10) NOT NULL,
  v0 VARCHAR(255),
  v1 VARCHAR(255),
  v2 VARCHAR(255),
  v3 VARCHAR(255),
  v4 VARCHAR(255),
  v5 VARCHAR(255),
  -- ... indexes and constraints
);

CREATE TABLE IF NOT EXISTS casbin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  groups JSON,
  roles JSON,
  -- ... other fields
);
```

## Step 2: Migrate Existing Data

Run the migration script to copy data from files to database:

```bash
cd server
node scripts/migrate-casbin-to-database.js
```

The script will:
1. Connect to your database
2. Verify tables exist
3. Migrate all policies from `policy.csv` to `casbin_rule` table
4. Migrate all users from `users.json` to `casbin_users` table (optional)
5. Verify the migration

**Important**: Keep your original files (`policy.csv` and `users.json`) as backup!

## Step 3: Enable Database Mode

Update the configuration to use database storage:

**Option A: Environment Variable** (Recommended)
```bash
# In your .env file
STORAGE_TYPE=database
```

**Option B: Config File**
Edit `server/src/config/config.js`:
```javascript
storage: {
  type: 'database', // Change from 'file' to 'database'
  // ...
}
```

## Step 4: Restart Server

Restart your server to apply the changes:

```bash
npm start
# or
npm run dev
```

The server will now:
- Load policies from the database instead of files
- Save policy changes to the database automatically
- Use the same database connection as your surgical guides feature

## Step 5: Verify

1. Check server logs for successful initialization:
   ```
   Casbin enforcer initialized with MySQL adapter
   ```

2. Test authorization:
   - Log in with a test user
   - Verify permissions work correctly
   - Check that user groups/roles are loaded

3. Test dynamic policy management:
   - Use admin API endpoints to add/remove policies
   - Verify changes persist in database
   - Restart server and verify changes are still there

## Configuration Options

### Environment Variables

```bash
# Storage type: 'file' or 'database'
STORAGE_TYPE=database

# Database table names (optional, defaults shown)
CASBIN_TABLE_NAME=casbin_rule
CASBIN_USERS_TABLE_NAME=casbin_users
```

### Config File Options

In `server/src/config/config.js`:

```javascript
casbin: {
  tableName: 'casbin_rule',           // Policy table name
  usersTableName: 'casbin_users',     // Users table name
  autoSave: true,                     // Auto-save on policy changes
  // ...
}

storage: {
  type: 'database',                   // 'file' | 'database'
  // ...
}
```

## Database Schema

### casbin_rule Table

Stores policy rules and role assignments:

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| ptype | VARCHAR(10) | 'p' for policy, 'g' for grouping |
| v0 | VARCHAR(255) | Subject/user or first field |
| v1 | VARCHAR(255) | Object/resource or role/group |
| v2 | VARCHAR(255) | Action (for policies) |
| v3-v5 | VARCHAR(255) | Extra fields (reserved) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Examples:**
- Policy: `ptype='p', v0='admin', v1='users', v2='read'`
- Grouping: `ptype='g', v0='user@example.com', v1='admin'`

### casbin_users Table

Stores user information (optional):

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| email | VARCHAR(255) | User email (unique) |
| full_name | VARCHAR(255) | User's full name |
| groups | JSON | Array of group names |
| roles | JSON | Array of role names |
| org_unit | VARCHAR(255) | Organizational unit |
| department | VARCHAR(255) | Department name |
| two_step_enabled | BOOLEAN | 2FA status |
| google_raw | JSON | Raw Google data |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## API Usage

With database mode enabled, all policy management APIs work dynamically:

### Add Policy
```javascript
POST /api/admin/policies
{
  "subject": "admin",
  "object": "users",
  "action": "read"
}
```

### Remove Policy
```javascript
DELETE /api/admin/policies
{
  "subject": "admin",
  "object": "users",
  "action": "read"
}
```

### Add User to Group
```javascript
POST /api/admin/users/groups
{
  "userEmail": "user@example.com",
  "group": "admin"
}
```

All changes are automatically saved to the database!

## Troubleshooting

### Database Connection Failed

**Error**: `Database not initialized, falling back to file storage`

**Solution**:
1. Check database environment variables are set
2. Verify database is accessible
3. Ensure database service is initialized before Casbin

### Tables Don't Exist

**Error**: `Table casbin_rule does not exist`

**Solution**: Run the SQL schema file:
```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < database/casbin_schema.sql
```

### Migration Failed

**Error**: Migration script fails

**Solution**:
1. Check database connection
2. Verify tables exist
3. Check file paths are correct
4. Review error logs for details

### Policies Not Loading

**Error**: Policies not working after migration

**Solution**:
1. Verify migration completed successfully
2. Check database has data: `SELECT COUNT(*) FROM casbin_rule`
3. Check server logs for initialization errors
4. Verify `STORAGE_TYPE=database` is set

## Rollback to File Mode

If you need to rollback to file mode:

1. Update config: `STORAGE_TYPE=file`
2. Restart server
3. Policies will load from `policy.csv` again

**Note**: Database data is preserved, you can migrate back anytime.

## Best Practices

1. **Backup First**: Always backup your database before major changes
2. **Test Migration**: Test migration on a development database first
3. **Keep Files**: Keep original CSV/JSON files as backup
4. **Monitor Logs**: Watch server logs during migration
5. **Verify Data**: Always verify migration completed successfully
6. **Use Transactions**: Policy changes are automatically transactional in database mode

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify database connection and permissions
3. Review this documentation
4. Check Casbin documentation: https://casbin.org/docs/en/overview

