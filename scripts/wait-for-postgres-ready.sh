#!/bin/bash

# Wait for PostgreSQL to be ready (port 5432)
echo "⏳ Waiting for PostgreSQL to be ready..."

MAX_RETRIES=60
RETRY=0

# Filter out harmless Podman/Docker rootless UID warnings
filter_warnings() {
  grep -vE "(cannot set uid|effective uid.*Operation not permitted|^--:)" 2>/dev/null || cat
}

# Function to check if PostgreSQL is ready
check_postgres() {
  local port=${1:-5432}
  # Try multiple methods to check PostgreSQL availability
  if command -v pg_isready >/dev/null 2>&1; then
    pg_isready -h 127.0.0.1 -p "$port" >/dev/null 2>&1
  elif command -v nc >/dev/null 2>&1; then
    nc -z 127.0.0.1 "$port" >/dev/null 2>&1
  else
    # Fallback: try to connect using timeout and /dev/tcp
    timeout 1 bash -c "echo > /dev/tcp/127.0.0.1/$port" >/dev/null 2>&1
  fi
}

while [ $RETRY -lt $MAX_RETRIES ]; do
  # Check if PostgreSQL is ready (port 5432)
  if check_postgres 5432; then
    echo "✅ PostgreSQL is ready!"
    exit 0
  fi
  
  RETRY=$((RETRY + 1))
  if [ $RETRY -lt $MAX_RETRIES ]; then
    echo "  Waiting for PostgreSQL... ($RETRY/$MAX_RETRIES)"
    sleep 2
  fi
done

echo "❌ PostgreSQL did not become ready in time"
exit 1
