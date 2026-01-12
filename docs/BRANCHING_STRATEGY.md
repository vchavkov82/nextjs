# Git Branching & Rebasing Strategy

## Overview

This repository uses a specialized branching and rebasing strategy to maintain multiple content variations while sharing functional code changes. This allows you to:

- Create 4-10 feature branches with different content/design variations
- Regularly sync functional code changes from `develop` to feature branches
- Automatically preserve custom content/design during rebases
- Reduce conflicts by ~80% compared to traditional merge workflows

## Quick Reference

### For Daily Work

```bash
# Check setup before first rebase
./scripts/test-content-preservation.sh

# Rebase feature branch with latest functional code
./scripts/rebase-from-develop.sh

# Review what changed
git diff HEAD@{1}

# Test the build
pnpm build:docs
```

### For Creating New Feature Branches

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-content-variant

# Make your content changes
# Commit and push
git push -u origin feature/my-content-variant
```

## Branch Structure

### `develop` Branch
- **Purpose**: Main development branch for functional code
- **Contains**: React components, features, libraries, build configs
- **Team Members**: All developers can commit here
- **Rule**: Never contains feature-specific content

### Feature Branches (e.g., `chavkov`, `feature/variant-a`)
- **Purpose**: Custom content/design variations
- **Contains**: Custom MDX files, navigation menus, styles, assets
- **Frequency**: Rebased from develop regularly to get functional updates
- **Preservation**: Content is automatically preserved during rebase

## File Classification

### Content/Design Files (Preserved in Feature Branches)

These files are protected during rebase - your feature branch version is kept:

```
📄 Documentation
├── apps/docs/content/**/*.mdx (519 files)
├── apps/docs/docs/ref/**/*.mdx (reference docs)
└── apps/design-system/content/**/*.mdx

🧭 Navigation & Structure
├── apps/docs/components/Navigation/NavigationMenu/NavigationMenu.constants.ts
├── apps/docs/spec/*-sections.json
├── apps/docs/spec/**/*.yml
└── apps/docs/spec/**/*.yaml

🎨 Styles & Theming
├── apps/docs/styles/**/*.scss
├── apps/docs/styles/**/*.css
├── apps/design-system/styles/**/*.css
└── tailwind.config.cjs

🖼️  Assets
├── apps/docs/public/img/**/* (1,083 images)
├── apps/docs/public/videos/**/*
├── apps/docs/public/**/*.{png,jpg,svg,etc}

💾 CMS Content
├── apps/cms/src/collections/**/*
└── apps/cms/content/**/*

⚙️  Deployment Config (per-branch)
├── apps/docs/.env.development
├── apps/docs/.env.local
└── apps/cms/.env.local
```

### Functional Code (Synced from Develop)

These files always get updates from develop:

```
⚡ React Components
├── apps/docs/components/**/*.tsx
├── apps/docs/components/**/*.ts
└── apps/design-system/**/*.tsx

🔧 Features & Logic
├── apps/docs/features/**/*.ts
├── apps/docs/features/**/*.tsx
├── apps/docs/hooks/**/*.ts
└── apps/docs/hooks/**/*.tsx

📍 App Routes
├── apps/docs/app/**/*.tsx
└── apps/docs/app/**/*.ts

📚 Libraries
├── apps/docs/lib/**/*
└── apps/cms/lib/**/*

