import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import { PrismaService } from '@libs/infrastructure';
import { Token, TokenType } from '@libs/business';

import { AuthorOwnershipGuard } from '../author-ownership.guard';

describe('AuthorOwnershipGuard', () => {
  let guard: AuthorOwnershipGuard;
  let prismaService: DeepMockProxy<PrismaService>;
  let executionContext: jest.Mocked<ExecutionContext>;

  const mockUser: Token = {
    sub: 'user-id-123',
    type: TokenType.ACCESS_TOKEN,
  };

  const createMockExecutionContext = (
    controllerName: string,
    params: Record<string, string> = { id: '1' },
    user: Token | null = mockUser,
  ): jest.Mocked<ExecutionContext> => {
    const mockRequest = {
      params,
      user,
    };

    const mockHttpArgumentsHost = {
      getRequest: vi.fn().mockReturnValue(mockRequest),
    };

    const mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue(mockHttpArgumentsHost),
      getClass: vi.fn().mockReturnValue({ name: controllerName }),
    } as unknown as jest.Mocked<ExecutionContext>;

    return mockExecutionContext;
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    prismaService = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorOwnershipGuard,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    guard = module.get<AuthorOwnershipGuard>(AuthorOwnershipGuard);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('posts 컨트롤러에서', () => {
    it('사용자가 자신의 게시글에 접근할 때 통과해야 한다', async () => {
      executionContext = createMockExecutionContext('PostsController');
      prismaService.post.findUnique.mockResolvedValue({
        id: 1,
        authorId: 'user-id-123',
        deletedAt: null,
      } as any);

      const result = await guard.canActivate(executionContext);

      expect(result).toBe(true);
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { authorId: true, deletedAt: true },
      });
    });

    it('사용자가 다른 사람의 게시글에 접근할 때 403 에러를 발생시켜야 한다', async () => {
      executionContext = createMockExecutionContext('PostsController');
      prismaService.post.findUnique.mockResolvedValue({
        id: 1,
        authorId: 'other-user-id',
        deletedAt: null,
      } as any);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new ForbiddenException('You can only access your own posts'),
      );
    });

    it('존재하지 않는 게시글에 접근할 때 404 에러를 발생시켜야 한다', async () => {
      executionContext = createMockExecutionContext('PostsController');
      prismaService.post.findUnique.mockResolvedValue(null);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new NotFoundException('Post with ID 1 not found'),
      );
    });

    it('삭제된 게시글에 접근할 때 404 에러를 발생시켜야 한다', async () => {
      executionContext = createMockExecutionContext('PostsController');
      prismaService.post.findUnique.mockResolvedValue({
        id: 1,
        authorId: 'user-id-123',
        deletedAt: new Date(),
      } as any);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new NotFoundException('Post has been deleted'),
      );
    });
  });

  describe('comments 컨트롤러에서', () => {
    it('사용자가 자신의 댓글에 접근할 때 통과해야 한다', async () => {
      executionContext = createMockExecutionContext('CommentsController');
      prismaService.comment.findUnique.mockResolvedValue({
        id: 1,
        authorId: 'user-id-123',
        deletedAt: null,
      } as any);

      const result = await guard.canActivate(executionContext);

      expect(result).toBe(true);
      expect(prismaService.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { authorId: true, deletedAt: true },
      });
    });

    it('사용자가 다른 사람의 댓글에 접근할 때 403 에러를 발생시켜야 한다', async () => {
      executionContext = createMockExecutionContext('CommentsController');
      prismaService.comment.findUnique.mockResolvedValue({
        id: 1,
        authorId: 'other-user-id',
        deletedAt: null,
      } as any);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new ForbiddenException('You can only access your own comments'),
      );
    });

    it('존재하지 않는 댓글에 접근할 때 404 에러를 발생시켜야 한다', async () => {
      executionContext = createMockExecutionContext('CommentsController');
      prismaService.comment.findUnique.mockResolvedValue(null);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new NotFoundException('Comment with ID 1 not found'),
      );
    });

    it('삭제된 댓글에 접근할 때 404 에러를 발생시켜야 한다', async () => {
      executionContext = createMockExecutionContext('CommentsController');
      prismaService.comment.findUnique.mockResolvedValue({
        id: 1,
        authorId: 'user-id-123',
        deletedAt: new Date(),
      } as any);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new NotFoundException('Comment has been deleted'),
      );
    });
  });

  describe('에러 케이스', () => {
    it('사용자 정보가 없을 때 403 에러를 발생시켜야 한다', async () => {
      executionContext = createMockExecutionContext('PostsController', { id: '1' }, null);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new ForbiddenException('User information is required'),
      );
    });

    it('사용자 ID가 없을 때 403 에러를 발생시켜야 한다', async () => {
      const userWithoutSub = { ...mockUser, sub: '' };
      executionContext = createMockExecutionContext('PostsController', { id: '1' }, userWithoutSub);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new ForbiddenException('User information is required'),
      );
    });

    it('유효하지 않은 리소스 ID일 때 403 에러를 발생시켜야 한다', async () => {
      executionContext = createMockExecutionContext('PostsController', { id: 'invalid' });

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new ForbiddenException('Valid resource ID is required'),
      );
    });

    it('지원하지 않는 컨트롤러일 때 403 에러를 발생시켜야 한다', async () => {
      executionContext = createMockExecutionContext('UnsupportedController');

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new ForbiddenException('Unsupported resource type'),
      );
    });

    it('리소스 ID가 없을 때 403 에러를 발생시켜야 한다', async () => {
      executionContext = createMockExecutionContext('PostsController', {});

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new ForbiddenException('Valid resource ID is required'),
      );
    });
  });

  describe('컨트롤러 이름 인식', () => {
    it('PostsController를 post 리소스로 인식해야 한다', async () => {
      executionContext = createMockExecutionContext('PostsController');
      prismaService.post.findUnique.mockResolvedValue({
        id: 1,
        authorId: 'user-id-123',
        deletedAt: null,
      } as any);

      await guard.canActivate(executionContext);

      expect(prismaService.post.findUnique).toHaveBeenCalled();
      expect(prismaService.comment.findUnique).not.toHaveBeenCalled();
    });

    it('CommentsController를 comment 리소스로 인식해야 한다', async () => {
      executionContext = createMockExecutionContext('CommentsController');
      prismaService.comment.findUnique.mockResolvedValue({
        id: 1,
        authorId: 'user-id-123',
        deletedAt: null,
      } as any);

      await guard.canActivate(executionContext);

      expect(prismaService.comment.findUnique).toHaveBeenCalled();
      expect(prismaService.post.findUnique).not.toHaveBeenCalled();
    });

    it('대소문자를 구분하지 않고 컨트롤러를 인식해야 한다', async () => {
      executionContext = createMockExecutionContext('postcontroller');
      prismaService.post.findUnique.mockResolvedValue({
        id: 1,
        authorId: 'user-id-123',
        deletedAt: null,
      } as any);

      await guard.canActivate(executionContext);

      expect(prismaService.post.findUnique).toHaveBeenCalled();
    });
  });
});