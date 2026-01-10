#!/bin/bash
# View details of a commit from upstream/master that needs to be re-implemented
# Usage: ./scripts/view-upstream-commit.sh <commit-hash>

set -e

COMMIT_HASH=$1

if [ -z "$COMMIT_HASH" ]; then
  echo "Usage: $0 <commit-hash>"
  echo ""
  echo "Example: $0 4e9b718c"
  echo ""
  echo "View all commits in upstream/master not in develop:"
  echo "  git log develop..upstream/master --oneline --no-merges"
  exit 1
fi

# Fetch upstream if needed
git fetch upstream master 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)'

echo "=== Commit Details ==="
git show --stat --format="%H%n%an <%ae>%n%ad%n%n%s%n%n%b" --date=short $COMMIT_HASH 2>/dev/null || {
  echo "Commit $COMMIT_HASH not found. Fetching from upstream..."
  git fetch upstream master 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)'
  git show --stat --format="%H%n%an <%ae>%n%ad%n%n%s%n%n%b" --date=short $COMMIT_HASH 2>/dev/null || {
    echo "Error: Commit $COMMIT_HASH not found in upstream/master"
    exit 1
  }
}

echo ""
echo "=== Files Changed ==="
git show --name-status --format="" $COMMIT_HASH 2>/dev/null | head -50

echo ""
echo "=== Full Diff ==="
echo "To view full diff, run: git show $COMMIT_HASH"
