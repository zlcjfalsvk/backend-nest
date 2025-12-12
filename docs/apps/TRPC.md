# tRPC Application Documentation

## Overview

The tRPC application (`apps/trpc`) provides a type-safe API using tRPC protocol. It offers end-to-end type safety between client and server with automatic TypeScript inference.

## Purpose

- Provide type-safe API endpoints
- Enable end-to-end TypeScript type inference
- Reduce boilerplate with automatic serialization
- Support real-time subscriptions (future)
- Integrate with business layer services

## Structure

```
apps/trpc/src/
├── schemas/
│   ├── auth.schema.ts       # Zod schemas for auth
│   ├── post.schema.ts       # Zod schemas for posts
│   ├── comment.schema.ts    # Zod schemas for comments
│   └── __test__/
│       └── schemas.spec.ts
├── trpc.router.ts           # Main tRPC router
├── trpc.module.ts           # tRPC module configuration
└── main.ts                  # Application bootstrap
```

## Application Bootstrap

**Location**: `apps/trpc/src/main.ts`

**Configuration**:

- Port: Default 3001 (configurable via environment)
- Protocol: tRPC over HTTP
- CORS: Enabled
- Context: Request-based context creation

**Startup Example**:

```typescript
import { NestFactory } from '@nestjs/core';
import { TrpcRouter } from './trpc.router';
import * as trpcExpress from '@trpc/server/adapters/express';

async function bootstrap() {
  const app = await NestFactory.create(TrpcModule);

  // Get tRPC router instance
  const trpc = app.get(TrpcRouter);
  const appRouter = trpc.createRouter();

  // Mount tRPC middleware
  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: ({ req, res }) => ({ req, res }),
    }),
  );

  app.enableCors();
  await app.listen(3001);
}
```

## tRPC Router Structure

The main router combines all feature routers:

```typescript
import { TrpcService } from '@libs/adapter';
import { createAuthRouter } from './routers/auth.router';
import { createPostRouter } from './routers/post.router';
import { createCommentRouter } from './routers/comment.router';

@Injectable()
export class TrpcRouter {
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

export type AppRouter = ReturnType<TrpcRouter['createRouter']>;
```

## Zod Schemas

### Auth Schemas

**Location**: `apps/trpc/src/schemas/auth.schema.ts`

```typescript
import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
```

### Post Schemas

**Location**: `apps/trpc/src/schemas/post.schema.ts`

```typescript
import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
});

export const getPostsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  authorId: z.string().optional(),
  search: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type GetPostsInput = z.infer<typeof getPostsSchema>;
```

### Comment Schemas

**Location**: `apps/trpc/src/schemas/comment.schema.ts`

```typescript
import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1),
  postId: z.string(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1),
});

export const getCommentsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  postId: z.string().optional(),
  authorId: z.string().optional(),
});
```

## Procedures

### Authentication Procedures

```typescript
export const authRouter = t.router({
  signUp: t.procedure.input(signUpSchema).mutation(async ({ input, ctx }) => {
    return await ctx.authService.signUp(input);
  }),

  signIn: t.procedure.input(signInSchema).mutation(async ({ input, ctx }) => {
    return await ctx.authService.signIn(input);
  }),
});
```

### Post Procedures

```typescript
export const postRouter = t.router({
  list: t.procedure.input(getPostsSchema).query(async ({ input, ctx }) => {
    return await ctx.postService.getPosts(input);
  }),

  byId: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.postService.getPost(input.id);
    }),

  create: t.authenticatedProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => {
      return await ctx.postService.createPost(ctx.userId, input);
    }),

  update: t.authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
        data: updatePostSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.postService.updatePost(input.id, ctx.userId, input.data);
    }),

  delete: t.authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.postService.deletePost(input.id, ctx.userId);
    }),
});
```

### Comment Procedures

```typescript
export const commentRouter = t.router({
  list: t.procedure.input(getCommentsSchema).query(async ({ input, ctx }) => {
    return await ctx.commentService.getComments(input);
  }),

  create: t.authenticatedProcedure
    .input(createCommentSchema)
    .mutation(async ({ input, ctx }) => {
      return await ctx.commentService.createComment(ctx.userId, input);
    }),

  update: t.authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateCommentSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.commentService.updateComment(
        input.id,
        ctx.userId,
        input.data,
      );
    }),

  delete: t.authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.commentService.deleteComment(input.id, ctx.userId);
    }),
});
```

## Context

tRPC context is created for each request:

```typescript
export interface TrpcContext {
  req: Request;
  res: Response;
  userId?: string; // Set by auth middleware
  user?: User; // Set by auth middleware
}

export const createContext = ({
  req,
  res,
}: CreateContextOptions): TrpcContext => {
  return { req, res };
};
```

