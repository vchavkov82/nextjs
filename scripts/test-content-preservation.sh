#!/bin/bash

# Test Script to Verify Content Preservation Setup
# Usage: ./scripts/test-content-preservation.sh
#
# This script validates that the git attributes configuration and merge driver
# are properly set up for content preservation during rebases.

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Test 1: Git repository check
test_git_repo() {
    print_test "Checking if in a git repository..."

    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_fail "Not in a git repository"
        return 1
    fi

    print_pass "Git repository found"
    return 0
}

# Test 2: .gitattributes existence
test_gitattributes_exists() {
    print_test "Checking if .gitattributes file exists..."

    if [ ! -f ".gitattributes" ]; then
        print_fail ".gitattributes not found in repository root"
        return 1
    fi

    print_pass ".gitattributes file exists"
    return 0
}

# Test 3: .gitattributes contains content patterns
test_gitattributes_content() {
    print_test "Checking .gitattributes content patterns..."

    local required_patterns=(
        "apps/docs/content/\*\*/\*.mdx"
        "apps/docs/components/Navigation"
        "apps/docs/spec/\*-sections.json"
        "apps/docs/styles/\*\*/\*.scss"
        "apps/docs/public/img"
    )

    local found=0
    local missing=0

    for pattern in "${required_patterns[@]}"; do
        if grep -q "$pattern" .gitattributes 2>/dev/null; then
            found=$((found + 1))
        else
            missing=$((missing + 1))
        fi
    done

    if [ $missing -gt 0 ]; then
        print_fail "Missing $missing content patterns in .gitattributes"
        return 1
    fi

    print_pass ".gitattributes contains all required content patterns ($found patterns)"
    return 0
}

# Test 4: merge=ours strategy in gitattributes
test_merge_strategy() {
    print_test "Checking for merge=ours strategy..."

    if ! grep -q "merge=ours" .gitattributes 2>/dev/null; then
        print_fail "No merge=ours patterns found in .gitattributes"
        return 1
    fi

    local count=$(grep -c "merge=ours" .gitattributes 2>/dev/null || true)
    print_pass "Found merge=ours strategy ($count occurrences)"
    return 0
}

# Test 5: Merge driver configuration
test_merge_driver() {
    print_test "Checking merge.ours driver configuration..."

    if ! git config merge.ours.driver > /dev/null 2>&1; then
        print_fail "merge.ours driver not configured"
        print_info "Run: git config merge.ours.driver true"
        return 1
    fi

    local driver_value=$(git config merge.ours.driver)
    print_pass "merge.ours driver configured (value: $driver_value)"
    return 0
}

# Test 6: Content files exist
test_content_files_exist() {
    print_test "Checking for content files..."

    local mdx_count=$(find apps/docs/content -name "*.mdx" 2>/dev/null | wc -l)
    local img_count=$(find apps/docs/public/img -type f 2>/dev/null | wc -l)

    if [ "$mdx_count" -eq 0 ] && [ "$img_count" -eq 0 ]; then
        print_fail "No content files found"
        return 1
    fi

    print_pass "Content files found (MDX: $mdx_count, Images: $img_count)"
    return 0
}

# Test 7: Branch structure
test_branch_structure() {
    print_test "Checking branch structure..."

    if ! git rev-parse --verify develop > /dev/null 2>&1; then
        print_fail "develop branch not found locally"
        return 1
    fi

    if ! git rev-parse --verify origin/develop > /dev/null 2>&1; then
        print_fail "origin/develop branch not found"
        return 1
    fi

    local current=$(git branch --show-current)
    print_pass "Branch structure valid (current: $current)"
    return 0
}

# Test 8: Remote connectivity
test_remote_connectivity() {
    print_test "Checking remote connectivity..."

    if ! git remote | grep -q "^origin$"; then
        print_fail "Origin remote not found"
        return 1
    fi

    if ! git fetch origin --dry-run > /dev/null 2>&1; then
        print_fail "Cannot connect to origin remote"
        return 1
    fi

    print_pass "Remote connectivity working"
    return 0
}

# Test 9: Rebase script exists
test_rebase_script() {
    print_test "Checking rebase script..."

    if [ ! -f "scripts/rebase-from-develop.sh" ]; then
        print_fail "scripts/rebase-from-develop.sh not found"
        return 1
    fi

    if [ ! -x "scripts/rebase-from-develop.sh" ]; then
        print_fail "scripts/rebase-from-develop.sh not executable"
        return 1
    fi

    print_pass "Rebase script found and executable"
    return 0
}

