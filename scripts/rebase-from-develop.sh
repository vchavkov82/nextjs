#!/bin/bash

# Enhanced Rebase Script for Content-Preserving Workflow
# Usage: ./scripts/rebase-from-develop.sh [branch-name]
# If no branch name is provided, uses the current branch
#
# Environment variables:
#   NON_INTERACTIVE=1  - Skip all prompts
#   AUTO_PUSH=1        - Automatically push after rebase
#   DRY_RUN=1          - Show what would happen without executing
#   VERIFY_CONTENT=1   - Verify content files preserved (default: 1)

set -e

# Load common library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib-rebase-common.sh
source "$SCRIPT_DIR/lib-rebase-common.sh"

# Configuration
NON_INTERACTIVE=${NON_INTERACTIVE:-0}
AUTO_PUSH=${AUTO_PUSH:-0}
DRY_RUN=${DRY_RUN:-0}
VERIFY_CONTENT=${VERIFY_CONTENT:-1}

# Global variables
HASH_FILE=""
STASHED=false

# Capture hashes of content files before rebase
capture_content_hashes() {
    HASH_FILE=$(mktemp)

    print_debug "Capturing content file hashes..."

    # Store git object hashes of tracked content files
    for pattern in "${CONTENT_PATTERNS[@]}"; do
        git ls-files "$pattern" 2>/dev/null | while read -r file; do
            if [ -f "$file" ]; then
                hash=$(git hash-object "$file")
                echo "$file:$hash" >> "$HASH_FILE"
            fi
        done
    done

    local count=$(wc -l < "$HASH_FILE" 2>/dev/null || echo "0")
    print_debug "Captured hashes for $count content files in: $HASH_FILE"
}

# Verify content files preserved after rebase
verify_content_preservation() {
    if [ "$VERIFY_CONTENT" != "1" ] || [ ! -f "$HASH_FILE" ]; then
        return 0
    fi

    print_info "Verifying content file preservation..."

    local changes=0
    local checked=0

    while IFS=: read -r file expected_hash; do
        checked=$((checked + 1))
        if [ -f "$file" ]; then
            current_hash=$(git hash-object "$file")
            if [ "$current_hash" != "$expected_hash" ]; then
                print_warn "Content file changed: $file"
                changes=$((changes + 1))
            fi
        fi
    done < "$HASH_FILE"

    if [ $changes -gt 0 ]; then
        print_warn "Found $changes/$checked content file(s) that changed during rebase"
        print_warn "This may indicate merge strategy issue or intentional manual edit"
        print_info "Review changes with: git diff HEAD@{1} apps/docs/content"
        return 1
    else
        print_info "✓ Content preservation verified ($checked files checked)"
        return 0
    fi
}

# Cleanup temporary hash file
cleanup_hash_file() {
    if [ -n "$HASH_FILE" ] && [ -f "$HASH_FILE" ]; then
        rm -f "$HASH_FILE"
    fi
}

# Setup cleanup trap
trap cleanup_hash_file EXIT

# Show conflict resolution guide
show_conflict_guide() {
    print_error "Rebase failed with conflicts"
    print_info ""
    print_info "═══════════════════════════════════════════════════════════════"
    print_info "CONFLICT RESOLUTION GUIDE"
    print_info "═══════════════════════════════════════════════════════════════"
    print_info ""
    print_info "1. Review conflicts: git status"
    print_info ""
    print_info "2. Resolve by type:"
    print_info ""

    # Categorize conflicts
    local content_conflicts=$(get_content_conflicts)
    local code_conflicts=$(get_code_conflicts)
    local other_conflicts=$(get_other_conflicts)

    if [ -n "$content_conflicts" ]; then
        print_info "📄 CONTENT/DESIGN FILES (keep feature branch version):"
        echo "$content_conflicts" | while read -r file; do
            echo "   $file"
        done
        print_info "   Command: git checkout --ours <file> && git add <file>"
        print_info ""
    fi

    if [ -n "$code_conflicts" ]; then
        print_info "⚙️  CODE FILES (take develop version):"
        echo "$code_conflicts" | while read -r file; do
            echo "   $file"
        done
        print_info "   Command: git checkout --theirs <file> && git add <file>"
        print_info ""
    fi

    if [ -n "$other_conflicts" ]; then
        print_info "📦 OTHER FILES (review manually):"
        echo "$other_conflicts" | while read -r file; do
            echo "   $file"
        done
        print_info "   Command: git add <file> (after resolving)"
        print_info ""
    fi

    print_info "3. Continue rebase:"
    print_info "   git add ."
    print_info "   git rebase --continue"
    print_info ""
    print_info "4. Or abort if needed:"
    print_info "   git rebase --abort"
    print_info ""
    print_info "═══════════════════════════════════════════════════════════════"
}

