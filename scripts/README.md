# Scripts Directory

This directory contains utility scripts for development, deployment, and maintenance tasks.

## Development Scripts

### `dev-kill.sh`
**Purpose**: Stop all development services and free up common ports
**Usage**: `./dev-kill.sh [--force] [--verbose] [--help]`

**Features**:
- Stops Docker/Podman services gracefully
- Kills Next.js dev processes
- Kills Turbo processes
- Frees common development ports (3000, 3001, 3003, 3004, 3030, 8082, 5173, 5174)
- Verifies ports are actually free with retry logic
- Supports both Docker and Podman

**Examples**:
```bash
# Interactive mode (default)
./dev-kill.sh

# Force kill without confirmation
./dev-kill.sh --force

# Show detailed output
./dev-kill.sh --verbose
```

## Docker/Podman Scripts

### `docker-reset.sh`
**Purpose**: Reset Docker/Podman environment by removing containers, volumes, and optionally resetting .env
**Usage**: `./docker-reset.sh [-y] [--no-env-reset] [--help]`

**Features**:
- Auto-detects Docker or Podman runtime
- Supports docker-compose, podman-compose, and docker-compose commands
- Safely removes containers, volumes, and bind mounts
- Optional .env file reset with backup
- Comprehensive error handling and validation

**Examples**:
```bash
# Interactive mode with confirmation
./docker-reset.sh

# Auto-confirm all prompts
./docker-reset.sh -y

# Skip .env file reset
./docker-reset.sh --no-env-reset
```

### `podman-cleanup.sh`
**Purpose**: Cleanup script for Podman containers, images, networks, and pods
**Usage**: `./podman-cleanup.sh [--images] [--volumes] [--all]`

**Features**:
- Removes containers, pods, and networks by default
- Optional image and volume removal
- Filters out harmless Podman rootless UID warnings
- Comprehensive cleanup with error handling

**Examples**:
```bash
# Basic cleanup (containers, pods, networks only)
./podman-cleanup.sh

# Remove everything
./podman-cleanup.sh --all

# Remove containers and images only
./podman-cleanup.sh --images
```

## Git Scripts

### `git-sync-upstream.sh`
**Purpose**: Sync upstream/master to origin/master by rebasing
**Usage**: `./git-sync-upstream.sh` (set `NON_INTERACTIVE=1` for non-interactive mode)

**Features**:
- Keeps origin/master as a clean copy of upstream/master
- Handles uncommitted changes (stashes them)
- Colored output and detailed logging
- Safety checks and confirmations

### `rebase-from-develop.sh`
**Purpose**: Rebase a branch from develop
**Usage**: `./rebase-from-develop.sh [branch-name]` (set `AUTO_PUSH=1` for auto-push)

**Features**:
- Rebases current branch or specified branch onto develop
- Handles uncommitted changes
- Optional automatic pushing after rebase
- Comprehensive error handling

## Database Scripts

### `start-postgres.sh` / `start-postgres-noninteractive.sh`
**Purpose**: Start PostgreSQL database services
**Usage**: `./start-postgres.sh` or `./start-postgres-noninteractive.sh`

### `stop-postgres.sh`
**Purpose**: Stop PostgreSQL database services
**Usage**: `./stop-postgres.sh`

### `verify-postgres-setup.sh`
**Purpose**: Verify PostgreSQL setup and connectivity
**Usage**: `./verify-postgres-setup.sh`

### `wait-for-postgres.sh` / `wait-for-postgres-ready.sh`
**Purpose**: Wait for PostgreSQL to be ready
**Usage**: `./wait-for-postgres.sh` or `./wait-for-postgres-ready.sh`

### `wait-for-supabase.sh`
**Purpose**: Wait for Supabase services to be ready
**Usage**: `./wait-for-supabase.sh`

## Deployment Scripts

