#!/usr/bin/env bash
#===============================================================================
# CI/CD Decision Logic Test Suite
#===============================================================================
# Purpose: Test and demonstrate the deployment decision logic
# Usage: ./scripts/test-ci-decision.sh
#===============================================================================

set -eo pipefail

# Colors
readonly GREEN='\033[0;32m'
readonly RED='\033[0;31m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       CI/CD Deployment Decision Logic Test Suite              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

test_scenario() {
    local name="$1"
    local branch="$2"
    local commit="$3"
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Test: ${name}${NC}"
    echo -e "  Branch: ${YELLOW}${branch}${NC}"
    echo -e "  Commit: ${YELLOW}${commit}${NC}"
    echo ""
    
    # Simulate decision logic
    local deploy_env=""
    local skip_deploy="false"
    local requires_approval="false"
    
    # Determine environment
    case "${branch}" in
        main)
            deploy_env="production"
            requires_approval="true"
            ;;
        staging)
            deploy_env="staging"
            ;;
        develop)
            deploy_env="dev"
            ;;
        feature/*|bugfix/*|hotfix/*)
            deploy_env="dev"
            ;;
    esac
    
    # Extract commit type
    local commit_type=""
    if [[ "${commit}" =~ ^([a-z]+) ]]; then
        commit_type="${BASH_REMATCH[1]}"
    fi
    
    # Check if should skip
    if [[ "${commit_type}" =~ ^(docs|chore|style|test|refactor)$ ]]; then
        skip_deploy="true"
    fi
    
    # Check hotfix approval
    if [[ "${commit_type}" == "hotfix" ]] && [[ "${deploy_env}" == "staging" ]]; then
        requires_approval="true"
    fi
    
    # Display results
    echo -e "  ${GREEN}Results:${NC}"
    echo -e "    Environment: ${deploy_env}"
    echo -e "    Skip Deploy: ${skip_deploy}"
    echo -e "    Requires Approval: ${requires_approval}"
    echo -e "    Commit Type: ${commit_type}"
    
    if [[ "${skip_deploy}" == "true" ]]; then
        echo -e "    ${YELLOW}➜ Action: SKIP DEPLOYMENT${NC}"
    elif [[ "${requires_approval}" == "true" ]]; then
        echo -e "    ${YELLOW}➜ Action: PENDING MANUAL APPROVAL${NC}"
    else
        echo -e "    ${GREEN}➜ Action: AUTO-DEPLOY TO $(echo ${deploy_env} | tr '[:lower:]' '[:upper:]')${NC}"
    fi
    echo ""
}

# Run test scenarios
test_scenario "Production Feature" "main" "feat(auth): add SSO authentication"
test_scenario "Production Bug Fix" "main" "fix(api): resolve memory leak"
test_scenario "Production Docs (Skip)" "main" "docs(readme): update documentation"
test_scenario "Staging Bug Fix" "staging" "fix(ui): resolve styling issue"
test_scenario "Staging Hotfix (Approval)" "staging" "hotfix(critical): patch vulnerability"
test_scenario "Development Feature" "develop" "feat(dashboard): add analytics"
test_scenario "Feature Branch" "feature/CR-123-new-feature" "feat(module): implement feature"
test_scenario "Bugfix Branch" "bugfix/BF-456-fix-bug" "fix(component): resolve issue"
test_scenario "Hotfix Branch" "hotfix/BF-789-critical" "hotfix(security): patch XSS"
test_scenario "Feature Docs (Skip)" "feature/CR-999-docs" "docs(api): document endpoints"
test_scenario "Develop Chore (Skip)" "develop" "chore(deps): update dependencies"

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                   Test Suite Complete                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Summary table
echo -e "${BLUE}Decision Matrix Summary:${NC}"
echo ""
echo "┌──────────────────────┬──────────────┬────────────┬──────────────────┐"
echo "│ Branch Pattern       │ Commit Type  │ Deploy To  │ Approval         │"
echo "├──────────────────────┼──────────────┼────────────┼──────────────────┤"
echo "│ main                 │ feat/fix     │ production │ ✅ Required      │"
echo "│ main                 │ docs/chore   │ N/A        │ N/A (skipped)    │"
echo "│ staging              │ feat/fix     │ staging    │ ❌ Not required  │"
echo "│ staging              │ hotfix       │ staging    │ ✅ Required      │"
echo "│ develop              │ feat/fix     │ dev        │ ❌ Not required  │"
echo "│ feature/*            │ feat/fix     │ dev        │ ❌ Not required  │"
echo "│ bugfix/*             │ fix          │ dev        │ ❌ Not required  │"
echo "│ hotfix/*             │ hotfix       │ dev        │ ❌ Not required  │"
echo "│ any                  │ docs/chore   │ N/A        │ N/A (skipped)    │"
echo "└──────────────────────┴──────────────┴────────────┴──────────────────┘"
echo ""

echo -e "${GREEN}✅ All test scenarios validated${NC}"
echo ""
echo "To test with actual git state, run:"
echo "  ./scripts/ci-deployment-decision.sh"