## Middleware

### Authentication Middleware

```typescript
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  // Extract token from Authorization header
  const token = ctx.req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing authentication token',
    });
  }

  try {
    // Verify JWT token
    const payload = await verifyToken(token);

    // Add user info to context
    return next({
      ctx: {
        ...ctx,
        userId: payload.userId,
        user: payload.user,
      },
    });
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }
});

// Create authenticated procedure
const authenticatedProcedure = t.procedure.use(authMiddleware);
```

## Client Usage

### Setup Client

```typescript
// client.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/trpc.router';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
      headers: () => {
        const token = localStorage.getItem('accessToken');
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
```

### Making Requests

```typescript
// Queries (GET-like operations)
const posts = await trpc.posts.list.query({
  page: 1,
  limit: 10,
});

const post = await trpc.posts.byId.query({ id: 'post-123' });

// Mutations (POST/PUT/DELETE-like operations)
const newPost = await trpc.posts.create.mutate({
  title: 'Hello World',
  content: 'This is my first post',
});

const updatedPost = await trpc.posts.update.mutate({
  id: 'post-123',
  data: {
    title: 'Updated Title',
  },
});

await trpc.posts.delete.mutate({ id: 'post-123' });
```

### Type Safety

The client automatically infers types from the server:

```typescript
// TypeScript knows the exact shape of the response
const posts = await trpc.posts.list.query({ page: 1 });
// posts: { data: Post[], meta: { page: number, total: number, ... } }

// TypeScript validates input
await trpc.posts.create.mutate({
  title: 123, // ❌ Type error: title must be string
});

await trpc.posts.create.mutate({
  title: '', // ❌ Runtime error: title must be at least 1 character
});
```

## Error Handling

tRPC provides specific error codes:

```typescript
try {
  await trpc.posts.byId.query({ id: 'invalid' });
} catch (error) {
  if (error instanceof TRPCClientError) {
    switch (error.data?.code) {
      case 'NOT_FOUND':
        console.error('Post not found');
        break;
      case 'UNAUTHORIZED':
        console.error('Please log in');
        break;
      case 'FORBIDDEN':
        console.error('You do not have permission');
        break;
      case 'BAD_REQUEST':
        console.error('Invalid input:', error.message);
        break;
      default:
        console.error('Unknown error:', error);
    }
  }
}
```

## Testing

### Schema Testing

```typescript
describe('Post Schemas', () => {
  it('should validate create post schema', () => {
    const valid = createPostSchema.parse({
      title: 'Test Post',
      content: 'Test content',
    });
    expect(valid).toBeDefined();
  });

  it('should reject invalid create post', () => {
    expect(() => {
      createPostSchema.parse({
        title: '', // Too short
        content: 'Content',
      });
    }).toThrow();
  });
});
```

### Procedure Testing

```typescript
describe('Post Router', () => {
  let caller: ReturnType<typeof createCaller>;

  beforeEach(() => {
    caller = createCaller({
      req: mockRequest,
      res: mockResponse,
      postService: mockPostService,
    });
  });

  it('should list posts', async () => {
    mockPostService.getPosts.mockResolvedValue({
      data: [{ id: '1', title: 'Test' }],
      meta: { page: 1, total: 1 },
    });

    const result = await caller.posts.list({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
  });
});
```

## Running the Application

### Development

```bash
npm run start:dev trpc
```

### Production

```bash
npm run build trpc
npm run start:prod trpc
```

## Best Practices

1. **Always use Zod schemas**: Define schemas for all inputs
2. **Type safety**: Export AppRouter type for client usage
3. **Use middleware**: Compose reusable middleware for auth, logging, etc.
4. **Error codes**: Use appropriate tRPC error codes
5. **Batch requests**: Enable batching for better performance
6. **Context enrichment**: Add necessary data to context in middleware
7. **Schema reuse**: Share schemas between procedures when possible
8. **Documentation**: Document complex schemas and procedures
9. **Versioning**: Consider router versioning for breaking changes
10. **Testing**: Test schemas, procedures, and middleware thoroughly

## Advantages over REST

1. **Type Safety**: Full TypeScript inference from server to client
2. **No Code Generation**: No need for OpenAPI/Swagger generation
3. **Reduced Boilerplate**: Automatic serialization/deserialization
4. **Better DX**: Autocomplete and type checking in client code
5. **Batch Requests**: Automatic request batching for performance
6. **Subscriptions**: Built-in support for real-time updates
7. **Smaller Bundle**: No need for HTTP client libraries like Axios
