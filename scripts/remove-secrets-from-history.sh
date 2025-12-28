#!/bin/bash
# scripts/remove-secrets-from-history.sh
# Remove sensitive .env files from git history

set -e

echo "🔒 Removing secrets from git history..."
echo ""
echo "⚠️  WARNING: This will rewrite git history!"
echo "⚠️  Make sure you have a backup of your repository!"
echo ""
read -p "Continue? (type 'yes' to proceed): " -r
if [[ ! $REPLY == "yes" ]]; then
  echo "❌ Cancelled"
  exit 1
fi

echo ""
echo "📋 Files to remove from history:"
echo "  - server/.env.backup2"
echo "  - server/.env.development"
echo "  - server/.env.production"
echo ""

# Use git filter-repo (recommended) or BFG Repo-Cleaner
# First, check if git-filter-repo is available
if command -v git-filter-repo &> /dev/null; then
  echo "✅ Using git-filter-repo (recommended method)"
  
  # Remove the files from all commits
  git filter-repo --invert-paths \
    --path server/.env.backup2 \
    --path server/.env.development \
    --path server/.env.production \
    --force
    
  echo "✅ Files removed from history"
  
elif command -v bfg &> /dev/null; then
  echo "✅ Using BFG Repo-Cleaner"
  
  # Create a file with patterns to remove
  echo "server/.env.backup2" > /tmp/files-to-remove.txt
  echo "server/.env.development" >> /tmp/files-to-remove.txt
  echo "server/.env.production" >> /tmp/files-to-remove.txt
  
  bfg --delete-files /tmp/files-to-remove.txt
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  
  echo "✅ Files removed from history"
  
else
  echo "❌ Neither git-filter-repo nor BFG is installed"
  echo ""
  echo "Please install one of these tools:"
  echo ""
  echo "Option 1 - git-filter-repo (recommended):"
  echo "  brew install git-filter-repo"
  echo ""
  echo "Option 2 - BFG Repo-Cleaner:"
  echo "  brew install bfg"
  echo ""
  exit 1
fi

echo ""
echo "✅ Git history cleaned!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 🔍 Verify .env files are removed:"
echo "   git log --all --full-history -- 'server/.env*'"
echo ""
echo "2. ⬆️  Force push to remote (DESTRUCTIVE):"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "3. 🔄 All collaborators must re-clone the repository!"
echo ""
echo "4. 🔐 Rotate all exposed secrets:"
echo "   - Google OAuth Client ID & Secret"
echo "   - Azure AD Application Secret"
echo "   - PowerBI credentials"
echo "   - Any other secrets in the .env files"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
