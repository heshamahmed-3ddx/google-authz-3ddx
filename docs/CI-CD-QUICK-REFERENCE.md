# CI/CD Quick Reference

## Decision Logic Cheat Sheet

### Branch → Environment
```
main              → production (requires approval)
staging           → staging
develop           → dev
feature/*         → dev
bugfix/*          → dev
hotfix/*          → dev
```

### Commit Type → Deploy?
```
✅ DEPLOY:
feat:     - New feature
fix:      - Bug fix
hotfix:   - Critical fix
perf:     - Performance improvement
build:    - Build system changes

❌ SKIP DEPLOY:
docs:     - Documentation only
chore:    - Maintenance
style:    - Formatting
test:     - Test updates
refactor: - Code restructuring
ci:       - CI configuration
```

## Common Commands

### Test Decision Logic Locally
```bash
# Run decision script
./scripts/ci-deployment-decision.sh

# Check specific branch
git checkout feature/CR-123
./scripts/ci-deployment-decision.sh
```

### Commit Message Templates
```bash
# Feature
git commit -m "feat(module): add new functionality"

# Bug fix
git commit -m "fix(component): resolve issue description"

# Hotfix
git commit -m "hotfix(critical): patch security vulnerability"

# Docs (no deploy)
git commit -m "docs(readme): update setup instructions"
```

## Required GitHub Secrets

### Development
- `DEV_SERVER_HOST`
- `DEV_SERVER_USER`
- `DEV_SSH_KEY`
- `DEV_DB_CONNECTION_STRING`

### Staging
- `STAGING_SERVER_HOST`
- `STAGING_SERVER_USER`
- `STAGING_SSH_KEY`
- `STAGING_DB_CONNECTION_STRING`

### Production
- `PROD_SERVER_HOST`
- `PROD_SERVER_USER`
- `PROD_SSH_KEY`
- `PROD_DB_CONNECTION_STRING`

## Approval Requirements

| Environment | Reviewers | Wait Time |
|------------|-----------|-----------|
| dev | 0 | 0 min |
| staging | 1 (optional) | 5 min |
| production | 2 (required) | 10 min |

## Emergency Procedures

### Hotfix to Production
1. Create hotfix branch from `main`
2. Commit with `hotfix:` prefix
3. Fast-track PR review (2 approvers)
4. Manual approval in pipeline
5. Deploy immediately

### Rollback Production
1. Go to Actions > Rollback Deployment
2. Click "Run workflow"
3. Select environment: `production`
4. Enter version tag to rollback to
5. Approve deployment

### Skip CI/CD (Emergency Only)
Add to commit message:
```
[skip ci]
```

## Monitoring URLs

- Dev: https://dev.insighthub.example.com/health
- Staging: https://staging.insighthub.example.com/health
- Production: https://insighthub.example.com/health

## Support Contacts

- DevOps Team: #devops-support
- On-call: +1-XXX-XXX-XXXX
- Escalation: devops-lead@example.com
