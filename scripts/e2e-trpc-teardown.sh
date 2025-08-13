#!/bin/bash

set -e

echo "🧹 Tearing down tRPC E2E test environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Stop and remove Docker containers
print_status "Stopping PostgreSQL test database..."
if docker compose -f docker-compose.test.yaml down -v; then
    print_status "Successfully stopped test database"
else
    print_warning "Failed to stop test database (it might not be running)"
fi

# Remove any orphaned containers
print_status "Cleaning up any orphaned containers..."
docker container prune -f || print_warning "Failed to prune containers"

# Remove test database volumes
print_status "Removing test database volumes..."
docker volume ls -q | grep -E "(postgres-test|postgres_test)" | xargs -r docker volume rm || print_warning "No test volumes to remove"

# Clean up logs directory if it exists
if [ -d "logs" ]; then
    print_status "Cleaning up tRPC test logs..."
    rm -rf logs/trpc-e2e-results.json || print_warning "Failed to clean tRPC log files"
fi

# Kill tRPC server if PID file exists
if [ -f "/tmp/e2e-trpc.pid" ]; then
    print_status "Stopping tRPC server..."
    TRPC_PID=$(cat /tmp/e2e-trpc.pid)
    kill $TRPC_PID 2>/dev/null || true
    rm /tmp/e2e-trpc.pid
    sleep 2
fi

# Kill any remaining processes on tRPC port
print_status "Ensuring tRPC port is cleaned up..."
lsof -ti:3001 | xargs -r kill -9 2>/dev/null || true
lsof -ti:5433 | xargs -r kill -9 2>/dev/null || true
sleep 1

print_status "✅ tRPC E2E test environment teardown complete!"