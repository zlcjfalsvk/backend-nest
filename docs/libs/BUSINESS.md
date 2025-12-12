# Business Layer Documentation

## Overview

The business layer (`libs/business`) contains the core domain logic and services for the application. This layer is framework-agnostic and focuses purely on business rules.

## Purpose

- Implement business logic and domain rules
- Provide reusable services across different applications (REST API, tRPC)
- Define business types and interfaces
- Handle data transformation and validation logic

## Structure

```
libs/business/src/
├── auth/
│   ├── auth.service.ts       # Authentication business logic
│   ├── auth.module.ts        # Auth module configuration
│   ├── types.ts              # Auth-related types
│   └── index.ts              # Public exports
├── post/
│   ├── post.service.ts       # Post management logic
│   ├── post.module.ts        # Post module configuration
│   ├── post.helpers.ts       # Post utility functions
│   ├── types.ts              # Post-related types
│   └── index.ts              # Public exports
├── comment/
│   ├── comment.service.ts    # Comment management logic
│   ├── comment.module.ts     # Comment module configuration
│   ├── comment.helpers.ts    # Comment utility/validation functions
│   ├── types.ts              # Comment-related types
│   └── index.ts              # Public exports
└── index.ts                  # Main business layer exports
```

## Key Components

### Auth Service

**Location**: `libs/business/src/auth/auth.service.ts`

**Responsibilities**:

- User registration (sign-up)
- User authentication (sign-in)
- Password hashing and verification
- JWT token generation and validation
- Token refresh logic

**Key Methods**:

- `signUp(param)`: Register new user with email, password, nickName
- `signIn(param)`: Authenticate user and return tokens

### Post Service

**Location**: `libs/business/src/post/post.service.ts`

**Responsibilities**:

- CRUD operations for posts
- Post ownership validation
- Post listing with pagination
- Post filtering and sorting

**Key Methods**:

- `create(data)`: Create new post with title, content, slug, authorId
- `find(id)`: Retrieve single post by ID (increments view count)
- `finds(params)`: List posts with pagination and cursor-based navigation
- `update(params)`: Update existing post
- `delete(id)`: Soft delete post

**Helper Functions** (`post.helpers.ts`):

- `AUTHOR_INCLUDE`: Constant for author include configuration
- `buildWhereCondition()`: Build query where conditions
- `buildFindManyQueryOptions()`: Build findMany query options
- `calculateTotalPages()`: Calculate pagination total pages
- `validatePostExists()`: Validate post exists (throws if not)
- `validatePostNotDeleted()`: Validate post is not deleted
- `validateSlugUniqueness()`: Validate slug is unique

### Comment Service

**Location**: `libs/business/src/comment/comment.service.ts`

**Responsibilities**:

- CRUD operations for comments
- Comment-post relationship management
- Comment ownership validation
- Comment listing with pagination

**Key Methods**:

- `create(data)`: Create new comment with content, postId, authorId
- `find(id)`: Retrieve single comment by ID
- `findsByPostId(params)`: List comments for a post with pagination
- `update(params)`: Update existing comment
- `delete(id)`: Soft delete comment

**Helper Functions** (`comment.helpers.ts`):

- `AUTHOR_INCLUDE`: Constant for author include configuration
- `validatePostExists()`: Validate post exists for comment
- `validatePostNotDeleted()`: Validate post is not deleted
- `validateCommentExists()`: Validate comment exists (throws if not)
- `validateCommentNotDeleted()`: Validate comment is not deleted
- `validateCommentNotAlreadyDeleted()`: Validate comment is not already deleted

## Type Definitions

Each module exports its own types in `types.ts`:

```typescript
// Example from auth/types.ts
export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
}
```

## Usage Examples

### Importing Business Services

```typescript
// Import from main business index
import { AuthService, PostService, CommentService } from '@libs/business';

// Or import from specific module
import { AuthService } from '@libs/business/auth';
import { PostService } from '@libs/business/post';
```

### Using in Controllers

```typescript
import { Controller, Injectable } from '@nestjs/common';
import { PostService } from '@libs/business';

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPosts(@Query() query: GetPostsQueryDto) {
    return await this.postService.getPosts(query);
  }
}
```

### Using in tRPC Routers

```typescript
import { PostService } from '@libs/business';

const postRouter = t.router({
  list: t.procedure.input(getPostsSchema).query(async ({ input, ctx }) => {
    return await ctx.postService.getPosts(input);
  }),
});
```

## Dependencies

### Internal Dependencies

- `@libs/infrastructure`: Database access via Prisma
- `@libs/utils`: Helper functions and utilities

### External Dependencies

- `@nestjs/common`: Dependency injection and decorators
- `@nestjs/jwt`: JWT token handling
- `argon2`: Password hashing (Note: For Korean services, pbkdf2-sha256 should be used per KISA standards)

## Module Registration

Each business module must be imported in the consuming application:

```typescript
// In apps/api/src/api.module.ts
import { AuthModule } from '@libs/business/auth';
import { PostModule } from '@libs/business/post';
import { CommentModule } from '@libs/business/comment';

@Module({
  imports: [
    AuthModule,
    PostModule,
    CommentModule,
    // ... other modules
  ],
})
export class ApiModule {}
```

## Testing

Business services should be unit tested with mocked dependencies:

```typescript
describe('PostService', () => {
  let service: PostService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  // ... tests
});
```

## Best Practices

1. **Keep services framework-agnostic**: Business logic should not depend on HTTP concepts
2. **Use dependency injection**: All dependencies should be injected
3. **Export types**: Make types available for consumers
4. **Handle errors**: Throw appropriate exceptions with clear messages
5. **Validate inputs**: Use types and runtime validation
6. **Document complex logic**: Add comments for non-obvious business rules
