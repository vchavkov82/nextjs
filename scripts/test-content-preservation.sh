#!/bin/bash

# Test Script to Verify Content Preservation Setup
# Usage: ./scripts/test-content-preservation.sh
#
# This script validates that git attributes configuration and merge driver
# are properly set up for content preservation during rebases.

set -e

# Load common library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib-rebase-common.sh
source "$SCRIPT_DIR/lib-rebase-common.sh"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Test result tracking
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

# Test 1: Git repository check
test_git_repo() {
    print_test "Checking if in a git repository..."
    if check_git_repo; then
        print_pass "Git repository found"
        return 0
    else
        print_fail "Not in a git repository"
        return 1
    fi
}

# Test 2: .gitattributes existence
test_gitattributes_exists() {
    print_test "Checking if .gitattributes file exists..."
    if [ -f ".gitattributes" ]; then
        print_pass ".gitattributes file exists"
        return 0
    else
        print_fail ".gitattributes not found in repository root"
        return 1
    fi
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

    print_pass ".gitattributes contains all required patterns ($found patterns)"
    return 0
}

# Test 4: merge=ours strategy in gitattributes
test_merge_strategy() {
    print_test "Checking for merge=ours strategy..."

    if ! grep -q "merge=ours" .gitattributes 2>/dev/null; then
        print_fail "No merge=ours patterns found in .gitattributes"
        return 1
    fi

    local count=$(grep -c "merge=ours" .gitattributes 2>/dev/null || echo "0")
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

    local current=$(get_current_branch)
    print_pass "Branch structure valid (current: ${current:-detached})"
    return 0
}

# Test 8: Remote connectivity
test_remote_connectivity() {
    print_test "Checking remote connectivity..."

    if ! check_origin_remote; then
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

# Test 10: pnpm availability and scripts
test_pnpm() {
    print_test "Checking pnpm and scripts..."

    if ! check_pnpm; then
        print_fail "pnpm not installed"
        return 1
    fi

    local pnpm_version=$(pnpm --version 2>/dev/null || echo "unknown")

    # Check for required scripts (non-fatal)
    local scripts_found=0
    for script in "build:docs" "typecheck"; do
        if pnpm run "$script" --help > /dev/null 2>&1; then
            scripts_found=$((scripts_found + 1))
        fi
    done

    print_pass "pnpm available (v$pnpm_version, $scripts_found/2 scripts found)"
    return 0
}

# Test 11: Common library
test_common_library() {
    print_test "Checking common library..."

    if [ ! -f "scripts/lib-rebase-common.sh" ]; then
        print_fail "scripts/lib-rebase-common.sh not found"
        return 1
    fi

    # Test if key functions are available
    if ! declare -f print_info > /dev/null; then
        print_fail "Common library functions not loaded"
        return 1
    fi

    print_pass "Common library loaded successfully"
    return 0
}

# Test 12: Conflict potential analysis
test_conflict_potential() {
    print_test "Analyzing potential conflicts..."

    git fetch origin develop > /dev/null 2>&1

    local current=$(get_current_branch)
    if [ -z "$current" ]; then
        print_pass "Skipped (detached HEAD state)"
        return 0
    fi

    local merge_base=$(get_merge_base HEAD origin/develop)
    if [ -z "$merge_base" ]; then
        print_pass "Skipped (no common ancestor)"
        return 0
    fi

    local branch_changes=$(git diff --name-only "$merge_base" HEAD 2>/dev/null | wc -l)
    local develop_changes=$(git diff --name-only "$merge_base" origin/develop 2>/dev/null | wc -l)
    local potential_conflicts=$(comm -12 \
        <(git diff --name-only "$merge_base" HEAD 2>/dev/null | sort) \
        <(git diff --name-only "$merge_base" origin/develop 2>/dev/null | sort) | wc -l)

    print_pass "Analyzed (branch: $branch_changes, develop: $develop_changes, conflicts: $potential_conflicts)"

    if [ "$potential_conflicts" -gt 0 ]; then
        local conflict_files=$(comm -12 \
            <(git diff --name-only "$merge_base" HEAD 2>/dev/null | sort) \
            <(git diff --name-only "$merge_base" origin/develop 2>/dev/null | sort) | head -3 | tr '\n' ', ')
        print_info "Sample conflicts: ${conflict_files%,}"
    fi

    return 0
}

# Test 13: Environment check
test_environment() {
    print_test "Checking shell environment..."

    # Check bash version
    if [ -z "$BASH_VERSION" ]; then
        print_fail "Not running in bash"
        return 1
    fi

    local bash_major=$(echo "$BASH_VERSION" | cut -d. -f1)
    if [ "$bash_major" -lt 4 ]; then
        print_fail "Bash 4+ required (current: $BASH_VERSION)"
        return 1
    fi

    # Check required commands
    local required_commands=("git" "grep" "mktemp" "wc")
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
    test_pnpm
    test_common_library
    test_conflict_potential
    test_environment

    # Print summary
    print_header "Test Results Summary"

    local total=$((TESTS_PASSED + TESTS_FAILED))

    echo "Total Tests: $total"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    if [ $TESTS_FAILED -gt 0 ]; then
        echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    fi

    print_header ""

    if [ $TESTS_FAILED -eq 0 ]; then
        print_info "✓ All tests passed! Setup is ready for rebasing."
        print_info ""
        print_info "Next steps:"
        print_info "  1. Create backup: git checkout -b <branch>-backup"
        print_info "  2. Run rebase: ./scripts/rebase-from-develop.sh"
        print_info "  3. Test build: pnpm build:docs"
        print_info "  4. Verify: git diff HEAD@{1} apps/docs/content"
        print_info ""
        return 0
    else
        print_fail "✗ $TESTS_FAILED test(s) failed. Review errors above."
        print_info ""
        print_info "Common fixes:"
        print_info "  • Missing .gitattributes: Check file exists at repo root"
        print_info "  • merge.ours not configured: Run 'git config merge.ours.driver true'"
        print_info "  • pnpm not installed: Run 'npm install -g pnpm'"
        print_info ""
        return 1
    fi
}

main "$@"
