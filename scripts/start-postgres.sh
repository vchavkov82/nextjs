#!/bin/bash

set -euo pipefail

# Start local PostgreSQL using Podman Compose
# This script starts PostgreSQL database services with proper validation
#
# Usage: ./start-postgres.sh [--help]
#   --help: Show this help message
#
# Features:
#   - Validates prerequisites and environment
#   - Checks for port conflicts
#   - Creates .env file from example if needed
#   - Waits for PostgreSQL to be ready
#   - Provides connection information

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly DOCKER_DIR="$PROJECT_ROOT/docker"
readonly COMPOSE_FILE="$DOCKER_DIR/docker-compose.postgres.yml"
readonly ENV_FILE="$DOCKER_DIR/.env"
readonly ENV_EXAMPLE_FILE="$DOCKER_DIR/postgres.env.example"
readonly POSTGRES_PORT=5432

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --help|-h)
      cat << EOF
Usage: $0 [--help]

Start local PostgreSQL using Podman Compose.

Options:
  --help, -h  Show this help message

Features:
  - Validates prerequisites and environment
  - Checks for port conflicts
  - Creates .env file from example if needed
  - Waits for PostgreSQL to be ready
  - Provides connection information

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
  
  # Check if we're in a git repository (optional but helpful)
  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_warn "Not in a git repository (this is optional)"
  fi
  
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

# Setup environment file
setup_env_file() {
  log_debug "Setting up environment file..."
  
  if [[ ! -f "$ENV_FILE" ]]; then
    if [[ -f "$ENV_EXAMPLE_FILE" ]]; then
      log_info "Creating .env file from postgres.env.example..."
      if ! cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"; then
        log_error "Failed to copy environment file"
        exit 1
      fi
      log_info "✅ .env file created"
      log_warn "Please edit .env and update PostgreSQL credentials if needed"
    else
      log_error "Neither .env nor postgres.env.example found in docker directory"
      exit 1
    fi
  else
    log_debug "Environment file already exists"
  fi
}

# Check if port is in use
check_port_conflict() {
  log_debug "Checking for port conflicts on $POSTGRES_PORT..."
  
  local port_in_use=false
  
  # Try different methods to check port usage
  if command -v lsof >/dev/null 2>&1; then
    if lsof -i :"$POSTGRES_PORT" >/dev/null 2>&1; then
      port_in_use=true
    fi
  elif command -v ss >/dev/null 2>&1; then
    if ss -tuln | grep -q ":$POSTGRES_PORT "; then
      port_in_use=true
    fi
  elif command -v netstat >/dev/null 2>&1; then
    if netstat -tuln 2>/dev/null | grep -q ":$POSTGRES_PORT "; then
      port_in_use=true
    fi
  else
    log_warn "Cannot check port usage (lsof, ss, or netstat not available)"
  fi
  
  if [[ "$port_in_use" == "true" ]]; then
    log_warn "Port $POSTGRES_PORT is already in use"
    echo ""
    echo "If Supabase stack is running, stop it first:"
    echo "  cd docker && podman-compose -f docker-compose.yml down"
    echo ""
    
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      log_info "Aborted by user"
      exit 0
    fi
  else
    log_debug "Port $POSTGRES_PORT is free"
  fi
}

# Start PostgreSQL
start_postgres() {
  log_info "Starting PostgreSQL..."
  
  cd "$DOCKER_DIR"
  
  if ! podman-compose -f docker-compose.postgres.yml up -d; then
    log_error "Failed to start PostgreSQL"
    exit 1
  fi
  
  log_info "✅ PostgreSQL started"
}

# Wait for PostgreSQL to be ready
wait_for_postgres() {
  log_info "Waiting for PostgreSQL to be ready..."
  
  local max_wait=30
  local wait_time=0
  
  cd "$DOCKER_DIR"
  
  while [[ $wait_time -lt $max_wait ]]; do
    # Check if PostgreSQL is accepting connections
    if podman-compose -f docker-compose.postgres.yml exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
      log_info "✅ PostgreSQL is ready!"
      return 0
    fi
    
    sleep 1
    ((wait_time++))
    
    if [[ $((wait_time % 5)) -eq 0 ]]; then
      log_debug "Still waiting... (${wait_time}/${max_wait}s)"
    fi
  done
  
  log_error "PostgreSQL did not become ready within ${max_wait} seconds"
  return 1
}

# Show status and connection info
show_status() {
  cd "$DOCKER_DIR"
  
  echo ""
  log_info "PostgreSQL Status:"
  
  # Filter out harmless Podman rootless warnings
  podman-compose -f docker-compose.postgres.yml ps 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)' || true
  
  echo ""
  log_info "Connection Information:"
  echo "  Host: localhost"
  echo "  Port: $POSTGRES_PORT"
  echo "  Database: postgres"
  echo "  User: postgres"
  echo "  Password: postgres (check .env file)"
  echo ""
  echo "Connection string: postgresql://postgres:postgres@localhost:$POSTGRES_PORT/postgres"
  echo ""
  log_info "Useful Commands:"
  echo "  Connect:     podman-compose -f docker-compose.postgres.yml exec postgres psql -U postgres -d postgres"
  echo "  Stop:        podman-compose -f docker-compose.postgres.yml down"
  echo "  View logs:   podman-compose -f docker-compose.postgres.yml logs -f postgres"
  echo ""
}

# Main execution
main() {
  log_info "Starting PostgreSQL setup..."
  
  # Validate prerequisites
  validate_prerequisites
  
  # Setup environment
  setup_env_file
  
  # Check for port conflicts
  check_port_conflict
  
  # Start PostgreSQL
  start_postgres
  
  # Wait for readiness
  if ! wait_for_postgres; then
    log_error "PostgreSQL failed to start properly"
    exit 1
  fi
  
  # Show status and connection info
  show_status
  
  log_info "PostgreSQL setup completed successfully!"
}

# Execute main function
main "$@"
