#!/bin/bash

set -e

echo "🧹 Tearing down E2E test environment..."

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
    print_status "Cleaning up test logs..."
    rm -rf logs/e2e-results.json logs/playwright-* || print_warning "Failed to clean some log files"
fi

# Optional: Kill any running API servers on test ports
print_status "Checking for any running processes on test ports..."
lsof -ti:3000 | xargs -r kill -9 || true
lsof -ti:5433 | xargs -r kill -9 || true

print_status "✅ E2E test environment teardown complete!"