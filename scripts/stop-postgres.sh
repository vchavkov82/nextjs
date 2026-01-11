#!/bin/bash
# Stop local PostgreSQL using Podman Compose

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

cd "$DOCKER_DIR"

echo "Stopping PostgreSQL..."
podman-compose -f docker-compose.postgres.yml down

echo "PostgreSQL stopped."
