# Detailed Step-by-Step Guide: Migrating Casbin to MySQL Database

This guide provides detailed, step-by-step instructions for migrating Casbin from file-based storage to MySQL database storage.

---

## Prerequisites Check

Before starting, verify you have:

1. ✅ MySQL database connection configured
2. ✅ Database credentials in `.env` file
3. ✅ Access to the same database used for `surgical_guides` table
4. ✅ Node.js and npm installed
5. ✅ Server code updated (already done)

### Verify Database Connection

Check your `.env` file in the `server` directory has these variables:

```bash
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_CONNECTION_LIMIT=10
```

**Example:**
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mypassword
DB_NAME=powerbi_cp_test
DB_CONNECTION_LIMIT=10
```

---

## Step 1: Verify Current Setup

### 1.1 Check Current Files Exist

Navigate to your project root and verify these files exist:

```bash
# From project root
ls -la server/src/config/casbin/
```

You should see:
- `model.conf` - Casbin model configuration
- `policy.csv` - Current policy rules
- `users.json` - Current user data

### 1.2 Backup Current Files (IMPORTANT!)

Before migration, create backups:

```bash
# From project root
mkdir -p backups/casbin
cp server/src/config/casbin/policy.csv backups/casbin/policy.csv.backup
cp server/src/config/casbin/users.json backups/casbin/users.json.backup
```

**Verify backups:**
```bash
ls -la backups/casbin/
```

You should see both backup files.

### 1.3 Check Database Connection

Test your database connection:

```bash
cd server
node -e "
import('mysql2/promise').then(async (mysql) => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  console.log('✅ Database connection successful!');
  await connection.end();
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});
"
```

Or use MySQL client directly:

```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME>
# Enter password when prompted
# If you can connect, type: exit
```

---

## Step 2: Create Database Tables

### 2.1 Locate the Schema File

The schema file is located at:
```
database/casbin_schema.sql
```

Verify it exists:
```bash
ls -la database/casbin_schema.sql
```

### 2.2 Review the Schema (Optional)

View the schema to understand what will be created:

```bash
cat database/casbin_schema.sql
```

You should see:
- `casbin_rule` table definition
- `casbin_users` table definition
- Indexes and constraints

### 2.3 Run the Schema SQL

**Option A: Using MySQL Command Line**

```bash
# From project root
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < database/casbin_schema.sql
```

**Replace placeholders:**
- `<DB_HOST>` - Your database host (e.g., `localhost` or IP address)
- `<DB_USER>` - Your database username (e.g., `root`)
- `<DB_NAME>` - Your database name (e.g., `powerbi_cp_test`)

**Example:**
```bash
mysql -h localhost -u root -p powerbi_cp_test < database/casbin_schema.sql
```

You'll be prompted for the database password.

**Option B: Using MySQL Client (Interactive)**

```bash
# Connect to MySQL
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME>

# Then run:
source database/casbin_schema.sql;

# Or copy-paste the entire SQL file content
```

**Option C: Using Database GUI Tool**

1. Open your MySQL GUI tool (phpMyAdmin, MySQL Workbench, DBeaver, etc.)
2. Connect to your database
3. Open the file `database/casbin_schema.sql`
4. Execute the SQL script

### 2.4 Verify Tables Were Created

**Using MySQL Command Line:**

```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> -e "SHOW TABLES LIKE 'casbin%';"
```

You should see:
```
+---------------------------+
| Tables_in_db (casbin%)    |
+---------------------------+
| casbin_rule               |
| casbin_users              |
+---------------------------+
```

**Or check table structure:**

```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> -e "DESCRIBE casbin_rule;"
```

You should see columns: `id`, `ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `v5`, `created_at`, `updated_at`

**Using SQL Query:**

