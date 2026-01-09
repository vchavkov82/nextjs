#!/bin/sh

set -e

auto_confirm=0

# Detect container runtime (Docker or Podman)
detect_compose_command() {
    if command -v podman >/dev/null 2>&1 && podman compose version >/dev/null 2>&1; then
        echo "podman compose"
    elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
        echo "docker compose"
    elif command -v docker-compose >/dev/null 2>&1; then
        echo "docker-compose"
    else
        echo "ERROR: Neither 'docker compose', 'podman compose', nor 'docker-compose' found" >&2
        exit 1
    fi
}

COMPOSE_CMD=$(detect_compose_command)

# Execute compose command with proper argument handling
compose_cmd() {
    eval "$COMPOSE_CMD $*"
}

confirm () {
    if [ "$auto_confirm" = "1" ]; then
        return 0
    fi

    printf "Are you sure you want to proceed? (y/N) "
    read -r REPLY
    case "$REPLY" in
        [Yy])
            ;;
        *)
            echo "Script canceled."
            exit 1
            ;;
    esac
}

if [ "$1" = "-y" ]; then
    auto_confirm=1
fi

echo ""
echo "*** WARNING: This will remove all containers and container data, and optionally reset .env ***"
echo ""

confirm

echo "===> Stopping and removing all containers..."

if [ -f ".env" ]; then
    compose_cmd -f docker-compose.yml -f ./dev/docker-compose.dev.yml down -v --remove-orphans
elif [ -f ".env.example" ]; then
    echo "No .env found, using .env.example for compose down..."
    compose_cmd --env-file .env.example -f docker-compose.yml -f ./dev/docker-compose.dev.yml down -v --remove-orphans
else
    echo "Skipping 'compose down' because there's no env-file."
fi

echo "===> Cleaning up bind-mounted directories..."
BIND_MOUNTS="./volumes/db/data ./volumes/storage"

for dir in $BIND_MOUNTS; do
    if [ -d "$dir" ]; then
        echo "Removing $dir..."
        confirm
        rm -rf "$dir"
    else
        echo "$dir not found."
    fi
done

echo "===> Resetting .env file (will save backup to .env.old)..."
confirm
if [ -f ".env" ] || [ -L ".env" ]; then
    echo "Renaming existing .env file to .env.old"
    mv .env .env.old
else
    echo "No .env file found."
fi

if [ -f ".env.example" ]; then
    echo "===> Copying .env.example to .env"
    cp .env.example .env
else
    echo "No .env.example found, can't restore .env to default values."
fi

echo "Cleanup complete!"
echo "Re-run '$COMPOSE_CMD pull' to update images."
echo ""
