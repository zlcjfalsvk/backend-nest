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

### HTTP Filter (CustomError Handler)

**Location**: `libs/utils/src/filters/http.filter.ts`

**Responsibilities**:

- Catch `CustomError` exceptions globally
- Map error codes to appropriate HTTP status codes
- Format error responses consistently
- Add error code to response body

**Features**:

- Implements `ExceptionFilter` interface
- Catches `CustomError` class specifically
- Maps error codes to HTTP exceptions (404, 401, 409, etc.)
- Returns standardized error format with error code

**Error Code Mapping**:

| Error Code              | HTTP Status      |
| ----------------------- | ---------------- |
| AUTH_CONFLICT           | 409 Conflict     |
| AUTH_UNAUTHORIZED       | 401 Unauthorized |
| POST_NOT_FOUND          | 404 Not Found    |
| COMMENT_NOT_FOUND       | 404 Not Found    |
| POST_DELETED            | 404 Not Found    |
| COMMENT_DELETED         | 404 Not Found    |
| COMMENT_ALREADY_DELETED | 404 Not Found    |
| (default)               | 400 Bad Request  |

**Usage Example**:

```typescript
// Register globally in main.ts
import { HttpFilter } from '@libs/utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpFilter());
  await app.listen(3000);
}
```

**Error Response Format**:

```typescript
{
  statusCode: number;
  message: string;
  error: string;
  code: string; // CustomError code (e.g., 'POST_NOT_FOUND')
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

#### @IsStrongPassword()

Custom validator decorator for password strength validation:

```typescript
import { IsStrongPassword } from '@libs/utils';

export class SignUpDto {
  @IsStrongPassword()
  password: string;
}
```

**Password Requirements**:

- At least 10 characters long
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one special character (!@#$%^&\*\_)

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

**Error Codes**:

```typescript
const AUTH_ERROR_CODES = {
  AUTH_CONFLICT: 'AUTH_CONFLICT',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
} as const;

const POST_ERROR_CODES = {
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  POST_CONFLICT: 'POST_CONFLICT',
  POST_DELETED: 'POST_DELETED',
} as const;

const COMMENT_ERROR_CODES = {
  COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',
  COMMENT_DELETED: 'COMMENT_DELETED',
  COMMENT_ALREADY_DELETED: 'COMMENT_ALREADY_DELETED',
} as const;

export const ERROR_CODES = {
  ...AUTH_ERROR_CODES,
  ...POST_ERROR_CODES,
  ...COMMENT_ERROR_CODES,
} as const;
```

**CustomError Class**:

```typescript
export class CustomError extends Error {
  readonly #code: ErrorCodeType;
  constructor(code: ErrorCodeType, message?: string) {
    super(message ?? '');
    this.name = 'CustomError';
    this.#code = code;
  }

  get code() {
    return this.#code;
  }
}
```

**Usage Example**:

```typescript
import { CustomError, ERROR_CODES } from '@libs/utils';

async getPost(id: number) {
  const post = await this.prisma.post.findUnique({ where: { id } });

  if (!post) {
    throw new CustomError(
      ERROR_CODES.POST_NOT_FOUND,
      `Post with id ${id} not found`,
    );
  }

  return post;
}
```

## Helper Functions

### String Transformation

```typescript
// Convert snake_case to camelCase
export const snakeToCamel = (snakeStr: string): string;

// Convert camelCase to snake_case
export const camelToSnake = (camelStr: string): string;
```

**Usage Example**:

```typescript
import { snakeToCamel, camelToSnake } from '@libs/utils';

const camelCase = snakeToCamel('user_name'); // 'userName'
const snakeCase = camelToSnake('userName'); // 'user_name'
```

## Usage Examples

### Complete Request Flow with Utils

```typescript
import { AuthorOwnershipGuard, plainToInstance } from '@libs/utils';

@Controller('posts')
export class PostsController {
  @Put(':id')
  @UseGuards(AccessTokenGuard, AuthorOwnershipGuard)
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    const result = await this.postService.update({ id, ...updatePostDto });
    return plainToInstance(PostResponseDto, result);
  }
}
```

## Module Registration

Utils don't typically need module registration, but filters and guards should be registered:

```typescript
// Global registration in main.ts
import { HttpFilter } from '@libs/utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter for CustomError
  app.useGlobalFilters(new HttpFilter());

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
describe('IsStrongPassword decorator', () => {
  it('should validate strong password', () => {
    const validPassword = 'MyStr0ng!Pass';
    // Password meets all requirements
    expect(isValidStrongPassword(validPassword)).toBe(true);
  });

  it('should reject weak password', () => {
    const weakPassword = 'weak';
    // Missing uppercase, special char, and too short
    expect(isValidStrongPassword(weakPassword)).toBe(false);
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
