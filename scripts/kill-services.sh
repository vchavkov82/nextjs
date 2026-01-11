#!/bin/bash

# Kill all services that might block pnpm run dev

echo "🛑 Stopping all dev services..."

# Kill next dev processes
echo "  Killing next dev processes..."
pkill -f "next dev" || true

# Kill turbo processes
echo "  Killing turbo processes..."
pkill -f "turbo run" || true

# Kill pnpm processes
echo "  Killing pnpm dev processes..."
pkill -f "pnpm run dev" || true

# Kill node processes on specific ports
PORTS=(3000 3003 3004 3030 8082 5173 5174)
for port in "${PORTS[@]}"; do
  echo "  Freeing port $port..."
  lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
done

# Give it a moment to clean up
sleep 1

echo "✅ All services stopped!"
