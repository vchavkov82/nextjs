#!/bin/bash

# Simple script to kill processes on common dev ports
echo "🛑 Killing dev processes on common ports..."

# Kill processes on specific ports
PORTS=(3000 3001 3003 3004 3030 8082 5173 5174)
for port in "${PORTS[@]}"; do
  echo "  Checking port $port..."
  PIDS=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$PIDS" ]; then
    echo "  Killing processes on port $port: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
  else
    echo "  No processes found on port $port"
  fi
done

# Kill next dev processes
echo "  Killing next dev processes..."
pkill -f "next dev" || true
pkill -f "next-server" || true

# Kill turbo processes
echo "  Killing turbo processes..."
pkill -f "turbo run" || true

# Give it a moment to clean up
sleep 1

echo "✅ All dev processes stopped!"
