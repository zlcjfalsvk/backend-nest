# Adapter Layer Documentation

## Overview

The adapter layer (`libs/adapter`) provides protocol adapters and framework integrations that bridge different communication protocols with the business layer.

## Purpose

- Adapt external protocols (tRPC, GraphQL, etc.) to business services
- Convert protocol-specific requests to business layer calls
- Provide type-safe API integrations
- Abstract protocol details from business logic

## Structure

```
libs/adapter/src/
├── tRPC/
│   ├── trpc.service.ts    # tRPC service and context
│   ├── trpc.module.ts     # tRPC module configuration
│   ├── types.ts           # tRPC-related types
│   └── index.ts           # Public exports
└── index.ts               # Main adapter exports
```

## Key Components

### tRPC Service

**Location**: `libs/adapter/src/tRPC/trpc.service.ts`

**Responsibilities**:

- Initialize tRPC server instance
- Configure tRPC context
- Provide type-safe procedure builders
- Handle authentication and middleware

**Key Features**:

- Context creation with request information
- Authenticated procedure builder
- Type-safe router composition
- Integration with business services

**Usage Example**:

```typescript
import { TrpcService } from '@libs/adapter';
import { PostService } from '@libs/business';

@Injectable()
export class AppTrpcService {
  constructor(
    private readonly trpc: TrpcService,
    private readonly postService: PostService,
  ) {}

  getRouter() {
    const t = this.trpc.createRouter();

    return t.router({
      posts: t.router({
        list: t.procedure.input(getPostsSchema).query(async ({ input }) => {
          return await this.postService.getPosts(input);
        }),

        create: t.authenticatedProcedure
          .input(createPostSchema)
          .mutation(async ({ input, ctx }) => {
            return await this.postService.createPost(ctx.userId, input);
          }),
      }),
    });
  }
}
```

### tRPC Context

**Type Definition**:

```typescript
export interface TrpcContext {
  req: Request;
  res: Response;
  userId?: string;
  user?: User;
}
```

**Context Creation**:

The context is created for each request and includes:

- Request and response objects
- Authenticated user information (if available)
- Additional metadata as needed

## Type Definitions

### Procedure Builders

```typescript
// Public procedure (no authentication required)
const publicProcedure = t.procedure;

// Authenticated procedure (requires valid JWT)
const authenticatedProcedure = t.procedure.use(authMiddleware);
```

### Router Types

```typescript
export type AppRouter = ReturnType<typeof createRouter>;
export type AppRouterInput = inferRouterInputs<AppRouter>;
export type AppRouterOutput = inferRouterOutputs<AppRouter>;
```

## Integration with Business Layer

The adapter layer should:

1. Receive protocol-specific requests (tRPC procedures)
2. Validate input using Zod schemas
3. Extract authentication information from context
4. Call business services with validated data
5. Return results in protocol format

**Example Flow**:

```
tRPC Client Request
      ↓
tRPC Router (apps/trpc)
      ↓
tRPC Service (libs/adapter) - Validate & Auth
      ↓
Business Service (libs/business) - Execute Logic
      ↓
Infrastructure Layer (libs/infrastructure) - Database
      ↓
Return Response through layers
```

## Authentication Middleware

The adapter layer handles authentication:

```typescript
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const token = extractTokenFromRequest(ctx.req);

  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const payload = await verifyToken(token);

  return next({
    ctx: {
      ...ctx,
      userId: payload.userId,
      user: payload.user,
    },
  });
});
```

## Module Registration

Import the adapter module in your tRPC application:

```typescript
import { TrpcModule } from '@libs/adapter';
import { BusinessModule } from '@libs/business';

@Module({
  imports: [TrpcModule, BusinessModule],
})
export class AppModule {}
```

## Usage in Apps

### In tRPC App

```typescript
// apps/trpc/src/trpc.router.ts
import { TrpcService } from '@libs/adapter';
import { AuthService, PostService, CommentService } from '@libs/business';

@Injectable()
export class AppRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly authService: AuthService,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  createRouter() {
    const t = this.trpc.t;

    return t.router({
      auth: createAuthRouter(t, this.authService),
      posts: createPostRouter(t, this.postService),
      comments: createCommentRouter(t, this.commentService),
    });
  }
}
```

## Error Handling

The adapter layer should transform business exceptions to protocol-specific errors:

```typescript
try {
  return await this.businessService.performOperation(input);
} catch (error) {
  if (error instanceof NotFoundException) {
    throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
  }
  if (error instanceof UnauthorizedException) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: error.message });
  }
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
}
```

## Testing

### Unit Tests

Mock business services when testing adapters:

```typescript
describe('TrpcService', () => {
  let service: TrpcService;
  let postService: PostService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TrpcService,
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    }).compile();

    service = module.get<TrpcService>(TrpcService);
  });

  it('should create router with authenticated procedures', () => {
    const router = service.createRouter();
    expect(router).toBeDefined();
  });
});
```

## Best Practices

1. **Keep adapters thin**: Business logic belongs in business layer
2. **Protocol-specific validation**: Use Zod schemas for tRPC
3. **Type safety**: Leverage tRPC's type inference
4. **Error transformation**: Convert business exceptions to protocol errors
5. **Context enrichment**: Add necessary metadata to context
6. **Middleware composition**: Use middleware for cross-cutting concerns
7. **Documentation**: Document procedure inputs/outputs clearly

## Future Adapters

The adapter layer can be extended to support additional protocols:

- **GraphQL Adapter**: For GraphQL API support
- **WebSocket Adapter**: For real-time communication
- **Message Queue Adapter**: For async job processing
- **gRPC Adapter**: For microservice communication

Each adapter should follow the same pattern:

1. Protocol-specific service
2. Context creation
3. Integration with business services
4. Type-safe interfaces
