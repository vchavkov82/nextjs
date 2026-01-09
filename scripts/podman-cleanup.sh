#!/bin/bash

# Cleanup script for Podman containers, images, networks, and pods
# Usage:
#   ./scripts/cleanup-podman.sh              # Clean containers, pods, and networks
#   ./scripts/cleanup-podman.sh --images     # Also remove images
#   ./scripts/cleanup-podman.sh --volumes    # Also remove volumes
#   ./scripts/cleanup-podman.sh --all        # Remove everything (containers, pods, networks, images, volumes)
#
# Note: You may see a warning "--: cannot set uid to 1001: effective uid 1001: Operation not permitted"
# This is a harmless Podman rootless mode warning that appears during initialization.
# It doesn't affect functionality and can be safely ignored. To suppress it globally, you can:
#   - Add to ~/.bashrc: alias podman='podman 2>/dev/null'
#   - Or redirect stderr when running: ./scripts/podman-cleanup.sh 2>/dev/null

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker/docker-compose.yml"

REMOVE_IMAGES=false
REMOVE_VOLUMES=false

# Helper function to filter out harmless Podman rootless UID warnings
# This warning appears because Podman cannot set effective UID to the host user's UID in rootless mode
# It's harmless and doesn't affect functionality, but clutters the output
filter_podman_warnings() {
  local stderr_file=$(mktemp)
  local exit_code=0
  "$@" 2>"$stderr_file" || exit_code=$?
  grep -vE "(cannot set uid|effective uid.*Operation not permitted|^--:)" "$stderr_file" >&2 || true
  rm -f "$stderr_file"
  return $exit_code
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --images)
      REMOVE_IMAGES=true
      shift
      ;;
    --volumes)
      REMOVE_VOLUMES=true
      shift
      ;;
    --all)
      REMOVE_IMAGES=true
      REMOVE_VOLUMES=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--images] [--volumes] [--all]"
      exit 1
      ;;
  esac
done

echo "🧹 Starting Podman cleanup..."

# Step 1: Stop and remove containers using podman-compose
if [ -f "$COMPOSE_FILE" ]; then
  echo "  📦 Stopping and removing containers with podman-compose..."
  cd "$PROJECT_ROOT"
  filter_podman_warnings podman-compose -f "$COMPOSE_FILE" down --remove-orphans || true
  echo "    ✅ Containers stopped and removed"
else
  echo "    ⚠️  Compose file not found at $COMPOSE_FILE, skipping podman-compose down"
fi

# Step 2: Remove any remaining BA containers
echo "  🗑️  Removing any remaining BA containers..."
CONTAINERS=$(filter_podman_warnings podman ps -a --filter "name=supabase" --format "{{.Names}}" || true)
if [ ! -z "$CONTAINERS" ]; then
  echo "$CONTAINERS" | while read -r container; do
    if [ ! -z "$container" ]; then
      echo "    Removing container: $container"
      filter_podman_warnings podman rm -f "$container" || true
    fi
  done
  echo "    ✅ Remaining containers removed"
else
  echo "    ℹ️  No BA containers found"
fi

# Step 3: Remove Podman pods
echo "  🏗️  Removing Podman pods..."
PODS=$(filter_podman_warnings podman pod ps --filter "name=supabase" --format "{{.Name}}" || true)
if [ ! -z "$PODS" ]; then
  echo "$PODS" | while read -r pod; do
    if [ ! -z "$pod" ]; then
      echo "    Removing pod: $pod"
      filter_podman_warnings podman pod rm -f "$pod" || true
    fi
  done
  echo "    ✅ Pods removed"
else
  echo "    ℹ️  No BA pods found"
fi

# Step 4: Remove Podman networks
echo "  🌐 Removing Podman networks..."
NETWORKS=$(filter_podman_warnings podman network ls --filter "name=supabase" --format "{{.Name}}" || true)
if [ ! -z "$NETWORKS" ]; then
  echo "$NETWORKS" | while read -r network; do
    if [ ! -z "$network" ]; then
      echo "    Removing network: $network"
      filter_podman_warnings podman network rm "$network" || true
    fi
  done
  echo "    ✅ Networks removed"
else
  echo "    ℹ️  No BA networks found"
fi

# Step 5: Remove images (if requested)
if [ "$REMOVE_IMAGES" = true ]; then
  echo "  🖼️  Removing Podman images..."
  IMAGES=$(filter_podman_warnings podman images --filter "reference=supabase/*" --filter "reference=kong:*" --filter "reference=darthsim/imgproxy:*" --filter "reference=timberio/vector:*" --filter "reference=postgrest/postgrest:*" --format "{{.Repository}}:{{.Tag}}" || true)
  if [ ! -z "$IMAGES" ]; then
    echo "$IMAGES" | while read -r image; do
      if [ ! -z "$image" ]; then
        echo "    Removing image: $image"
        filter_podman_warnings podman rmi "$image" || true
      fi
    done
    echo "    ✅ Images removed"
  else
    echo "    ℹ️  No BA-related images found"
  fi
fi

# Step 6: Remove volumes (if requested)
if [ "$REMOVE_VOLUMES" = true ]; then
  echo "  💾 Removing Podman volumes..."
  VOLUMES=$(filter_podman_warnings podman volume ls --filter "name=supabase" --format "{{.Name}}" || true)
  if [ ! -z "$VOLUMES" ]; then
    echo "$VOLUMES" | while read -r volume; do
      if [ ! -z "$volume" ]; then
        echo "    Removing volume: $volume"
        filter_podman_warnings podman volume rm "$volume" || true
      fi
    done
    echo "    ✅ Volumes removed"
  else
    echo "    ℹ️  No BA volumes found"
  fi

  # Also remove local volume directories if they exist
  VOLUME_DIRS=(
    "$PROJECT_ROOT/docker/volumes/db/data"
    "$PROJECT_ROOT/docker/volumes/storage"
  )
  for vol_dir in "${VOLUME_DIRS[@]}"; do
    if [ -d "$vol_dir" ]; then
      echo "    Removing volume directory: $vol_dir"
      rm -rf "$vol_dir" 2>/dev/null || true
    fi
  done
fi

echo ""
echo "✅ Podman cleanup complete!"
echo ""
if [ "$REMOVE_IMAGES" = false ] && [ "$REMOVE_VOLUMES" = false ]; then
  echo "💡 Tip: Use --images to also remove images"
  echo "💡 Tip: Use --volumes to also remove volumes"
  echo "💡 Tip: Use --all to remove everything"
fi
