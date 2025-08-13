import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { describe, it, expect, beforeEach } from 'vitest';

import { prisma } from '../../../tests/e2e/setup';

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

interface Comment {
  id: number;
  content: string;
  postId: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    nickName: string;
  };
}

interface CommentsResponse {
  comments: Comment[];
  totalCount: number;
  nextCursor: number | null;
}

const API_BASE_URL = 'http://localhost:3000';

describe('Comments API E2E Tests', () => {
  let request: TestAgent<supertest.Test>;
  let authToken: string;
  let testUser: AuthUser;
  let testPost: {
    id: number;
    title: string;
    content: string;
    slug: string;
    published: boolean;
    authorId: string;
  };
  let testComment: {
    id: number;
    content: string;
    postId: number;
    authorId: string;
  };

  beforeEach(async () => {
    request = supertest(API_BASE_URL);

    // Create a test user with unique email for each test
    const uniqueId = Math.random().toString(36).substring(7);
    const userData = {
      email: `commentuser${uniqueId}@example.com`,
      nickName: `commentuser${uniqueId}`,
      password: 'SecurePassword123!',
      introduction: 'Test user for comment testing',
    };

    const userResponse = await request
      .post('/auth/sign-up')
      .send(userData)
      .expect(201);

    testUser = userResponse.body as AuthUser;

    const signInResponse = await request
      .post('/auth/sign-in')
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(201);

    authToken = (signInResponse.body as SignInResponse).accessToken;

    // Create a test post with unique slug
    const postUniqueId = Math.random().toString(36).substring(7);
    testPost = await prisma.post.create({
      data: {
        title: 'Test Post for Comments',
        content: 'This is a test post for comment testing',
        slug: `test-post-comments-${postUniqueId}`,
        published: true,
        authorId: testUser.id,
      },
    });

    // Create a test comment
    testComment = await prisma.comment.create({
      data: {
        content: 'This is a test comment',
        postId: testPost.id,
        authorId: testUser.id,
      },
    });
  });

  describe('GET /comments/post/:postId', () => {
    it('should return all comments for a specific post', async () => {
      const response = await request
        .get(`/comments/post/${testPost.id}`)
        .expect(200);

      const commentsResponse = response.body as CommentsResponse;
      expect(commentsResponse).toBeDefined();
      expect(commentsResponse.comments).toBeDefined();
      expect(Array.isArray(commentsResponse.comments)).toBe(true);
      expect(commentsResponse.totalCount).toBeDefined();
      expect(typeof commentsResponse.totalCount).toBe('number');
      expect(commentsResponse.comments.length).toBeGreaterThan(0);

      // Check comment structure
      const comment = commentsResponse.comments[0];
      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('content');
      expect(comment).toHaveProperty('postId', testPost.id);
      expect(comment).toHaveProperty('author');
      expect(comment.author).toHaveProperty('id');
      expect(comment.author).toHaveProperty('nickName');
    });

    it('should return comments with pagination using take parameter', async () => {
      // Create additional comments
      await prisma.comment.create({
        data: {
          content: 'Second test comment',
          postId: testPost.id,
          authorId: testUser.id,
        },
      });

      const response = await request
        .get(`/comments/post/${testPost.id}?take=1`)
        .expect(200);

      const commentsResponse = response.body as CommentsResponse;
      expect(commentsResponse).toBeDefined();
      expect(commentsResponse.comments).toBeDefined();
      expect(commentsResponse.comments.length).toBe(1);
      expect(commentsResponse.totalCount).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array for post with no comments', async () => {
      // Create a post without comments with unique slug
      const uniqueId = Math.random().toString(36).substring(7);
      const emptyPost = await prisma.post.create({
        data: {
          title: 'Post Without Comments',
          content: 'This post has no comments',
          slug: `post-without-comments-${uniqueId}`,
          published: true,
          authorId: testUser.id,
        },
      });

      const response = await request
        .get(`/comments/post/${emptyPost.id}`)
        .expect(200);

      const commentsResponse = response.body as CommentsResponse;
      expect(commentsResponse).toBeDefined();
      expect(commentsResponse.comments).toBeDefined();
      expect(Array.isArray(commentsResponse.comments)).toBe(true);
      expect(commentsResponse.comments.length).toBe(0);
      expect(commentsResponse.totalCount).toBe(0);
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request.get('/comments/post/99999').expect(404);
      expect(response.body).toHaveProperty('code', 'POST_NOT_FOUND');
    });
  });

  describe('GET /comments/:id', () => {
    it('should return a specific comment by ID', async () => {
      const response = await request
        .get(`/comments/${testComment.id}`)
        .expect(200);

      const comment = response.body as Comment;
      expect(comment).toBeDefined();
      expect(comment.id).toBe(testComment.id);
      expect(comment.content).toBe(testComment.content);
      expect(comment.postId).toBe(testPost.id);
      expect(comment.authorId).toBe(testUser.id);
      expect(comment.author).toBeDefined();
      expect(comment.author.id).toBe(testUser.id);
      expect(comment.author.nickName).toBe(testUser.nickName);
    });

    it('should return 404 for non-existent comment', async () => {
      const response = await request.get('/comments/99999').expect(404);
      expect(response.body).toHaveProperty('code', 'COMMENT_NOT_FOUND');
    });

    it('should return 400 for invalid comment ID', async () => {
      await request.get('/comments/invalid-id').expect(400);
    });
  });

  describe('POST /comments', () => {
    it('should create a new comment with valid data', async () => {
      const newCommentData = {
        content: 'This is a new test comment',
        postId: testPost.id,
        authorId: testUser.id,
      };

      const response = await request
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCommentData)
        .expect(201);

      const comment = response.body as Comment;
      expect(comment).toBeDefined();
      expect(comment.content).toBe(newCommentData.content);
      expect(comment.postId).toBe(newCommentData.postId);
      expect(comment.authorId).toBe(newCommentData.authorId);
      expect(comment.author).toBeDefined();
      expect(comment.author.id).toBe(testUser.id);
      expect(comment.author.nickName).toBe(testUser.nickName);
      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('createdAt');
      expect(comment).toHaveProperty('updatedAt');
    });

    it('should return 401 when creating comment without authentication', async () => {
      const newCommentData = {
        content: 'Unauthorized comment',
        postId: testPost.id,
        authorId: testUser.id,
      };

      await request.post('/comments').send(newCommentData).expect(401);
    });

    it('should return 400 for invalid comment data', async () => {
      const invalidCommentData = {
        content: '', // Empty content should be invalid
        postId: testPost.id,
        authorId: testUser.id,
      };

      await request
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCommentData)
        .expect(400);
    });

    it('should return 404 for non-existent post', async () => {
      const commentData = {
        content: 'Comment on non-existent post',
        postId: 99999,
        authorId: testUser.id,
      };

      const response = await request
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(404);

      expect(response.body).toHaveProperty('code', 'POST_NOT_FOUND');
    });
  });

  describe('PUT /comments/:id', () => {
    it('should update an existing comment', async () => {
      const updateData = {
        content: 'Updated comment content',
      };

      const response = await request
        .put(`/comments/${testComment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      const comment = response.body as Comment;
      expect(comment).toBeDefined();
      expect(comment.content).toBe(updateData.content);
      expect(comment.id).toBe(testComment.id);
      expect(comment.postId).toBe(testPost.id);
      expect(comment.authorId).toBe(testUser.id);
      expect(comment.author).toBeDefined();
      expect(comment.author.id).toBe(testUser.id);
      expect(comment).toHaveProperty('updatedAt');
    });

    it('should return 401 when updating comment without authentication', async () => {
      const updateData = {
        content: 'Unauthorized update',
      };

      await request
        .put(`/comments/${testComment.id}`)
        .send(updateData)
        .expect(401);
    });

    it('should return 404 when updating non-existent comment', async () => {
      const updateData = {
        content: 'Update non-existent comment',
      };

      const response = await request
        .put('/comments/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('code', 'COMMENT_NOT_FOUND');
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdateData = {
        content: '', // Empty content should be invalid
      };

      await request
        .put(`/comments/${testComment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdateData)
        .expect(400);
    });
  });

  describe('DELETE /comments/:id', () => {
    it('should delete an existing comment', async () => {
      // Create a new comment to delete (to avoid affecting other tests)
      const commentToDelete = await prisma.comment.create({
        data: {
          content: 'Comment to be deleted',
          postId: testPost.id,
          authorId: testUser.id,
        },
      });

      await request
        .delete(`/comments/${commentToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify comment is marked as deleted (soft delete)
      const response = await request
        .get(`/comments/${commentToDelete.id}`)
        .expect(404);
      expect(response.body).toHaveProperty('code', 'COMMENT_DELETED');
    });

    it('should return 401 when deleting comment without authentication', async () => {
      await request.delete(`/comments/${testComment.id}`).expect(401);
    });

    it('should return 404 when deleting non-existent comment', async () => {
      const response = await request
        .delete('/comments/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('code', 'COMMENT_NOT_FOUND');
    });
  });

  describe('Comment-Post Integration', () => {
    it('should create post, add comments, and verify comment-post relationship', async () => {
      // Create a new post with unique slug using Prisma directly
      const uniqueId = Math.random().toString(36).substring(7);
      const newPost = await prisma.post.create({
        data: {
          title: 'Post for Comment Integration',
          content: 'This post will have multiple comments',
          slug: `post-comment-integration-${uniqueId}`,
          published: true,
          authorId: testUser.id,
        },
      });

      // newPost is now the direct result from Prisma

      // Add multiple comments to the post
      const comment1Data = {
        content: 'First comment on the post',
        postId: newPost.id,
        authorId: testUser.id,
      };

      const comment2Data = {
        content: 'Second comment on the post',
        postId: newPost.id,
        authorId: testUser.id,
      };

      const comment1Response = await request
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(comment1Data)
        .expect(201);

      const comment2Response = await request
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(comment2Data)
        .expect(201);

      // Verify created comments have correct structure
      const comment1 = comment1Response.body as Comment;
      const comment2 = comment2Response.body as Comment;
      expect(comment1).toHaveProperty('id');
      expect(comment1.content).toBe(comment1Data.content);
      expect(comment2).toHaveProperty('id');
      expect(comment2.content).toBe(comment2Data.content);

      // Retrieve all comments for the post
      const commentsResponse = await request
        .get(`/comments/post/${newPost.id}`)
        .expect(200);

      const allCommentsResponse = commentsResponse.body as CommentsResponse;
      expect(allCommentsResponse).toBeDefined();
      expect(allCommentsResponse.comments).toBeDefined();
      expect(Array.isArray(allCommentsResponse.comments)).toBe(true);
      expect(allCommentsResponse.comments.length).toBe(2);
      expect(allCommentsResponse.totalCount).toBe(2);

      // Verify comment contents and structure
      const comments = allCommentsResponse.comments;
      const commentContents = comments.map((c) => c.content);
      expect(commentContents).toContain(comment1Data.content);
      expect(commentContents).toContain(comment2Data.content);

      // Verify each comment has proper structure
      comments.forEach((comment) => {
        expect(comment).toHaveProperty('id');
        expect(comment).toHaveProperty('content');
        expect(comment).toHaveProperty('postId', newPost.id);
        expect(comment).toHaveProperty('authorId', testUser.id);
        expect(comment).toHaveProperty('author');
        expect(comment.author).toHaveProperty('id', testUser.id);
        expect(comment.author).toHaveProperty('nickName', testUser.nickName);
        expect(comment).toHaveProperty('createdAt');
        expect(comment).toHaveProperty('updatedAt');
      });
    });
  });
});
