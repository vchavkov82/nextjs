#!/bin/bash

# Script to resolve rebase conflicts and continue
# This script marks conflicts as resolved and continues the rebase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a rebase
if [ ! -f .git/rebase-merge/git-rebase-todo ]; then
    print_error "Not in a rebase. Nothing to resolve."
    exit 1
fi

print_info "Resolving rebase conflicts..."

# Mark deleted files as resolved (if they exist in git index)
if git ls-files --error-unmatch apps/www/data/solutions/developers.tsx >/dev/null 2>&1; then
    print_info "Removing apps/www/data/solutions/developers.tsx"
    git rm apps/www/data/solutions/developers.tsx 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || true
fi

if git ls-files --error-unmatch apps/www/pages/solutions/developers.tsx >/dev/null 2>&1; then
    print_info "Removing apps/www/pages/solutions/developers.tsx"
    git rm apps/www/pages/solutions/developers.tsx 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || true
fi

# Mark sitemap as resolved
if [ -f apps/www/public/sitemap_www.xml ]; then
    print_info "Staging apps/www/public/sitemap_www.xml"
    git add apps/www/public/sitemap_www.xml 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || true
fi

# Check if there are any remaining unmerged files
UNMERGED=$(git diff --name-only --diff-filter=U 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || echo "")

if [ -n "$UNMERGED" ]; then
    print_warn "Still have unmerged files:"
    echo "$UNMERGED"
    print_error "Please resolve remaining conflicts before continuing."
    exit 1
fi

# Check if we're in a rebase (not a merge)
if [ -f .git/rebase-merge/git-rebase-todo ]; then
    print_info "All conflicts resolved. Continuing rebase..."
    git rebase --continue 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || {
        REBASE_OUTPUT=$(git rebase --continue 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || echo "")
        if echo "$REBASE_OUTPUT" | grep -q "Successfully rebased"; then
            print_info "Rebase completed successfully!"
            exit 0
        else
            print_error "Rebase continue failed. Check the output above."
            echo "$REBASE_OUTPUT"
            exit 1
        fi
    }
    print_info "Rebase completed successfully!"
elif [ -f .git/MERGE_HEAD ]; then
    # We're in a merge, not a rebase
    print_info "All conflicts resolved. Committing merge..."
    git commit --no-edit 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || {
        print_error "Merge commit failed. Check the output above."
        exit 1
    }
    print_info "Merge completed successfully!"
else
    print_warn "Not in a rebase or merge. Nothing to continue."
    exit 0
fi
