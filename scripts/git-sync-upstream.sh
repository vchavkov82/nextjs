#!/bin/bash

# Script to sync upstream/master to origin/master by rebasing
# This keeps origin/master as a clean copy of upstream/master
# 
# Set NON_INTERACTIVE=1 to skip all prompts and use defaults

set -e

# Check for non-interactive mode
NON_INTERACTIVE=${NON_INTERACTIVE:-0}

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

# Check if upstream remote exists
if ! git remote | grep -q "^upstream$"; then
    print_error "Upstream remote not found. Please add it with: git remote add upstream <url>"
    exit 1
fi

# Check if origin remote exists
if ! git remote | grep -q "^origin$"; then
    print_error "Origin remote not found"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warn "You have uncommitted changes. Please commit or stash them before syncing."
    if [ "$NON_INTERACTIVE" = "1" ]; then
        print_info "Non-interactive mode: auto-stashing changes..."
        git stash push -m "Stashed before syncing upstream $(date +%Y-%m-%d)"
        STASHED=true
    else
        read -p "Do you want to stash changes? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git stash push -m "Stashed before syncing upstream $(date +%Y-%m-%d)"
            STASHED=true
        else
            print_error "Aborting. Please commit or stash your changes first."
            exit 1
        fi
    fi
fi

# Fetch latest from upstream
print_info "Fetching latest from upstream..."
git fetch upstream

# Check if upstream/master exists
if ! git rev-parse --verify upstream/master > /dev/null 2>&1; then
    print_error "upstream/master branch not found"
    exit 1
fi

# Checkout master branch
print_info "Checking out master branch..."
if git rev-parse --verify master > /dev/null 2>&1; then
    git checkout master
else
    print_warn "Local master branch not found. Creating it from origin/master..."
    git checkout -b master origin/master
fi

# Show what will be rebased
UPSTREAM_COMMIT=$(git rev-parse upstream/master)
CURRENT_COMMIT=$(git rev-parse HEAD)

if [ "$UPSTREAM_COMMIT" = "$CURRENT_COMMIT" ]; then
    print_info "Already up to date with upstream/master"
else
    print_info "Upstream/master is at: $(git log -1 --oneline upstream/master)"
    print_info "Current master is at: $(git log -1 --oneline HEAD)"
    
    # Ask for confirmation (skip in non-interactive mode)
    if [ "$NON_INTERACTIVE" = "1" ]; then
        print_info "Non-interactive mode: proceeding with rebase..."
    else
        read -p "Do you want to rebase master onto upstream/master? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warn "Aborted by user"
            exit 0
        fi
    fi
    
    # Rebase master onto upstream/master
    print_info "Rebasing master onto upstream/master..."
    if git rebase upstream/master; then
        print_info "Rebase successful!"
    else
        print_error "Rebase failed. You may need to resolve conflicts manually."
        print_info "After resolving conflicts, run: git rebase --continue"
        exit 1
    fi
fi

# Push to origin/master with force-with-lease for safety
print_info "Pushing to origin/master..."
if [ "$NON_INTERACTIVE" = "1" ]; then
    print_info "Non-interactive mode: proceeding with push..."
    if git push --force-with-lease origin master; then
        print_info "Successfully pushed to origin/master!"
    else
        print_error "Push failed. This might be because someone else pushed changes."
        print_info "If you're sure you want to overwrite, you can use: git push --force origin master"
        exit 1
    fi
else
    read -p "Do you want to push to origin/master? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if git push --force-with-lease origin master; then
            print_info "Successfully pushed to origin/master!"
        else
            print_error "Push failed. This might be because someone else pushed changes."
            print_info "If you're sure you want to overwrite, you can use: git push --force origin master"
            exit 1
        fi
    else
        print_warn "Skipped pushing to origin/master"
    fi
fi

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    print_info "Restoring stashed changes..."
    git stash pop || print_warn "Could not restore stash. Run 'git stash list' to see your stashes."
fi

# Return to original branch if different
if [ "$CURRENT_BRANCH" != "master" ]; then
    print_info "Returning to original branch: $CURRENT_BRANCH"
    git checkout "$CURRENT_BRANCH"
fi

print_info "Sync completed successfully!"

