# Release Process Guide

This document outlines the process for creating and managing releases for InsightHub.

## Version Numbering

We follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

Current version: **1.1.0**

## Release Checklist

### 1. Pre-Release Testing

Before creating a release, ensure all tests pass:

```bash
# Run unit & integration tests
cd tests && npm test

# Run E2E tests
cd tests && npm run test:e2e

# Check for linting issues
npm run lint
```

### 2. Update Version Numbers

Update version in all `package.json` files:

```bash
# Root package.json
# server/package.json
# client/package.json
# tests/package.json
```

### 3. Update CHANGELOG.md

Add release notes to `CHANGELOG.md`:

```markdown
## [1.2.0] - 2025-12-28
### Added
- PowerBI reporting integration
- E2E test suite with Playwright
- Pre-deployment testing guide

### Fixed
- Integration test port configuration
- E2E test wait strategies

### Changed
- Updated test suite to handle dynamic content
```

### 4. Commit Changes

```bash
git add .
git commit -m "chore: bump version to 1.2.0"
```

### 5. Create Git Tag

Create an annotated tag for the release:

```bash
# Create annotated tag
git tag -a v1.2.0 -m "Release version 1.2.0

Features:
- PowerBI reporting integration
- Enhanced E2E testing
- Pre-deployment testing guide

Bug Fixes:
- Fixed integration test configuration
- Improved E2E test reliability"

# Verify tag was created
git tag -l
git show v1.2.0
```

### 6. Push to Remote

Push commits and tags to remote repository:

```bash
# Push commits
git push origin feature/powerbi-integration

# Push tags
git push origin v1.2.0

# Or push all tags at once
git push origin --tags
```

## Release Tag Commands

### Create a New Release Tag

```bash
# For a minor version (new features)
git tag -a v1.2.0 -m "Release v1.2.0 - PowerBI Integration"

# For a patch version (bug fixes)
git tag -a v1.1.1 -m "Release v1.1.1 - Bug Fixes"

# For a major version (breaking changes)
git tag -a v2.0.0 -m "Release v2.0.0 - Major Redesign"
```

### List All Tags

```bash
# List all tags
git tag

# List tags with pattern
git tag -l "v1.*"

# Show tag details
git show v1.2.0
```

### Delete a Tag

```bash
# Delete local tag
git tag -d v1.2.0

# Delete remote tag
git push origin --delete v1.2.0
```

### Checkout a Specific Release

```bash
# Checkout a specific tag
git checkout v1.2.0

# Create a branch from a tag
git checkout -b hotfix/1.2.1 v1.2.0
```

## Automated Release Script

Create a release script for automation:

```bash
#!/bin/bash
# scripts/release.sh

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/release.sh <version>"
  echo "Example: ./scripts/release.sh 1.2.0"
  exit 1
fi

echo "🚀 Creating release v$VERSION"

# Run tests
echo "📋 Running tests..."
cd tests && npm test && npm run test:e2e && cd ..

# Update version in package.json files
echo "📝 Updating version numbers..."
npm version $VERSION --no-git-tag-version
cd server && npm version $VERSION --no-git-tag-version && cd ..
cd client && npm version $VERSION --no-git-tag-version && cd ..
cd tests && npm version $VERSION --no-git-tag-version && cd ..

# Commit changes
echo "💾 Committing changes..."
git add .
git commit -m "chore: bump version to $VERSION"

# Create tag
echo "🏷️  Creating tag v$VERSION..."
git tag -a "v$VERSION" -m "Release version $VERSION"

# Push
echo "⬆️  Pushing to remote..."
git push origin $(git branch --show-current)
git push origin "v$VERSION"

echo "✅ Release v$VERSION created successfully!"
echo ""
echo "Next steps:"
echo "1. Create a release on GitHub: https://github.com/swd-3ddx/InsightHub/releases/new?tag=v$VERSION"
echo "2. Add release notes from CHANGELOG.md"
echo "3. Attach build artifacts if needed"
```

Make it executable:

```bash
chmod +x scripts/release.sh
```

## GitHub Release

After pushing the tag, create a GitHub Release:

1. Go to: https://github.com/swd-3ddx/InsightHub/releases/new
2. Select the tag (e.g., `v1.2.0`)
3. Set release title (e.g., "Release 1.2.0 - PowerBI Integration")
4. Add release notes from CHANGELOG.md
5. Attach build artifacts (optional)
6. Click "Publish release"

## Hotfix Process

For urgent bug fixes:

```bash
# Create hotfix branch from the release tag
git checkout -b hotfix/1.2.1 v1.2.0

# Make fixes
# ... fix bugs ...

# Test
cd tests && npm test

# Update version (patch)
# Update CHANGELOG.md

# Commit and tag
git add .
git commit -m "fix: critical bug fix"
git tag -a v1.2.1 -m "Hotfix 1.2.1 - Critical Bug Fix"

# Push
git push origin hotfix/1.2.1
git push origin v1.2.1

# Merge back to main and develop
git checkout main
git merge hotfix/1.2.1
git push origin main

git checkout develop
git merge hotfix/1.2.1
git push origin develop
```

## Version History

Track all releases:

```bash
# View all releases
git tag -l -n9

# View releases with dates
git log --tags --simplify-by-decoration --pretty="format:%ci %d"

# View changes between releases
git log v1.1.0..v1.2.0 --oneline
```

## Rollback Process

If a release has issues:

```bash
# Rollback to previous version
git checkout v1.1.0

# Or create a revert release
git revert <commit-hash>
git tag -a v1.2.1 -m "Revert changes from v1.2.0"
```

## Release Artifacts

Consider including these in releases:

- Built client bundle (`client/dist/`)
- Server build (if applicable)
- Database migration scripts
- Configuration templates
- Documentation PDFs

## Best Practices

1. **Always test before tagging** - Run full test suite
2. **Use annotated tags** - Include release notes in tag message
3. **Follow semantic versioning** - Be consistent with version numbers
4. **Document changes** - Keep CHANGELOG.md up to date
5. **Sign tags** - Use GPG signing for security: `git tag -s v1.2.0`
6. **Backup before major releases** - Create database backups
7. **Communicate releases** - Notify team members
8. **Archive old releases** - Keep release history for reference

## Example Release Flow

```bash
# 1. Feature development
git checkout -b feature/new-feature
# ... develop feature ...
git commit -m "feat: add new feature"

# 2. Merge to develop
git checkout develop
git merge feature/new-feature

# 3. Run tests
cd tests && npm test && npm run test:e2e

# 4. Update version and changelog
# Edit package.json: "version": "1.2.0"
# Edit CHANGELOG.md

# 5. Commit version bump
git add .
git commit -m "chore: bump version to 1.2.0"

# 6. Create release tag
git tag -a v1.2.0 -m "Release 1.2.0 - New Features"

# 7. Push everything
git push origin develop
git push origin v1.2.0

# 8. Create GitHub release
# Visit GitHub and create release from tag
```

---

**Last Updated**: December 28, 2025  
**Current Version**: 1.1.0  
**Next Release**: 1.2.0 (planned)
