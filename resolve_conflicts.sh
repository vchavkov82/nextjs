#!/bin/bash

# Auto-resolve rebase conflicts script
# This script resolves conflicts by:
# 1. Removing files that were deleted in HEAD (DU conflicts)
# 2. Keeping HEAD version for content conflicts (UU conflicts)

echo "Resolving rebase conflicts..."

while true; do
    # Check if we're still in a rebase
    if ! git rebase --show-current-patch 2>/dev/null; then
        echo "No rebase in progress or rebase completed"
        break
    fi

    # Count conflicts
    du_count=$(git status --porcelain | grep "^DU" | wc -l)
    uu_count=$(git status --porcelain | grep "^UU" | wc -l)
    
    echo "Found $du_count DU conflicts and $uu_count UU conflicts"
    
    if [ $du_count -eq 0 ] && [ $uu_count -eq 0 ]; then
        echo "No conflicts found, continuing rebase"
        git rebase --continue
        if [ $? -eq 0 ]; then
            echo "Rebase continued successfully"
            continue
        else
            echo "Rebase continue failed, checking for new conflicts"
            continue
        fi
    fi

    # Resolve DU conflicts (deleted in HEAD, modified in theirs)
    if [ $du_count -gt 0 ]; then
        echo "Resolving DU conflicts by removing files..."
        git status --porcelain | grep "^DU" | awk '{print $2}' | xargs git rm -f
    fi

    # Resolve UU conflicts (both modified) - keep HEAD version
    if [ $uu_count -gt 0 ]; then
        echo "Resolving UU conflicts by keeping HEAD version..."
        git status --porcelain | grep "^UU" | awk '{print $2}' | xargs -I {} git checkout --ours {}
    fi

    # Add all resolved files
    git add .

    echo "Attempting to continue rebase..."
    git rebase --continue
    if [ $? -ne 0 ]; then
        echo "Rebase continue returned error, checking for more conflicts..."
        sleep 1
    fi
done

echo "Conflict resolution complete!"
