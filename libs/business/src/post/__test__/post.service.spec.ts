import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import { Post } from '@prisma-client';

import { PostService } from '@libs/business';
import { PrismaService } from '@libs/infrastructure';
import { CustomError, ERROR_CODES } from '@libs/utils';

import { FindsParams, PostWithAuthor } from '../types';

describe('PostService', () => {
  let service: PostService;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaService = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  // finds 메소드 테스트
  describe('finds', () => {
    it('기본 매개변수로 게시물 목록을 조회해야 한다', async () => {
      // Arrange
      const mockPosts = [
        { id: 1, title: '게시물 1', views: 10 },
        { id: 2, title: '게시물 2', views: 20 },
      ] as Post[];

      prismaService.post.count.mockResolvedValue(2);
      prismaService.post.findMany.mockResolvedValue(mockPosts);

      // Act
      const result = await service.finds();

      // Assert
      expect(prismaService.post.count).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          published: true,
        },
      });
      expect(prismaService.post.findMany).toHaveBeenCalled();
      expect(result.posts).toEqual(mockPosts);
      expect(result.totalCount).toBe(2);
      expect(result.totalPages).toBe(1);
      expect(result.nextCursor).toBe(2);
    });

    it('커스텀 매개변수로 게시물 목록을 조회해야 한다', async () => {
      // Arrange
      const params: FindsParams = {
        take: 5,
        cursor: 10,
        includeDeleted: true,
        onlyPublished: false,
        sortBy: 'views',
        sortOrder: 'asc',
      };

      const mockPosts = [
        { id: 11, title: '게시물 11', views: 30 },
        { id: 12, title: '게시물 12', views: 40 },
      ] as Post[];

      prismaService.post.count.mockResolvedValue(20);
      prismaService.post.findMany.mockResolvedValue(mockPosts);

      // Act
      const result = await service.finds(params);

      // Assert
      expect(prismaService.post.count).toHaveBeenCalledWith({
        where: {
          deletedAt: undefined,
          published: undefined,
        },
      });
      expect(prismaService.post.findMany).toHaveBeenCalled();
      expect(result.posts).toEqual(mockPosts);
      expect(result.totalCount).toBe(20);
      expect(result.totalPages).toBe(4);
      expect(result.nextCursor).toBe(12);
    });

    it('결과가 없을 경우 nextCursor는 null이어야 한다', async () => {
      // Arrange
      prismaService.post.count.mockResolvedValue(0);
      prismaService.post.findMany.mockResolvedValue([]);

      // Act
      const result = await service.finds();

      // Assert
      expect(result.posts).toEqual([]);
      expect(result.totalCount).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.nextCursor).toBeNull();
    });
  });

  // find 메소드 테스트
  describe('find', () => {
    it('존재하는 게시물을 조회하고 조회수를 증가시켜야 한다', async () => {
      // Arrange
      const postId = 1;
      const mockPost = {
        id: postId,
        title: '게시물 제목',
        content: '게시물 내용',
        views: 10,
        deletedAt: null,
        author: {
          id: 'author-1',
          nickName: '작성자',
        },
      } as PostWithAuthor;

      prismaService.post.findUnique.mockResolvedValue(mockPost);
      prismaService.post.update.mockResolvedValue({ ...mockPost, views: 11 });

      // Act
      const result = await service.find(postId);

      // Assert
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
        include: {
          author: {
            select: {
              id: true,
              nickName: true,
            },
          },
        },
      });
      expect(prismaService.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: { views: { increment: 1 } },
      });
      expect(result).toEqual({
        ...mockPost,
        views: 11,
      });
    });

    it('존재하지 않는 게시물을 조회하면 POST_NOT_FOUND 오류를 발생시켜야 한다', async () => {
      // Arrange
      const postId = 999;
      prismaService.post.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.find(postId)).rejects.toThrow(CustomError);
      await expect(service.find(postId)).rejects.toMatchObject({
        code: ERROR_CODES.POST_NOT_FOUND,
        message: `Post with id ${postId} not found`,
      });
    });

    it('삭제된 게시물을 조회하면 POST_DELETED 오류를 발생시켜야 한다', async () => {
      // Arrange
      const postId = 1;
      const mockPost = {
        id: postId,
        title: '게시물 제목',
        content: '게시물 내용',
        views: 10,
        deletedAt: new Date(),
      } as Post;

      prismaService.post.findUnique.mockResolvedValue(mockPost);

      // Act & Assert
      await expect(service.find(postId)).rejects.toThrow(CustomError);
      await expect(service.find(postId)).rejects.toMatchObject({
        code: ERROR_CODES.POST_DELETED,
        message: `Post with id ${postId} has been deleted`,
      });
    });
  });

  // create 메소드 테스트
  describe('create', () => {
    it('유효한 데이터로 게시물을 생성해야 한다', async () => {
      // Arrange
      const createData = {
        title: '새 게시물',
        content: '게시물 내용',
        slug: 'new-post',
        authorId: 'author-1',
      };

      const mockCreatedPost = {
        id: 1,
        ...createData,
        views: 0,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        author: {
          id: 'author-1',
          nickName: '작성자',
        },
      };

      prismaService.post.findUnique.mockResolvedValue(null);
      prismaService.post.create.mockResolvedValue(mockCreatedPost);

      // Act
      const result = await service.create(createData);

      // Assert
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { slug: createData.slug },
      });
      expect(prismaService.post.create).toHaveBeenCalledWith({
        data: createData,
        include: {
          author: {
            select: {
              id: true,
              nickName: true,
            },
          },
        },
      });
      expect(result).toEqual(mockCreatedPost);
    });

    it('이미 존재하는 slug로 게시물을 생성하면 POST_CONFLICT 오류를 발생시켜야 한다', async () => {
      // Arrange
      const createData = {
        title: '새 게시물',
        content: '게시물 내용',
        slug: 'existing-slug',
        authorId: 'author-1',
      };

      const existingPost = {
        id: 1,
        slug: 'existing-slug',
      } as Post;

      prismaService.post.findUnique.mockResolvedValue(existingPost);

      // Act & Assert
      await expect(service.create(createData)).rejects.toThrow(CustomError);
      await expect(service.create(createData)).rejects.toMatchObject({
        code: ERROR_CODES.POST_CONFLICT,
        message: `Post with slug '${createData.slug}' already exists`,
      });
    });
  });

  // update 메소드 테스트
  describe('update', () => {
    it('존재하는 게시물을 업데이트해야 한다', async () => {
      // Arrange
      const updateData = {
        id: 1,
        title: '수정된 제목',
        content: '수정된 내용',
      };

      const existingPost = {
        id: 1,
        title: '원래 제목',
        content: '원래 내용',
        slug: 'original-slug',
        deletedAt: null,
      } as Post;

      const updatedPost = {
        ...existingPost,
        ...updateData,
        author: {
          id: 'author-1',
          nickName: '작성자',
        },
      };

      prismaService.post.findUnique.mockResolvedValue(existingPost);
      prismaService.post.update.mockResolvedValue(updatedPost);

      // Act
      const result = await service.update(updateData);

      // Assert
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: updateData.id },
      });
      expect(prismaService.post.update).toHaveBeenCalledWith({
        where: { id: updateData.id },
        data: {
          title: updateData.title,
          content: updateData.content,
        },
        include: {
          author: {
            select: {
              id: true,
              nickName: true,
            },
          },
        },
      });
      expect(result).toEqual(updatedPost);
    });

    it('존재하지 않는 게시물을 업데이트하면 POST_NOT_FOUND 오류를 발생시켜야 한다', async () => {
      // Arrange
      const updateData = {
        id: 999,
        title: '수정된 제목',
      };

      prismaService.post.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(updateData)).rejects.toThrow(CustomError);
      await expect(service.update(updateData)).rejects.toMatchObject({
        code: ERROR_CODES.POST_NOT_FOUND,
        message: `Post with id ${updateData.id} not found`,
      });
    });

    it('삭제된 게시물을 업데이트하면 POST_DELETED 오류를 발생시켜야 한다', async () => {
      // Arrange
      const updateData = {
        id: 1,
        title: '수정된 제목',
      };

      const deletedPost = {
        id: 1,
        deletedAt: new Date(),
      } as Post;

      prismaService.post.findUnique.mockResolvedValue(deletedPost);

      // Act & Assert
      await expect(service.update(updateData)).rejects.toThrow(CustomError);
      await expect(service.update(updateData)).rejects.toMatchObject({
        code: ERROR_CODES.POST_DELETED,
        message: `Post with id ${updateData.id} has been deleted`,
      });
    });

    it('이미 존재하는 slug로 업데이트하면 POST_CONFLICT 오류를 발생시켜야 한다', async () => {
      // Arrange
      const updateData = {
        id: 1,
        slug: 'existing-slug',
      };

      const existingPost = {
        id: 1,
        slug: 'original-slug',
        deletedAt: null,
      } as Post;

      const conflictingPost = {
        id: 2,
        slug: 'existing-slug',
      } as Post;

      prismaService.post.findUnique.mockResolvedValue(existingPost);
      prismaService.post.findFirst.mockResolvedValue(conflictingPost);

      // Act & Assert
      await expect(service.update(updateData)).rejects.toThrow(CustomError);
      await expect(service.update(updateData)).rejects.toMatchObject({
        code: ERROR_CODES.POST_CONFLICT,
        message: `Post with slug '${updateData.slug}' already exists`,
      });
    });

    it('slug가 변경되지 않으면 slug 중복 검사를 수행하지 않아야 한다', async () => {
      // Arrange
      const updateData = {
        id: 1,
        title: '수정된 제목',
        slug: 'original-slug', // 기존과 동일한 slug
      };

      const existingPost = {
        id: 1,
        title: '원래 제목',
        slug: 'original-slug',
        deletedAt: null,
      } as Post;

      const updatedPost = {
        ...existingPost,
        title: updateData.title,
        author: {
          id: 'author-1',
          nickName: '작성자',
        },
      };

      prismaService.post.findUnique.mockResolvedValue(existingPost);
      prismaService.post.update.mockResolvedValue(updatedPost);

      // Act
      await service.update(updateData);

      // Assert
      expect(prismaService.post.findFirst).not.toHaveBeenCalled();
    });
  });

  // delete 메소드 테스트
  describe('delete', () => {
    it('존재하는 게시물을 삭제해야 한다', async () => {
      // Arrange
      const postId = 1;
      const existingPost = {
        id: postId,
        title: '게시물 제목',
        deletedAt: null,
      } as Post;

      const deletedPost = {
        ...existingPost,
        deletedAt: new Date(),
      };

      prismaService.post.findUnique.mockResolvedValue(existingPost);
      prismaService.post.update.mockResolvedValue(deletedPost);

      // Act
      const result = await service.delete(postId);

      // Assert
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
      // Verify that update was called with the correct id
      expect(prismaService.post.update).toHaveBeenCalled();
      const updateCall = prismaService.post.update.mock.calls[0][0];
      expect(updateCall.where).toEqual({ id: postId });
      expect(updateCall.data).toHaveProperty('deletedAt');
      expect(result).toEqual(deletedPost);
    });

    it('존재하지 않는 게시물을 삭제하면 POST_NOT_FOUND 오류를 발생시켜야 한다', async () => {
      // Arrange
      const postId = 999;
      prismaService.post.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete(postId)).rejects.toThrow(CustomError);
      await expect(service.delete(postId)).rejects.toMatchObject({
        code: ERROR_CODES.POST_NOT_FOUND,
        message: `Post with id ${postId} not found`,
      });
    });

    it('이미 삭제된 게시물을 삭제하면 POST_DELETED 오류를 발생시켜야 한다', async () => {
      // Arrange
      const postId = 1;
      const deletedPost = {
        id: postId,
        deletedAt: new Date(),
      } as Post;

      prismaService.post.findUnique.mockResolvedValue(deletedPost);

      // Act & Assert
      await expect(service.delete(postId)).rejects.toThrow(CustomError);
      await expect(service.delete(postId)).rejects.toMatchObject({
        code: ERROR_CODES.POST_DELETED,
        message: `Post with id ${postId} has been deleted`,
      });
    });
  });
});
