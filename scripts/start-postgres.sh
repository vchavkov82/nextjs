#!/bin/bash
# Start local PostgreSQL using Podman Compose

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

cd "$DOCKER_DIR"

# Check if .env file exists, if not, copy from example
if [ ! -f .env ]; then
  echo "Creating .env file from postgres.env.example..."
  cp postgres.env.example .env
  echo "Please edit .env and update PostgreSQL credentials if needed"
fi

# Check if port 5432 is already in use
PORT_IN_USE=false
if command -v lsof >/dev/null 2>&1; then
  if lsof -i :5432 >/dev/null 2>&1; then
    PORT_IN_USE=true
  fi
elif command -v ss >/dev/null 2>&1; then
  if ss -tuln | grep -q ":5432 "; then
    PORT_IN_USE=true
  fi
fi

if [ "$PORT_IN_USE" = true ]; then
  echo "⚠️  Warning: Port 5432 is already in use"
  echo "   If Supabase stack is running, stop it first:"
  echo "   cd docker && podman-compose -f docker-compose.yml down"
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
  fi
fi

echo "Starting PostgreSQL..."
podman-compose -f docker-compose.postgres.yml up -d

echo "Waiting for PostgreSQL to be ready..."
sleep 2

# Filter out harmless Podman rootless warnings
podman-compose -f docker-compose.postgres.yml ps 2>&1 | grep -vE '(cannot set uid|effective uid.*Operation not permitted|^--:)'

echo ""
echo "PostgreSQL is running!"
echo "Connection string: postgresql://postgres:postgres@localhost:5432/postgres"
echo ""
echo "To connect: podman-compose -f docker-compose.postgres.yml exec postgres psql -U postgres -d postgres"
echo "To stop: podman-compose -f docker-compose.postgres.yml down"
