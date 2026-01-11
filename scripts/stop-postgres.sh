#!/bin/bash

set -euo pipefail

# Stop local PostgreSQL using Podman Compose
# This script stops PostgreSQL database services with proper validation
#
# Usage: ./stop-postgres.sh [--help] [--force]
#   --help: Show this help message
#   --force: Force stop without confirmation
#
# Features:
#   - Validates prerequisites
#   - Graceful shutdown with timeout
#   - Proper error handling
#   - Status reporting

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly DOCKER_DIR="$PROJECT_ROOT/docker"
readonly COMPOSE_FILE="$DOCKER_DIR/docker-compose.postgres.yml"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Parse command line arguments
FORCE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --force)
      FORCE=true
      shift
      ;;
    --help|-h)
      cat << EOF
Usage: $0 [--force] [--help]

Stop local PostgreSQL using Podman Compose.

Options:
  --force    Force stop without confirmation
  --help, -h Show this help message

Features:
  - Validates prerequisites
  - Graceful shutdown with timeout
  - Proper error handling
  - Status reporting

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

# Validate prerequisites
validate_prerequisites() {
  log_debug "Validating prerequisites..."
  
  # Check if podman-compose is available
  if ! command -v podman-compose >/dev/null 2>&1; then
    log_error "podman-compose not found. Please install Podman with compose support."
    exit 1
  fi
  
  # Check if compose file exists
  if [[ ! -f "$COMPOSE_FILE" ]]; then
    log_error "Compose file not found: $COMPOSE_FILE"
    exit 1
  fi
  
  log_debug "Prerequisites validated"
}

# Check if PostgreSQL is running
check_postgres_status() {
  cd "$DOCKER_DIR"
  
  # Check if containers are running
  local running_containers
  running_containers=$(podman-compose -f docker-compose.postgres.yml ps -q 2>/dev/null || true)
  
  if [[ -z "$running_containers" ]]; then
    log_info "PostgreSQL is not running"
    return 1
  fi
  
  log_debug "PostgreSQL containers are running"
  return 0
}

# Show confirmation prompt
confirm_stop() {
  if [[ "$FORCE" == "true" ]]; then
    return 0
  fi
  
  echo ""
  read -p "Stop PostgreSQL services? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Aborted by user"
    exit 0
  fi
}

# Stop PostgreSQL
stop_postgres() {
  log_info "Stopping PostgreSQL..."
  
  cd "$DOCKER_DIR"
  
  # Try graceful shutdown first
  if ! podman-compose -f docker-compose.postgres.yml down --timeout 30; then
    log_warn "Graceful shutdown failed, forcing stop..."
    
    # Force stop
    if ! podman-compose -f docker-compose.postgres.yml down --timeout 10 --remove-orphans; then
      log_error "Failed to stop PostgreSQL"
      return 1
    fi
  fi
  
  log_info "✅ PostgreSQL stopped"
}

# Verify PostgreSQL is stopped
verify_stopped() {
  cd "$DOCKER_DIR"
  
  local running_containers
  running_containers=$(podman-compose -f docker-compose.postgres.yml ps -q 2>/dev/null || true)
  
  if [[ -z "$running_containers" ]]; then
    log_info "✅ All PostgreSQL containers stopped"
    return 0
  else
    log_warn "Some containers may still be running"
    log_debug "Running containers: $running_containers"
    return 1
  fi
}

# Show final status
show_status() {
  cd "$DOCKER_DIR"
  
  echo ""
  log_info "Final Status:"
  
  # Filter out harmless Podman rootless warnings
  podman-compose -f docker-compose.postgres.yml ps 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || true
  
  echo ""
  log_info "Useful Commands:"
  echo "  Start:       ./start-postgres.sh"
  echo "  View logs:   podman-compose -f docker-compose.postgres.yml logs postgres"
  echo "  Force stop:  ./stop-postgres.sh --force"
  echo ""
}

# Main execution
main() {
  log_info "Starting PostgreSQL shutdown..."
  
  # Validate prerequisites
  validate_prerequisites
  
  # Check if PostgreSQL is running
  if ! check_postgres_status; then
    log_info "Nothing to stop - PostgreSQL is not running"
    exit 0
  fi
  
  # Show confirmation unless forced
  confirm_stop
  
  # Stop PostgreSQL
  if ! stop_postgres; then
    log_error "Failed to stop PostgreSQL"
    exit 1
  fi
  
  # Verify stopped
  verify_stopped
  
  # Show final status
  show_status
  
  log_info "PostgreSQL shutdown completed!"
}

# Execute main function
main "$@"
