#!/bin/bash

# Kill all services that might block pnpm run dev

echo "🛑 Stopping all dev services..."

# Kill next dev processes
echo "  Killing next dev processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# Kill turbo processes
echo "  Killing turbo processes..."
pkill -f "turbo run" 2>/dev/null || true

# Kill pnpm processes
echo "  Killing pnpm dev processes..."
pkill -f "pnpm run dev" 2>/dev/null || true

# Kill node processes on specific ports
PORTS=(3000 3001 3003 3004 3030 8082 5173 5174)
for port in "${PORTS[@]}"; do
  echo "  Freeing port $port..."
  PIDS=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$PIDS" ]; then
    echo "    Found processes: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
  fi
done

# Give it a moment to clean up
sleep 2

echo "✅ All services stopped!"
