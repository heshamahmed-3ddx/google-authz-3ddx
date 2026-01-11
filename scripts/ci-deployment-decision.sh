#!/usr/bin/env bash
#===============================================================================
# CI/CD Deployment Decision Engine
#===============================================================================
# Purpose: Automatically determine deployment environment and behavior based on
#          branch name and commit message type (Conventional Commits)
#
# Author: DevOps Team
# Version: 1.0.0
# Last Updated: January 11, 2026
#
# Usage:
#   source ./scripts/ci-deployment-decision.sh
#   
# Exports:
#   DEPLOY_ENV       - Target environment (dev|staging|production)
#   SKIP_DEPLOY      - Whether to skip deployment (true|false)
#   COMMIT_TYPE      - Type of commit (feat|fix|docs|chore|hotfix)
#   REQUIRES_APPROVAL - Whether manual approval is needed (true|false)
#   DEPLOYMENT_LABEL - Human-readable deployment description
#===============================================================================

set -euo pipefail

#===============================================================================
# Configuration
#===============================================================================

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Branch patterns
readonly MAIN_BRANCH="main"
readonly STAGING_BRANCH="staging"
readonly DEVELOP_BRANCH="develop"
readonly FEATURE_PATTERN="^feature/"
readonly BUGFIX_PATTERN="^bugfix/"
readonly HOTFIX_PATTERN="^hotfix/"

# Non-deployable commit types
readonly NON_DEPLOYABLE_TYPES="docs chore style test refactor"

#===============================================================================
# Helper Functions
#===============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*" >&2
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*" >&2
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*" >&2
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

#===============================================================================
# Core Logic Functions
#===============================================================================

# Get the current branch name
# Supports both local git and CI environments (GitHub Actions, GitLab CI, etc.)
get_branch_name() {
    local branch=""
    
    # GitHub Actions
    if [[ -n "${GITHUB_REF:-}" ]]; then
        branch="${GITHUB_REF#refs/heads/}"
    # GitLab CI
    elif [[ -n "${CI_COMMIT_REF_NAME:-}" ]]; then
        branch="${CI_COMMIT_REF_NAME}"
    # Jenkins
    elif [[ -n "${GIT_BRANCH:-}" ]]; then
        branch="${GIT_BRANCH#origin/}"
    # Local git
    else
        branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"
    fi
    
    echo "${branch}"
}

# Get the latest commit message
get_commit_message() {
    local commit_msg=""
    
    # GitHub Actions
    if [[ -n "${GITHUB_EVENT_NAME:-}" ]] && [[ "${GITHUB_EVENT_NAME}" == "pull_request" ]]; then
        commit_msg="$(git log -1 --pretty=%B HEAD 2>/dev/null || echo '')"
    # Standard git
    else
        commit_msg="$(git log -1 --pretty=%B 2>/dev/null || echo '')"
    fi
    
    echo "${commit_msg}"
}

# Extract commit type from Conventional Commits format
# Format: <type>(<scope>): <subject>
extract_commit_type() {
    local commit_msg="$1"
    local commit_type=""
    
    # Extract type (everything before the first colon or opening parenthesis)
    if [[ "${commit_msg}" =~ ^([a-z]+)(\([^\)]*\))?:.*$ ]]; then
        commit_type="${BASH_REMATCH[1]}"
    else
        # Fallback: try to detect common patterns
        if [[ "${commit_msg}" =~ ^(feat|feature|fix|docs|style|refactor|test|chore|perf|ci|build|hotfix) ]]; then
            commit_type="${BASH_REMATCH[1]}"
        else
            commit_type="unknown"
        fi
    fi
    
    # Normalize variations
    case "${commit_type}" in
        feature) commit_type="feat" ;;
        bugfix) commit_type="fix" ;;
    esac
    
    echo "${commit_type}"
}

# Check if commit type should skip deployment
should_skip_deployment() {
    local commit_type="$1"
    
    for non_deployable in ${NON_DEPLOYABLE_TYPES}; do
        if [[ "${commit_type}" == "${non_deployable}" ]]; then
            return 0  # true - should skip
        fi
    done
    
    return 1  # false - should deploy
}

# Determine deployment environment based on branch name
determine_environment() {
    local branch="$1"
    local env=""
    
    case "${branch}" in
        "${MAIN_BRANCH}")
            env="production"
            ;;
        "${STAGING_BRANCH}")
            env="staging"
            ;;
        "${DEVELOP_BRANCH}")
            env="dev"
            ;;
        *)
            # Feature, bugfix, and hotfix branches go to dev
            if [[ "${branch}" =~ ${FEATURE_PATTERN} ]] || \
               [[ "${branch}" =~ ${BUGFIX_PATTERN} ]] || \
               [[ "${branch}" =~ ${HOTFIX_PATTERN} ]]; then
                env="dev"
            else
                # Unknown branch pattern - default to dev with warning
                log_warning "Unknown branch pattern: ${branch}, defaulting to dev environment"
                env="dev"
            fi
            ;;
    esac
    
    echo "${env}"
}

