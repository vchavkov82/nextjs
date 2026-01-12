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

# Check for environment variables
NON_INTERACTIVE=${NON_INTERACTIVE:-0}
AUTO_PUSH=${AUTO_PUSH:-0}
DRY_RUN=${DRY_RUN:-0}
VERIFY_CONTENT=${VERIFY_CONTENT:-1}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
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
    echo -e "${YELLOW}[DEBUG]${NC} $1"
}

# Content files to verify preservation
# These patterns define what should be preserved from feature branch
declare -a CONTENT_PATTERNS=(
    "apps/docs/content/**/*.mdx"
    "apps/docs/components/Navigation/NavigationMenu/NavigationMenu.constants.ts"
    "apps/docs/spec/*-sections.json"
    "apps/docs/spec/**/*.yml"
    "apps/docs/spec/**/*.yaml"
    "apps/docs/styles/**/*.scss"
    "apps/docs/styles/**/*.css"
    "tailwind.config.cjs"
)

# Capture hashes of content files before rebase
capture_content_hashes() {
    HASH_FILE=$(mktemp)

    # Store git object hashes of tracked content files
    for pattern in "${CONTENT_PATTERNS[@]}"; do
        git ls-files "$pattern" 2>/dev/null | while read -r file; do
            if [ -f "$file" ]; then
                hash=$(git hash-object "$file")
                echo "$file:$hash" >> "$HASH_FILE"
            fi
        done
    done

    print_debug "Content hashes captured in: $HASH_FILE"
    export HASH_FILE
}

# Verify content files preserved after rebase
verify_content_preservation() {
    if [ "$VERIFY_CONTENT" != "1" ] || [ ! -f "$HASH_FILE" ]; then
        return 0
    fi

    print_info "Verifying content file preservation..."

    local changes=0
    while IFS=: read -r file expected_hash; do
        if [ -f "$file" ]; then
            current_hash=$(git hash-object "$file")
            if [ "$current_hash" != "$expected_hash" ]; then
                print_warn "Content file changed: $file"
                changes=$((changes + 1))
            fi
        fi
    done < "$HASH_FILE"

    if [ $changes -gt 0 ]; then
        print_warn "Found $changes content file(s) that changed during rebase"
        print_warn "This may indicate merge strategy issue or manual edit needed"
        return 1
    else
        print_info "Content preservation verified ✓"
        return 0
    fi
}

# Cleanup temporary hash file
cleanup_hash_file() {
    if [ -f "$HASH_FILE" ]; then
        rm -f "$HASH_FILE"
    fi
}

# Setup cleanup trap
trap cleanup_hash_file EXIT

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Check if origin remote exists
if ! git remote | grep -q "^origin$"; then
    print_error "Origin remote not found"
    exit 1
fi

# Check for .gitattributes
if [ ! -f ".gitattributes" ]; then
    print_warn ".gitattributes not found in repository root"
    print_warn "Content preservation via merge=ours strategy may not work"
    if [ "$NON_INTERACTIVE" != "1" ]; then
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
    fi
fi

# Check for merge.ours driver configuration
if ! git config merge.ours.driver > /dev/null 2>&1; then
    print_warn "merge.ours driver not configured"
    print_info "Configuring merge.ours driver locally..."
    git config merge.ours.driver true
    print_info "Configured: git config merge.ours.driver = true"
fi

# Get target branch (from argument or current branch)
TARGET_BRANCH="${1:-$(git branch --show-current)}"
CURRENT_BRANCH=$(git branch --show-current)

# Validate target branch exists
if ! git rev-parse --verify "$TARGET_BRANCH" > /dev/null 2>&1; then
    print_error "Branch '$TARGET_BRANCH' not found"
    exit 1
fi

print_info "Target branch: $TARGET_BRANCH"

# Checkout target branch if not already on it
if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
    print_info "Checking out branch: $TARGET_BRANCH"
    git checkout "$TARGET_BRANCH"
fi

# Check if there are uncommitted changes
STASHED=false
if ! git diff-index --quiet HEAD --; then
    print_warn "You have uncommitted changes. Stashing them..."
    if [ "$NON_INTERACTIVE" = "1" ]; then
        git stash push -m "Stashed before rebasing from develop $(date +%Y-%m-%d)"
        STASHED=true
    else
        read -p "Do you want to stash changes? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git stash push -m "Stashed before rebasing from develop $(date +%Y-%m-%d)"
            STASHED=true
        else
            print_error "Aborting. Please commit or stash your changes first."
            exit 1
        fi
    fi
fi

# Fetch latest from develop
print_info "Fetching latest from develop..."
git fetch origin develop

# Check if origin/develop exists
if ! git rev-parse --verify origin/develop > /dev/null 2>&1; then
    print_error "origin/develop branch not found"
    exit 1
