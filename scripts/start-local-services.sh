#!/bin/bash

# Start Local Services Script
# This script starts the local PostgreSQL database and WebSocket server

set -e

echo "🚀 Starting local services..."

# Check if podman-compose is available
if ! command -v podman-compose &> /dev/null; then
    echo "❌ podman-compose is not installed. Please install it first."
    exit 1
fi

# Start PostgreSQL database
echo "📊 Starting PostgreSQL database..."
podman-compose -f docker-compose.local.yml up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is ready
if podman exec local-postgres pg_isready -U postgres -d localdb; then
    echo "✅ Database is ready!"
else
    echo "❌ Database failed to start properly"
    exit 1
fi

# Start PgAdmin (optional)
echo "🛠️  Starting PgAdmin..."
podman-compose -f docker-compose.local.yml up -d pgadmin

# Start WebSocket server
echo "🔌 Starting WebSocket server..."
# This would be started from the application code
echo "ℹ️  WebSocket server will be started by the application"

echo ""
echo "🎉 Local services started successfully!"
echo ""
echo "📋 Service URLs:"
echo "  PostgreSQL: localhost:5432 (user: postgres, password: password, database: localdb)"
echo "  PgAdmin: http://localhost:8080 (admin@localhost / admin)"
echo "  WebSocket: ws://localhost:8081 (when application starts)"
echo ""
echo "🔧 To stop services: podman-compose -f docker-compose.local.yml down"