#!/bin/bash

# Script to rebase a branch from develop
# Usage: ./scripts/rebase-from-develop.sh [branch-name]
# If no branch name is provided, uses the current branch
# 
# Set NON_INTERACTIVE=1 to skip all prompts and use defaults
# Set AUTO_PUSH=1 to automatically push after rebase

set -e

# Check for non-interactive mode
NON_INTERACTIVE=${NON_INTERACTIVE:-0}
AUTO_PUSH=${AUTO_PUSH:-0}

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

# Rebase onto develop
print_info "Rebasing $TARGET_BRANCH onto develop..."
if git rebase origin/develop; then
    print_info "Rebase successful!"
else
    print_error "Rebase failed. You may need to resolve conflicts manually."
    print_info "After resolving conflicts, run: git rebase --continue"
    print_info "Or abort with: git rebase --abort"
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
