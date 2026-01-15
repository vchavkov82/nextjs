#!/bin/bash

# Optimized script to sync upstream changes by analyzing and re-implementing
# This script rebases from origin develop to assistance/chavkov branches while analyzing
# upstream changes for re-implementation rather than direct rebasing
#
# Set NON_INTERACTIVE=1 to skip all prompts and use defaults
#
# Usage examples:
#   ./scripts/git-sync-upstream.sh assistance
#   ./scripts/git-sync-upstream.sh chavkov
#   NON_INTERACTIVE=1 ./scripts/git-sync-upstream.sh assistance

set -e

# Check for non-interactive mode
NON_INTERACTIVE=${NON_INTERACTIVE:-0}

# Get target branch from first parameter
TARGET_BRANCH=$1

# Validate target branch parameter
if [ -z "$TARGET_BRANCH" ]; then
    print_error "Target branch must be specified as first parameter"
    print_info "Allowed target branches: assistance, chavkov"
    print_info "Usage: ./scripts/git-sync-upstream.sh <assistance|chavkov>"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Function to analyze upstream changes
analyze_upstream_changes() {
    local source_branch=$1
    local target_branch=$2
    local analysis_file=$(mktemp)
    
    print_info "Analyzing changes from upstream/$source_branch to $target_branch..."
    
    # Get commit range
    local merge_base=$(git merge-base "$target_branch" "upstream/$source_branch" 2>/dev/null || echo "")
    if [ -z "$merge_base" ]; then
        print_warn "No common base found between $target_branch and upstream/$source_branch"
        return 1
    fi
    
    # Generate analysis report
    {
        echo "# Upstream Changes Analysis Report"
        echo "Generated: $(date)"
        echo "Source: upstream/$source_branch"
        echo "Target: $target_branch"
        echo "Merge Base: $(git rev-parse --short $merge_base)"
        echo ""
        
        echo "## Commit Summary"
        git log --oneline --graph --decorate $merge_base..upstream/$source_branch
        echo ""
        
        echo "## File Changes"
        git diff --stat $merge_base..upstream/$source_branch
        echo ""
        
        echo "## Detailed Changes by File"
        git diff --name-status $merge_base..upstream/$source_branch
        echo ""
        
        echo "## Potential Conflicts"
        git diff --name-only --diff-filter=U $merge_base..upstream/$source_branch 2>/dev/null || echo "No conflicts detected"
        echo ""
        
        echo "## Key Commits to Review"
        git log --pretty=format:"%h - %an (%ar): %s" --grep="feat\|fix\|BREAKING" $merge_base..upstream/$source_branch | head -10
        echo ""
        
    } > "$analysis_file"
    
    print_info "Analysis report saved to: $analysis_file"
    print_debug "Key findings:"
    git log --oneline $merge_base..upstream/$source_branch | head -5 | while read line; do
        print_debug "  $line"
    done
    
    echo "$analysis_file"
}

# Function to create re-implementation plan
create_reimplementation_plan() {
    local analysis_file=$1
    local plan_file=$(mktemp)
    
    print_info "Creating re-implementation plan..."
    
    {
        echo "# Re-implementation Plan"
        echo "Based on analysis: $(basename $analysis_file)"
        echo "Created: $(date)"
        echo ""
        echo "## Steps to Re-implement Changes"
        echo ""
        echo "1. Review the analysis report for breaking changes"
        echo "2. Identify critical features that need manual implementation"
        echo "3. Create feature branches for major changes"
        echo "4. Test each change independently"
        echo "5. Merge changes incrementally"
        echo ""
        echo "## Automated Implementation Tasks"
        echo ""
        
        # Extract file changes and suggest actions
        grep -A 100 "## File Changes" "$analysis_file" | grep -B 100 "## Detailed Changes" | \
        grep -E "^\s+[0-9]+\s+.*\|\s+[0-9]+" | while read line; do
            if [[ $line =~ (.+)\|\s+([0-9]+) ]]; then
                local file="${BASH_REMATCH[1]}"
                local changes="${BASH_REMATCH[2]}"
                echo "- Review and adapt changes in: $file ($changes lines)"
            fi
        done
        
        echo ""
        echo "## Manual Review Required"
        echo "- Configuration files"
        echo "- Database migrations"
        echo "- API endpoints"
        echo "- Security-related changes"
        
    } > "$plan_file"
    
    print_info "Re-implementation plan saved to: $plan_file"
    echo "$plan_file"
}

