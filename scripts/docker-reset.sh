#!/bin/bash

set -euo pipefail

# Reset Docker/Podman environment by removing containers, volumes, and resetting .env
# This script supports both Docker and Podman for maximum compatibility
#
# Usage: ./docker-reset.sh [-y] [--no-env-reset] [--help]
#   -y, --yes:        Skip all confirmation prompts
#   --no-env-reset:   Skip .env file reset (keep current configuration)
#   --help, -h:       Show this help message
#
# Features:
#   - Auto-detects Docker or Podman runtime
#   - Supports docker-compose, podman-compose, and docker-compose commands
#   - Safely removes containers, volumes, and bind mounts
#   - Optional .env file reset with backup
#   - Comprehensive error handling and validation

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly COMPOSE_FILE="$PROJECT_ROOT/docker/docker-compose.yml"
readonly DEV_COMPOSE_FILE="$PROJECT_ROOT/dev/docker-compose.dev.yml"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Parse command line arguments
AUTO_CONFIRM=false
NO_ENV_RESET=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -y|--yes)
      AUTO_CONFIRM=true
      shift
      ;;
    --no-env-reset)
      NO_ENV_RESET=true
      shift
      ;;
    --help|-h)
      cat << EOF
Usage: $0 [-y] [--no-env-reset] [--help]

Reset Docker/Podman environment by removing containers, volumes, and resetting .env.

Options:
  -y, --yes        Skip all confirmation prompts
  --no-env-reset   Skip .env file reset (keep current configuration)
  --help, -h       Show this help message

Features:
  - Auto-detects Docker or Podman runtime
  - Supports docker-compose, podman-compose, and docker-compose commands
  - Safely removes containers, volumes, and bind mounts
  - Optional .env file reset with backup
  - Comprehensive error handling and validation

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

# Confirmation function
confirm() {
  local message="$1"
  local default="${2:-N}"
  
  if [[ "$AUTO_CONFIRM" == "true" ]]; then
    log_debug "Auto-confirming: $message"
    return 0
  fi
  
  printf "%s (y/N): " "$message"
  read -r REPLY
  case "$REPLY" in
    [Yy])
      return 0
      ;;
    *)
      echo "Operation canceled."
      exit 1
      ;;
  esac
}

# Detect container runtime (Docker or Podman)
detect_compose_command() {
  local compose_cmd=""
  
  # Try podman compose first
  if command -v podman >/dev/null 2>&1 && podman compose version >/dev/null 2>&1; then
    compose_cmd="podman compose"
    log_info "Using Podman Compose"
  # Try docker compose
  elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    compose_cmd="docker compose"
    log_info "Using Docker Compose"
  # Try docker-compose (legacy)
  elif command -v docker-compose >/dev/null 2>&1; then
    compose_cmd="docker-compose"
    log_info "Using Docker Compose (legacy)"
  else
    log_error "Container runtime not found. Please install either Docker or Podman with compose support."
    exit 1
  fi
  
  echo "$compose_cmd"
}