# Handle stashing of uncommitted changes
handle_stash() {
    if ! is_working_directory_clean; then
        print_warn "You have uncommitted changes"

        if [ "$NON_INTERACTIVE" = "1" ]; then
            git stash push -m "Auto-stash before rebase $(date +%Y-%m-%d_%H:%M:%S)"
            STASHED=true
            print_info "Changes stashed automatically"
        else
            read -p "Stash changes? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git stash push -m "Stashed before rebase $(date +%Y-%m-%d_%H:%M:%S)"
                STASHED=true
            else
                print_error "Please commit or stash your changes first"
                exit 1
            fi
        fi
    fi
}

# Restore stashed changes
restore_stash() {
    if [ "$STASHED" = true ]; then
        print_info "Restoring stashed changes..."
        if ! git stash pop; then
            print_warn "Could not restore stash automatically"
            print_info "Run 'git stash list' to see your stashes"
        fi
    fi
}

# Main execution
main() {
    # Check prerequisites
    check_git_repo || exit 1
    check_origin_remote || exit 1

    # Check for .gitattributes (warning only)
    if ! check_gitattributes && [ "$NON_INTERACTIVE" != "1" ]; then
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
    fi

    # Configure merge driver
    check_merge_driver

    # Get target branch
    TARGET_BRANCH="${1:-$(get_current_branch)}"
    CURRENT_BRANCH=$(get_current_branch)

    if [ -z "$TARGET_BRANCH" ]; then
        print_error "Could not determine branch name"
        exit 1
    fi

    check_branch_exists "$TARGET_BRANCH" || exit 1

    print_info "Target branch: $TARGET_BRANCH"

    # Checkout target branch if needed
    if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
        print_info "Switching to $TARGET_BRANCH..."
        git checkout "$TARGET_BRANCH"
    fi

    # Handle uncommitted changes
    handle_stash

    # Fetch latest from develop
    print_info "Fetching latest from develop..."
    git fetch origin develop

    # Check if origin/develop exists
    check_branch_exists "origin/develop" || exit 1

    # Check if already up to date
    DEVELOP_COMMIT=$(git rev-parse origin/develop)
    MERGE_BASE=$(get_merge_base HEAD origin/develop)

    if [ "$MERGE_BASE" = "$DEVELOP_COMMIT" ]; then
        print_info "✓ Branch is already up to date with develop"
        restore_stash
        exit 0
    fi

    # Show rebase info
    COMMITS_BEHIND=$(count_commits_between HEAD origin/develop)
    COMMITS_AHEAD=$(count_commits_between origin/develop HEAD)

    print_info "Develop HEAD: $(git log -1 --oneline origin/develop)"
    print_info "Current HEAD: $(git log -1 --oneline HEAD)"
    print_info "Merge base: $(git log -1 --oneline "$MERGE_BASE")"
    print_info "Branch is $COMMITS_BEHIND commit(s) behind and $COMMITS_AHEAD commit(s) ahead"

    # Dry run mode
    if [ "$DRY_RUN" = "1" ]; then
        print_info "[DRY RUN] Would rebase $TARGET_BRANCH onto origin/develop"
        print_info "Run without DRY_RUN=1 to perform the rebase"
        restore_stash
        exit 0
    fi

    # Confirmation
    if [ "$NON_INTERACTIVE" = "1" ]; then
        print_info "Non-interactive mode: proceeding with rebase..."
    else
        read -p "Rebase $TARGET_BRANCH onto develop? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warn "Aborted by user"
            restore_stash
            exit 0
        fi
    fi

    # Capture content hashes
    print_info "Capturing content file state..."
    capture_content_hashes

    # Perform rebase
    print_info "Rebasing $TARGET_BRANCH onto origin/develop..."

    if git rebase origin/develop; then
        print_info "✓ Rebase successful!"
        verify_content_preservation || print_warn "Review content changes above"
    else
        show_conflict_guide
        restore_stash
        exit 1
    fi

    # Restore stash
    restore_stash

    # Push to remote
    if [ "$AUTO_PUSH" = "1" ]; then
        print_info "Auto-push enabled: pushing to origin/$TARGET_BRANCH..."
        if git push --force-with-lease origin "$TARGET_BRANCH"; then
            print_info "✓ Successfully pushed!"
        else
            print_error "Push failed (someone may have pushed changes)"
            print_info "Use: git push --force origin $TARGET_BRANCH (if you're sure)"
            exit 1
        fi
    elif [ "$NON_INTERACTIVE" != "1" ]; then
        read -p "Push to origin/$TARGET_BRANCH? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if git push --force-with-lease origin "$TARGET_BRANCH"; then
                print_info "✓ Successfully pushed!"
            else
                print_error "Push failed (someone may have pushed changes)"
                exit 1
            fi
        fi
    fi

    print_info "═══════════════════════════════════════════════════════════════"
    print_info "✓ Rebase completed successfully!"
    print_info "═══════════════════════════════════════════════════════════════"
}

# Run main function
main "$@"
