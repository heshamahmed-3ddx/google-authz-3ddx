# Casbin Database Maintenance Guide

## Understanding Duplicate Policies

### Why Duplicates Happen

Duplicate policies in the `casbin_rule` table can occur when:

1. **Multiple saves without deduplication**: The Casbin enforcer saves policies without checking if they already exist
2. **Server restarts during development**: Each restart may re-initialize policies
3. **Testing**: Adding/removing policies multiple times during testing
4. **Race conditions**: Multiple instances saving simultaneously

### Impact of Duplicates

- ✅ **Functionality**: Casbin works correctly even with duplicates (it only checks if a policy exists)
- ⚠️ **Performance**: Slower policy lookups as the table grows
- ⚠️ **Storage**: Unnecessary database storage usage
- ⚠️ **Maintenance**: Harder to audit and understand policies

## Cleaning Up Duplicates

### Option 1: Automated Cleanup Script (Recommended)

Run the cleanup script to remove all duplicates automatically:

```bash
cd /home/hesham/InsightHub
node scripts/cleanup-casbin-duplicates.js
```

This script will:
- Connect to your database
- Find all duplicate policies
- Keep the oldest entry of each unique policy
- Delete all duplicate entries
- Show before/after statistics

### Option 2: Manual SQL Cleanup

If you prefer to do it manually:

```sql
-- Find duplicates
SELECT ptype, v0, v1, v2, COUNT(*) as count
FROM casbin_rule
GROUP BY ptype, v0, v1, v2
HAVING count > 1;

-- Delete duplicates, keeping the oldest entry
DELETE t1 FROM casbin_rule t1
INNER JOIN casbin_rule t2 
WHERE t1.id > t2.id
  AND t1.ptype = t2.ptype
  AND t1.v0 = t2.v0
  AND COALESCE(t1.v1, '') = COALESCE(t2.v1, '')
  AND COALESCE(t1.v2, '') = COALESCE(t2.v2, '')
  AND COALESCE(t1.v3, '') = COALESCE(t2.v3, '')
  AND COALESCE(t1.v4, '') = COALESCE(t2.v4, '')
  AND COALESCE(t1.v5, '') = COALESCE(t2.v5, '');
```

## Preventing Future Duplicates

### 1. Add Unique Index to Database

Create a unique index to prevent duplicates at the database level:

```sql
-- First, clean existing duplicates
-- Then add unique constraint
ALTER TABLE casbin_rule
ADD UNIQUE INDEX unique_policy (ptype, v0, v1, v2, v3, v4, v5);
```

**Note**: MySQL allows NULL values in unique indexes, so this works even with NULL columns.

### 2. Use Casbin's Built-in Deduplication

The Casbin enforcer has built-in methods that check for existence:

```javascript
// Good: Checks before adding
const added = await enforcer.addPolicy(sub, obj, act);
if (!added) {
  console.log('Policy already exists');
}

// Bad: Forces add without checking
await enforcer.addPolicies([[sub, obj, act]]);
```

### 3. Check Before Adding (Application Level)

In your admin endpoints, always check first:

```javascript
// Check if policy exists before adding
const exists = await casbinService.enforcer.hasPolicy(groupName, 'application', 'access');
if (exists) {
  return res.status(409).json({ error: 'Policy already exists' });
}

// Add policy
const added = await casbinService.enforcer.addPolicy(groupName, 'application', 'access');
```

✅ Your current code in `api.routes.js` already does this for the `/admin/groups/allowed` endpoint!

### 4. Periodic Cleanup Schedule

Set up a cron job or scheduled task:

```bash
# Add to crontab (runs weekly on Sunday at 2 AM)
0 2 * * 0 cd /home/hesham/InsightHub && node scripts/cleanup-casbin-duplicates.js >> /var/log/casbin-cleanup.log 2>&1
```

## Monitoring Duplicates

### Quick Check Query

Run this to see if you have duplicates:

```sql
SELECT 
  COUNT(*) as total_rules,
  COUNT(DISTINCT CONCAT(ptype, v0, COALESCE(v1,''), COALESCE(v2,''), COALESCE(v3,''), COALESCE(v4,''), COALESCE(v5,''))) as unique_rules,
  COUNT(*) - COUNT(DISTINCT CONCAT(ptype, v0, COALESCE(v1,''), COALESCE(v2,''), COALESCE(v3,''), COALESCE(v4,''), COALESCE(v5,''))) as duplicates
FROM casbin_rule;
```

### Node.js Check

```javascript
const [rules] = await connection.query('SELECT * FROM casbin_rule');
const unique = new Set(rules.map(r => 
  `${r.ptype}|${r.v0}|${r.v1}|${r.v2}|${r.v3}|${r.v4}|${r.v5}`
));
console.log(`Total: ${rules.length}, Unique: ${unique.size}, Duplicates: ${rules.length - unique.size}`);
```

## Best Practices

1. **Clean regularly**: Run cleanup script monthly or after major policy changes
2. **Add unique index**: Prevents duplicates at database level (recommended)
3. **Check before add**: Always use `hasPolicy()` before `addPolicy()`
4. **Monitor growth**: Track `casbin_rule` table size
5. **Backup before cleanup**: Always backup before running cleanup operations

## Troubleshooting

### "Cannot add or update a row: a duplicate entry exists"

This means you successfully added the unique index! This is good - it prevents duplicates.

**Solution**: Use `hasPolicy()` to check before adding:

```javascript
if (!(await enforcer.hasPolicy(sub, obj, act))) {
  await enforcer.addPolicy(sub, obj, act);
}
```

### Cleanup script hangs

- Check database connection
- Verify credentials in `.env`
- Ensure no long-running queries are locking the table

### Performance issues after cleanup

- Run `ANALYZE TABLE casbin_rule;` to update table statistics
- Consider adding indexes on frequently queried columns

## Additional Resources

- [Casbin Documentation](https://casbin.org/docs/overview)
- [MySQL Unique Constraints](https://dev.mysql.com/doc/refman/8.0/en/create-index.html)
- [InsightHub Casbin Implementation](./CASBIN_MIGRATION_QUICK_REFERENCE.md)
