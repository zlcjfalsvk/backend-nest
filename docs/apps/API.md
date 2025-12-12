# REST API Application Documentation

## Overview

The REST API application (`apps/api`) provides a traditional RESTful HTTP API using NestJS with Express adapter. It exposes endpoints for authentication, post management, and comment management.

## Purpose

- Provide RESTful HTTP API endpoints
- Handle HTTP request/response cycle
- Validate request DTOs
- Apply guards and middleware
- Integrate with business layer services

## Structure

```
apps/api/src/
├── auth/
│   ├── auth.controller.ts           # Auth endpoints
│   ├── auth.controller.module.ts    # Auth module
│   ├── guards/
│   │   └── access-token.guard.ts    # JWT authentication guard
│   ├── dtos/
│   │   ├── sign-up.dto.ts           # Sign up request
│   │   ├── sign-in.dto.ts           # Sign in request
│   │   ├── sign-up-response.dto.ts  # Sign up response
│   │   └── sign-in-response.dto.ts  # Sign in response
│   └── __test__/
│       └── auth.controller.spec.ts
├── posts/
│   ├── posts.controller.ts          # Post endpoints
│   ├── posts.controller.module.ts   # Post module
│   ├── dtos/
│   │   ├── create-post.dto.ts       # Create post request
│   │   ├── update-post.dto.ts       # Update post request
│   │   ├── post-response.dto.ts     # Post response
│   │   └── get-posts-query.dto.ts   # List posts query
│   └── __test__/
│       └── posts.controller.spec.ts
├── comments/
│   ├── comments.controller.ts       # Comment endpoints
│   ├── comments.controller.module.ts # Comment module
│   ├── dtos/
│   │   ├── create-comment.dto.ts    # Create comment request
│   │   ├── update-comment.dto.ts    # Update comment request
│   │   ├── comment-response.dto.ts  # Comment response
│   │   └── get-comments-query.dto.ts # List comments query
│   └── __test__/
│       └── comments.controller.spec.ts
├── api.module.ts                    # Root API module
└── main.ts                          # Application bootstrap
```

## Application Bootstrap

**Location**: `apps/api/src/main.ts`

**Configuration**:

- Port: Default 3000 (configurable via environment)
- Global prefix: `/api`
- CORS: Enabled
- Global validation pipe: Enabled
- Global exception filter: HttpExceptionFilter

**Startup Example**:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@libs/utils';
import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
```

## API Endpoints

### Authentication Endpoints

**Base Path**: `/api/auth`

#### POST /api/auth/sign-up

Register a new user account.

**Request Body**:

```typescript
{
  email: string; // Valid email format
  password: string; // Min 8 characters
  name: string; // User's display name
}
```

**Response** (201):

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
  }
  accessToken: string;
  refreshToken: string;
}
```

#### POST /api/auth/sign-in

Authenticate existing user.

**Request Body**:

```typescript
{
  email: string;
  password: string;
}
```

