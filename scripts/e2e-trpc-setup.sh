#!/bin/bash

set -e

echo "🚀 Setting up tRPC E2E test environment..."

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker compose command exists
if ! docker compose version &> /dev/null; then
    print_error "docker compose command not found. Please install Docker Compose."
    exit 1
fi

# Stop any existing containers
print_status "Stopping any existing test containers..."
docker compose -f docker-compose.test.yaml down -v || true

# Start PostgreSQL test database
print_status "Starting PostgreSQL test database..."
docker compose -f docker-compose.test.yaml up -d

# Wait for database to be ready
print_status "Waiting for database to be ready..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker compose -f docker-compose.test.yaml exec -T postgres-test pg_isready -U testuser -d testdb > /dev/null 2>&1; then
        print_status "Database is ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "Database failed to start after $max_attempts attempts"
        docker compose -f docker-compose.test.yaml logs postgres-test
        exit 1
    fi
    
    echo "Attempt $attempt/$max_attempts - waiting for database..."
    sleep 2
    ((attempt++))
done

# Set environment variables for test database
export DATABASE_URL="postgresql://testuser:testpass@localhost:5433/testdb"

# Run Prisma migrations
print_status "Running Prisma migrations..."
if ! npx prisma migrate deploy --schema=./prisma/schema.prisma; then
    print_error "Failed to run Prisma migrations"
    exit 1
fi

# Generate Prisma client
print_status "Generating Prisma client..."
if ! npx prisma generate --schema=./prisma/schema.prisma; then
    print_error "Failed to generate Prisma client"
    exit 1
fi

# Install tsx if not already installed (for running TypeScript files)
if ! command -v tsx &> /dev/null; then
    print_status "Installing tsx for running TypeScript files..."
    npm install -g tsx
fi

# Seed test data
print_status "Seeding test data..."
if ! tsx tests/e2e/seed.ts; then
    print_error "Failed to seed test data"
    exit 1
fi

# Kill any existing processes on port 3001
print_status "Ensuring port 3001 is available..."
lsof -ti:3001 | xargs -r kill -9 2>/dev/null || true
sleep 2

# Start tRPC server in background
print_status "Starting tRPC server..."
npm run trpc:start:prod &
TRPC_PID=$!

# Wait for tRPC server to start
print_status "Waiting for tRPC server to start..."
sleep 10

# Test if tRPC server is responding
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:3001/trpc > /dev/null 2>&1; then
        print_status "tRPC server is ready!"
        break
    fi

    if [ $attempt -eq $max_attempts ]; then
        print_error "tRPC server failed to start after $max_attempts attempts"
        kill $TRPC_PID 2>/dev/null || true
        exit 1
    fi

    echo "Attempt $attempt/$max_attempts - waiting for tRPC server..."
    sleep 2
    ((attempt++))
done

# Save tRPC PID for cleanup
echo $TRPC_PID > /tmp/e2e-trpc.pid

print_status "✅ tRPC E2E test environment setup complete!"
print_status "Database URL: $DATABASE_URL"
print_status "tRPC Server: http://localhost:3001/trpc"
print_status "You can now run tRPC E2E tests with: npm run e2e:trpc"