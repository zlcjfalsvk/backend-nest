# E2E Testing Setup

This directory contains the complete End-to-End (E2E) testing setup for the Node.js application using Vitest as the primary test runner and Playwright for browser automation.

## Overview

The E2E testing environment includes:

- **Vitest** as the primary test runner for API testing
- **Playwright** for browser automation (if needed)
- **PostgreSQL** test database running in Docker
- **Prisma** for database management and seeding
- **Supertest** for HTTP API testing

## Project Structure

```
tests/e2e/
├── README.md                    # This file
├── vitest.config.e2e.ts        # Vitest configuration for E2E tests
├── playwright.config.ts        # Playwright configuration
├── global-setup.ts             # Global setup script (DB, seeding)
├── global-teardown.ts          # Global teardown script
├── setup.ts                    # Test setup (Prisma client, cleanup)
├── seed.ts                     # Database seeding script
├── auth.e2e-spec.ts            # Authentication E2E tests
├── posts.e2e-spec.ts           # Posts API E2E tests
├── comments.e2e-spec.ts        # Comments API E2E tests
└── health.e2e-spec.ts          # Application health E2E tests
```

## Prerequisites

1. **Docker & Docker Compose** - for running PostgreSQL test database
2. **Node.js** - compatible with project requirements (>=22.0.0)
3. **npm** - for package management (>=10.0.0)

## Quick Start

### 1. Run Complete E2E Test Suite

```bash
npm run e2e
```

This command will:
- Start PostgreSQL test database in Docker
- Run Prisma migrations
- Seed test data
- Execute all E2E tests
- Clean up environment

### 2. Individual Commands

```bash
# Setup test environment
npm run e2e:setup

# Run E2E tests only (requires setup first)
npm run e2e:test

# Run E2E tests with UI
npm run e2e:test:ui

# Run Playwright tests (browser automation)
npm run e2e:playwright

# Teardown test environment
npm run e2e:teardown

# Run both Vitest and Playwright tests
npm run e2e:full
```

## Test Database Configuration

The test database runs in Docker using the following configuration:

- **Host**: localhost
- **Port**: 5433 (different from default 5432 to avoid conflicts)
- **Database**: testdb
- **User**: testuser
- **Password**: testpass
- **Connection URL**: `postgresql://testuser:testpass@localhost:5433/testdb`

## Test Data

The seeding script (`seed.ts`) creates:

- **3 test users** with different roles and data
- **5 test posts** with varying published states and view counts
- **5 test comments** across different posts

## Test Coverage

### Authentication Tests (`auth.e2e-spec.ts`)
- User registration (sign-up)
- User authentication (sign-in)
- Input validation
- Duplicate email/nickname handling
- Authentication token integration

### Posts API Tests (`posts.e2e-spec.ts`)
- CRUD operations (Create, Read, Update, Delete)
- Authentication required endpoints
- Input validation
- Pagination and filtering
- Error handling

### Comments API Tests (`comments.e2e-spec.ts`)
- CRUD operations for comments
- Comment-post relationships
- Authentication requirements
- Input validation
- Error scenarios

### Health Tests (`health.e2e-spec.ts`)
- Application connectivity
- CORS handling
- Error responses
- Security headers
- Database connectivity

## Environment Variables

The following environment variables are used for E2E testing:

```bash
DATABASE_URL=postgresql://testuser:testpass@localhost:5433/testdb
```

## Troubleshooting

### Docker Issues

1. **Docker not running**:
   ```bash
   # Start Docker Desktop or Docker daemon
   sudo systemctl start docker  # Linux
   ```

2. **Port 5433 already in use**:
   ```bash
   # Find and kill process using port 5433
   lsof -ti:5433 | xargs kill -9
   ```

3. **Database connection issues**:
   ```bash
   # Check if test database is running
   docker compose -f docker-compose.test.yaml ps
   
   # View database logs
   docker compose -f docker-compose.test.yaml logs postgres-test
   ```

### Test Issues

1. **Prisma client errors**:
   ```bash
   # Regenerate Prisma client
   npx prisma generate --schema=./prisma/schema.prisma
   ```

2. **Migration issues**:
   ```bash
   # Reset database and run migrations
   npm run e2e:teardown
   npm run e2e:setup
   ```

3. **Seed data issues**:
   ```bash
   # Run seeding manually
   tsx tests/e2e/seed.ts
   ```

## CI/CD Integration

For CI/CD pipelines, use the complete E2E command:

```yaml
# GitHub Actions example
- name: Run E2E Tests
  run: npm run e2e
```

The setup is idempotent and can be run multiple times without issues.

## Best Practices

1. **Isolation**: Each test is isolated with database cleanup
2. **Realistic Data**: Use realistic test data that mirrors production
3. **Error Testing**: Test both success and failure scenarios
4. **Performance**: Tests should run quickly (< 30 seconds per test)
5. **Cleanup**: Always clean up resources after tests

## Extending Tests

To add new E2E tests:

1. Create a new `.e2e-spec.ts` file in this directory
2. Import the `prisma` client from `./setup`
3. Use `supertest` for API testing
4. Follow existing patterns for authentication and data setup
5. Ensure proper cleanup in `beforeEach` hooks

## Playwright Browser Tests

If you need browser automation:

1. Tests go in files ending with `.playwright.ts`
2. Use Playwright's test runner and page objects
3. Configure base URL in `playwright.config.ts`
4. Screenshots and videos are saved to `logs/playwright-artifacts/`

## Support

For issues or questions about the E2E testing setup, check:

1. Test logs in the `logs/` directory
2. Docker container logs
3. Database connection status
4. Environment variable configuration