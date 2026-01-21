# Database Migrations - README

Version-controlled database schema management for InsightHub using Knex.js.

## 🎯 Quick Links

- **📖 [Complete Guide](./DATABASE_MIGRATIONS.md)** - Comprehensive documentation
- **⚡ [Quick Reference](./DATABASE_MIGRATIONS_QUICK_REFERENCE.md)** - One-page command reference  
- **📋 [Implementation Summary](./DATABASE_MIGRATIONS_IMPLEMENTATION.md)** - What was built

## 🚀 Get Started in 30 Seconds

```bash
# Check current migration status
npm run migrate:status

# Apply any pending migrations
npm run migrate:latest

# Create a new migration
npm run migrate:make add_my_feature
```

## ✨ What You Can Do

### Run Migrations
```bash
npm run migrate:latest        # Apply all pending
npm run migrate:up            # Apply next one
```

### Check Status
```bash
npm run migrate:status        # See completed/pending
npm run migrate:list          # List all migrations
```

### Create Migrations
```bash
npm run migrate:make create_users_table
npm run migrate:make add_email_column
```

### Rollback (Dev Only)
```bash
npm run migrate:rollback      # Undo last batch
npm run migrate:down          # Undo specific migration
```

## 📂 Where Everything Lives

```
InsightHub/
├── knexfile.js                    # Configuration
├── database/
│   └── migrations/                # All migration files here
└── docs/
    ├── DATABASE_MIGRATIONS.md              # 📖 Full guide
    ├── DATABASE_MIGRATIONS_QUICK_REFERENCE.md  # ⚡ Quick ref
    └── DATABASE_MIGRATIONS_IMPLEMENTATION.md   # 📋 Summary
```

## ⚡ Common Tasks

### I need to add a new table
```bash
npm run migrate:make create_my_table
# Edit: database/migrations/TIMESTAMP_create_my_table.cjs
npm run migrate:latest
```

### I need to add a column
```bash
npm run migrate:make add_column_to_table
# Edit the migration file
npm run migrate:latest
```

### I want to see what's been applied
```bash
npm run migrate:status
```

### Deployment to production
```bash
NODE_ENV=production npm run migrate:latest
```

## ⚠️ Important Notes

1. **Rollbacks don't work in production** (user lacks DROP permissions)
2. Use **forward-only migrations** to fix issues
3. Always **test locally** first
4. **Backup production** before migrating
5. Migrations use **`.cjs`** extension (CommonJS)

## 📚 Documentation

Choose your learning style:

| Document | Best For | Time |
|----------|----------|------|
| [Quick Reference](./DATABASE_MIGRATIONS_QUICK_REFERENCE.md) | Quick lookups, commands | 2 min |
| [Complete Guide](./DATABASE_MIGRATIONS.md) | Deep understanding, patterns | 20 min |
| [Implementation Summary](./DATABASE_MIGRATIONS_IMPLEMENTATION.md) | What was built, why | 10 min |

## 🎓 Learn More

- [Knex.js Documentation](https://knexjs.org/)
- [Schema Builder API](https://knexjs.org/guide/schema-builder.html)
- [Migration Guide](https://knexjs.org/guide/migrations.html)

## 🆘 Need Help?

1. Check [DATABASE_MIGRATIONS.md](./DATABASE_MIGRATIONS.md) troubleshooting section
2. Run `npm run migrate:status` to see current state
3. Review migration files in `database/migrations/`
4. Check server logs for errors
5. Contact development team

## ✅ System Status

```bash
npm run migrate:status
```

Current migrations:
- ✅ Casbin RBAC tables (policies, users)
- ✅ Report access logs (audit trail)

---

**Version:** 1.0.0  
**Last Updated:** January 21, 2026  
**Maintained by:** InsightHub Development Team