```sql
-- Check if tables exist
SHOW TABLES LIKE 'casbin%';

-- Check casbin_rule structure
DESCRIBE casbin_rule;

-- Check casbin_users structure
DESCRIBE casbin_users;

-- Check indexes
SHOW INDEX FROM casbin_rule;
```

---

## Step 3: Run Migration Script

### 3.1 Navigate to Server Directory

```bash
cd server
```

### 3.2 Verify Migration Script Exists

```bash
ls -la scripts/migrate-casbin-to-database.js
```

### 3.3 Check Environment Variables Are Loaded

The script uses environment variables from `.env` file. Make sure you're in the `server` directory where `.env` is located:

```bash
# From server directory
pwd
# Should show: .../InsightHub/server

ls -la .env
# Should show the .env file exists
```

### 3.4 Run the Migration Script

```bash
node scripts/migrate-casbin-to-database.js
```

### 3.5 Expected Output

You should see output like this:

```
🚀 Starting Casbin migration to database...

📡 Connecting to database...
   ✅ Database connected

   ✅ Table casbin_rule exists
   ✅ Table casbin_users exists

📋 Migrating policies from CSV to database...
   Found 50 policies and 10 groupings
   Cleared existing policies from database
   ✅ Migrated 60 policies to database

👥 Migrating users from JSON to database...
   Found 6 users
   ✅ Migrated 6 users to database

🔍 Verifying migration...
   Policies: 50
   Groupings: 10
   Users: 6

📊 Migration Summary:
   Policies migrated: 50
   Groupings migrated: 10
   Users migrated: 6

✅ Migration completed successfully!

⚠️  Next steps:
   1. Update CONFIG.storage.type to "database" in config.js
   2. Restart the server
   3. Test authorization to ensure everything works
   4. Keep the original files as backup
```

### 3.6 Troubleshooting Migration Errors

**Error: "Database connection failed"**
- Check `.env` file has correct database credentials
- Verify database is running and accessible
- Test connection manually (see Step 1.3)

**Error: "Table casbin_rule does not exist"**
- Go back to Step 2 and create the tables
- Verify you're using the correct database name

**Error: "Policy file not found"**
- Verify you're running from `server` directory
- Check file path: `server/src/config/casbin/policy.csv`

**Error: "Users file not found"**
- Check file path: `server/src/config/casbin/users.json`
- This is optional - migration will continue without it

### 3.7 Verify Data in Database

**Check policies were migrated:**

```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> -e "SELECT COUNT(*) as total FROM casbin_rule WHERE ptype='p';"
```

**Check groupings were migrated:**

```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> -e "SELECT COUNT(*) as total FROM casbin_rule WHERE ptype IN ('g', 'g2');"
```

**Check users were migrated:**

```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> -e "SELECT COUNT(*) as total FROM casbin_users;"
```

**View sample data:**

```sql
-- View first 10 policies
SELECT * FROM casbin_rule WHERE ptype='p' LIMIT 10;

-- View first 10 groupings
SELECT * FROM casbin_rule WHERE ptype='g' LIMIT 10;

-- View all users
SELECT email, full_name, groups, roles FROM casbin_users;
```

---

## Step 4: Enable Database Mode

### 4.1 Option A: Using Environment Variable (Recommended)

Edit your `.env` file in the `server` directory:

```bash
cd server
nano .env
# or
code .env
# or
vim .env
```

Add or update this line:

```bash
STORAGE_TYPE=database
```

**Full .env example:**

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=powerbi_cp_test
DB_CONNECTION_LIMIT=10

# Storage Type for Casbin
STORAGE_TYPE=database

# Google OAuth (your existing config)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Session Secret
SESSION_SECRET=your-session-secret
```

Save the file.

### 4.2 Option B: Using Config File

Edit `server/src/config/config.js`:

```bash
cd server
nano src/config/config.js
# or
code src/config/config.js
```

Find this section (around line 114-119):

```javascript
  // Database/Storage Configuration
  storage: {
    type: 'file', // 'file' | 'database'
    backupInterval: 24 * 60 * 60 * 1000, // 24 hours
    retentionDays: 30
  },
