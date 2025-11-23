# Casbin Database Migration - Quick Reference

## 🚀 Quick Start (5 Steps)

### 1. Create Tables
```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < database/casbin_schema.sql
```

### 2. Backup Files
```bash
mkdir -p backups/casbin
cp server/src/config/casbin/policy.csv backups/casbin/policy.csv.backup
cp server/src/config/casbin/users.json backups/casbin/users.json.backup
```

### 3. Run Migration
```bash
cd server
node scripts/migrate-casbin-to-database.js
```

### 4. Enable Database Mode
Add to `server/.env`:
```bash
STORAGE_TYPE=database
```

### 5. Restart Server
```bash
npm start
```

---

## ✅ Verification Commands

### Check Tables Exist
```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> -e "SHOW TABLES LIKE 'casbin%';"
```

### Check Data Migrated
```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> -e "SELECT COUNT(*) FROM casbin_rule;"
```

### Check Server Logs
Look for: `✅ Casbin enforcer initialized with MySQL adapter`

---

## 🔄 Rollback

Set in `.env`:
```bash
STORAGE_TYPE=file
```

---

## 📋 Full Guide

See `docs/CASBIN_MIGRATION_STEPS.md` for detailed instructions.

