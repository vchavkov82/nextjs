#!/bin/bash

# Common Library for Content-Preserving Rebase Scripts
# This file provides shared functions used by rebase and test scripts
# Source this file: source scripts/lib-rebase-common.sh

# Exit on error
set -e

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Content file patterns to preserve during rebase
readonly CONTENT_PATTERNS=(
    "apps/docs/content/**/*.mdx"
    "apps/docs/components/Navigation/NavigationMenu/NavigationMenu.constants.ts"
    "apps/docs/spec/*-sections.json"
    "apps/docs/spec/**/*.yml"
    "apps/docs/spec/**/*.yaml"
    "apps/docs/styles/**/*.scss"
    "apps/docs/styles/**/*.css"
    "tailwind.config.cjs"
)

# Print functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        return 1
    fi
    return 0
}

# Check if .gitattributes exists
check_gitattributes() {
    if [ ! -f ".gitattributes" ]; then
        print_warn ".gitattributes not found in repository root"
        print_warn "Content preservation via merge=ours strategy may not work"
        return 1
    fi
    return 0
}

# Check and configure merge.ours driver
check_merge_driver() {
    if ! git config merge.ours.driver > /dev/null 2>&1; then
        print_warn "merge.ours driver not configured"
        print_info "Configuring merge.ours driver locally..."
        git config merge.ours.driver true
        print_info "Configured: git config merge.ours.driver = true"
    fi
    return 0
}

# Check if pnpm is available
check_pnpm() {
    if ! command -v pnpm > /dev/null 2>&1; then
        print_error "pnpm is not installed"
        print_info "Install with: npm install -g pnpm"
        return 1
    fi
    return 0
}

# Verify a pnpm script exists
check_pnpm_script() {
    local script_name="$1"
    if ! pnpm run "$script_name" --help > /dev/null 2>&1; then
        print_warn "pnpm script '$script_name' not found"
        return 1
    fi
    return 0
}

# Check if origin remote exists
check_origin_remote() {
    if ! git remote | grep -q "^origin$"; then
        print_error "Origin remote not found"
        return 1
    fi
    return 0
}

# Check if branch exists
check_branch_exists() {
    local branch="$1"
    if ! git rev-parse --verify "$branch" > /dev/null 2>&1; then
        print_error "Branch '$branch' not found"
        return 1
    fi
    return 0
}

# Check if we're in the middle of a rebase
is_rebase_in_progress() {
    [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]
}

# Get current branch name (empty if detached HEAD)
get_current_branch() {
    git branch --show-current
}

# Check if working directory is clean
is_working_directory_clean() {
    git diff-index --quiet HEAD -- 2>/dev/null
}

# Get merge base between two commits
get_merge_base() {
    local commit1="$1"
    local commit2="$2"
    git merge-base "$commit1" "$commit2" 2>/dev/null
}

# Count commits between two refs
count_commits_between() {
    local from="$1"
    local to="$2"
    git rev-list --count "$from..$to" 2>/dev/null || echo "0"
}

# Get list of conflicted files
get_conflicted_files() {
    git diff --name-only --diff-filter=U 2>/dev/null || true
}

# Categorize conflicted files by type
get_content_conflicts() {
    get_conflicted_files | grep -E '\.(mdx|json|yml|yaml|scss|css)$' || true
}

get_code_conflicts() {
    get_conflicted_files | grep -E '\.(tsx?|jsx?)$' || true
}

get_other_conflicts() {
    get_conflicted_files | grep -v -E '\.(mdx|json|yml|yaml|scss|css|tsx?|jsx?)$' || true
}

# Export functions for use in other scripts
export -f print_info print_warn print_error print_debug print_header
export -f check_git_repo check_gitattributes check_merge_driver check_pnpm
export -f check_pnpm_script check_origin_remote check_branch_exists
export -f is_rebase_in_progress get_current_branch is_working_directory_clean
export -f get_merge_base count_commits_between
export -f get_conflicted_files get_content_conflicts get_code_conflicts get_other_conflicts
