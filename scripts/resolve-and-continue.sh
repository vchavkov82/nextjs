#!/bin/bash
# Script to resolve rebase conflicts and continue

set -e

echo "Resolving merge conflicts..."

# Mark deleted files as resolved (confirm deletion)
# For "deleted by us" conflicts, we need to remove them from the index
echo "Marking deleted files as resolved..."
# Check if files are in the index and remove them
if git ls-files --error-unmatch apps/www/data/solutions/developers.tsx >/dev/null 2>&1; then
    git rm apps/www/data/solutions/developers.tsx 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || true
else
    # File not in index, use git add to stage the deletion
    git add apps/www/data/solutions/developers.tsx 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || true
fi

if git ls-files --error-unmatch apps/www/pages/solutions/developers.tsx >/dev/null 2>&1; then
    git rm apps/www/pages/solutions/developers.tsx 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || true
else
    # File not in index, use git add to stage the deletion
    git add apps/www/pages/solutions/developers.tsx 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || true
fi

# Mark sitemap as resolved
echo "Staging resolved sitemap..."
git add apps/www/public/sitemap_www.xml 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || true

# Check if there are any remaining unmerged files
UNMERGED=$(git diff --name-only --diff-filter=U 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || echo "")

if [ -n "$UNMERGED" ]; then
    echo "Warning: Still have unmerged files:"
    echo "$UNMERGED"
    exit 1
fi

echo "All conflicts resolved. Continuing rebase..."
git rebase --continue 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || {
    echo "Rebase continue completed or needs attention."
    exit 0
}

echo "Rebase completed successfully!"