```

Change it to:

```javascript
  // Database/Storage Configuration
  storage: {
    type: 'database', // 'file' | 'database'
    backupInterval: 24 * 60 * 60 * 1000, // 24 hours
    retentionDays: 30
  },
```

Save the file.

### 4.3 Verify Configuration

Check that the configuration is correct:

```bash
cd server
node -e "
import('./src/config/config.js').then(({ CONFIG }) => {
  console.log('Storage type:', CONFIG.storage.type);
  if (CONFIG.storage.type === 'database') {
    console.log('✅ Database mode is enabled');
  } else {
    console.log('⚠️  Still using file mode');
  }
});
"
```

---

## Step 5: Restart the Server

### 5.1 Stop Current Server (if running)

If your server is running, stop it:
- Press `Ctrl+C` in the terminal where server is running
- Or kill the process: `pkill -f "node.*index.js"`

### 5.2 Start the Server

**Development mode:**
```bash
cd server
npm run dev
```

**Production mode:**
```bash
cd server
npm start
```

### 5.3 Watch for Initialization Messages

Look for these log messages in the console:

**Success messages:**
```
✅ Database connection status: SUCCESS
✅ Casbin enforcer initialized with MySQL adapter
✅ Casbin enforcer initialized successfully
   storageType: database
   policiesCount: 50
   groupingsCount: 10
```

**If you see file mode instead:**
```
⚠️  Casbin enforcer initialized with file adapter
```

This means database mode is not enabled - go back to Step 4.

### 5.4 Check Server Logs

The server should log:
- Database connection successful
- Casbin initialization with MySQL adapter
- Policy count loaded from database

---

## Step 6: Verify Everything Works

### 6.1 Test Database Connection

The server logs should show:
```
Database connection status: SUCCESS
```

### 6.2 Test Casbin Initialization

Check logs for:
```
Casbin enforcer initialized with MySQL adapter
Casbin enforcer initialized successfully
  storageType: database
  policiesCount: <number>
  groupingsCount: <number>
```

### 6.3 Test User Login

1. Open your application in browser: `http://localhost:3001` (or your server URL)
2. Log in with a test user
3. Verify you can access protected resources
4. Check that user permissions work correctly

### 6.4 Test Policy Management (Admin Only)

If you have admin access, test adding a policy:

**Using API:**

```bash
# Get your session cookie first by logging in through browser
# Then use the cookie in this request:

curl -X POST http://localhost:3001/api/admin/policies \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-session-cookie>" \
  -d '{
    "subject": "test-group",
    "object": "test-resource",
    "action": "read"
  }'
```

**Verify in database:**

```sql
SELECT * FROM casbin_rule 
WHERE v0='test-group' AND v1='test-resource' AND v2='read';
```

You should see the new policy.

**Remove test policy:**

```bash
curl -X DELETE http://localhost:3001/api/admin/policies \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-session-cookie>" \
  -d '{
    "subject": "test-group",
    "object": "test-resource",
    "action": "read"
  }'
```

**Verify removed:**

```sql
SELECT * FROM casbin_rule 
WHERE v0='test-group' AND v1='test-resource' AND v2='read';
```

Should return no rows.

### 6.5 Test User Group Assignment

**Add user to group:**

```bash
curl -X POST http://localhost:3001/api/admin/users/groups \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-session-cookie>" \
  -d '{
    "userEmail": "test@example.com",
    "group": "test-group"
  }'
```

**Verify in database:**

```sql
SELECT * FROM casbin_rule 
WHERE ptype='g' AND v0='test@example.com' AND v1='test-group';
```

### 6.6 Restart Server and Verify Persistence

1. Stop the server (`Ctrl+C`)
2. Start it again
3. Verify the test policy/grouping you added is still there
4. This confirms data persists in database

