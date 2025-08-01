import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import { PostService } from '@libs/business';

import { AccessTokenGuard } from '../../auth/guards';
import { CreatePostDto, UpdatePostDto, GetPostsQueryDto } from '../dtos';
import { PostsController } from '../posts.controller';

describe('PostsController', () => {
  let controller: PostsController;
  let postService: DeepMockProxy<PostService>;
  let jwtService: DeepMockProxy<JwtService>;

  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'Test Content',
    slug: 'test-post',
    published: true,
    views: 0,
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

    postService = mockDeep<PostService>();
    jwtService = mockDeep<JwtService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostService,
          useValue: postService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        AccessTokenGuard,
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('컨트롤러가 정의되어야 한다', () => {
    expect(controller).toBeDefined();
  });

  describe('getPosts', () => {
    it('게시글 목록을 반환해야 한다', async () => {
      const query: GetPostsQueryDto = {
        take: 10,
        onlyPublished: true,
      };

      const mockResponse = {
        posts: [mockPost],
        totalCount: 1,
        totalPages: 1,
        nextCursor: null,
      };

      postService.finds.mockResolvedValue(mockResponse);

      const result = await controller.getPosts(query);

      expect(postService.finds).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPost', () => {
    it('단일 게시글을 반환해야 한다', async () => {
      const postId = 1;
      const mockResponse = { ...mockPost, views: 1 };

      postService.find.mockResolvedValue(mockResponse);

      const result = await controller.getPost(postId);

      expect(postService.find).toHaveBeenCalledWith(postId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createPost', () => {
    it('새로운 게시글을 생성해야 한다', async () => {
      const createPostDto: CreatePostDto = {
        title: 'New Post',
        content: 'New Content',
        slug: 'new-post',
        published: true,
        authorId: 'user-1',
      };

      postService.create.mockResolvedValue(mockPost);

      const result = await controller.createPost(createPostDto);

      expect(postService.create).toHaveBeenCalledWith(createPostDto);
      expect(result).toEqual(mockPost);
    });
  });

  describe('updatePost', () => {
    it('게시글을 수정해야 한다', async () => {
      const postId = 1;
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Post',
        content: 'Updated Content',
      };

      const updatedPost = { ...mockPost, ...updatePostDto };
      postService.update.mockResolvedValue(updatedPost);

      const result = await controller.updatePost(postId, updatePostDto);

      expect(postService.update).toHaveBeenCalledWith({
        id: postId,
        ...updatePostDto,
      });
      expect(result).toEqual(updatedPost);
    });
  });

  describe('deletePost', () => {
    it('게시글을 삭제해야 한다', async () => {
      const postId = 1;
      const deletedPost = { ...mockPost, deletedAt: new Date() };

      postService.delete.mockResolvedValue(deletedPost);

      await controller.deletePost(postId);

      expect(postService.delete).toHaveBeenCalledWith(postId);
    });
  });
});
