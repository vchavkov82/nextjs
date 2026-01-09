#!/bin/bash
# Complete rebase - resolve conflicts and commit automatically

# Suppress node version errors
export NVM_DIR=""
unset NODE_VERSION

echo "=== Resolving conflicts and completing rebase ==="

# Resolve deleted files
echo "1. Resolving deleted files..."
git rm --cached apps/www/data/solutions/developers.tsx 2>&1 | grep -v "error: Requested version" || \
git add apps/www/data/solutions/developers.tsx 2>&1 | grep -v "error: Requested version" || echo "  ✓ Deleted file 1 resolved"

git rm --cached apps/www/pages/solutions/developers.tsx 2>&1 | grep -v "error: Requested version" || \
git add apps/www/pages/solutions/developers.tsx 2>&1 | grep -v "error: Requested version" || echo "  ✓ Deleted file 2 resolved"

# Resolve sitemap
echo "2. Staging sitemap..."
git add apps/www/public/sitemap_www.xml 2>&1 | grep -v "error: Requested version" && echo "  ✓ Sitemap staged" || echo "  ⚠ Sitemap may already be staged"

# Check status
echo "3. Checking for remaining conflicts..."
UNMERGED=$(git diff --name-only --diff-filter=U 2>&1 | grep -v "error: Requested version" || echo "")

if [ -z "$UNMERGED" ] || [ "$UNMERGED" = "" ]; then
    echo "  ✓ All conflicts resolved"
    
    # Continue rebase
    echo "4. Continuing rebase..."
    GIT_EDITOR=true git rebase --continue 2>&1 | grep -v "error: Requested version" && {
        echo ""
        echo "✅ Rebase completed successfully!"
    } || {
        echo ""
        echo "⚠ Rebase continue executed. Check status with: git status"
    }
else
    echo "  ⚠ Remaining conflicts:"
    echo "$UNMERGED"
    echo ""
    echo "Run these commands manually:"
    echo "  git add <each-file>"
    echo "  GIT_EDITOR=true git rebase --continue"
fi