---

## Step 7: Final Verification Checklist

Run through this checklist to ensure everything is working:

- [ ] Database tables created (`casbin_rule` and `casbin_users`)
- [ ] Migration script completed successfully
- [ ] Data verified in database (policies and users count match)
- [ ] `STORAGE_TYPE=database` set in `.env` or config
- [ ] Server restarted
- [ ] Server logs show "MySQL adapter" initialization
- [ ] User login works
- [ ] Authorization/permissions work correctly
- [ ] Can add policies via API (if admin)
- [ ] Can remove policies via API (if admin)
- [ ] Changes persist after server restart
- [ ] Original files backed up

---

## Troubleshooting Common Issues

### Issue: "Database not initialized, falling back to file storage"

**Cause:** Database service not initialized before Casbin

**Solution:**
1. Check database environment variables in `.env`
2. Verify database is accessible
3. Check server initialization order in `server/src/index.js`
4. Database should initialize before Casbin

### Issue: "Table does not exist"

**Cause:** Tables weren't created

**Solution:**
1. Go back to Step 2
2. Run the SQL schema file again
3. Verify tables exist: `SHOW TABLES LIKE 'casbin%';`

### Issue: "No policies loaded"

**Cause:** Migration didn't run or failed

**Solution:**
1. Check migration script output for errors
2. Verify `policy.csv` file exists and has data
3. Run migration script again
4. Check database has data: `SELECT COUNT(*) FROM casbin_rule;`

### Issue: "Policies not working after migration"

**Cause:** Data format mismatch or missing data

**Solution:**
1. Compare policy count: `SELECT COUNT(*) FROM casbin_rule WHERE ptype='p';`
2. Check sample policies: `SELECT * FROM casbin_rule LIMIT 5;`
3. Verify format matches original CSV
4. Re-run migration if needed

### Issue: "Can't add policies via API"

**Cause:** Auto-save not working or database connection issue

**Solution:**
1. Check `CONFIG.casbin.autoSave` is `true`
2. Check server logs for database errors
3. Verify database connection is still active
4. Test database query manually

---

## Rollback Instructions

If you need to rollback to file mode:

### Quick Rollback

1. Edit `.env` file:
   ```bash
   STORAGE_TYPE=file
   ```

2. Restart server:
   ```bash
   npm start
   ```

3. Server will now use `policy.csv` and `users.json` files

### Full Rollback (Restore from Backup)

1. Stop server

2. Restore backup files:
   ```bash
   cp backups/casbin/policy.csv.backup server/src/config/casbin/policy.csv
   cp backups/casbin/users.json.backup server/src/config/casbin/users.json
   ```

3. Set storage type to file:
   ```bash
   STORAGE_TYPE=file
   ```

4. Restart server

**Note:** Database data is preserved, you can migrate back anytime.

---

## Next Steps After Migration

1. **Monitor Performance:** Watch server logs for any database-related issues
2. **Test Thoroughly:** Test all authorization scenarios
3. **Update Documentation:** Document any custom policies or roles
4. **Set Up Backups:** Include `casbin_rule` and `casbin_users` in your database backup routine
5. **Consider User Management:** You can now manage users directly in database if needed

---

## Support

If you encounter issues:

1. Check server logs for detailed error messages
2. Verify database connection and permissions
3. Review this guide step-by-step
4. Check `docs/casbin-database-migration.md` for additional details
5. Verify all prerequisites are met

---

## Summary

You've successfully migrated Casbin to use MySQL database! Your policies and roles are now stored dynamically in the database, allowing for real-time management without file edits.

**Key Benefits:**
- ✅ Dynamic policy management
- ✅ Better performance
- ✅ Transaction support
- ✅ Multi-instance ready
- ✅ Easier backups

**Remember:**
- Keep original files as backup
- Database data persists across restarts
- Can switch back to file mode anytime
- All API endpoints work the same way

