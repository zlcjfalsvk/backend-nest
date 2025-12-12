# Architecture Overview

## System Design

This NestJS project follows a **clean layered architecture** pattern using a monorepo structure with clear separation of concerns.

## Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Presentation Layer (apps/api, apps/trpc)              │
│  - REST Controllers                                      │
│  - tRPC Routers                                         │
│  - DTOs & Request/Response Validation                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Business Logic Layer (libs/business)                   │
│  - AuthService, PostService, CommentService             │
│  - Business Rules & Domain Logic                        │
│  - Type Definitions                                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Adapter Layer (libs/adapter)                           │
│  - Protocol Converters (tRPC)                           │
│  - Framework Integrations                               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Infrastructure Layer (libs/infrastructure)             │
│  - Database Access (Prisma ORM)                         │
│  - Configuration Management                             │
│  - External Service Integrations                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Utilities Layer (libs/utils)                           │
│  - Guards, Filters, Decorators                          │
│  - Helper Functions                                      │
│  - Cross-Cutting Concerns                               │
└─────────────────────────────────────────────────────────┘
```

## Monorepo Structure

### Apps

- **apps/api**: REST API application with Express adapter
- **apps/trpc**: tRPC API application for type-safe API calls

### Libraries

- **libs/business**: Core business logic and services
- **libs/infrastructure**: Database and configuration layer
- **libs/adapter**: Protocol adapters and integrations
- **libs/utils**: Shared utilities and helpers

## Key Design Patterns

### 1. Module Pattern

Each feature (auth, posts, comments) has its own module hierarchy:

- Controller/Router Module (presentation)
- Service Module (business logic)
- Clear module boundaries and exports

### 2. DTO Pattern

- Request validation using `class-validator`
- Type safety with `class-transformer`
- Dedicated DTOs for each endpoint

### 3. Service Pattern

- Business logic centralized in services
- Services injected via dependency injection
- Clean separation from controllers/routers

### 4. Guard Pattern

- Authentication guards (AccessTokenGuard)
- Authorization guards (AuthorOwnershipGuard)
- Reusable across controllers

### 5. Filter Pattern

- Global exception handling
- Custom HttpFilter for error responses
- Consistent error format

### 6. Type Conversion Pattern

- `plainToInstance` utility for DTO conversion
- Automatic property transformation
- Type-safe conversions

## Path Aliases

```typescript
@libs/adapter        → libs/adapter/src
@libs/business       → libs/business/src
@libs/infrastructure → libs/infrastructure/src
@libs/utils          → libs/utils/src
@prisma-client       → prisma/prisma-clients
```

## Dependency Rules

1. **Apps** can depend on all libs
2. **libs/business** can depend on infrastructure and utils
3. **libs/infrastructure** can depend on utils only
4. **libs/adapter** can depend on business and utils
5. **libs/utils** has no dependencies (foundation layer)

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript (strict mode)
- **ORM**: Prisma
- **Validation**: class-validator, class-transformer, Zod (tRPC)
- **Testing**: Jest
- **API Protocols**: REST (Express), tRPC

## Cross-Cutting Concerns

- **Authentication**: JWT-based with AccessTokenGuard
- **Authorization**: Role and ownership-based guards
- **Error Handling**: Global HttpFilter
- **Validation**: Global ValidationPipe
- **Logging**: NestJS Logger (can be extended)
- **Configuration**: Environment-based with ConfigService
