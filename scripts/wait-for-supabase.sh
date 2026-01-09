#!/bin/bash

# Wait for CMS Postgres to be ready
echo "⏳ Waiting for CMS Postgres to be ready..."

MAX_RETRIES=60
RETRY=0

# Function to check if a port is open
check_port() {
  local port=$1
  # Try multiple methods to check port availability
  if command -v nc >/dev/null 2>&1; then
    nc -z 127.0.0.1 "$port" >/dev/null 2>&1
  elif command -v pg_isready >/dev/null 2>&1; then
    pg_isready -h 127.0.0.1 -p "$port" >/dev/null 2>&1
  else
    # Fallback: try to connect using timeout and /dev/tcp
    timeout 1 bash -c "echo > /dev/tcp/127.0.0.1/$port" >/dev/null 2>&1
  fi
}

while [ $RETRY -lt $MAX_RETRIES ]; do
  # Check if CMS Postgres is ready (port 5433)
  if check_port 5433; then
    echo "✅ CMS Postgres is ready!"
    exit 0
  fi
  
  RETRY=$((RETRY + 1))
  if [ $RETRY -lt $MAX_RETRIES ]; then
    echo "  Waiting for CMS Postgres... ($RETRY/$MAX_RETRIES)"
    sleep 2
  fi
done

echo "❌ CMS Postgres did not become ready in time"
exit 1