# Test 10: No uncommitted changes on develop
test_develop_clean() {
    print_test "Checking if develop branch is clean..."

    # Check if we're in the middle of a rebase
    if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
        print_pass "Skipped (rebase in progress) - check develop manually after rebase"
        return 0
    fi

    # Save current branch
    local current=$(git branch --show-current)

    # If not on a branch (detached HEAD), skip this test
    if [ -z "$current" ]; then
        print_pass "Skipped (detached HEAD state)"
        return 0
    fi

    # Check if there are uncommitted changes that would prevent checkout
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        print_pass "Skipped (uncommitted changes on current branch)"
        return 0
    fi

    # Switch to develop temporarily
    if ! git checkout develop > /dev/null 2>&1; then
        print_fail "Cannot checkout develop branch"
        return 1
    fi

    # Check for changes on develop
    local has_changes=0
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        has_changes=1
    fi

    # Switch back to original branch
    git checkout "$current" > /dev/null 2>&1

    if [ $has_changes -eq 1 ]; then
        print_fail "develop branch has uncommitted changes"
        return 1
    fi

    print_pass "develop branch is clean"
    return 0
}

# Test 11: Simulate conflict detection (dry-run)
test_conflict_potential() {
    print_test "Analyzing potential conflicts..."

    git fetch origin develop > /dev/null 2>&1

    local current=$(git branch --show-current)
    local merge_base=$(git merge-base HEAD origin/develop)

    # Check for files changed in current branch
    local branch_changes=$(git diff --name-only "$merge_base" HEAD 2>/dev/null | wc -l)

    # Check for files changed in develop since merge base
    local develop_changes=$(git diff --name-only "$merge_base" origin/develop 2>/dev/null | wc -l)

    # Check for potential overlaps
    local potential_conflicts=$(comm -12 <(git diff --name-only "$merge_base" HEAD 2>/dev/null | sort) <(git diff --name-only "$merge_base" origin/develop 2>/dev/null | sort) | wc -l)

    print_pass "Analyzed changes (branch: $branch_changes, develop: $develop_changes, potential conflicts: $potential_conflicts)"

    if [ "$potential_conflicts" -gt 0 ]; then
        print_info "Expected conflicts in: $(comm -12 <(git diff --name-only "$merge_base" HEAD 2>/dev/null | sort) <(git diff --name-only "$merge_base" origin/develop 2>/dev/null | sort) | head -3 | tr '\n' ',')"
    fi

    return 0
}

# Test 12: Environment check
test_environment() {
    print_test "Checking shell environment..."

    # Check bash version
    if [ -z "$BASH_VERSION" ]; then
        print_fail "Script requires bash (not running in bash)"
        return 1
    fi

    local bash_version=$(echo "$BASH_VERSION" | cut -d. -f1)
    if [ "$bash_version" -lt 4 ]; then
        print_fail "Bash 4+ required (current: $BASH_VERSION)"
        return 1
    fi

    # Check required commands
    local required_commands=("git" "grep" "mktemp")
    local missing=0

    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" > /dev/null 2>&1; then
            print_fail "Required command not found: $cmd"
            missing=$((missing + 1))
        fi
    done

    if [ $missing -gt 0 ]; then
        return 1
    fi

    print_pass "Environment verified (Bash $BASH_VERSION)"
    return 0
}

# Main execution
main() {
    print_header "Content Preservation Setup Validation"

    # Run all tests
    test_git_repo
    test_gitattributes_exists
    test_gitattributes_content
    test_merge_strategy
    test_merge_driver
    test_content_files_exist
    test_branch_structure
    test_remote_connectivity
    test_rebase_script
    test_develop_clean
    test_conflict_potential
    test_environment

    # Print summary
    print_header "Test Results Summary"

    local total=$((TESTS_PASSED + TESTS_FAILED))

    echo -e "Total Tests: $total"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    if [ $TESTS_FAILED -gt 0 ]; then
        echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    fi

    print_header ""

    if [ $TESTS_FAILED -eq 0 ]; then
        print_info "✓ All tests passed! Setup is ready for rebasing."
        print_info ""
        print_info "Next steps:"
        print_info "1. Create a backup branch: git checkout -b <branch>-backup"
        print_info "2. Run rebase: ./scripts/rebase-from-develop.sh"
        print_info "3. Test build: pnpm build:docs"
        print_info ""
        return 0
    else
        print_fail "✗ Some tests failed. Review errors above and fix them."
        print_info ""
        print_info "Common fixes:"
        print_info "• .gitattributes missing: Check file exists at repository root"
        print_info "• merge.ours not configured: Run 'git config merge.ours.driver true'"
        print_info "• develop branch issues: Ensure develop branch is up to date"
        print_info ""
        return 1
    fi
}

main "$@"
