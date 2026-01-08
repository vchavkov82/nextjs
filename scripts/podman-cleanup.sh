#!/bin/bash

# Cleanup script for Podman containers, images, networks, and pods
# Usage:
#   ./scripts/cleanup-podman.sh              # Clean containers, pods, and networks
#   ./scripts/cleanup-podman.sh --images     # Also remove images
#   ./scripts/cleanup-podman.sh --volumes    # Also remove volumes
#   ./scripts/cleanup-podman.sh --all        # Remove everything (containers, pods, networks, images, volumes)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker/docker-compose.yml"

REMOVE_IMAGES=false
REMOVE_VOLUMES=false

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
  podman-compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
  echo "    ✅ Containers stopped and removed"
else
  echo "    ⚠️  Compose file not found at $COMPOSE_FILE, skipping podman-compose down"
fi

# Step 2: Remove any remaining Supabase containers
echo "  🗑️  Removing any remaining Supabase containers..."
CONTAINERS=$(podman ps -a --filter "name=supabase" --format "{{.Names}}" 2>/dev/null || true)
if [ ! -z "$CONTAINERS" ]; then
  echo "$CONTAINERS" | while read -r container; do
    if [ ! -z "$container" ]; then
      echo "    Removing container: $container"
      podman rm -f "$container" 2>/dev/null || true
    fi
  done
  echo "    ✅ Remaining containers removed"
else
  echo "    ℹ️  No Supabase containers found"
fi

# Step 3: Remove Podman pods
echo "  🏗️  Removing Podman pods..."
PODS=$(podman pod ps --filter "name=supabase" --format "{{.Name}}" 2>/dev/null || true)
if [ ! -z "$PODS" ]; then
  echo "$PODS" | while read -r pod; do
    if [ ! -z "$pod" ]; then
      echo "    Removing pod: $pod"
      podman pod rm -f "$pod" 2>/dev/null || true
    fi
  done
  echo "    ✅ Pods removed"
else
  echo "    ℹ️  No Supabase pods found"
fi

# Step 4: Remove Podman networks
echo "  🌐 Removing Podman networks..."
NETWORKS=$(podman network ls --filter "name=supabase" --format "{{.Name}}" 2>/dev/null || true)
if [ ! -z "$NETWORKS" ]; then
  echo "$NETWORKS" | while read -r network; do
    if [ ! -z "$network" ]; then
      echo "    Removing network: $network"
      podman network rm "$network" 2>/dev/null || true
    fi
  done
  echo "    ✅ Networks removed"
else
  echo "    ℹ️  No Supabase networks found"
fi

# Step 5: Remove images (if requested)
if [ "$REMOVE_IMAGES" = true ]; then
  echo "  🖼️  Removing Podman images..."
  IMAGES=$(podman images --filter "reference=supabase/*" --filter "reference=kong:*" --filter "reference=darthsim/imgproxy:*" --filter "reference=timberio/vector:*" --filter "reference=postgrest/postgrest:*" --format "{{.Repository}}:{{.Tag}}" 2>/dev/null || true)
  if [ ! -z "$IMAGES" ]; then
    echo "$IMAGES" | while read -r image; do
      if [ ! -z "$image" ]; then
        echo "    Removing image: $image"
        podman rmi "$image" 2>/dev/null || true
      fi
    done
    echo "    ✅ Images removed"
  else
    echo "    ℹ️  No Supabase-related images found"
  fi
fi

# Step 6: Remove volumes (if requested)
if [ "$REMOVE_VOLUMES" = true ]; then
  echo "  💾 Removing Podman volumes..."
  VOLUMES=$(podman volume ls --filter "name=supabase" --format "{{.Name}}" 2>/dev/null || true)
  if [ ! -z "$VOLUMES" ]; then
    echo "$VOLUMES" | while read -r volume; do
      if [ ! -z "$volume" ]; then
        echo "    Removing volume: $volume"
        podman volume rm "$volume" 2>/dev/null || true
      fi
    done
    echo "    ✅ Volumes removed"
  else
    echo "    ℹ️  No Supabase volumes found"
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
