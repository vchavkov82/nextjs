#!/bin/bash

set -euo pipefail

# Upload static build assets and public files to Cloudflare R2 CDN
# This script optimizes asset delivery by serving from CDN instead of Vercel
#
# Usage: ./upload-static-assets.sh [--dry-run] [--force]
#   --dry-run: Show what would be uploaded without actually uploading
#   --force:  Force upload even if conditions aren't met
#
# Environment variables:
#   FORCE_ASSET_CDN: Force upload (1=enable, -1=disable, 0/unset=auto)
#   VERCEL_ENV: Vercel environment (production/staging/preview)
#   NEXT_PUBLIC_ENVIRONMENT: App environment (staging/prod)
#   SITE_NAME: Site identifier for CDN path
#   VERCEL_GIT_COMMIT_SHA: Git commit SHA for versioning
#   ASSET_CDN_S3_ENDPOINT: R2 S3 endpoint URL
#   AWS_ACCESS_KEY_ID: AWS credentials (optional if using instance profile)
#   AWS_SECRET_ACCESS_KEY: AWS credentials (optional if using instance profile)
#   AWS_SESSION_TOKEN: AWS credentials (optional if using instance profile)

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly STATIC_DIR=".next/static"
readonly PUBLIC_DIR="public"
readonly AWS_CLI_VERSION="2.22.35"
readonly AWS_CLI_INSTALL_DIR="/tmp/aws-cli-$$"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Parse command line arguments
DRY_RUN=false
FORCE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --help|-h)
      cat << EOF
Usage: $0 [--dry-run] [--force] [--help]

Upload static build assets and public files to Cloudflare R2 CDN.

Options:
  --dry-run  Show what would be uploaded without actually uploading
  --force    Force upload even if conditions aren't met
  --help, -h Show this help message

Environment variables:
  FORCE_ASSET_CDN           Force upload (1=enable, -1=disable, 0/unset=auto)
  VERCEL_ENV                Vercel environment (production/staging/preview)
  NEXT_PUBLIC_ENVIRONMENT   App environment (staging/prod)
  SITE_NAME                 Site identifier for CDN path
  VERCEL_GIT_COMMIT_SHA     Git commit SHA for versioning
  ASSET_CDN_S3_ENDPOINT     R2 S3 endpoint URL
  AWS_*                     AWS credentials (optional if using instance profile)

EOF
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Logging functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
  if [[ "${DEBUG:-0}" == "1" ]]; then
    echo -e "${BLUE}[DEBUG]${NC} $1"
  fi
}

