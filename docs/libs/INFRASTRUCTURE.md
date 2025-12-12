# Infrastructure Layer Documentation

## Overview

The infrastructure layer (`libs/infrastructure`) provides technical capabilities for the application, including database access, configuration management, and external service integrations.

## Purpose

- Abstract database access through Prisma ORM
- Manage application configuration
- Handle environment variables
- Provide infrastructure services to other layers

## Structure

```
libs/infrastructure/src/
├── config/
│   ├── config.service.ts       # Configuration management
│   ├── config.module.ts        # Config module setup
│   ├── config.service.spec.ts  # Unit tests
│   └── index.ts                # Public exports
├── prisma/
│   ├── prisma.service.ts       # Prisma client wrapper
│   ├── prisma.module.ts        # Prisma module setup
│   └── index.ts                # Public exports
└── index.ts                    # Main infrastructure exports
```

## Key Components

### Prisma Service

**Location**: `libs/infrastructure/src/prisma/prisma.service.ts`

**Responsibilities**:

- Initialize and manage Prisma client
- Handle database connections
- Provide database transaction support
- Clean up connections on shutdown

**Key Features**:

- Extends `PrismaClient` for direct access to all Prisma methods
- Implements `OnModuleInit` for connection initialization
- Implements `OnModuleDestroy` for graceful shutdown

**Usage Example**:

```typescript
import { PrismaService } from '@libs/infrastructure';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(data: CreatePostData) {
    return await this.prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        authorId: data.userId,
      },
    });
  }

  async getPostsWithTransaction() {
    return await this.prisma.$transaction(async (tx) => {
      const posts = await tx.post.findMany();
      const count = await tx.post.count();
      return { posts, count };
    });
  }
}
```

### Config Service

**Location**: `libs/infrastructure/src/config/config.service.ts`

**Responsibilities**:

- Load and validate environment variables
- Provide type-safe access to configuration
- Centralize configuration logic
- Support different environments (dev, test, prod)

**Key Methods**:

- `get(key)`: Get configuration value by key
- `getOrThrow(key)`: Get value or throw if not found
- Environment-specific getters (e.g., `getDatabaseUrl()`, `getJwtSecret()`)

**Usage Example**:

```typescript
import { ConfigService } from '@libs/infrastructure';

@Injectable()
export class AuthService {
  constructor(private readonly config: ConfigService) {}

  generateToken(payload: TokenPayload) {
    const secret = this.config.getOrThrow('JWT_SECRET');
    const expiresIn = this.config.get('JWT_EXPIRES_IN', '1h');

    return jwt.sign(payload, secret, { expiresIn });
  }
}
```

## Database Schema

The Prisma schema is located at: `prisma/schema.prisma`

**Main Models**:

- **User**: User accounts and authentication
- **Post**: Blog posts or content items
- **Comment**: Comments on posts

**Relationships**:

- User → Posts (one-to-many)
- User → Comments (one-to-many)
- Post → Comments (one-to-many)

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT Authentication
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
NODE_ENV="development"
PORT="3000"
```

## Module Registration

Import infrastructure modules in your application:

```typescript
import { PrismaModule, ConfigModule } from '@libs/infrastructure';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    // ... other modules
  ],
})
export class AppModule {}
```

## Prisma Client Access

The Prisma client is available through path alias:

```typescript
import { User, Post, Comment } from '@prisma-client';

// Use generated types
const user: User = await prisma.user.findUnique({ where: { id: 1 } });
```

## Database Migrations

### Create Migration

```bash
npx prisma migrate dev --name your_migration_name
```

### Apply Migrations

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

### Generate Prisma Client

```bash
npx prisma generate
```

## Testing

### Unit Tests

Mock the PrismaService in unit tests:

```typescript
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  post: {
    // ... mock methods
  },
};

const module = await Test.createTestingModule({
  providers: [
    YourService,
    {
      provide: PrismaService,
      useValue: mockPrismaService,
    },
  ],
}).compile();
```

### E2E Tests

Use a test database for E2E tests:

```typescript
beforeAll(async () => {
  // Set test database URL
  process.env.DATABASE_URL = 'postgresql://localhost:5432/test_db';

  // Run migrations
  execSync('npx prisma migrate deploy');
});

afterAll(async () => {
  // Clean up
  await prisma.$disconnect();
});
```

## Best Practices

1. **Always use PrismaService**: Never instantiate PrismaClient directly
2. **Use transactions for related operations**: Ensure data consistency
3. **Close connections properly**: Let NestJS lifecycle handle cleanup
4. **Type-safe queries**: Leverage Prisma's generated types
5. **Environment validation**: Validate all required env vars at startup
6. **Separate test database**: Never run tests against production DB
7. **Migration naming**: Use descriptive names for migrations
8. **Index optimization**: Add indexes for frequently queried fields

## Troubleshooting

### Connection Issues

```typescript
// Check connection
await prisma.$connect();

// Test query
await prisma.$queryRaw`SELECT 1`;
```

### Schema Sync Issues

```bash
# Reset database (DEV ONLY)
npx prisma migrate reset

# Push schema without migration
npx prisma db push
```

### Type Generation Issues

```bash
# Regenerate Prisma Client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```
