import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { describe, it, expect, beforeEach } from 'vitest';

import type { AppRouter } from '../src/trpc.router';

const TRPC_BASE_URL = 'http://localhost:3001/trpc';

interface AuthUser {
  id: string;
  email: string;
  nickName: string;
  introduction: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SignInResponse {
  id: string;
  accessToken: string;
  refreshToken: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

describe('tRPC Posts E2E Tests', () => {
  let trpc: ReturnType<typeof createTRPCClient<AppRouter>>;
  let authenticatedTrpc: ReturnType<typeof createTRPCClient<AppRouter>>;
  let testUser: AuthUser;
  let accessToken: string;

  beforeEach(() => {
    trpc = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: TRPC_BASE_URL,
        }),
      ],
    });
  });

  beforeEach(async () => {
    // Create a test user and get access token for protected routes
    const userData = {
      email: 'trpc-postuser@example.com',
      nickName: 'trpcpostuser',
      password: 'PostPassword123!',
      introduction: 'User for post testing',
    };

    testUser = await trpc.auth.signUp.mutate(userData);

    const signInResponse = await trpc.auth.signIn.mutate({
      email: userData.email,
      password: userData.password,
    });

    accessToken = signInResponse.accessToken;

    // Create authenticated client
    authenticatedTrpc = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: TRPC_BASE_URL,
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        }),
      ],
    });
  });

  describe('post.getPosts', () => {
    it('should return posts with pagination', async () => {
      const result = await trpc.post.getPosts.query({
        take: 10,
        onlyPublished: true,
      });

      expect(result).toBeDefined();
    });

    it('should return empty result when no posts exist', async () => {
      const result = await trpc.post.getPosts.query({
        take: 10,
        onlyPublished: true,
      });

      // Initially, there might be no posts
      expect(result).toBeDefined();
    });

    it('should handle different page sizes', async () => {
      const result = await trpc.post.getPosts.query({
        take: 5,
        onlyPublished: true,
      });

      expect(result).toBeDefined();
    });
  });

  describe('post.createPost', () => {
    it('should create a new post with valid data', async () => {
      const postData = {
        title: 'Test Post from tRPC',
        content: 'This is a test post created via tRPC',
        slug: 'test-post-from-trpc',
        published: false,
        authorId: testUser.id,
      };

      const post = await authenticatedTrpc.post.createPost.mutate(postData);

      expect(post).toBeDefined();
      expect(post.id).toBeDefined();
      expect(post.title).toBe(postData.title);
      expect(post.content).toBe(postData.content);
      expect(post.slug).toBe(postData.slug);
      expect(post.authorId).toBe(postData.authorId);
      expect(post.createdAt).toBeDefined();
      expect(post.updatedAt).toBeDefined();
    });

    it('should throw error when not authenticated', async () => {
      const postData = {
        title: 'Unauthorized Post',
        content: 'This should fail',
        slug: 'unauthorized-post',
        authorId: testUser.id,
      };

      await expect(trpc.post.createPost.mutate(postData)).rejects.toThrow();
    });

    it('should throw error for invalid data', async () => {
      const invalidPostData = {
        title: '', // Empty title
        content: 'Valid content',
        slug: 'valid-slug',
        authorId: testUser.id,
      };

      await expect(
        authenticatedTrpc.post.createPost.mutate(invalidPostData),
      ).rejects.toThrow();
    });
  });

  describe('post.getPost', () => {
    let createdPost: Post;

    beforeEach(async () => {
      // Create a post for testing
      createdPost = await authenticatedTrpc.post.createPost.mutate({
        title: 'Test Post for Retrieval',
        content: 'This post is created for testing getPost',
        slug: 'test-post-for-retrieval',
        published: true,
        authorId: testUser.id,
      });
    });

    it('should retrieve a post by id', async () => {
      const post = await trpc.post.getPost.query({ id: createdPost.id });

      expect(post).toBeDefined();
      expect(post.id).toBe(createdPost.id);
      expect(post.title).toBe(createdPost.title);
      expect(post.content).toBe(createdPost.content);
      expect(post.authorId).toBe(createdPost.authorId);
    });

    it('should throw error for non-existent post', async () => {
      await expect(trpc.post.getPost.query({ id: 999999 })).rejects.toThrow();
    });
  });

  describe('post.updatePost', () => {
    let createdPost: Post;

    beforeEach(async () => {
      // Create a post for testing
      createdPost = await authenticatedTrpc.post.createPost.mutate({
        title: 'Original Title',
        content: 'Original content',
        slug: 'original-title',
        published: true,
        authorId: testUser.id,
      });
    });

    it('should update a post with valid data', async () => {
      const updateData = {
        id: createdPost.id,
        title: 'Updated Title',
        content: 'Updated content',
      };

      const updatedPost =
        await authenticatedTrpc.post.updatePost.mutate(updateData);

      expect(updatedPost).toBeDefined();
      expect(updatedPost.id).toBe(createdPost.id);
      expect(updatedPost.title).toBe(updateData.title);
      expect(updatedPost.content).toBe(updateData.content);
      expect(updatedPost.authorId).toBe(createdPost.authorId);
      expect(new Date(updatedPost.updatedAt).getTime()).toBeGreaterThan(
        new Date(createdPost.updatedAt).getTime(),
      );
    });

    it('should throw error when not authenticated', async () => {
      const updateData = {
        id: createdPost.id,
        title: 'Unauthorized Update',
        content: 'This should fail',
      };

      await expect(trpc.post.updatePost.mutate(updateData)).rejects.toThrow();
    });

    it('should throw error for non-existent post', async () => {
      const updateData = {
        id: 999999,
        title: 'Updated Title',
        content: 'Updated content',
      };

      await expect(
        authenticatedTrpc.post.updatePost.mutate(updateData),
      ).rejects.toThrow();
    });
  });

  describe('post.deletePost', () => {
    let createdPost: Post;

    beforeEach(async () => {
      // Create a post for testing
      createdPost = await authenticatedTrpc.post.createPost.mutate({
        title: 'Post to Delete',
        content: 'This post will be deleted',
        slug: 'post-to-delete',
        published: true,
        authorId: testUser.id,
      });
    });

    it('should delete a post', async () => {
      await authenticatedTrpc.post.deletePost.mutate({ id: createdPost.id });

      // Verify the post is deleted
      await expect(
        trpc.post.getPost.query({ id: createdPost.id }),
      ).rejects.toThrow();
    });

    it('should throw error when not authenticated', async () => {
      await expect(
        trpc.post.deletePost.mutate({ id: createdPost.id }),
      ).rejects.toThrow();
    });

    it('should throw error for non-existent post', async () => {
      await expect(
        authenticatedTrpc.post.deletePost.mutate({ id: 999999 }),
      ).rejects.toThrow();
    });
  });

  describe('Posts Integration', () => {
    it('should create, read, update, and delete a post', async () => {
      // Create
      const postData = {
        title: 'CRUD Test Post',
        content: 'Testing full CRUD operations',
        slug: 'crud-test-post',
        published: true,
        authorId: testUser.id,
      };

      const createdPost =
        await authenticatedTrpc.post.createPost.mutate(postData);
      expect(createdPost.title).toBe(postData.title);

      // Read
      const retrievedPost = await trpc.post.getPost.query({
        id: createdPost.id,
      });
      expect(retrievedPost.id).toBe(createdPost.id);

      // Update
      const updateData = {
        id: createdPost.id,
        title: 'Updated CRUD Test Post',
        content: 'Updated content for CRUD test',
      };

      const updatedPost =
        await authenticatedTrpc.post.updatePost.mutate(updateData);
      expect(updatedPost.title).toBe(updateData.title);
      expect(updatedPost.content).toBe(updateData.content);

      // Delete
      await authenticatedTrpc.post.deletePost.mutate({ id: createdPost.id });

      // Verify deletion
      await expect(
        trpc.post.getPost.query({ id: createdPost.id }),
      ).rejects.toThrow();
    });
  });
});