# Function to safely rebase with analysis
safe_rebase_with_analysis() {
    local source_branch=$1
    local target_branch=$2
    
    print_info "Starting safe rebase process from upstream/$source_branch to $target_branch..."
    
    # Step 1: Analyze changes
    local analysis_file=$(analyze_upstream_changes "$source_branch" "$target_branch")
    if [ $? -ne 0 ]; then
        print_error "Analysis failed"
        return 1
    fi
    
    # Step 2: Create implementation plan
    local plan_file=$(create_reimplementation_plan "$analysis_file")
    
    # Step 3: Show summary and get confirmation
    print_info "=== Analysis Summary ==="
    local commit_count=$(git rev-list --count $merge_base..upstream/$source_branch 2>/dev/null || echo "unknown")
    print_info "Commits to analyze: $commit_count"
    print_info "Analysis file: $analysis_file"
    print_info "Implementation plan: $plan_file"
    
    if [ "$NON_INTERACTIVE" != "1" ]; then
        echo
        read -p "Do you want to proceed with the re-implementation process? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warn "Aborted by user"
            print_info "Analysis files preserved for manual review:"
            print_info "  $analysis_file"
            print_info "  $plan_file"
            return 0
        fi
    fi
    
    # Step 4: Create a temporary branch for re-implementation
    local temp_branch="reimpl-$(date +%Y%m%d-%H%M%S)"
    git checkout -b "$temp_branch" "$target_branch"
    
    print_info "Created temporary branch: $temp_branch"
    print_info "Ready for manual re-implementation based on analysis"
    
    # Step 5: Apply changes selectively (cherry-pick approach)
    print_info "Applying changes selectively..."
    
    # Get list of commits to apply
    local commits=$(git rev-list --reverse $merge_base..upstream/$source_branch)
    local applied_count=0
    local skipped_count=0
    
    for commit in $commits; do
        local commit_msg=$(git log --format="%s" -n 1 $commit)
        local commit_author=$(git log --format="%an" -n 1 $commit)
        
        print_debug "Processing commit: $(git rev-parse --short $commit) - $commit_msg"
        
        # Skip certain types of commits automatically
        if [[ "$commit_msg" =~ ^(chore|docs|style|refactor|test) ]]; then
            print_debug "Skipping maintenance commit: $commit_msg"
            ((skipped_count++))
            continue
        fi
        
        # Try to cherry-pick the commit
        if git cherry-pick -x $commit 2>/dev/null; then
            print_debug "Applied: $(git rev-parse --short $commit)"
            ((applied_count++))
        else
            print_warn "Failed to apply $(git rev-parse --short $commit): $commit_msg"
            git cherry-pick --abort 2>/dev/null || true
            ((skipped_count++))
        fi
    done
    
    print_info "Re-implementation summary:"
    print_info "  Applied commits: $applied_count"
    print_info "  Skipped commits: $skipped_count"
    
    # Step 6: Merge back to target branch if successful
    if [ $applied_count -gt 0 ]; then
        if [ "$NON_INTERACTIVE" = "1" ]; then
            print_info "Non-interactive mode: merging changes to $target_branch..."
            git checkout "$target_branch"
            git merge "$temp_branch" --no-ff -m "Re-implement upstream changes from $source_branch"
            git branch -d "$temp_branch"
        else
            read -p "Do you want to merge these changes to $target_branch? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git checkout "$target_branch"
                git merge "$temp_branch" --no-ff -m "Re-implement upstream changes from $source_branch"
                git branch -d "$temp_branch"
                print_info "Changes merged to $target_branch"
            else
                print_warn "Changes kept in branch: $temp_branch"
                print_info "You can merge manually when ready"
            fi
        fi
    else
        print_warn "No commits were applied. Keeping temporary branch for manual work."
    fi
    
    # Cleanup
    print_info "Cleaning up temporary files..."
    rm -f "$analysis_file" "$plan_file"
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

# Get current branch and validate target branch
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"

# Validate TARGET_BRANCH is one of the allowed branches
ALLOWED_BRANCHES=("assistance" "chavkov")
if [[ ! " ${ALLOWED_BRANCHES[@]} " =~ " ${TARGET_BRANCH} " ]]; then
    print_error "Target branch '$TARGET_BRANCH' is not allowed"
    print_info "Allowed target branches: ${ALLOWED_BRANCHES[*]}"
    print_info "Usage: ./scripts/git-sync-upstream.sh <assistance|chavkov>"
    exit 1
fi

print_info "Target branch: $TARGET_BRANCH"

# Validate target branch exists locally or remotely
if ! git rev-parse --verify "$TARGET_BRANCH" > /dev/null 2>&1 && \
   ! git rev-parse --verify "origin/$TARGET_BRANCH" > /dev/null 2>&1; then
    print_error "Target branch '$TARGET_BRANCH' not found locally or on origin"
    print_info "Available branches on origin:"
    git branch -r | grep origin/ | sed 's/origin\///' | grep -E "(assistance|chavkov)" || echo "  None of the target branches found on origin"
    exit 1
fi

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

# Fetch latest from all remotes
print_info "Fetching latest from all remotes..."
git fetch --all --prune

# Determine source branch (defaults to develop)
SOURCE_BRANCH=${SOURCE_BRANCH:-develop}
print_info "Using source branch: $SOURCE_BRANCH"

# Check if upstream source branch exists
if ! git rev-parse --verify "upstream/$SOURCE_BRANCH" > /dev/null 2>&1; then
    print_error "upstream/$SOURCE_BRANCH branch not found"
    print_info "Available upstream branches:"
    git branch -r | grep upstream/ | sed 's/upstream\///'
    exit 1
fi

# Ensure target branch is checked out and up to date
if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
    print_info "Checking out target branch: $TARGET_BRANCH"
    if git rev-parse --verify "$TARGET_BRANCH" > /dev/null 2>&1; then
        git checkout "$TARGET_BRANCH"
    else
        print_info "Creating local branch $TARGET_BRANCH from origin/$TARGET_BRANCH..."
        git checkout -b "$TARGET_BRANCH" "origin/$TARGET_BRANCH"
    fi
fi

# Update target branch from origin if it exists
if git rev-parse --verify "origin/$TARGET_BRANCH" > /dev/null 2>&1; then
    print_info "Updating $TARGET_BRANCH from origin/$TARGET_BRANCH..."
    git pull origin "$TARGET_BRANCH" --ff-only || \
    print_warn "Could not fast-forward $TARGET_BRANCH from origin/$TARGET_BRANCH"
fi

# Main execution
print_info "Starting optimized sync process..."
print_info "Source: upstream/$SOURCE_BRANCH"
print_info "Target: $TARGET_BRANCH"

# Run the safe rebase with analysis
if safe_rebase_with_analysis "$SOURCE_BRANCH" "$TARGET_BRANCH"; then
    print_info "Sync process completed successfully!"
    
    # Push to origin if requested
    if [ "$NON_INTERACTIVE" = "1" ]; then
        print_info "Non-interactive mode: pushing to origin/$TARGET_BRANCH..."
        if git push --force-with-lease origin "$TARGET_BRANCH"; then
            print_info "Successfully pushed to origin/$TARGET_BRANCH!"
        else
            print_error "Push failed. This might be because someone else pushed changes."
            print_info "If you're sure you want to overwrite, you can use: git push --force origin $TARGET_BRANCH"
            exit 1
        fi
    else
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
else
    print_error "Sync process failed!"
    exit 1
fi

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    print_info "Restoring stashed changes..."
    git stash pop || print_warn "Could not restore stash. Run 'git stash list' to see your stashes."
fi

# Return to original branch if different
if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
    print_info "Returning to original branch: $CURRENT_BRANCH"
    git checkout "$CURRENT_BRANCH"
fi

print_info "Optimized sync completed successfully!"
print_info "Summary:"
print_info "  - Analyzed upstream changes from $SOURCE_BRANCH"
print_info "  - Re-implemented changes on $TARGET_BRANCH"
print_info "  - Maintained clean git history"

