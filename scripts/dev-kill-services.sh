#!/bin/bash

# Kill all services that might block pnpm run dev
# This script runs non-interactively and forcefully kills all processes

echo "🛑 Stopping all dev services..."

# Kill next dev processes
echo "  Killing next dev processes..."
<<<<<<< HEAD
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true

# Kill turbo processes
echo "  Killing turbo processes..."
pkill -9 -f "turbo run" 2>/dev/null || true

# Kill pnpm processes
echo "  Killing pnpm dev processes..."
pkill -9 -f "pnpm run dev" 2>/dev/null || true
=======
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# Kill turbo processes
echo "  Killing turbo processes..."
pkill -f "turbo run" 2>/dev/null || true

# Kill pnpm processes
echo "  Killing pnpm dev processes..."
pkill -f "pnpm run dev" 2>/dev/null || true
>>>>>>> 3297abd6aa (clean up docs errors)

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
<<<<<<< HEAD

# Verify ports are actually free (retry if needed)
echo "  Verifying ports are free..."
for port in 3000 3001; do
  MAX_RETRIES=5
  RETRY=0
  while [ $RETRY -lt $MAX_RETRIES ]; do
    PIDS=$(lsof -ti:$port 2>/dev/null)
    if [ -z "$PIDS" ]; then
      echo "    ✅ Port $port is free"
      break
    else
      echo "    ⚠️  Port $port still in use, killing again..."
      echo "$PIDS" | xargs kill -9 2>/dev/null || true
      sleep 1
      RETRY=$((RETRY + 1))
    fi
  done
  
  # Final check
  PIDS=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$PIDS" ]; then
    echo "    ❌ Port $port is still in use after cleanup. Please manually free it."
  fi
done
=======
>>>>>>> 3297abd6aa (clean up docs errors)

echo "✅ All services stopped!"
echo ""
echo "💡 Ports 3000 and 3001 are now free."
echo "💡 Run 'pnpm dev' or 'pnpm dev:www' and 'pnpm dev:docs' to start servers."
