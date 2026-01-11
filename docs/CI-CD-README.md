# CI/CD System

Enterprise-grade continuous integration and deployment system with automatic environment routing and intelligent deployment decisions.

## 🚀 Quick Start

### Run Decision Logic (Local)
```bash
./scripts/ci-deployment-decision.sh
```

### Run Test Suite
```bash
./scripts/test-ci-decision.sh
```

### Check Pipeline Status
Visit: https://github.com/swd-3ddx/InsightHub/actions

## 📋 Documentation Index

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [CI-CD-QUICK-REFERENCE.md](CI-CD-QUICK-REFERENCE.md) | Quick reference cheat sheet | 2 min |
| [CI-CD-FLOW-DIAGRAM.md](CI-CD-FLOW-DIAGRAM.md) | Visual flow diagrams | 5 min |
| [CI-CD-IMPLEMENTATION-SUMMARY.md](CI-CD-IMPLEMENTATION-SUMMARY.md) | Delivery summary | 10 min |
| [CI-CD-IMPLEMENTATION.md](CI-CD-IMPLEMENTATION.md) | Complete implementation guide | 30 min |

## 🎯 How It Works

### 1. You Push Code
```bash
git commit -m "feat(dashboard): add analytics"
git push origin feature/CR-123
```

### 2. Pipeline Decides Automatically
- Reads branch name: `feature/CR-123` → **dev environment**
- Reads commit type: `feat` → **deploy**
- Checks approval: feature branch → **no approval needed**

### 3. Deployment Happens
- Runs quality gates (lint, test, security)
- Builds artifacts
- Deploys to development environment
- Runs health checks
- Notifies team

## 🌍 Environments

| Environment | Branch | URL | Approval |
|------------|--------|-----|----------|
| **Development** | develop, feature/*, bugfix/*, hotfix/* | https://dev.insighthub.example.com | None |
| **Staging** | staging | https://staging.insighthub.example.com | Hotfix only |
| **Production** | main | https://insighthub.example.com | Always (2 reviewers) |

## 📝 Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

### Types That Deploy
- `feat:` - New features
- `fix:` - Bug fixes
- `hotfix:` - Critical fixes
- `perf:` - Performance improvements
- `build:` - Build system changes

### Types That Skip Deployment
- `docs:` - Documentation only
- `chore:` - Maintenance tasks
- `style:` - Code formatting
- `test:` - Test updates
- `refactor:` - Code restructuring
- `ci:` - CI configuration

## 🔐 Security

- ✅ No credentials in code
- ✅ Environment-specific secrets
- ✅ Manual approval gates
- ✅ Branch protection rules
- ✅ Audit logging
- ✅ Rollback capability

## 🧪 Testing

### Test Decision Logic
```bash
# Test with current git state
./scripts/ci-deployment-decision.sh

# Run comprehensive test suite
./scripts/test-ci-decision.sh

# Test specific scenario
git checkout -b feature/test
git commit -m "feat(test): testing deployment"
./scripts/ci-deployment-decision.sh
```

## 📊 Pipeline Jobs

1. **Decision** - Determines deployment strategy
2. **Quality** - Runs linting, tests, security audits
3. **Build** - Compiles artifacts for deployment
4. **Deploy** - Environment-specific deployment
5. **Monitor** - Post-deployment health checks

## 🆘 Common Tasks

### Deploy to Development
```bash
git checkout -b feature/my-feature
git commit -m "feat(component): add feature"
git push origin feature/my-feature
# Auto-deploys to dev
```

### Deploy to Staging
```bash
git checkout staging
git merge feature/my-feature
git push origin staging
# Auto-deploys to staging
```

### Deploy to Production
```bash
git checkout main
git merge staging
git push origin main
# Waits for manual approval
# Then deploys to production
```

### Skip Deployment
```bash
git commit -m "docs(readme): update documentation"
git push
# Quality gates run, but no deployment
```

## 🔧 Configuration

### GitHub Secrets Required

**Development:**
- `DEV_SERVER_HOST`
- `DEV_SERVER_USER`
- `DEV_SSH_KEY`
- `DEV_DB_CONNECTION_STRING`

**Staging:**
- `STAGING_SERVER_HOST`
- `STAGING_SERVER_USER`
- `STAGING_SSH_KEY`
- `STAGING_DB_CONNECTION_STRING`

**Production:**
- `PROD_SERVER_HOST`
- `PROD_SERVER_USER`
- `PROD_SSH_KEY`
- `PROD_DB_CONNECTION_STRING`

### GitHub Environments Setup

1. Go to: `Settings > Environments`
2. Create: `development`, `staging`, `production`
3. Configure protection rules (see [CI-CD-IMPLEMENTATION.md](CI-CD-IMPLEMENTATION.md))

### Branch Protection Rules

1. Go to: `Settings > Branches`
2. Add protection for: `main`, `staging`, `develop`
3. Configure rules (see [CI-CD-IMPLEMENTATION.md](CI-CD-IMPLEMENTATION.md))

## 📈 Monitoring

### Health Check Endpoints
- Dev: https://dev.insighthub.example.com/health
- Staging: https://staging.insighthub.example.com/health
- Production: https://insighthub.example.com/health

### Pipeline Status
- GitHub Actions: https://github.com/swd-3ddx/InsightHub/actions
- View logs, artifacts, and deployment history

## 🚨 Emergency Procedures

### Rollback Production
1. Go to Actions > Rollback Deployment
2. Select environment: `production`
3. Enter version/tag to rollback to
4. Approve deployment

### Hotfix to Production
1. Create hotfix branch from `main`
2. Commit with `hotfix:` prefix
3. Fast-track PR review (2 approvers)
4. Approve in pipeline
5. Deploy immediately

### Pause Deployments
Add `[skip ci]` to commit message:
```bash
git commit -m "[skip ci] emergency: pause deployments"
```

## 📞 Support

- Documentation: See files in this directory
- Pipeline Issues: Check GitHub Actions logs
- Questions: Contact DevOps team
- Emergency: Use #devops-alerts channel

## 🎓 Learning Resources

1. **Quick Start**: Read [CI-CD-QUICK-REFERENCE.md](CI-CD-QUICK-REFERENCE.md) (2 min)
2. **Visual Guide**: Check [CI-CD-FLOW-DIAGRAM.md](CI-CD-FLOW-DIAGRAM.md) (5 min)
3. **Deep Dive**: Study [CI-CD-IMPLEMENTATION.md](CI-CD-IMPLEMENTATION.md) (30 min)
4. **Try It**: Run `./scripts/test-ci-decision.sh`

## 📜 Version History

- **v1.0.0** (Jan 11, 2026) - Initial enterprise CI/CD implementation
  - Automatic deployment decision logic
  - Environment-based routing
  - Approval gates for production
  - Comprehensive documentation

---

**Status:** ✅ Production Ready  
**Last Updated:** January 11, 2026  
**Maintained by:** DevOps Team