fi

# Check if branch is already up to date
DEVELOP_COMMIT=$(git rev-parse origin/develop)
MERGE_BASE=$(git merge-base HEAD origin/develop)

if [ "$MERGE_BASE" = "$DEVELOP_COMMIT" ]; then
    print_info "Branch is already up to date with develop"
    
    # Restore stashed changes if any
    if [ "$STASHED" = true ]; then
        print_info "Restoring stashed changes..."
        git stash pop || print_warn "Could not restore stash. Run 'git stash list' to see your stashes."
    fi
    
    print_info "No rebase needed!"
    exit 0
fi

# Show what will be rebased
print_info "Develop is at: $(git log -1 --oneline origin/develop)"
print_info "Current branch is at: $(git log -1 --oneline HEAD)"
print_info "Merge base: $(git log -1 --oneline $MERGE_BASE)"

# Ask for confirmation (skip in non-interactive mode)
if [ "$DRY_RUN" = "1" ]; then
    print_info "[DRY RUN] Would rebase $TARGET_BRANCH onto origin/develop"
    print_info "Run without DRY_RUN=1 to actually perform the rebase"
    # Restore stashed changes if any
    if [ "$STASHED" = true ]; then
        print_info "Restoring stashed changes..."
        git stash pop || print_warn "Could not restore stash."
    fi
    exit 0
fi

if [ "$NON_INTERACTIVE" = "1" ]; then
    print_info "Non-interactive mode: proceeding with rebase..."
else
    read -p "Do you want to rebase $TARGET_BRANCH onto develop? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warn "Aborted by user"
        # Restore stashed changes if any
        if [ "$STASHED" = true ]; then
            print_info "Restoring stashed changes..."
            git stash pop || print_warn "Could not restore stash."
        fi
        exit 0
    fi
fi

# Capture content file hashes before rebase
print_info "Capturing content file state before rebase..."
capture_content_hashes

# Rebase onto develop
print_info "Rebasing $TARGET_BRANCH onto origin/develop..."
if git rebase origin/develop; then
    print_info "Rebase successful!"
    verify_content_preservation
    REBASE_STATUS=$?
else
    print_error "Rebase failed with conflicts"
    print_info ""
    print_info "═══════════════════════════════════════════════════════════════"
    print_info "CONFLICT RESOLUTION GUIDE"
    print_info "═══════════════════════════════════════════════════════════════"
    print_info ""
    print_info "1. Review conflicts with: git status"
    print_info ""
    print_info "2. Resolve by type:"
    print_info ""

    # Categorize conflicts
    content_conflicts=$(git diff --name-only --diff-filter=U 2>/dev/null | grep -E '\.(mdx|json|yml|yaml|scss|css)$' || true)
    code_conflicts=$(git diff --name-only --diff-filter=U 2>/dev/null | grep -E '\.(tsx?|jsx?)$' || true)
    other_conflicts=$(git diff --name-only --diff-filter=U 2>/dev/null | grep -v -E '\.(mdx|json|yml|yaml|scss|css|tsx?|jsx?)$' || true)

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
        print_info "   Command: git add <file> (after manually resolving)"
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
    print_info ""

    # Restore stashed changes if any (even on failure)
    if [ "$STASHED" = true ]; then
        print_info "Restoring stashed changes..."
        git stash pop || print_warn "Could not restore stash."
    fi
    exit 1
fi

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    print_info "Restoring stashed changes..."
    git stash pop || print_warn "Could not restore stash. Run 'git stash list' to see your stashes."
fi

# Ask about pushing (or auto-push if enabled)
if [ "$AUTO_PUSH" = "1" ]; then
    print_info "Auto-push enabled: pushing to origin/$TARGET_BRANCH..."
    if git push --force-with-lease origin "$TARGET_BRANCH"; then
        print_info "Successfully pushed to origin/$TARGET_BRANCH!"
    else
        print_error "Push failed. This might be because someone else pushed changes."
        print_info "If you're sure you want to overwrite, you can use: git push --force origin $TARGET_BRANCH"
        exit 1
    fi
elif [ "$NON_INTERACTIVE" != "1" ]; then
    read -p "Do you want to push to origin/$TARGET_BRANCH? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if git push --force-with-lease origin "$TARGET_BRANCH"; then
            print_info "Successfully pushed to origin/$TARGET_BRANCH!"
        else
            print_error "Push failed. This might be because someone else pushed changes."
            print_info "If you're sure you want to overwrite, you can use: git push --force origin $TARGET_BRANCH"
            exit 1
        fi
    else
        print_warn "Skipped pushing to origin/$TARGET_BRANCH"
    fi
fi

print_info "Rebase completed successfully!"
