# Utils Layer Documentation

## Overview

The utils layer (`libs/utils`) provides cross-cutting utilities, helpers, and shared components used throughout the application. This is the foundation layer with no dependencies on other layers.

## Purpose

- Provide reusable utility functions
- Define custom guards and decorators
- Handle common error cases
- Implement type transformations
- Share cross-cutting functionality

## Structure

```
libs/utils/src/
├── filters/
│   ├── http.filter.ts        # Global exception filter
│   └── index.ts               # Filter exports
├── guards/
│   ├── author-ownership.guard.ts  # Ownership validation guard
│   └── index.ts               # Guard exports
├── custom-error.ts            # Custom error classes
├── decorators.ts              # Custom decorators
├── plain-to-instance.ts       # DTO transformation utility
└── index.ts                   # Main utils exports
```

## Key Components

### HTTP Exception Filter

**Location**: `libs/utils/src/filters/http.filter.ts`

**Responsibilities**:

- Catch all HTTP exceptions globally
- Format error responses consistently
- Log errors for debugging
- Transform exceptions to user-friendly messages

**Features**:

- Implements `ExceptionFilter` interface
- Catches `HttpException` and all subclasses
- Returns standardized error format

**Usage Example**:

```typescript
// Register globally in main.ts
import { HttpExceptionFilter } from '@libs/utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
```

**Error Response Format**:

```typescript
{
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error?: string;
}
```

### Author Ownership Guard

**Location**: `libs/utils/src/guards/author-ownership.guard.ts`

**Responsibilities**:

- Validate user owns the resource being modified
- Prevent unauthorized modifications
- Work with posts, comments, and other user-owned resources

**Usage Example**:

```typescript
import { AuthorOwnershipGuard } from '@libs/utils';

@Controller('posts')
export class PostsController {
  @Put(':id')
  @UseGuards(AccessTokenGuard, AuthorOwnershipGuard)
  async updatePost(
    @Param('id') id: string,
    @Body() updateDto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return await this.postService.updatePost(id, user.id, updateDto);
  }
}
```

### Custom Decorators

**Location**: `libs/utils/src/decorators.ts`

**Available Decorators**:

#### @CurrentUser()

Extract authenticated user from request:

```typescript
import { CurrentUser } from '@libs/utils';

@Get('profile')
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

#### @CurrentUserId()

Extract just the user ID:

```typescript
import { CurrentUserId } from '@libs/utils';

@Post()
async createPost(
  @CurrentUserId() userId: string,
  @Body() createDto: CreatePostDto,
) {
  return await this.postService.createPost(userId, createDto);
}
```

#### @Public()

Mark endpoint as public (skip authentication):

```typescript
import { Public } from '@libs/utils';

@Public()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}
```

### Plain to Instance Utility

**Location**: `libs/utils/src/plain-to-instance.ts`

**Responsibilities**:

- Transform plain objects to DTO class instances
- Apply class-transformer decorators
- Enable type validation and transformation
- Handle nested objects and arrays

**Usage Example**:

```typescript
import { plainToInstance } from '@libs/utils';
import { CreatePostDto } from './dtos/create-post.dto';

// Transform request body to DTO
const dto = plainToInstance(CreatePostDto, req.body);

// Transform array of objects
const dtos = plainToInstance(CreatePostDto, arrayOfPlainObjects);
```

**Key Features**:

- Excludes extraneous properties
- Enables implicit type conversion
- Exposes decorated properties only
- Works with nested DTOs

### Custom Error Classes

**Location**: `libs/utils/src/custom-error.ts`

**Available Error Classes**:

```typescript
// Resource not found
export class NotFoundException extends HttpException {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

// Unauthorized access
export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

// Forbidden action
export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

// Bad request
export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
```

**Usage Example**:

```typescript
import { NotFoundException } from '@libs/utils';

async getPost(id: string) {
  const post = await this.prisma.post.findUnique({ where: { id } });

  if (!post) {
    throw new NotFoundException('Post', id);
  }

  return post;
}
```

## Helper Functions

### String Transformation

```typescript
// Convert snake_case to camelCase
export function snakeToCamel(str: string): string;

// Convert camelCase to snake_case
export function camelToSnake(str: string): string;

// Convert object keys from snake_case to camelCase
export function keysSnakeToCamel<T>(obj: any): T;

// Convert object keys from camelCase to snake_case
export function keysCamelToSnake<T>(obj: any): T;
```

**Usage Example**:

```typescript
import { snakeToCamel, keysSnakeToCamel } from '@libs/utils';

const camelCase = snakeToCamel('user_name'); // 'userName'

const transformed = keysSnakeToCamel({
  user_id: 1,
  first_name: 'John',
}); // { userId: 1, firstName: 'John' }
```

## Usage Examples

### Complete Request Flow with Utils

```typescript
import {
  HttpExceptionFilter,
  AuthorOwnershipGuard,
  CurrentUserId,
  NotFoundException,
  plainToInstance,
} from '@libs/utils';

@Controller('posts')
@UseFilters(HttpExceptionFilter)
export class PostsController {
  @Put(':id')
  @UseGuards(AccessTokenGuard, AuthorOwnershipGuard)
  async updatePost(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @Body() body: any,
  ) {
    // Transform plain object to DTO
    const updateDto = plainToInstance(UpdatePostDto, body);

    // Get post
    const post = await this.postService.getPost(id);
    if (!post) {
      throw new NotFoundException('Post', id);
    }

    // Update post
    return await this.postService.updatePost(id, userId, updateDto);
  }
}
```

## Module Registration

Utils don't typically need module registration, but filters and guards should be registered:

```typescript
// Global registration
import { HttpExceptionFilter } from '@libs/utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000);
}
```

## Testing

### Testing Guards

```typescript
describe('AuthorOwnershipGuard', () => {
  let guard: AuthorOwnershipGuard;

  beforeEach(() => {
    guard = new AuthorOwnershipGuard();
  });

  it('should allow access to resource owner', async () => {
    const context = createMockContext({
      user: { id: 'user-1' },
      params: { id: 'post-1' },
      resource: { authorId: 'user-1' },
    });

    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);
  });

  it('should deny access to non-owner', async () => {
    const context = createMockContext({
      user: { id: 'user-1' },
      params: { id: 'post-1' },
      resource: { authorId: 'user-2' },
    });

    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(false);
  });
});
```

### Testing Decorators

```typescript
describe('CurrentUser decorator', () => {
  it('should extract user from request', () => {
    const request = {
      user: { id: 'user-1', email: 'test@example.com' },
    };

    const user = CurrentUser(null, {
      switchToHttp: () => ({ getRequest: () => request }),
    });
    expect(user).toEqual(request.user);
  });
});
```

## Best Practices

1. **Keep utils pure**: No business logic in utilities
2. **Type safety**: Always provide proper TypeScript types
3. **Documentation**: Document complex utility functions
4. **Testing**: Write unit tests for all utilities
5. **Reusability**: Design for reuse across modules
6. **No dependencies**: Utils should not depend on other layers
7. **Error handling**: Use appropriate error classes
8. **Naming conventions**: Clear, descriptive names

## Common Patterns

### Validation Decorator Pattern

```typescript
export function IsNotEmpty(): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    // Validation logic
  };
}
```

### Guard Composition Pattern

```typescript
@UseGuards(AuthGuard, RoleGuard, OwnershipGuard)
```

### Exception Filter Pattern

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // Error handling logic
  }
}
```
