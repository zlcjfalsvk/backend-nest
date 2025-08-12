import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import { prisma } from './setup';

const API_BASE_URL = 'http://localhost:3000';

describe('Comments API E2E Tests', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let authToken: string;
  let testUser: any;
  let testPost: any;
  let testComment: any;

  beforeEach(async () => {
    request = supertest(API_BASE_URL);

    // Create a test user and get auth token
    const userResponse = await request
      .post('/auth/sign-up')
      .send({
        email: 'commentuser@example.com',
        nickName: 'commentuser',
        password: 'password123',
        introduction: 'Test user for comment testing',
      })
      .expect(201);

    testUser = userResponse.body;

    const signInResponse = await request
      .post('/auth/sign-in')
      .send({
        email: 'commentuser@example.com',
        password: 'password123',
      })
      .expect(201);

    authToken = signInResponse.body.accessToken;

    // Create a test post
    testPost = await prisma.post.create({
      data: {
        title: 'Test Post for Comments',
        content: 'This is a test post for comment testing',
        slug: 'test-post-comments',
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

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.data || response.body)).toBe(true);
    });

    it('should return comments with pagination', async () => {
      const response = await request
        .get(`/comments/post/${testPost.id}?page=1&limit=5`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should return empty array for post with no comments', async () => {
      // Create a post without comments
      const emptyPost = await prisma.post.create({
        data: {
          title: 'Post Without Comments',
          content: 'This post has no comments',
          slug: 'post-without-comments',
          published: true,
          authorId: testUser.id,
        },
      });

      const response = await request
        .get(`/comments/post/${emptyPost.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      const comments = response.body.data || response.body;
      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBe(0);
    });

    it('should return 404 for non-existent post', async () => {
      await request
        .get('/comments/post/99999')
        .expect(404);
    });
  });

  describe('GET /comments/:id', () => {
    it('should return a specific comment by ID', async () => {
      const response = await request
        .get(`/comments/${testComment.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(testComment.id);
      expect(response.body.content).toBe(testComment.content);
      expect(response.body.postId).toBe(testPost.id);
    });

    it('should return 404 for non-existent comment', async () => {
      await request
        .get('/comments/99999')
        .expect(404);
    });

    it('should return 400 for invalid comment ID', async () => {
      await request
        .get('/comments/invalid-id')
        .expect(400);
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

      expect(response.body).toBeDefined();
      expect(response.body.content).toBe(newCommentData.content);
      expect(response.body.postId).toBe(newCommentData.postId);
      expect(response.body.authorId).toBe(newCommentData.authorId);
    });

    it('should return 401 when creating comment without authentication', async () => {
      const newCommentData = {
        content: 'Unauthorized comment',
        postId: testPost.id,
        authorId: testUser.id,
      };

      await request
        .post('/comments')
        .send(newCommentData)
        .expect(401);
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

    it('should return 400 for non-existent post', async () => {
      const commentData = {
        content: 'Comment on non-existent post',
        postId: 99999,
        authorId: testUser.id,
      };

      await request
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(400);
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

      expect(response.body).toBeDefined();
      expect(response.body.content).toBe(updateData.content);
      expect(response.body.id).toBe(testComment.id);
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

      await request
        .put('/comments/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
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
      await request
        .delete(`/comments/${testComment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify comment is deleted
      await request
        .get(`/comments/${testComment.id}`)
        .expect(404);
    });

    it('should return 401 when deleting comment without authentication', async () => {
      await request
        .delete(`/comments/${testComment.id}`)
        .expect(401);
    });

    it('should return 404 when deleting non-existent comment', async () => {
      await request
        .delete('/comments/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Comment-Post Integration', () => {
    it('should create post, add comments, and verify comment-post relationship', async () => {
      // Create a new post
      const postData = {
        title: 'Post for Comment Integration',
        content: 'This post will have multiple comments',
        slug: 'post-comment-integration',
        published: true,
        authorId: testUser.id,
      };

      const postResponse = await request
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      const newPost = postResponse.body;

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

      await request
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(comment1Data)
        .expect(201);

      await request
        .post('/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(comment2Data)
        .expect(201);

      // Retrieve all comments for the post
      const commentsResponse = await request
        .get(`/comments/post/${newPost.id}`)
        .expect(200);

      const comments = commentsResponse.body.data || commentsResponse.body;
      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBe(2);

      // Verify comment contents
      const commentContents = comments.map((c: any) => c.content);
      expect(commentContents).toContain(comment1Data.content);
      expect(commentContents).toContain(comment2Data.content);
    });
  });
});