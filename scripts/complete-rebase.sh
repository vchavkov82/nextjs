#!/bin/bash
# Simple script to complete rebase after conflicts are resolved

# Mark deleted files as resolved
git rm apps/www/data/solutions/developers.tsx apps/www/pages/solutions/developers.tsx 2>/dev/null || true

# Mark sitemap as resolved  
git add apps/www/public/sitemap_www.xml

# Continue rebase (this will commit automatically)
git rebase --continue

echo "Rebase completed!"
