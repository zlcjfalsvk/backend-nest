import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import { PostService } from '@libs/business';
import { PrismaService, ConfigService } from '@libs/infrastructure';

import { AccessTokenGuard } from '../../auth/guards';
import {
  CreatePostDto,
  UpdatePostDto,
  GetPostsQueryDto,
  PostResponseDto,
  PostsResponseDto,
} from '../dtos';
import { PostsController } from '../posts.controller';

describe('PostsController', () => {
  let controller: PostsController;
  let postService: DeepMockProxy<PostService>;
  let jwtService: DeepMockProxy<JwtService>;
  let prismaService: DeepMockProxy<PrismaService>;
  let configService: DeepMockProxy<ConfigService>;

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
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    // Clear mock call history before creating module
    vi.clearAllMocks();

    postService = mockDeep<PostService>();
    jwtService = mockDeep<JwtService>();
    prismaService = mockDeep<PrismaService>();
    configService = mockDeep<ConfigService>();

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

    controller = module.get<PostsController>(PostsController);
  });

  it('컨트롤러가 정의되어야 한다', () => {
    expect(controller).toBeDefined();
  });

  describe('getPosts', () => {
    it('게시글 목록을 PostsResponseDto로 변환하여 반환해야 한다', async () => {
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
      expect(result).toBeInstanceOf(PostsResponseDto);
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0]).toBeInstanceOf(PostResponseDto);
      expect(result.totalCount).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.nextCursor).toBe(null);
    });

    it('빈 배열도 정상적으로 처리해야 한다', async () => {
      const query: GetPostsQueryDto = {};

      const mockResponse = {
        posts: [],
        totalCount: 0,
        totalPages: 0,
        nextCursor: null,
      };

      postService.finds.mockResolvedValue(mockResponse);

      const result = await controller.getPosts(query);

      expect(result).toBeInstanceOf(PostsResponseDto);
      expect(result.posts).toEqual([]);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('getPost', () => {
    it('단일 게시글을 PostResponseDto로 변환하여 반환해야 한다', async () => {
      const postId = 1;
      const mockResponse = { ...mockPost, views: 1 };

      postService.find.mockResolvedValue(mockResponse);

      const result = await controller.getPost(postId);

      expect(postService.find).toHaveBeenCalledWith(postId);
      expect(result).toBeInstanceOf(PostResponseDto);
      expect(result.id).toBe(mockResponse.id);
      expect(result.title).toBe(mockResponse.title);
      expect(result.author).toEqual(mockResponse.author);
    });
  });

  describe('createPost', () => {
    it('새로운 게시글을 생성하고 PostResponseDto로 변환하여 반환해야 한다', async () => {
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
      expect(result).toBeInstanceOf(PostResponseDto);
      expect(result.title).toBe(mockPost.title);
      expect(result.slug).toBe(mockPost.slug);
    });
  });

  describe('updatePost', () => {
    it('게시글을 수정하고 PostResponseDto로 변환하여 반환해야 한다', async () => {
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
      expect(result).toBeInstanceOf(PostResponseDto);
      expect(result.title).toBe('Updated Post');
      expect(result.content).toBe('Updated Content');
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

  describe('DTO 변환 테스트', () => {
    it('PostResponseDto가 올바른 속성을 가져야 한다', () => {
      const dto = new PostResponseDto();
      dto.id = 1;
      dto.title = 'Test';
      dto.content = 'Content';
      dto.slug = 'test';
      dto.published = true;
      dto.views = 10;
      dto.authorId = 'user-1';
      dto.createdAt = new Date();
      dto.updatedAt = new Date();
      dto.deletedAt = null;
      dto.author = { id: 'user-1', nickName: 'test' };

      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('title');
      expect(dto).toHaveProperty('content');
      expect(dto).toHaveProperty('slug');
      expect(dto).toHaveProperty('published');
      expect(dto).toHaveProperty('views');
      expect(dto).toHaveProperty('authorId');
      expect(dto).toHaveProperty('createdAt');
      expect(dto).toHaveProperty('updatedAt');
      expect(dto).toHaveProperty('deletedAt');
      expect(dto).toHaveProperty('author');
    });

    it('PostsResponseDto가 올바른 구조를 가져야 한다', () => {
      const dto = new PostsResponseDto();
      dto.posts = [];
      dto.totalCount = 0;
      dto.totalPages = 0;
      dto.nextCursor = null;

      expect(dto).toHaveProperty('posts');
      expect(dto).toHaveProperty('totalCount');
      expect(dto).toHaveProperty('totalPages');
      expect(dto).toHaveProperty('nextCursor');
    });
  });
});