# Check if manual approval is required
requires_manual_approval() {
    local env="$1"
    local commit_type="$2"
    
    # Production always requires approval
    if [[ "${env}" == "production" ]]; then
        echo "true"
        return
    fi
    
    # Hotfixes to staging also require approval
    if [[ "${env}" == "staging" ]] && [[ "${commit_type}" == "hotfix" ]]; then
        echo "true"
        return
    fi
    
    echo "false"
}

# Generate deployment label for logging/notifications
generate_deployment_label() {
    local env="$1"
    local commit_type="$2"
    local branch="$3"
    
    local label=""
    
    case "${env}" in
        production)
            label="🚀 Production Deployment"
            ;;
        staging)
            label="🎭 Staging Deployment"
            ;;
        dev)
            label="🔧 Development Deployment"
            ;;
        *)
            label="📦 Deployment"
            ;;
    esac
    
    label="${label} (${commit_type} from ${branch})"
    echo "${label}"
}

#===============================================================================
# Validation Functions
#===============================================================================

validate_branch_name() {
    local branch="$1"
    
    if [[ -z "${branch}" ]]; then
        log_error "Could not determine branch name"
        return 1
    fi
    
    log_info "Branch: ${branch}"
    return 0
}

validate_commit_message() {
    local commit_msg="$1"
    
    if [[ -z "${commit_msg}" ]]; then
        log_error "Could not retrieve commit message"
        return 1
    fi
    
    log_info "Commit: ${commit_msg:0:80}..."
    return 0
}

validate_commit_type() {
    local commit_type="$1"
    
    if [[ "${commit_type}" == "unknown" ]]; then
        log_warning "Commit does not follow Conventional Commits format"
        log_warning "Expected format: <type>(<scope>): <subject>"
        log_warning "Proceeding with deployment anyway..."
    fi
    
    log_info "Commit type: ${commit_type}"
    return 0
}

#===============================================================================
# Main Decision Logic
#===============================================================================

make_deployment_decision() {
    log_info "================================================"
    log_info "CI/CD Deployment Decision Engine"
    log_info "================================================"
    
    # Step 1: Get branch name
    local branch
    branch="$(get_branch_name)"
    validate_branch_name "${branch}" || return 1
    
    # Step 2: Get commit message
    local commit_msg
    commit_msg="$(get_commit_message)"
    validate_commit_message "${commit_msg}" || return 1
    
    # Step 3: Extract commit type
    local commit_type
    commit_type="$(extract_commit_type "${commit_msg}")"
    validate_commit_type "${commit_type}"
    
    # Step 4: Determine if deployment should be skipped
    local skip_deploy="false"
    if should_skip_deployment "${commit_type}"; then
        skip_deploy="true"
        log_warning "Commit type '${commit_type}' does not require deployment"
    fi
    
    # Step 5: Determine target environment
    local deploy_env
    deploy_env="$(determine_environment "${branch}")"
    log_info "Target environment: ${deploy_env}"
    
    # Step 6: Check if manual approval is required
    local requires_approval
    requires_approval="$(requires_manual_approval "${deploy_env}" "${commit_type}")"
    
    if [[ "${requires_approval}" == "true" ]]; then
        log_warning "⚠️  Manual approval required for this deployment"
    fi
    
    # Step 7: Generate deployment label
    local deployment_label
    deployment_label="$(generate_deployment_label "${deploy_env}" "${commit_type}" "${branch}")"
    
    # Step 8: Export environment variables
    export DEPLOY_ENV="${deploy_env}"
    export SKIP_DEPLOY="${skip_deploy}"
    export COMMIT_TYPE="${commit_type}"
    export REQUIRES_APPROVAL="${requires_approval}"
    export DEPLOYMENT_LABEL="${deployment_label}"
    
    # Step 9: Summary output
    log_info "================================================"
    log_info "Decision Summary:"
    log_info "  Environment:         ${deploy_env}"
    log_info "  Skip Deployment:     ${skip_deploy}"
    log_info "  Requires Approval:   ${requires_approval}"
    log_info "  Deployment Label:    ${deployment_label}"
    log_info "================================================"
    
    if [[ "${skip_deploy}" == "true" ]]; then
        log_success "✅ Deployment will be skipped"
        return 0
    fi
    
    if [[ "${requires_approval}" == "true" ]]; then
        log_warning "⏸️  Deployment pending manual approval"
    else
        log_success "✅ Deployment will proceed automatically"
    fi
    
    return 0
}

#===============================================================================
# Script Execution
#===============================================================================

# Only run if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    make_deployment_decision
    exit_code=$?
    
    if [[ ${exit_code} -ne 0 ]]; then
        log_error "Deployment decision failed"
        exit ${exit_code}
    fi
    
    # Output variables in format suitable for CI systems
    echo ""
    echo "# Export these variables in your CI pipeline:"
    echo "export DEPLOY_ENV=\"${DEPLOY_ENV}\""
    echo "export SKIP_DEPLOY=\"${SKIP_DEPLOY}\""
    echo "export COMMIT_TYPE=\"${COMMIT_TYPE}\""
    echo "export REQUIRES_APPROVAL=\"${REQUIRES_APPROVAL}\""
    echo "export DEPLOYMENT_LABEL=\"${DEPLOYMENT_LABEL}\""
fi
