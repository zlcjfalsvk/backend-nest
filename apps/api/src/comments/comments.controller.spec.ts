import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CommentService } from '@libs/business';

import { CommentsController } from './comments.controller';
import {
  CreateCommentDto,
  UpdateCommentDto,
  GetCommentsQueryDto,
} from './dtos';

// Create a mock CommentService
const mockCommentService = {
  findsByPostId: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('CommentsController', () => {
  let controller: CommentsController;
  let commentService: CommentService;

  const mockComment = {
    id: 1,
    content: '테스트 댓글입니다',
    postId: 1,
    authorId: 'user-1',
    author: {
      id: 'user-1',
      nickName: 'testuser',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    // Clear mock call history before creating module
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    commentService = module.get<CommentService>(CommentService);
  });

  it('컨트롤러가 정의되어야 한다', () => {
    expect(controller).toBeDefined();
  });

  describe('getCommentsByPostId', () => {
    it('포스트의 댓글 목록을 반환해야 한다', async () => {
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

      mockCommentService.findsByPostId.mockResolvedValue(mockResponse);

      const result = await controller.getCommentsByPostId(postId, query);

      expect(commentService.findsByPostId).toHaveBeenCalledWith({
        postId,
        ...query,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getComment', () => {
    it('특정 댓글을 반환해야 한다', async () => {
      const commentId = 1;

      mockCommentService.find.mockResolvedValue(mockComment);

      const result = await controller.getComment(commentId);

      expect(commentService.find).toHaveBeenCalledWith(commentId);
      expect(result).toEqual(mockComment);
    });
  });

  describe('createComment', () => {
    it('새로운 댓글을 생성해야 한다', async () => {
      const createCommentDto: CreateCommentDto = {
        content: '새로운 댓글입니다',
        postId: 1,
        authorId: 'user-1',
      };

      mockCommentService.create.mockResolvedValue(mockComment);

      const result = await controller.createComment(createCommentDto);

      expect(commentService.create).toHaveBeenCalledWith(createCommentDto);
      expect(result).toEqual(mockComment);
    });
  });

  describe('updateComment', () => {
    it('댓글을 수정해야 한다', async () => {
      const commentId = 1;
      const updateCommentDto: UpdateCommentDto = {
        content: '수정된 댓글입니다',
      };

      const updatedComment = { ...mockComment, ...updateCommentDto };
      mockCommentService.update.mockResolvedValue(updatedComment);

      const result = await controller.updateComment(
        commentId,
        updateCommentDto,
      );

      expect(commentService.update).toHaveBeenCalledWith({
        id: commentId,
        ...updateCommentDto,
      });
      expect(result).toEqual(updatedComment);
    });
  });

  describe('deleteComment', () => {
    it('댓글을 삭제해야 한다', async () => {
      const commentId = 1;
      const deletedComment = { ...mockComment, deletedAt: new Date() };

      mockCommentService.delete.mockResolvedValue(deletedComment);

      await controller.deleteComment(commentId);

      expect(commentService.delete).toHaveBeenCalledWith(commentId);
    });
  });
});