### `upload-static-assets.sh`
**Purpose**: Upload static build assets and public files to Cloudflare R2 CDN
**Usage**: `./upload-static-assets.sh [--dry-run] [--force] [--help]`

**Environment Variables**:
- `FORCE_ASSET_CDN`: Force upload (1=enable, -1=disable, 0/unset=auto)
- `VERCEL_ENV`: Vercel environment (production/staging/preview)
- `NEXT_PUBLIC_ENVIRONMENT`: App environment (staging/prod)
- `SITE_NAME`: Site identifier for CDN path
- `VERCEL_GIT_COMMIT_SHA`: Git commit SHA for versioning
- `ASSET_CDN_S3_ENDPOINT`: R2 S3 endpoint URL

**Features**:
- Optimizes asset delivery by serving from CDN instead of Vercel
- Supports dry-run mode for testing
- Comprehensive validation and error handling
- Automatic AWS CLI installation if needed

### `getSecrets.js`
**Purpose**: Fetch secrets from AWS Secrets Manager and write them to .env.local
**Usage**: `node getSecrets.js -n <secret-name> [-r <region>]`

**Options**:
- `-n, --secret-name`: Name of the secret in AWS Secrets Manager (required)
- `-r, --region`: AWS region (default: ap-southeast-2)

**Features**:
- Comprehensive error handling and validation
- Support for both JSON and raw string secrets
- Retry configuration for better reliability
- Proper secret key format validation

### `authorizeVercelDeploys.ts`
**Purpose**: Authorize Vercel deployments from PR information
**Usage**: Runs automatically in CI/CD with environment variables

**Environment Variables**:
- `HEAD_COMMIT_SHA`: Current commit SHA
- `VERCEL_TOKEN`: Vercel API token

**Features**:
- Fetches GitHub statuses for authorization-required deployments
- Authorizes deployments via Vercel API
- TypeScript with Zod validation
- Comprehensive error handling

## GitHub Actions

### `actions/find-stale-dashboard-prs.js`
**Purpose**: Finds stale Dashboard PRs (older than 24 hours) and fetches their status
**Usage**: Called from GitHub Actions workflows

**Features**:
- Filters PRs by age and file changes
- Checks review status and mergeable state
- Paging support for large repositories
- Detailed status reporting

### `actions/send-slack-pr-notification.js`
**Purpose**: Sends Slack notifications about stale PRs
**Usage**: Called from GitHub Actions workflows

**Features**:
- Formats PR information for Slack
- Handles Slack block limits
- Proper escaping for Slack mrkdwn
- Error handling for API failures

## Utility Scripts

### `view-upstream-commit.sh`
**Purpose**: View the latest commit from upstream repository
**Usage**: `./view-upstream-commit.sh`

## Script Standards

All scripts follow these standards:
- **Error Handling**: Comprehensive error handling with proper exit codes
- **Validation**: Input validation and prerequisite checking
- **Documentation**: Clear usage instructions and help text
- **Logging**: Structured logging with colors and levels
- **Compatibility**: Support for multiple environments (Docker/Podman, etc.)
- **Safety**: Confirmation prompts for destructive operations

## Environment Variables

Common environment variables used across scripts:
- `DEBUG=1`: Enable debug logging
- `NON_INTERACTIVE=1`: Skip confirmation prompts
- `FORCE=1`: Force operations without confirmation

## Contributing

When adding new scripts:
1. Follow the existing naming conventions
2. Include comprehensive help text
3. Add proper error handling and validation
4. Update this README.md
5. Test thoroughly before committing

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make scripts executable with `chmod +x scripts/*.sh`
2. **Missing Dependencies**: Install required tools (Docker, Podman, AWS CLI, etc.)
3. **Environment Variables**: Ensure all required environment variables are set
4. **Port Conflicts**: Use `./dev-kill.sh` to free up development ports

### Getting Help

Most scripts support `--help` or `-h` flags for detailed usage information:
```bash
./script-name.sh --help
```
