import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import { TrpcService } from '@libs/adapter';
import { AuthService, PostService, CommentService } from '@libs/business';

import { TrpcRouter } from '../trpc.router';

describe('TrpcRouter', () => {
  let router: TrpcRouter;
  let trpcService: DeepMockProxy<TrpcService>;
  let authService: DeepMockProxy<AuthService>;
  let postService: DeepMockProxy<PostService>;
  let commentService: DeepMockProxy<CommentService>;

  beforeEach(async () => {
    vi.resetAllMocks();

    trpcService = mockDeep<TrpcService>();
    authService = mockDeep<AuthService>();
    postService = mockDeep<PostService>();
    commentService = mockDeep<CommentService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrpcRouter,
        {
          provide: TrpcService,
          useValue: trpcService,
        },
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: PostService,
          useValue: postService,
        },
        {
          provide: CommentService,
          useValue: commentService,
        },
      ],
    }).compile();

    router = module.get<TrpcRouter>(TrpcRouter);
  });

  describe('생성자', () => {
    it('정상적으로 정의되어야 한다', () => {
      expect(router).toBeDefined();
    });

    it('tRPC 서비스가 주입되어야 한다', () => {
      expect(router['trpc']).toBeDefined();
    });

    it('인증 서비스가 주입되어야 한다', () => {
      expect(router['authService']).toBeDefined();
    });

    it('게시글 서비스가 주입되어야 한다', () => {
      expect(router['postService']).toBeDefined();
    });

    it('댓글 서비스가 주입되어야 한다', () => {
      expect(router['commentService']).toBeDefined();
    });
  });

  describe('서비스 의존성', () => {
    it('인증 기능을 위해 AuthService를 사용해야 한다', () => {
      expect(router['authService']).toBe(authService);
    });

    it('게시글 기능을 위해 PostService를 사용해야 한다', () => {
      expect(router['postService']).toBe(postService);
    });

    it('댓글 기능을 위해 CommentService를 사용해야 한다', () => {
      expect(router['commentService']).toBe(commentService);
    });

    it('tRPC 기능을 위해 TrpcService를 사용해야 한다', () => {
      expect(router['trpc']).toBe(trpcService);
    });
  });

  describe('TrpcRouter 클래스 구조', () => {
    it('authRouter getter 메서드가 있어야 한다', () => {
      expect(
        typeof Object.getOwnPropertyDescriptor(
          TrpcRouter.prototype,
          'authRouter',
        )?.get,
      ).toBe('function');
    });

    it('postRouter getter 메서드가 있어야 한다', () => {
      expect(
        typeof Object.getOwnPropertyDescriptor(
          TrpcRouter.prototype,
          'postRouter',
        )?.get,
      ).toBe('function');
    });

    it('commentRouter getter 메서드가 있어야 한다', () => {
      expect(
        typeof Object.getOwnPropertyDescriptor(
          TrpcRouter.prototype,
          'commentRouter',
        )?.get,
      ).toBe('function');
    });

    it('appRouter getter 메서드가 있어야 한다', () => {
      expect(
        typeof Object.getOwnPropertyDescriptor(
          TrpcRouter.prototype,
          'appRouter',
        )?.get,
      ).toBe('function');
    });
  });
});
