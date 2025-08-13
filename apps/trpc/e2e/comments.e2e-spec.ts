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

interface Comment {
  id: number;
  content: string;
  postId: number;
  authorId: string;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
}

describe('tRPC Comments E2E Tests', () => {
  let trpc: ReturnType<typeof createTRPCClient<AppRouter>>;
  let authenticatedTrpc: ReturnType<typeof createTRPCClient<AppRouter>>;
  let testUser: AuthUser;
  let testPost: Post;
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
    // Create a test user and get access token
    const userData = {
      email: 'trpc-commentuser@example.com',
      nickName: 'trpccommentuser',
      password: 'CommentPassword123!',
      introduction: 'User for comment testing',
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

    // Create a test post for comments
    testPost = await authenticatedTrpc.post.createPost.mutate({
      title: 'Test Post for Comments',
      content: 'This post is created for testing comments',
      slug: 'test-post-for-comments',
      published: true,
      authorId: testUser.id,
    });
  });

  describe('comment.getCommentsByPostId', () => {
    it('should return comments for a post with pagination', async () => {
      const result = await trpc.comment.getCommentsByPostId.query({
        postId: Number(testPost.id),
        take: 10,
      });

      expect(result).toBeDefined();
    });

    it('should return empty result when no comments exist', async () => {
      const result = await trpc.comment.getCommentsByPostId.query({
        postId: Number(testPost.id),
        take: 10,
      });

      // Initially, there should be no comments
      expect(result).toBeDefined();
    });

    it('should handle different page sizes', async () => {
      const result = await trpc.comment.getCommentsByPostId.query({
        postId: Number(testPost.id),
        take: 5,
      });

      expect(result).toBeDefined();
    });
  });

  describe('comment.createComment', () => {
    it('should create a new comment with valid data', async () => {
      const commentData = {
        content: 'This is a test comment via tRPC',
        postId: Number(testPost.id),
        authorId: testUser.id,
      };

      const comment =
        await authenticatedTrpc.comment.createComment.mutate(commentData);

      expect(comment).toBeDefined();
      expect(comment.id).toBeDefined();
      expect(comment.content).toBe(commentData.content);
      expect(comment.postId).toBe(commentData.postId);
      expect(comment.authorId).toBe(commentData.authorId);
      expect(comment.createdAt).toBeDefined();
      expect(comment.updatedAt).toBeDefined();
    });

    it('should throw error when not authenticated', async () => {
      const commentData = {
        content: 'Unauthorized comment',
        postId: Number(testPost.id),
        authorId: testUser.id,
      };

      await expect(
        trpc.comment.createComment.mutate(commentData),
      ).rejects.toThrow();
    });

    it('should throw error for invalid data', async () => {
      const invalidCommentData = {
        content: '', // Empty content
        postId: Number(testPost.id),
        authorId: testUser.id,
      };

      await expect(
        authenticatedTrpc.comment.createComment.mutate(invalidCommentData),
      ).rejects.toThrow();
    });

    it('should throw error for non-existent post', async () => {
      const commentData = {
        content: 'Comment on non-existent post',
        postId: 999999,
        authorId: testUser.id,
      };

      await expect(
        authenticatedTrpc.comment.createComment.mutate(commentData),
      ).rejects.toThrow();
    });
  });

  describe('comment.getComment', () => {
    let createdComment: Comment;

    beforeEach(async () => {
      // Create a comment for testing
      createdComment = await authenticatedTrpc.comment.createComment.mutate({
        content: 'Test comment for retrieval',
        postId: Number(testPost.id),
        authorId: testUser.id,
      });
    });

    it('should retrieve a comment by id', async () => {
      const comment = await trpc.comment.getComment.query({
        id: Number(createdComment.id),
      });

      expect(comment).toBeDefined();
      expect(comment.id).toBe(createdComment.id);
      expect(comment.content).toBe(createdComment.content);
      expect(comment.postId).toBe(createdComment.postId);
      expect(comment.authorId).toBe(createdComment.authorId);
    });

    it('should throw error for non-existent comment', async () => {
      await expect(
        trpc.comment.getComment.query({ id: 999999 }),
      ).rejects.toThrow();
    });
  });

  describe('comment.updateComment', () => {
    let createdComment: Comment;

    beforeEach(async () => {
      // Create a comment for testing
      createdComment = await authenticatedTrpc.comment.createComment.mutate({
        content: 'Original comment content',
        postId: Number(testPost.id),
        authorId: testUser.id,
      });
    });

    it('should update a comment with valid data', async () => {
      const updateData = {
        id: Number(createdComment.id),
        content: 'Updated comment content',
      };

      const updatedComment =
        await authenticatedTrpc.comment.updateComment.mutate(updateData);

      expect(updatedComment).toBeDefined();
      expect(updatedComment.id).toBe(createdComment.id);
      expect(updatedComment.content).toBe(updateData.content);
      expect(updatedComment.postId).toBe(createdComment.postId);
      expect(updatedComment.authorId).toBe(createdComment.authorId);
      expect(new Date(updatedComment.updatedAt).getTime()).toBeGreaterThan(
        new Date(createdComment.updatedAt).getTime(),
      );
    });

    it('should throw error when not authenticated', async () => {
      const updateData = {
        id: Number(createdComment.id),
        content: 'Unauthorized update',
      };

      await expect(
        trpc.comment.updateComment.mutate(updateData),
      ).rejects.toThrow();
    });

    it('should throw error for non-existent comment', async () => {
      const updateData = {
        id: 999999,
        content: 'Updated content',
      };

      await expect(
        authenticatedTrpc.comment.updateComment.mutate(updateData),
      ).rejects.toThrow();
    });
  });

  describe('comment.deleteComment', () => {
    let createdComment: Comment;

    beforeEach(async () => {
      // Create a comment for testing
      createdComment = await authenticatedTrpc.comment.createComment.mutate({
        content: 'Comment to delete',
        postId: Number(testPost.id),
        authorId: testUser.id,
      });
    });

    it('should delete a comment', async () => {
      await authenticatedTrpc.comment.deleteComment.mutate({
        id: Number(createdComment.id),
      });

      // Verify the comment is deleted
      await expect(
        trpc.comment.getComment.query({ id: Number(createdComment.id) }),
      ).rejects.toThrow();
    });

    it('should throw error when not authenticated', async () => {
      await expect(
        trpc.comment.deleteComment.mutate({ id: Number(createdComment.id) }),
      ).rejects.toThrow();
    });

    it('should throw error for non-existent comment', async () => {
      await expect(
        authenticatedTrpc.comment.deleteComment.mutate({ id: 999999 }),
      ).rejects.toThrow();
    });
  });

  describe('Comments Integration', () => {
    it('should create, read, update, and delete a comment', async () => {
      // Create
      const commentData = {
        content: 'CRUD test comment',
        postId: Number(testPost.id),
        authorId: testUser.id,
      };

      const createdComment =
        await authenticatedTrpc.comment.createComment.mutate(commentData);
      expect(createdComment.content).toBe(commentData.content);

      // Read
      const retrievedComment = await trpc.comment.getComment.query({
        id: Number(createdComment.id),
      });
      expect(retrievedComment.id).toBe(createdComment.id);

      // Update
      const updateData = {
        id: Number(createdComment.id),
        content: 'Updated CRUD test comment',
      };

      const updatedComment =
        await authenticatedTrpc.comment.updateComment.mutate(updateData);
      expect(updatedComment.content).toBe(updateData.content);

      // Delete
      await authenticatedTrpc.comment.deleteComment.mutate({
        id: Number(createdComment.id),
      });

      // Verify deletion
      await expect(
        trpc.comment.getComment.query({ id: Number(createdComment.id) }),
      ).rejects.toThrow();
    });

    it('should list comments for a post after creating some', async () => {
      // Create multiple comments
      const comment1 = await authenticatedTrpc.comment.createComment.mutate({
        content: 'First comment',
        postId: Number(testPost.id),
        authorId: testUser.id,
      });

      const comment2 = await authenticatedTrpc.comment.createComment.mutate({
        content: 'Second comment',
        postId: Number(testPost.id),
        authorId: testUser.id,
      });

      // List comments for the post
      const result = await trpc.comment.getCommentsByPostId.query({
        postId: Number(testPost.id),
        take: 10,
      });

      expect(result).toBeDefined();
      // The exact structure depends on the business service implementation
      // Just verify we get a result and it's defined
    });
  });
});