**Response** (200):

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
  }
  accessToken: string;
  refreshToken: string;
}
```

### Post Endpoints

**Base Path**: `/api/posts`

#### GET /api/posts

List posts with optional filtering and pagination.

**Query Parameters**:

```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 10
  authorId?: string;    // Filter by author
  search?: string;      // Search in title/content
}
```

**Response** (200):

```typescript
{
  data: Post[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### GET /api/posts/:id

Get a single post by ID.

**Response** (200):

```typescript
{
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
  }
  createdAt: string;
  updatedAt: string;
}
```

#### POST /api/posts

Create a new post (requires authentication).

**Headers**:

```
Authorization: Bearer <access_token>
```

**Request Body**:

```typescript
{
  title: string; // Required, min 1 char
  content: string; // Required, min 1 char
}
```

**Response** (201):

```typescript
{
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
```

#### PUT /api/posts/:id

Update an existing post (requires authentication + ownership).

**Headers**:

```
Authorization: Bearer <access_token>
```

**Request Body**:

```typescript
{
  title?: string;
  content?: string;
}
```

**Response** (200):

```typescript
{
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
```

#### DELETE /api/posts/:id

Delete a post (requires authentication + ownership).

**Headers**:

```
Authorization: Bearer <access_token>
```

**Response** (204): No content

### Comment Endpoints

**Base Path**: `/api/comments`

#### GET /api/comments

List comments with optional filtering.

**Query Parameters**:

```typescript
{
  page?: number;
  limit?: number;
  postId?: string;     // Filter by post
  authorId?: string;   // Filter by author
}
```

#### POST /api/comments

Create a new comment (requires authentication).

**Request Body**:

```typescript
{
  content: string; // Required
  postId: string; // Required, must exist
}
```

#### PUT /api/comments/:id

Update a comment (requires authentication + ownership).

#### DELETE /api/comments/:id

Delete a comment (requires authentication + ownership).

## DTOs (Data Transfer Objects)

### Validation Rules

DTOs use `class-validator` decorators:

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(1)
  name: string;
}
```

### Transformation

DTOs are automatically transformed using the global ValidationPipe:

```typescript
// Request body (plain object)
{ email: "test@example.com", password: "password123" }

// Automatically transformed to
SignInDto {
  email: "test@example.com",
  password: "password123"
}
```

## Guards

### Access Token Guard

**Location**: `apps/api/src/auth/guards/access-token.guard.ts`

**Purpose**: Validate JWT access token and attach user to request.

**Usage**:

```typescript
@UseGuards(AccessTokenGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

### Author Ownership Guard

**Location**: `@libs/utils/guards/author-ownership.guard.ts`

**Purpose**: Ensure user owns the resource being modified.

**Usage**:

```typescript
@UseGuards(AccessTokenGuard, AuthorOwnershipGuard)
@Put(':id')
updatePost(@Param('id') id: string, @Body() dto: UpdatePostDto) {
  // Only owner can access this
}
```

## Error Handling

All errors are caught by the global `HttpExceptionFilter` and returned in a consistent format:

```typescript
{
  statusCode: 400,
  timestamp: "2025-01-15T10:30:00.000Z",
  path: "/api/posts/123",
  message: "Validation failed",
  error: "Bad Request"
}
```

**Common Status Codes**:

- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (not resource owner)
- 404: Not Found
- 500: Internal Server Error

## Testing

### Unit Tests

Controllers are unit tested with mocked services:

```typescript
describe('PostsController', () => {
  let controller: PostsController;
  let service: PostService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should create a post', async () => {
    const dto = new CreatePostDto();
    dto.title = 'Test';
    dto.content = 'Content';

    const result = await controller.createPost('user-1', dto);
    expect(result).toBeDefined();
  });
});
```

### E2E Tests

Full API integration tests:

```typescript
describe('Posts API (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    // Sign in to get token
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send({ email: 'test@test.com', password: 'password' });

    accessToken = response.body.accessToken;
  });

  it('/api/posts (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Test', content: 'Content' })
      .expect(201);
  });
});
```

## Running the Application

### Development

```bash
npm run start:dev api
```

### Production

```bash
npm run build api
npm run start:prod api
```

### Debug Mode

```bash
npm run start:debug api
```

## Best Practices

1. **Always use DTOs**: Never accept plain objects in controllers
2. **Apply guards**: Use appropriate guards for protected endpoints
3. **Validate input**: Let ValidationPipe handle validation
4. **Transform responses**: Use response DTOs for consistent output
5. **Handle errors**: Let HttpExceptionFilter catch exceptions
6. **Document endpoints**: Add Swagger/OpenAPI documentation
7. **Version API**: Consider versioning for breaking changes
8. **Rate limiting**: Implement rate limiting for production
9. **Request logging**: Log all incoming requests
10. **Security headers**: Use helmet for security headers