# Validation functions
validate_required_vars() {
  local missing_vars=()
  
  if [[ -z "${SITE_NAME:-}" ]]; then
    missing_vars+=("SITE_NAME")
  fi
  
  if [[ -z "${VERCEL_GIT_COMMIT_SHA:-}" ]]; then
    missing_vars+=("VERCEL_GIT_COMMIT_SHA")
  fi
  
  if [[ -z "${ASSET_CDN_S3_ENDPOINT:-}" ]]; then
    missing_vars+=("ASSET_CDN_S3_ENDPOINT")
  fi
  
  if [[ ${#missing_vars[@]} -gt 0 ]]; then
    log_error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
      echo "  - $var"
    done
    exit 1
  fi
}

validate_commit_sha() {
  local sha="$1"
  if [[ ! "$sha" =~ ^[a-fA-F0-9]{40}$ ]]; then
    log_error "Invalid commit SHA format: $sha"
    exit 1
  fi
}

# Check if upload should proceed
should_upload() {
  # Check for explicit disable
  if [[ "$FORCE_ASSET_CDN" == "-1" ]]; then
    log_info "Asset CDN explicitly disabled via FORCE_ASSET_CDN=-1"
    return 1
  fi
  
  # Check for force mode
  if [[ "$FORCE" == "true" ]] || [[ "$FORCE_ASSET_CDN" == "1" ]]; then
    log_info "Upload forced via --force or FORCE_ASSET_CDN=1"
    return 0
  fi
  
  # Check for production environment
  if [[ "$VERCEL_ENV" == "production" ]]; then
    log_info "Running in production environment, proceeding with upload"
    return 0
  fi
  
  log_info "Skipping upload. Set FORCE_ASSET_CDN=1, VERCEL_ENV=production, or use --force"
  return 1
}

# Determine bucket name based on environment
get_bucket_name() {
  if [[ "$NEXT_PUBLIC_ENVIRONMENT" == "staging" ]]; then
    echo "frontend-assets-staging"
  else
    echo "frontend-assets-prod"
  fi
}

# Check if AWS CLI is available and install if needed
setup_aws_cli() {
  if command -v aws &> /dev/null; then
    local aws_version
    aws_version=$(aws --version 2>/dev/null | cut -d' ' -f1 | cut -d'/' -f2)
    log_info "AWS CLI found (version: $aws_version)"
    return 0
  fi
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "Dry run: Would install AWS CLI"
    return 0
  fi
  
  log_warn "AWS CLI not found, installing..."
  
  # Create temporary directory
  mkdir -p "$AWS_CLI_INSTALL_DIR"
  cd "$AWS_CLI_INSTALL_DIR"
  
  # Download and install AWS CLI
  if ! curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64-${AWS_CLI_VERSION}.zip" -o "awscliv2.zip"; then
    log_error "Failed to download AWS CLI"
    exit 1
  fi
  
  if ! unzip -q awscliv2.zip; then
    log_error "Failed to extract AWS CLI"
    exit 1
  fi
  
  # Add to PATH
  export PATH="$PWD/aws/dist:$PATH"
  
  # Verify installation
  if ! command -v aws &> /dev/null; then
    log_error "AWS CLI installation failed"
    exit 1
  fi
  
  log_info "AWS CLI installed successfully"
  
  # Cleanup function
  cleanup_aws_cli() {
    cd "$PROJECT_ROOT"
    rm -rf "$AWS_CLI_INSTALL_DIR"
  }
  trap cleanup_aws_cli EXIT
}

# Validate directories exist
validate_directories() {
  local missing_dirs=()
  
  if [[ ! -d "$PROJECT_ROOT/$STATIC_DIR" ]]; then
    missing_dirs+=("$STATIC_DIR")
  fi
  
  if [[ ! -d "$PROJECT_ROOT/$PUBLIC_DIR" ]]; then
    missing_dirs+=("$PUBLIC_DIR")
  fi
  
  if [[ ${#missing_dirs[@]} -gt 0 ]]; then
    log_error "Required directories not found:"
    for dir in "${missing_dirs[@]}"; do
      echo "  - $dir"
    done
    echo "Make sure you're running this script from your Next.js project root and the build is complete."
    exit 1
  fi
}

# Upload files to S3
upload_to_s3() {
  local source_dir="$1"
  local target_path="$2"
  local description="$3"
  
  local bucket_name
  bucket_name=$(get_bucket_name)
  
  local commit_short="${VERCEL_GIT_COMMIT_SHA:0:12}"
  local s3_path="s3://$bucket_name/$SITE_NAME/$commit_short/$target_path"
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "Dry run: Would upload $description to $s3_path"
    return 0
  fi
  
  log_info "Uploading $description to R2..."
  
  if ! aws s3 sync "$source_dir" "$s3_path" \
    --endpoint-url "$ASSET_CDN_S3_ENDPOINT" \
    --cache-control "public,max-age=604800,immutable" \
    --region auto \
    --only-show-errors; then
    log_error "Failed to upload $description"
    return 1
  fi
  
  log_info "✅ $description uploaded successfully"
}

# Clean up local static files
cleanup_local_files() {
  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "Dry run: Would clean up local static files"
    return 0
  fi
  
  log_info "Cleaning up local static files..."
  
  if [[ -d "$PROJECT_ROOT/$STATIC_DIR" ]]; then
    rm -rf "$PROJECT_ROOT/$STATIC_DIR"/*
    log_info "✅ Local static files cleaned up"
  fi
  
  # Note: We keep the public dir as Next.js doesn't officially support serving it via CDN
}

# Main execution
main() {
  log_info "Starting static assets upload process..."
  
  # Change to project root
  cd "$PROJECT_ROOT"
  
  # Validate prerequisites
  validate_required_vars
  validate_commit_sha "$VERCEL_GIT_COMMIT_SHA"
  validate_directories
  
  # Check if upload should proceed
  if ! should_upload; then
    exit 0
  fi
  
  # Setup AWS CLI
  setup_aws_cli
  
  # Upload files
  local upload_success=true
  
  if ! upload_to_s3 "$STATIC_DIR" "_next/static" "static files"; then
    upload_success=false
  fi
  
  if ! upload_to_s3 "$PUBLIC_DIR" "" "public files"; then
    upload_success=false
  fi
  
  # Clean up if successful
  if [[ "$upload_success" == "true" ]]; then
    cleanup_local_files
    log_info "✅ Upload completed successfully!"
  else
    log_error "Upload failed"
    exit 1
  fi
}

# Execute main function
main "$@"