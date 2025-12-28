# Git Secrets Removal Guide

## Problem

GitHub detected secrets in your git history and blocked the push:
- Google OAuth Client ID & Secret
- Azure Active Directory Application Secret  
- Files: `server/.env.backup2`, `server/.env.development`, `server/.env.production`

## Quick Fix (Recommended)

### Option 1: Allow Secrets on GitHub (Quick but not recommended)

Click the provided GitHub links to allow each secret:
- https://github.com/heshamahmed-3ddx/google-authz-3ddx/security/secret-scanning/unblock-secret/...

**Note**: This doesn't remove secrets from history, just bypasses the protection.

### Option 2: Remove Secrets from History (Recommended)

#### Step 1: Install git-filter-repo

```bash
brew install git-filter-repo
```

#### Step 2: Run the cleanup script

```bash
./scripts/remove-secrets-from-history.sh
```

Or manually:

```bash
# Remove .env files from all commits
git filter-repo --invert-paths \
  --path server/.env.backup2 \
  --path server/.env.development \
  --path server/.env.production \
  --force
```

#### Step 3: Force push (DESTRUCTIVE - warns all team members first!)

```bash
# Push all branches
git push origin --force --all

# Push all tags
git push origin --force --tags
```

#### Step 4: Rotate All Secrets

⚠️ **CRITICAL**: Change all secrets that were exposed:

1. **Google OAuth Credentials**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Delete old credentials
   - Create new OAuth 2.0 Client ID
   - Update `.env` files with new credentials

2. **Azure AD Application Secret**:
   - Go to: https://portal.azure.com
   - Navigate to App Registrations
   - Generate new client secret
   - Update `.env` files

3. **PowerBI Credentials**:
   - Update any PowerBI service principal credentials
   - Regenerate access tokens if needed

## Alternative: Use GitHub Secret Allowlist

If you want to keep current secrets and just bypass protection:

1. Click each unblock URL provided by GitHub
2. Push again:
   ```bash
   git push origin feature/powerbi-integration
   git push origin v1.2.0
   ```

## Prevent Future Issues

### Update .gitignore

Ensure `.gitignore` includes:

```gitignore
# Environment files
.env
.env.*
*.env
.env.local
.env.development
.env.production
.env.backup*

# Except example files
!.env.example
!.env.template
```

### Use .env.example Template

Create `.env.example` with placeholder values:

```bash
# server/.env.example
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
AZURE_CLIENT_SECRET=your_azure_client_secret_here
```

### Pre-commit Hook

Install a pre-commit hook to prevent committing secrets:

```bash
# Install git-secrets
brew install git-secrets

# Initialize git-secrets
git secrets --install
git secrets --register-aws
git secrets --add 'GOOGLE_CLIENT_ID=.*'
git secrets --add 'GOOGLE_CLIENT_SECRET=.*'
git secrets --add 'AZURE_CLIENT_SECRET=.*'
```

## Post-Cleanup Verification

After cleaning history, verify secrets are removed:

```bash
# Check for .env files in history
git log --all --full-history -- "server/.env*"

# Should return: "no matching files"

# Search for secret patterns
git log --all -S "GOOGLE_CLIENT_SECRET" --source --all
```

## Team Communication

If you clean git history, notify all team members:

```
⚠️ IMPORTANT: Git history has been rewritten

All team members must:
1. Save any uncommitted changes
2. Delete their local repository
3. Clone the repository fresh:
   git clone git@github.com:heshamahmed-3ddx/google-authz-3ddx.git

DO NOT try to pull or merge - you will get conflicts!
```

## Emergency Rollback

If something goes wrong:

```bash
# If you have a backup
git clone /path/to/backup

# Or reset to remote state
git fetch origin
git reset --hard origin/main
```

## Summary of Commands

```bash
# 1. Install tool
brew install git-filter-repo

# 2. Remove secrets from history
git filter-repo --invert-paths \
  --path server/.env.backup2 \
  --path server/.env.development \
  --path server/.env.production \
  --force

# 3. Force push
git push origin --force --all
git push origin --force --tags

# 4. Rotate all secrets in .env files

# 5. Verify
git log --all --full-history -- "server/.env*"
```

---

**Important**: Once secrets are in git history, they should be considered compromised. Always rotate them even after removal.
