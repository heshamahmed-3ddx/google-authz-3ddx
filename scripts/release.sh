#!/bin/bash
# scripts/release.sh
# Automated release script for InsightHub

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "❌ Error: Version number required"
  echo ""
  echo "Usage: ./scripts/release.sh <version>"
  echo "Example: ./scripts/release.sh 1.2.0"
  echo ""
  echo "Version format: MAJOR.MINOR.PATCH"
  echo "  - MAJOR: Breaking changes (e.g., 2.0.0)"
  echo "  - MINOR: New features (e.g., 1.2.0)"
  echo "  - PATCH: Bug fixes (e.g., 1.1.1)"
  exit 1
fi

echo "🚀 Creating release v$VERSION for InsightHub"
echo ""

# Confirm with user
read -p "This will create a new release v$VERSION. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Release cancelled"
  exit 1
fi

# Run tests
echo "📋 Running test suite..."
cd tests
if npm test; then
  echo "✅ Unit/Integration tests passed"
else
  echo "❌ Tests failed - aborting release"
  exit 1
fi

echo ""
echo "📋 Running E2E tests..."
if npm run test:e2e; then
  echo "✅ E2E tests passed"
else
  echo "❌ E2E tests failed - aborting release"
  exit 1
fi
cd ..

# Update version in package.json files
echo ""
echo "📝 Updating version numbers..."
npm version $VERSION --no-git-tag-version
cd server && npm version $VERSION --no-git-tag-version && cd ..
cd client && npm version $VERSION --no-git-tag-version && cd ..
cd tests && npm version $VERSION --no-git-tag-version && cd ..
echo "✅ Version updated to $VERSION in all package.json files"

# Prompt for changelog entry
echo ""
echo "📝 Please update CHANGELOG.md with release notes"
echo "   Press ENTER when done..."
read

# Check if CHANGELOG was updated
if ! git diff --quiet CHANGELOG.md; then
  echo "✅ CHANGELOG.md updated"
else
  echo "⚠️  Warning: CHANGELOG.md not modified"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Release cancelled"
    exit 1
  fi
fi

# Commit changes
echo ""
echo "💾 Committing version bump..."
git add .
git commit -m "chore: bump version to $VERSION"
echo "✅ Changes committed"

# Create annotated tag
echo ""
echo "🏷️  Creating annotated tag v$VERSION..."
git tag -a "v$VERSION" -m "Release version $VERSION

See CHANGELOG.md for details"
echo "✅ Tag v$VERSION created"

# Get current branch
BRANCH=$(git branch --show-current)

# Push to remote
echo ""
read -p "Push to remote (branch: $BRANCH, tag: v$VERSION)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "⬆️  Pushing to remote..."
  git push origin "$BRANCH"
  git push origin "v$VERSION"
  echo "✅ Pushed to remote"
else
  echo "⚠️  Skipped push - you can push manually later:"
  echo "   git push origin $BRANCH"
  echo "   git push origin v$VERSION"
fi

echo ""
echo "✅ Release v$VERSION created successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 🌐 Create GitHub Release:"
echo "   https://github.com/swd-3ddx/InsightHub/releases/new?tag=v$VERSION"
echo ""
echo "2. 📝 Add release notes from CHANGELOG.md"
echo ""
echo "3. 📦 Attach build artifacts (optional):"
echo "   - client/dist/ (frontend bundle)"
echo "   - server/ (backend build)"
echo "   - migrations/ (database scripts)"
echo ""
echo "4. 🚀 Deploy to production (if applicable)"
echo ""
echo "5. 📢 Announce release to team"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
