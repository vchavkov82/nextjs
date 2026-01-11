#!/bin/bash

set -euo pipefail

# Kill all development services and processes
# This script stops development servers, containers, and frees up common ports
#
# Usage: ./dev-kill.sh [--force] [--verbose] [--help]
#   --force:   Force kill without confirmation prompts
#   --verbose: Show detailed output
#   --help:    Show this help message
#
# Features:
#   - Stops Docker/Podman services
#   - Kills Next.js dev processes
#   - Kills Turbo processes
#   - Frees common development ports
#   - Verifies ports are actually free
#   - Supports both Docker and Podman

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly COMPOSE_FILE="$PROJECT_ROOT/docker/docker-compose.yml"

# Common development ports
readonly PORTS=(3000 3001 3003 3004 3030 8082 5173 5174)

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Parse command line arguments
FORCE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --force)
      FORCE=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help|-h)
      cat << EOF
Usage: $0 [--force] [--verbose] [--help]

Kill all development services and processes.

Options:
  --force   Force kill without confirmation prompts
  --verbose Show detailed output
  --help    Show this help message

Features:
  - Stops Docker/Podman services
  - Kills Next.js dev processes
  - Kills Turbo processes
  - Frees common development ports
  - Verifies ports are actually free
  - Supports both Docker and Podman

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
  if [[ "$VERBOSE" == "true" ]]; then
    echo -e "${BLUE}[DEBUG]${NC} $1"
  fi
}

# Detect container runtime
detect_compose_command() {
  if command -v podman >/dev/null 2>&1 && podman compose version >/dev/null 2>&1; then
    echo "podman compose"
  elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    echo "docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
  else
    echo ""
  fi
}

# Stop container services
stop_containers() {
  log_info "Stopping container services..."
  
  local compose_cmd
  compose_cmd=$(detect_compose_command)
  
  if [[ -n "$compose_cmd" && -f "$COMPOSE_FILE" ]]; then
    log_debug "Using compose command: $compose_cmd"
    
    if ! eval "$compose_cmd -f $COMPOSE_FILE down 2>/dev/null"; then
      log_warn "Failed to stop containers gracefully"
    else
      log_info "✅ Container services stopped"
    fi
  else
    log_debug "No compose setup found, skipping container stop"
  fi
}

# Kill processes by pattern
kill_processes() {
  local pattern="$1"
  local description="$2"
  
  log_debug "Killing processes matching: $pattern"
  
  local pids
  pids=$(pgrep -f "$pattern" 2>/dev/null || true)
  
  if [[ -n "$pids" ]]; then
    log_info "Killing $description..."
    echo "$pids" | xargs kill -TERM 2>/dev/null || true
    
    # Give processes time to terminate gracefully
    sleep 2
    
    # Force kill any remaining processes
    pids=$(pgrep -f "$pattern" 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
      log_debug "Force killing remaining $description..."
      echo "$pids" | xargs kill -9 2>/dev/null || true
    fi
    
    log_info "✅ $description killed"
  else
    log_debug "No $description found"
  fi
}

# Free up ports
free_ports() {
  log_info "Freeing development ports..."
  
  for port in "${PORTS[@]}"; do
    log_debug "Checking port $port..."
    
    local pids
    pids=$(lsof -ti:"$port" 2>/dev/null || true)
    
    if [[ -n "$pids" ]]; then
      log_info "Freeing port $port (processes: $pids)..."
      echo "$pids" | xargs kill -TERM 2>/dev/null || true
      
      # Give processes time to terminate
      sleep 1
      
      # Force kill any remaining processes
      pids=$(lsof -ti:"$port" 2>/dev/null || true)
      if [[ -n "$pids" ]]; then
        log_debug "Force killing processes on port $port..."
        echo "$pids" | xargs kill -9 2>/dev/null || true
      fi
      
      log_info "✅ Port $port freed"
    else
      log_debug "Port $port is already free"
    fi
  done
}

# Verify ports are free (with retry logic)
verify_ports_free() {
  log_info "Verifying ports are free..."
  
  local critical_ports=(3000 3001)
  local all_free=true
  
  for port in "${critical_ports[@]}"; do
    local max_retries=3
    local retry=0
    
    while [[ $retry -lt $max_retries ]]; do
      local pids
      pids=$(lsof -ti:"$port" 2>/dev/null || true)
      
      if [[ -z "$pids" ]]; then
        log_info "✅ Port $port is free"
        break
      else
        ((retry++))
        if [[ $retry -lt $max_retries ]]; then
          log_warn "Port $port still in use (attempt $retry/$max_retries), retrying..."
          echo "$pids" | xargs kill -9 2>/dev/null || true
          sleep 1
        else
          log_error "❌ Port $port is still in use after cleanup"
          echo "  Processes: $pids"
          all_free=false
        fi
      fi
    done
  done
  
  if [[ "$all_free" == "true" ]]; then
    log_info "✅ All critical ports are free"
  else
    log_warn "Some ports may still be in use. You may need to manually kill the remaining processes."
  fi
}

# Show confirmation prompt
confirm_kill() {
  if [[ "$FORCE" == "true" ]]; then
    return 0
  fi
  
  echo ""
  echo -e "${YELLOW}This will stop all development services and kill processes on ports:${NC}"
  echo "  ${PORTS[*]}"
  echo ""
  
  read -p "Do you want to continue? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation canceled."
    exit 0
  fi
}

# Main execution
main() {
  log_info "Starting development services cleanup..."
  
  # Change to project root
  cd "$PROJECT_ROOT"
  
  # Show confirmation unless forced
  confirm_kill
  
  # Execute cleanup steps
  stop_containers
  kill_processes "next dev" "Next.js dev processes"
  kill_processes "next-server" "Next.js server processes"
  kill_processes "turbo run" "Turbo processes"
  kill_processes "pnpm run dev" "PNPM dev processes"
  
  free_ports
  verify_ports_free
  
  # Give everything a moment to clean up
  sleep 1
  
  log_info "✅ All development services stopped!"
  echo ""
  log_info "Next steps:"
  echo "  - Run 'pnpm dev' to start development servers"
  echo "  - Run 'pnpm dev:www' and 'pnpm dev:docs' for specific apps"
  echo ""
}

# Execute main function
main "$@"