# Validate compose files exist
validate_compose_files() {
  local missing_files=()
  
  if [[ ! -f "$COMPOSE_FILE" ]]; then
    missing_files+=("$COMPOSE_FILE")
  fi
  
  if [[ ! -f "$DEV_COMPOSE_FILE" ]]; then
    missing_files+=("$DEV_COMPOSE_FILE")
  fi
  
  if [[ ${#missing_files[@]} -gt 0 ]]; then
    log_error "Required compose files not found:"
    for file in "${missing_files[@]}"; do
      echo "  - $file"
    done
    exit 1
  fi
}

# Execute compose command with proper error handling
compose_cmd() {
  local cmd="$*"
  log_debug "Executing: $COMPOSE_CMD $cmd"
  
  if ! eval "$COMPOSE_CMD $cmd"; then
    log_error "Compose command failed: $cmd"
    return 1
  fi
}

# Stop and remove containers
stop_containers() {
  log_info "Stopping and removing all containers..."
  
  local env_file=""
  if [[ -f "$PROJECT_ROOT/.env" ]]; then
    env_file="--env-file $PROJECT_ROOT/.env"
  elif [[ -f "$PROJECT_ROOT/.env.example" ]]; then
    log_warn "No .env found, using .env.example for compose down..."
    env_file="--env-file $PROJECT_ROOT/.env.example"
  else
    log_warn "No env file found, proceeding without environment variables..."
  fi
  
  if ! compose_cmd -f "$COMPOSE_FILE" -f "$DEV_COMPOSE_FILE" $env_file down -v --remove-orphans; then
    log_warn "Some containers may still be running or couldn't be removed"
  fi
}

# Clean up bind-mounted directories
cleanup_bind_mounts() {
  local bind_mounts="./volumes/db/data ./volumes/storage"
  
  log_info "Cleaning up bind-mounted directories..."
  
  for dir in $bind_mounts; do
    local full_path="$PROJECT_ROOT/$dir"
    if [[ -d "$full_path" ]]; then
      log_info "Removing $dir..."
      if [[ "$AUTO_CONFIRM" != "true" ]]; then
        confirm "Remove directory $dir?"
      fi
      
      if ! rm -rf "$full_path"; then
        log_warn "Failed to remove $dir (may be in use or permissions issue)"
      else
        log_info "✅ Removed $dir"
      fi
    else
      log_debug "Directory $dir not found, skipping"
    fi
  done
}

# Reset .env file
reset_env_file() {
  if [[ "$NO_ENV_RESET" == "true" ]]; then
    log_info "Skipping .env file reset as requested"
    return 0
  fi
  
  log_info "Resetting .env file..."
  
  # Backup existing .env file
  if [[ -f "$PROJECT_ROOT/.env" ]] || [[ -L "$PROJECT_ROOT/.env" ]]; then
    local backup_file="$PROJECT_ROOT/.env.old"
    local counter=1
    
    # Find a unique backup name
    while [[ -f "$backup_file" ]]; do
      backup_file="$PROJECT_ROOT/.env.old.$counter"
      ((counter++))
    done
    
    log_info "Backing up existing .env file to $(basename "$backup_file")"
    if ! mv "$PROJECT_ROOT/.env" "$backup_file"; then
      log_error "Failed to backup .env file"
      return 1
    fi
  fi
  
  # Copy .env.example to .env
  if [[ -f "$PROJECT_ROOT/.env.example" ]]; then
    log_info "Copying .env.example to .env"
    if ! cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"; then
      log_error "Failed to copy .env.example to .env"
      return 1
    fi
    log_info "✅ .env file reset to defaults"
  else
    log_warn "No .env.example found, cannot restore .env to default values"
  fi
}

# Show warning message
show_warning() {
  echo ""
  echo -e "${YELLOW}*** WARNING: This will remove all containers and container data${NC}"
  echo -e "${YELLOW}*** and optionally reset .env file${NC}"
  echo ""
  
  if [[ "$AUTO_CONFIRM" != "true" ]]; then
    confirm "Are you sure you want to proceed?"
  fi
}

# Main execution
main() {
  log_info "Starting Docker/Podman environment reset..."
  
  # Change to project root
  cd "$PROJECT_ROOT"
  
  # Detect runtime
  COMPOSE_CMD=$(detect_compose_command)
  
  # Validate prerequisites
  validate_compose_files
  
  # Show warning and get confirmation
  show_warning
  
  # Execute reset steps
  stop_containers
  cleanup_bind_mounts
  reset_env_file
  
  log_info "✅ Environment reset completed!"
  echo ""
  log_info "Next steps:"
  echo "  1. Update your .env file with required configuration"
  echo "  2. Run '$COMPOSE_CMD pull' to update images"
  echo "  3. Run '$COMPOSE_CMD up -d' to start services"
  echo ""
}

# Execute main function
main "$@"