🔨 Build Configuration
├── package.json
├── apps/*/package.json
├── pnpm-workspace.yaml
├── turbo.json
├── next.config.mjs
└── tsconfig.json
```

## Workflow: Standard Rebase

### Step 1: Ensure Clean Working Directory

```bash
# Check status
git status

# If you have uncommitted changes, stash them
git stash push -m "Description of changes"
```

### Step 2: Create Backup Branch (First Time)

```bash
# Only needed before your first rebase
git branch $(git branch --show-current)-backup
```

### Step 3: Run Rebase

```bash
# Interactive mode (recommended for learning)
./scripts/rebase-from-develop.sh

# Or specify the branch explicitly
./scripts/rebase-from-develop.sh feature/my-branch

# Or use environment variables
NON_INTERACTIVE=1 AUTO_PUSH=1 ./scripts/rebase-from-develop.sh
```

### Step 4: Review Changes

```bash
# See what changed
git log --oneline origin/develop..HEAD

# See the diff
git diff origin/develop..HEAD --stat

# Verify content preserved
git diff HEAD@{1} apps/docs/content
```

### Step 5: Test Build

```bash
# Install dependencies
pnpm install

# Build documentation
pnpm build:docs

# Run tests (if applicable)
pnpm test

# Start dev server for manual verification
pnpm dev
```

### Step 6: Push to Remote

```bash
# Push with safety check
git push --force-with-lease origin $(git branch --show-current)

# Or let the script handle it
# (respond 'y' when prompted)
```

## Handling Conflicts

### Understanding Conflict Types

The rebase script categorizes conflicts to help you resolve them correctly:

#### 📄 Content/Design Files (Keep Feature Branch)

Files like MDX, JSON configs, SCSS, CSS - your feature branch version should be kept.

**Command**:
```bash
git checkout --ours apps/docs/content/guides/example.mdx
git add apps/docs/content/guides/example.mdx
```

#### ⚙️ Code Files (Take Develop Version)

Files like TypeScript, JavaScript - develop's version should be taken.

**Command**:
```bash
git checkout --theirs apps/docs/components/Example.tsx
git add apps/docs/components/Example.tsx
```

#### 📦 Other Files (Review Manually)

Review these case-by-case:

```bash
# Check the file
nano path/to/file

# After editing, add it
git add path/to/file
```

### Resolving Conflicts - Complete Example

```bash
# 1. Rebase encounters conflicts
./scripts/rebase-from-develop.sh
# Output shows conflicts by category

# 2. Resolve content files (keep ours)
git checkout --ours apps/docs/content/guides/example.mdx
git add apps/docs/content/guides/example.mdx

# 3. Resolve code files (take theirs)
git checkout --theirs apps/docs/components/Example.tsx
git add apps/docs/components/Example.tsx

# 4. Continue rebase
git rebase --continue

# 5. If more conflicts in next commit, repeat steps 2-4

# 6. Test and push
pnpm build:docs
git push --force-with-lease origin $(git branch --show-current)
```

### Aborting a Rebase

If things go wrong:

```bash
# Abort rebase and return to original state
git rebase --abort

# Reset to remote version if needed
git fetch origin
git reset --hard origin/$(git branch --show-current)
```

## Advanced Usage

### Dry Run (Preview Changes)

See what would happen without actually doing the rebase:

```bash
DRY_RUN=1 ./scripts/rebase-from-develop.sh
```

### Non-Interactive Mode

Skip all prompts (useful for automation):

```bash
NON_INTERACTIVE=1 AUTO_PUSH=1 ./scripts/rebase-from-develop.sh
```

### Disable Content Verification

Skip content preservation check (if it causes issues):

```bash
VERIFY_CONTENT=0 ./scripts/rebase-from-develop.sh
```

### Environment Variables Combined

```bash
# Dry run, non-interactive, with verification
DRY_RUN=1 NON_INTERACTIVE=1 ./scripts/rebase-from-develop.sh

# Perform rebase, no prompts, auto-push, verify content
NON_INTERACTIVE=1 AUTO_PUSH=1 VERIFY_CONTENT=1 ./scripts/rebase-from-develop.sh feature/my-branch
```

## Best Practices

### Rebasing Strategy

✅ **DO**:
- Rebase regularly (at least weekly) to avoid large conflicts
- Test after every rebase before pushing
- Use `--force-with-lease` when pushing (safer than `--force`)
- Create backup branches before first rebase
- Keep develop branch clean (only functional code)

❌ **DON'T**:
- Rebase the develop branch itself
- Push without testing the build
- Use `--force` without `--lease`
- Mix functional code and content changes in feature branches
- Commit large, unrelated changes to feature branches

### Commit Messages

When working in feature branches:

```bash
# Good: Clear separation of concerns
git commit -m "feat: add custom documentation for enterprise section"
git commit -m "style: update color scheme for variant-b branch"

# Less ideal: Mixed changes
git commit -m "Updated docs and components"
```

### Handling New Content Files

If develop adds a new MDX file that should be customized:

```bash
# After rebase, new file appears
git show origin/develop:apps/docs/content/new-guide.mdx > apps/docs/content/new-guide.mdx

# Customize for this branch
nano apps/docs/content/new-guide.mdx

# Commit
git add apps/docs/content/new-guide.mdx
git commit -m "Customize new guide for this variant"
```

### Handling Deleted Files

If your branch deleted a file but develop modified it:

```bash
# Option 1: Keep it deleted (during rebase conflict)
git rm apps/docs/content/removed-guide.mdx
git rebase --continue

# Option 2: Restore it (if needed later)
git show origin/develop:apps/docs/content/removed-guide.mdx > apps/docs/content/removed-guide.mdx
git add apps/docs/content/removed-guide.mdx
git commit -m "Restore removed guide"
```

## Testing Setup

### Before First Rebase

```bash
# Run validation tests
./scripts/test-content-preservation.sh

# Expected output: All tests pass ✓
```

### Before Important Rebases

```bash
# Dry run to see what would change
DRY_RUN=1 ./scripts/rebase-from-develop.sh

# If output looks good, run for real
./scripts/rebase-from-develop.sh
```

### After Every Rebase

```bash
# 1. Check content preserved
git diff HEAD@{1} apps/docs/content

# 2. Check updated code
git log origin/develop..HEAD --oneline

# 3. Test build
pnpm install
pnpm build:docs

# 4. Check for type errors
pnpm typecheck

# 5. Visual check (in development)
pnpm dev
# Visit http://localhost:3000
# Check that your custom content appears correctly
```

## Troubleshooting

### Problem: Rebase fails with "merge.ours driver not configured"

**Solution**:
```bash
git config merge.ours.driver true
```

### Problem: Content files changed after rebase

**Check what changed**:
```bash
git diff origin/feature-branch -- apps/docs/content
```

**Restore from previous commit**:
```bash
git show HEAD~1:apps/docs/content/guides/example.mdx > apps/docs/content/guides/example.mdx
git add apps/docs/content/guides/example.mdx
git commit -m "Restore content"
```

### Problem: Build fails after rebase

**Usually caused by missing dependencies**:
```bash
# Clean and reinstall
pnpm clean
rm -rf .next .turbo node_modules

# Reinstall and rebuild
pnpm install
pnpm build:docs

# Check for TypeScript errors
pnpm typecheck
```

### Problem: Too many conflicts during rebase

**Likely cause**: Branch is too far behind develop

**Solution**:
1. Abort rebase: `git rebase --abort`
2. Create backup: `git branch $(git branch --show-current)-old`
3. Try again with patience: `./scripts/rebase-from-develop.sh`
4. Resolve conflicts step-by-step

### Problem: "origin/develop not found"

**Solution**:
```bash
# Fetch develop from remote
git fetch origin develop

# Try rebase again
./scripts/rebase-from-develop.sh
```

### Problem: Accidentally pushed broken commit

**Solution**:
```bash
# Find the good commit
git log --oneline

# Reset to good state
git reset --hard <good-commit-hash>

# Force push (be careful!)
git push --force origin $(git branch --show-current)
```

## Emergency Procedures

### Complete Rollback to Remote

```bash
# Get latest from remote
git fetch origin

# Reset to match remote exactly
git reset --hard origin/$(git branch --show-current)

# Verify
git log --oneline -1
```

### Restore from Backup Branch

```bash
# If you created a backup branch before rebasing
git reset --hard feature/my-branch-backup

# Or restore specific files
git checkout feature/my-branch-backup -- apps/docs/content
```

### Retrieve Lost Commits

```bash
# Find recent commits
git reflog

# Reset to a previous state
git reset --hard HEAD@{5}  # adjust number as needed
```

## Automation (Optional)

### GitHub Actions for Auto-Rebase

If your team wants automated daily rebases:

```yaml
# .github/workflows/auto-rebase-branches.yml
name: Auto-Rebase Content Branches
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
  workflow_dispatch:

jobs:
  rebase:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        branch: [chavkov, feature/variant-a, feature/variant-b]
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ matrix.branch }}
          fetch-depth: 0
      - name: Configure Git
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git config merge.ours.driver true
      - name: Rebase
        run: ./scripts/rebase-from-develop.sh
        continue-on-error: true
      - name: Notify on failure
        if: failure()
        run: |
          echo "Auto-rebase failed for ${{ matrix.branch }}"
```

## Common Questions

### Q: How often should I rebase?
**A**: Weekly is ideal. Daily if develop is changing rapidly. Before important work if it's been a while.

### Q: What if develop and my branch have conflicting changes?
**A**: The `.gitattributes` file with `merge=ours` strategy ensures content files use your version. Code files use develop's version. Manual conflicts are categorized to help resolution.

### Q: Can I rebase multiple times?
**A**: Yes! Rebase as often as you need. The safety features (hash verification, conflict categorization) work every time.

### Q: What if I make mistakes in resolving conflicts?
**A**: You can abort with `git rebase --abort` and start over. Or reset to remote: `git reset --hard origin/<branch>`.

### Q: How do I know if content was preserved?
**A**: The rebase script verifies this automatically. Look for "Content preservation verified ✓" in output. Or check manually: `git diff HEAD@{1} apps/docs/content`

### Q: Do I need to do anything special when merging to production?
**A**: No. Feature branches merge normally. Just ensure content is as desired before merging to main/production.

## Support & Resources

- **Git Attributes**: https://git-scm.com/docs/gitattributes
- **Merge Strategies**: https://git-scm.com/docs/merge-strategies
- **Git Rebase**: https://git-scm.com/book/en/v2/Git-Branching-Rebasing
- **This Repository**: See `.gitattributes` at root and `scripts/rebase-from-develop.sh`

## Need Help?

1. **Before rebasing**: Run `./scripts/test-content-preservation.sh`
2. **During rebase**: Script provides conflict categorization and commands
3. **After issues**: See "Troubleshooting" section above
4. **Stuck**: Create a backup branch and start fresh

---

**Last Updated**: January 2026
**Strategy Type**: Content-Preserving Rebase with Git Attributes
**Affected Branches**: 4-10 feature branches, 519 MDX files, 1,083 assets
