#!/bin/bash
# Simple script to mark all conflicts as resolved

echo "Marking conflicts as resolved..."

# For "deleted by us" conflicts, remove from index (even if file doesn't exist)
# This tells git we want to keep the deletion
echo "Removing deleted files from index..."
git rm --cached apps/www/data/solutions/developers.tsx 2>/dev/null || git add apps/www/data/solutions/developers.tsx 2>/dev/null || true
git rm --cached apps/www/pages/solutions/developers.tsx 2>/dev/null || git add apps/www/pages/solutions/developers.tsx 2>/dev/null || true

# Mark sitemap as resolved
echo "Staging sitemap..."
git add apps/www/public/sitemap_www.xml

echo "All conflicts marked as resolved!"
echo "Run 'git rebase --continue' to continue the rebase."
