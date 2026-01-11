# Enterprise CI/CD Implementation Guide

## Overview

This document describes the enterprise-grade CI/CD pipeline implementation with automatic deployment decision logic based on branch names and commit message types.

## Architecture

### Decision Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CI/CD DECISION ENGINE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. Read Branch Name                                                 │
│     ├─ main          → Production                                    │
│     ├─ staging       → Staging                                       │
│     ├─ develop       → Development                                   │
│     ├─ feature/*     → Development                                   │
│     ├─ bugfix/*      → Development                                   │
│     └─ hotfix/*      → Development                                   │
│                                                                       │
│  2. Read Latest Commit Message                                       │
│     └─ Extract type from Conventional Commits format                 │
│                                                                       │
│  3. Determine Deployment Behavior                                    │
│     ├─ feat, fix, hotfix  → Deploy                                   │
│     └─ docs, chore, style → Skip Deployment                          │
│                                                                       │
│  4. Check Approval Requirements                                      │
│     ├─ Production      → ⚠️  Requires Manual Approval                │
│     ├─ Staging/Hotfix  → ⚠️  Requires Manual Approval                │
│     └─ Development     → ✅ Auto-deploy                              │
│                                                                       │
│  5. Export Decision Variables                                        │
│     ├─ DEPLOY_ENV                                                    │
│     ├─ SKIP_DEPLOY                                                   │
│     ├─ COMMIT_TYPE                                                   │
│     ├─ REQUIRES_APPROVAL                                             │
│     └─ DEPLOYMENT_LABEL                                              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Decision Logic Script

**Location:** `scripts/ci-deployment-decision.sh`

**Purpose:** Automated decision engine that determines:
- Target deployment environment
- Whether to skip deployment
- Whether manual approval is required
- Deployment metadata for logging

**Key Functions:**

```bash
get_branch_name()          # Detects branch in CI/local environments
get_commit_message()       # Retrieves latest commit message
extract_commit_type()      # Parses Conventional Commits format
should_skip_deployment()   # Checks if commit type is non-deployable
determine_environment()    # Maps branch to environment
requires_manual_approval() # Determines if approval gate is needed
```

**Usage:**

```bash
# Source and execute
source ./scripts/ci-deployment-decision.sh
make_deployment_decision

# Exported variables:
# - DEPLOY_ENV (dev|staging|production)
# - SKIP_DEPLOY (true|false)
# - COMMIT_TYPE (feat|fix|docs|chore|hotfix|etc)
# - REQUIRES_APPROVAL (true|false)
# - DEPLOYMENT_LABEL (human-readable description)
```

### 2. GitHub Actions Pipeline

**Location:** `.github/workflows/ci-cd-pipeline.yml`

**Jobs:**

1. **Decision** - Runs decision logic, exports variables
2. **Quality Gates** - Linting, testing, security audits
3. **Build** - Compiles client and server artifacts
4. **Deploy Dev** - Auto-deploys to development
5. **Deploy Staging** - Auto-deploys to staging
6. **Deploy Production** - Deploys to production with manual approval
7. **Monitor** - Post-deployment health checks and monitoring

## Branch → Environment Mapping

| Branch Pattern | Environment | Auto-Deploy | Requires Approval |
|---------------|-------------|-------------|-------------------|
| `main` | production | No | ✅ Yes |
| `staging` | staging | Yes | No* |
| `develop` | dev | Yes | No |
| `feature/*` | dev | Yes | No |
| `bugfix/*` | dev | Yes | No |
| `hotfix/*` | dev | Yes | No |

*Hotfixes to staging require approval

## Commit Type → Behavior Mapping

| Commit Type | Deployable | Description |
|------------|-----------|-------------|
| `feat:` | ✅ Yes | New feature (change request) |
| `fix:` | ✅ Yes | Bug fix |
| `hotfix:` | ✅ Yes | Critical production fix |
| `docs:` | ❌ No | Documentation only |
| `chore:` | ❌ No | Maintenance tasks |
| `style:` | ❌ No | Code formatting |
| `test:` | ❌ No | Test updates |
| `refactor:` | ❌ No | Code restructuring |

## Conventional Commits Format

Expected format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**

```bash
# Feature (deploys)
feat(auth): add SSO authentication support

# Bug fix (deploys)
fix(api): resolve memory leak in user service

# Hotfix (deploys with approval)
hotfix(database): fix critical data corruption issue

# Documentation (skips deployment)
docs(readme): update installation instructions

# Chore (skips deployment)
chore(deps): update dependencies to latest versions
```

## Security Configuration

### GitHub Secrets Setup

Navigate to: `Settings > Secrets and variables > Actions > New repository secret`

#### Development Environment
```
DEV_SERVER_HOST=dev.insighthub.example.com
DEV_SERVER_USER=deploy-user
DEV_SSH_KEY=<private-key-content>
DEV_DB_CONNECTION_STRING=postgresql://user:pass@host:5432/db_dev
```

#### Staging Environment
```
STAGING_SERVER_HOST=staging.insighthub.example.com
STAGING_SERVER_USER=deploy-user
STAGING_SSH_KEY=<private-key-content>
STAGING_DB_CONNECTION_STRING=postgresql://user:pass@host:5432/db_staging
```

#### Production Environment
```
PROD_SERVER_HOST=insighthub.example.com
PROD_SERVER_USER=deploy-user
PROD_SSH_KEY=<private-key-content>
PROD_DB_CONNECTION_STRING=postgresql://user:pass@host:5432/db_prod
```

### GitHub Environment Protection Rules

#### Development Environment
- No protection rules needed
- Auto-deploy enabled

#### Staging Environment
- Optional: Wait timer (5 minutes)
- Optional: Required reviewers (1 developer)

#### Production Environment
- **Required reviewers:** Minimum 2 (DevOps + Tech Lead)
- **Wait timer:** 10 minutes
- **Branch restrictions:** Only `main` can deploy
- **Deployment branches:** `main` only

**Setup:** `Settings > Environments > New environment`

### Branch Protection Rules

#### Main Branch
```
Settings > Branches > Add branch protection rule

Branch name pattern: main

☑ Require a pull request before merging
  ☑ Require approvals: 2
  ☑ Dismiss stale pull request approvals
  ☑ Require review from Code Owners

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date
  - quality (quality gates job)
  - build (build job)

☑ Require conversation resolution before merging
☑ Do not allow bypassing the above settings
```

#### Staging Branch
```
Branch name pattern: staging

☑ Require a pull request before merging
  ☑ Require approvals: 1

☑ Require status checks to pass before merging
  - quality
```

#### Develop Branch
```
Branch name pattern: develop

☑ Require a pull request before merging
  ☑ Require approvals: 1

☑ Require status checks to pass before merging
  - quality
```

## Workflow Examples

### Scenario 1: New Feature Development

```bash
# Developer creates feature branch
git checkout -b feature/CR-1234-add-user-dashboard

# Makes changes and commits
git commit -m "feat(dashboard): add user analytics dashboard"

# Pushes to remote
git push origin feature/CR-1234-add-user-dashboard

# CI/CD Decision:
# ✅ Branch: feature/CR-1234-add-user-dashboard → dev environment
# ✅ Commit: feat → deploy
# ✅ Auto-deploy to development
```

### Scenario 2: Documentation Update

```bash
# Developer updates docs
git checkout -b feature/CR-1235-update-docs

git commit -m "docs(api): update API documentation with new endpoints"

git push origin feature/CR-1235-update-docs

# CI/CD Decision:
# ✅ Branch: feature/CR-1235-update-docs → dev environment
# ❌ Commit: docs → SKIP deployment
# ✅ Quality gates run, but no deployment occurs
```

### Scenario 3: Bug Fix to Staging

```bash
# Developer fixes bug
git checkout staging
git checkout -b bugfix/BF-456-fix-login-issue

git commit -m "fix(auth): resolve login redirect loop"

# Merge to staging via PR
git push origin bugfix/BF-456-fix-login-issue
# ... PR merged to staging ...

# CI/CD Decision:
# ✅ Branch: staging → staging environment
# ✅ Commit: fix → deploy
# ✅ Auto-deploy to staging
```

### Scenario 4: Production Release

```bash
# Staging is tested and ready
git checkout main
git merge staging --no-ff -m "feat(release): v2.1.0 release"

git push origin main

# CI/CD Decision:
# ✅ Branch: main → production environment
# ✅ Commit: feat → deploy
# ⚠️  Requires manual approval
# ⏸️  Pipeline waits for approval from 2 reviewers
# ✅ After approval, deploys to production
```

### Scenario 5: Hotfix to Production

```bash
# Critical issue in production
git checkout main
git checkout -b hotfix/BF-789-critical-security-fix

git commit -m "hotfix(security): patch XSS vulnerability"

# Fast-track merge to main
git checkout main
git merge hotfix/BF-789-critical-security-fix --no-ff
git push origin main

# CI/CD Decision:
# ✅ Branch: main → production environment
# ✅ Commit: hotfix → deploy
# ⚠️  Requires manual approval (expedited review)
# ✅ Deploy to production after approval
```

## Extending the Pipeline

### Adding a New Environment

1. **Update decision script:**

```bash
# In scripts/ci-deployment-decision.sh
readonly QA_BRANCH="qa"

determine_environment() {
    local branch="$1"
    
    case "${branch}" in
        "${QA_BRANCH}")
            env="qa"
            ;;
        # ... existing cases ...
    esac
}
```

2. **Add deployment job:**

```yaml
# In .github/workflows/ci-cd-pipeline.yml
deploy-qa:
  name: 🧪 Deploy to QA
  runs-on: ubuntu-latest
  needs: [decision, build]
  if: |
    needs.decision.outputs.skip_deploy == 'false' &&
    needs.decision.outputs.deploy_env == 'qa'
  environment:
    name: qa
    url: https://qa.insighthub.example.com
  steps:
    # ... deployment steps ...
```

3. **Configure GitHub environment:**
   - Settings > Environments > New environment: `qa`
   - Add secrets: `QA_SERVER_HOST`, `QA_SSH_KEY`, etc.

### Adding Rollback Support

Create a manual workflow trigger:

```yaml
# .github/workflows/rollback.yml
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        type: choice
        options:
          - production
          - staging
          - dev
      version:
        description: 'Version to rollback to (git tag)'
        required: true
        type: string

jobs:
  rollback:
    name: Rollback to ${{ inputs.version }}
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    
    steps:
      - name: Checkout specific version
        uses: actions/checkout@v4
        with:
          ref: ${{ inputs.version }}
      
      - name: Deploy previous version
        run: |
          echo "Rolling back ${{ inputs.environment }} to ${{ inputs.version }}"
          # ... deployment steps ...
```

### Adding Database Migration Guards

Add migration validation before deployment:

```yaml
- name: Validate migrations
  run: |
    # Check for breaking schema changes
    npm run migrate:validate
    
    # Ensure migrations are reversible
    npm run migrate:test-rollback
    
    # Verify data integrity
    npm run db:integrity-check
```

### Adding Performance Baselines

Add performance regression tests:

```yaml
- name: Performance baseline check
  run: |
    # Run load tests
    npm run test:performance
    
    # Compare with baseline
    npm run performance:compare
    
    # Fail if regression detected
    npm run performance:gate
```

## Monitoring and Alerting

### Post-Deployment Checks

The pipeline automatically monitors:
- HTTP health endpoints
- Error rates (target: < 1%)
- Response times (target: < 500ms)
- Database connection pools
- Memory/CPU usage

### Alert Channels

Configure notifications in:
```yaml
- name: Notify on success
  uses: slackapi/slack-github-action@v1
  with:
    webhook: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "✅ Deployment successful: ${{ needs.decision.outputs.deployment_label }}"
      }

- name: Notify on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook: ${{ secrets.SLACK_WEBHOOK_ALERTS }}
    payload: |
      {
        "text": "🚨 Deployment failed: ${{ needs.decision.outputs.deployment_label }}"
      }
```

## Troubleshooting

### Pipeline Fails at Decision Step

**Symptom:** Decision job fails with "Could not determine branch name"

**Solution:**
```bash
# Check git configuration in CI
git config --list

# Ensure proper checkout depth
uses: actions/checkout@v4
with:
  fetch-depth: 2  # Need commit history
```

### Deployment Skipped Unexpectedly

**Symptom:** Commit should deploy but gets skipped

**Solution:**
1. Verify commit message format:
   ```bash
   git log -1 --pretty=%B
   ```
2. Check decision script output:
   ```bash
   ./scripts/ci-deployment-decision.sh
   ```

### Manual Approval Not Triggered

**Symptom:** Production deployment proceeds without approval

**Solution:**
1. Verify environment protection rules
2. Check `requires_approval` output:
   ```bash
   echo $REQUIRES_APPROVAL
   ```

### Secret Not Found

**Symptom:** "Secret PROD_SERVER_HOST not found"

**Solution:**
1. Verify secret exists: Settings > Secrets > Actions
2. Check secret name matches exactly (case-sensitive)
3. Ensure secret is available to environment

## Best Practices

### Commit Messages
- ✅ Use Conventional Commits format
- ✅ Include ticket/CR numbers in scope
- ✅ Write clear, descriptive subjects
- ❌ Avoid generic messages like "fix bug"

### Branch Naming
- ✅ Follow pattern: `type/TICKET-short-description`
- ✅ Use descriptive names
- ❌ Avoid numbered branches like `branch-1`

### Deployment Strategy
- ✅ Always deploy to dev first
- ✅ Test thoroughly in staging
- ✅ Schedule production deploys during low-traffic periods
- ✅ Have rollback plan ready

### Security
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use least-privilege SSH keys
- ✅ Enable audit logging
- ✅ Review deployment logs
- ❌ Never commit secrets to repo

## Maintenance

### Regular Tasks

**Weekly:**
- Review deployment success rates
- Check for pending approvals
- Monitor pipeline execution times

**Monthly:**
- Rotate deployment SSH keys
- Update dependencies
- Review and archive old artifacts
- Audit environment secrets

**Quarterly:**
- Conduct security review
- Update branch protection rules
- Review and update approval teams
- Disaster recovery drill

## Support

For issues or questions:
1. Check pipeline logs in GitHub Actions
2. Review decision script output
3. Consult this documentation
4. Contact DevOps team

---

**Last Updated:** January 11, 2026  
**Version:** 1.0.0  
**Maintained by:** DevOps Team
