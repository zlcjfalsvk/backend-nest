import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import { CommentService } from '@libs/business';
import { PrismaService, ConfigService } from '@libs/infrastructure';

import { AccessTokenGuard } from '../../auth/guards';
import { CommentsController } from '../comments.controller';
import {
  CreateCommentDto,
  UpdateCommentDto,
  GetCommentsQueryDto,
  CommentResponseDto,
  CommentsResponseDto,
} from '../dtos';

describe('CommentsController', () => {
  let controller: CommentsController;
  let commentService: DeepMockProxy<CommentService>;
  let jwtService: DeepMockProxy<JwtService>;
  let prismaService: DeepMockProxy<PrismaService>;
  let configService: DeepMockProxy<ConfigService>;

  const mockComment = {
    id: 1,
    content: '테스트 댓글입니다',
    postId: 1,
    authorId: 'user-1',
    author: {
      id: 'user-1',
      nickName: 'testuser',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    // Clear mock call history before creating module
    vi.clearAllMocks();

    commentService = mockDeep<CommentService>();
    jwtService = mockDeep<JwtService>();
    prismaService = mockDeep<PrismaService>();
    configService = mockDeep<ConfigService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentService,
          useValue: commentService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        AccessTokenGuard,
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  it('컨트롤러가 정의되어야 한다', () => {
    expect(controller).toBeDefined();
  });

  describe('getCommentsByPostId', () => {
    it('포스트의 댓글 목록을 CommentsResponseDto로 변환하여 반환해야 한다', async () => {
      const postId = 1;
      const query: GetCommentsQueryDto = {
        take: 20,
        sortOrder: 'asc',
      };

      const mockResponse = {
        comments: [mockComment],
        totalCount: 1,
        nextCursor: null,
      };

      commentService.findsByPostId.mockResolvedValue(mockResponse);

      const result = await controller.getCommentsByPostId(postId, query);

      expect(commentService.findsByPostId).toHaveBeenCalledWith({
        postId,
        ...query,
      });
      expect(result).toBeInstanceOf(CommentsResponseDto);
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0]).toBeInstanceOf(CommentResponseDto);
      expect(result.totalCount).toBe(1);
      expect(result.nextCursor).toBe(null);
    });

    it('빈 댓글 목록도 정상적으로 처리해야 한다', async () => {
      const postId = 1;
      const query: GetCommentsQueryDto = {};

      const mockResponse = {
        comments: [],
        totalCount: 0,
        nextCursor: null,
      };

      commentService.findsByPostId.mockResolvedValue(mockResponse);

      const result = await controller.getCommentsByPostId(postId, query);

      expect(result).toBeInstanceOf(CommentsResponseDto);
      expect(result.comments).toEqual([]);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('getComment', () => {
    it('특정 댓글을 CommentResponseDto로 변환하여 반환해야 한다', async () => {
      const commentId = 1;

      commentService.find.mockResolvedValue(mockComment);

      const result = await controller.getComment(commentId);

      expect(commentService.find).toHaveBeenCalledWith(commentId);
      expect(result).toBeInstanceOf(CommentResponseDto);
      expect(result.id).toBe(mockComment.id);
      expect(result.content).toBe(mockComment.content);
      expect(result.author).toEqual(mockComment.author);
    });
  });

  describe('createComment', () => {
    it('새로운 댓글을 생성하고 CommentResponseDto로 변환하여 반환해야 한다', async () => {
      const createCommentDto: CreateCommentDto = {
        content: '새로운 댓글입니다',
        postId: 1,
        authorId: 'user-1',
      };

      commentService.create.mockResolvedValue(mockComment);

      const result = await controller.createComment(createCommentDto);

      expect(commentService.create).toHaveBeenCalledWith(createCommentDto);
      expect(result).toBeInstanceOf(CommentResponseDto);
      expect(result.content).toBe(mockComment.content);
      expect(result.postId).toBe(mockComment.postId);
    });
  });

  describe('updateComment', () => {
    it('댓글을 수정하고 CommentResponseDto로 변환하여 반환해야 한다', async () => {
      const commentId = 1;
      const updateCommentDto: UpdateCommentDto = {
        content: '수정된 댓글입니다',
      };

      const updatedComment = { ...mockComment, ...updateCommentDto };
      commentService.update.mockResolvedValue(updatedComment);

      const result = await controller.updateComment(
        commentId,
        updateCommentDto,
      );

      expect(commentService.update).toHaveBeenCalledWith({
        id: commentId,
        ...updateCommentDto,
      });
      expect(result).toBeInstanceOf(CommentResponseDto);
      expect(result.content).toBe('수정된 댓글입니다');
    });
  });

  describe('deleteComment', () => {
    it('댓글을 삭제해야 한다', async () => {
      const commentId = 1;
      const deletedComment = { ...mockComment, deletedAt: new Date() };

      commentService.delete.mockResolvedValue(deletedComment);

      await controller.deleteComment(commentId);

      expect(commentService.delete).toHaveBeenCalledWith(commentId);
    });
  });

  describe('DTO 변환 테스트', () => {
    it('CommentResponseDto가 올바른 속성을 가져야 한다', () => {
      const dto = new CommentResponseDto();
      dto.id = 1;
      dto.content = 'Test Comment';
      dto.postId = 1;
      dto.authorId = 'user-1';
      dto.createdAt = new Date();
      dto.updatedAt = new Date();
      dto.deletedAt = null;
      dto.author = { id: 'user-1', nickName: 'test' };

      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('content');
      expect(dto).toHaveProperty('postId');
      expect(dto).toHaveProperty('authorId');
      expect(dto).toHaveProperty('createdAt');
      expect(dto).toHaveProperty('updatedAt');
      expect(dto).toHaveProperty('deletedAt');
      expect(dto).toHaveProperty('author');
    });

    it('CommentsResponseDto가 올바른 구조를 가져야 한다', () => {
      const dto = new CommentsResponseDto();
      dto.comments = [];
      dto.totalCount = 0;
      dto.nextCursor = null;

      expect(dto).toHaveProperty('comments');
      expect(dto).toHaveProperty('totalCount');
      expect(dto).toHaveProperty('nextCursor');
    });
  });
});
