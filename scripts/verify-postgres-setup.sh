#!/bin/bash
# Verify that you're using local PostgreSQL and not depending on Supabase

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "=== Verifying PostgreSQL Setup ==="
echo ""

# Check 1: Is PostgreSQL container running?
echo "1. Checking if PostgreSQL container is running..."
cd "$DOCKER_DIR"
if podman-compose -f docker-compose.postgres.yml ps 2>&1 | grep -q "postgres.*Up"; then
    echo "   ✓ PostgreSQL container is running"
else
    echo "   ✗ PostgreSQL container is NOT running"
    echo "     Run: ./scripts/start-postgres.sh"
fi
echo ""

# Check 2: Are Supabase environment variables set?
echo "2. Checking for Supabase environment variables..."
if [ -f "$PROJECT_ROOT/.env" ] || [ -f "$PROJECT_ROOT/.env.local" ]; then
    if grep -q "NEXT_PUBLIC_SUPABASE_URL\|SUPABASE_URL\|SUPABASE_ANON_KEY" "$PROJECT_ROOT"/.env* 2>/dev/null; then
        echo "   ⚠ Warning: Found Supabase environment variables in .env files"
        echo "     These may indicate Supabase dependencies"
    else
        echo "   ✓ No Supabase environment variables found in .env files"
    fi
else
    echo "   ℹ No .env file found (this is okay)"
fi
echo ""

# Check 3: Database connection test
echo "3. Testing database connection..."
if podman-compose -f docker-compose.postgres.yml exec -T postgres psql -U postgres -d postgres -c "SELECT version();" > /dev/null 2>&1; then
    echo "   ✓ Successfully connected to PostgreSQL"
    VERSION=$(podman-compose -f docker-compose.postgres.yml exec -T postgres psql -U postgres -d postgres -t -c "SELECT version();" 2>/dev/null | head -1)
    echo "     $VERSION"
else
    echo "   ✗ Cannot connect to PostgreSQL (container may not be running)"
fi
echo ""

# Check 4: Check for Supabase docker-compose
echo "4. Checking for Supabase docker-compose setup..."
if [ -f "$DOCKER_DIR/docker-compose.yml" ]; then
    if grep -q "supabase" "$DOCKER_DIR/docker-compose.yml" 2>/dev/null; then
        echo "   ⚠ Found Supabase docker-compose.yml"
        echo "     You have both Supabase and PostgreSQL-only compose files"
        echo "     Use: podman-compose -f docker-compose.postgres.yml up"
    fi
else
    echo "   ✓ No Supabase docker-compose.yml found"
fi
echo ""

# Check 5: Studio app self-hosted configuration
echo "5. Checking Studio app configuration..."
if [ -d "$PROJECT_ROOT/apps/studio" ]; then
    echo "   ℹ Studio app supports self-hosted mode"
    echo "   Set IS_PLATFORM=false or unset NEXT_PUBLIC_IS_PLATFORM to use local PostgreSQL"
    echo "   Uses: POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_PASSWORD"
fi
echo ""

echo "=== Summary ==="
echo ""
echo "For local PostgreSQL setup:"
echo "  - Start: ./scripts/start-postgres.sh"
echo "  - Connection: postgresql://postgres:postgres@localhost:5432/postgres"
echo "  - Studio env: Set IS_PLATFORM=false or unset NEXT_PUBLIC_IS_PLATFORM"
echo ""
