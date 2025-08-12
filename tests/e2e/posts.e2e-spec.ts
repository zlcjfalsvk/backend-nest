import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import { prisma } from './setup';

const API_BASE_URL = 'http://localhost:3000';

describe('Posts API E2E Tests', () => {
  let request: supertest.SuperTest<supertest.Test>;
  let authToken: string;
  let testUser: any;
  let testPost: any;

  beforeEach(async () => {
    request = supertest(API_BASE_URL);

    // Create a test user and get auth token
    const userResponse = await request
      .post('/auth/sign-up')
      .send({
        email: 'testuser@example.com',
        nickName: 'testuser',
        password: 'password123',
        introduction: 'Test user for E2E testing',
      })
      .expect(201);

    testUser = userResponse.body;

    const signInResponse = await request
      .post('/auth/sign-in')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      })
      .expect(201);

    authToken = signInResponse.body.accessToken;

    // Create a test post
    testPost = await prisma.post.create({
      data: {
        title: 'Test Post for E2E',
        content: 'This is a test post content',
        slug: 'test-post-e2e',
        published: true,
        authorId: testUser.id,
      },
    });
  });

  describe('GET /posts', () => {
    it('should return all published posts', async () => {
      const response = await request
        .get('/posts')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.data || response.body)).toBe(true);
    });

    it('should return posts with pagination', async () => {
      const response = await request
        .get('/posts?page=1&limit=5')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should filter posts by published status', async () => {
      const response = await request
        .get('/posts?published=true')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('GET /posts/:id', () => {
    it('should return a specific post by ID', async () => {
      const response = await request
        .get(`/posts/${testPost.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(testPost.id);
      expect(response.body.title).toBe(testPost.title);
    });

    it('should return 404 for non-existent post', async () => {
      await request
        .get('/posts/99999')
        .expect(404);
    });

    it('should return 400 for invalid post ID', async () => {
      await request
        .get('/posts/invalid-id')
        .expect(400);
    });
  });

  describe('POST /posts', () => {
    it('should create a new post with valid data', async () => {
      const newPostData = {
        title: 'New Test Post',
        content: 'This is new test post content',
        slug: 'new-test-post',
        published: true,
        authorId: testUser.id,
      };

      const response = await request
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPostData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.title).toBe(newPostData.title);
      expect(response.body.content).toBe(newPostData.content);
      expect(response.body.slug).toBe(newPostData.slug);
    });

    it('should return 401 when creating post without authentication', async () => {
      const newPostData = {
        title: 'Unauthorized Post',
        content: 'This should fail',
        slug: 'unauthorized-post',
        published: true,
        authorId: testUser.id,
      };

      await request
        .post('/posts')
        .send(newPostData)
        .expect(401);
    });

    it('should return 400 for invalid post data', async () => {
      const invalidPostData = {
        title: '', // Empty title should be invalid
        content: 'Valid content',
        slug: 'valid-slug',
        published: true,
        authorId: testUser.id,
      };

      await request
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPostData)
        .expect(400);
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update an existing post', async () => {
      const updateData = {
        title: 'Updated Test Post',
        content: 'Updated content',
        published: false,
      };

      const response = await request
        .put(`/posts/${testPost.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.content).toBe(updateData.content);
      expect(response.body.published).toBe(updateData.published);
    });

    it('should return 401 when updating post without authentication', async () => {
      const updateData = {
        title: 'Unauthorized Update',
        content: 'This should fail',
      };

      await request
        .put(`/posts/${testPost.id}`)
        .send(updateData)
        .expect(401);
    });

    it('should return 404 when updating non-existent post', async () => {
      const updateData = {
        title: 'Update Non-existent',
        content: 'This should fail',
      };

      await request
        .put('/posts/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete an existing post', async () => {
      await request
        .delete(`/posts/${testPost.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify post is deleted
      await request
        .get(`/posts/${testPost.id}`)
        .expect(404);
    });

    it('should return 401 when deleting post without authentication', async () => {
      await request
        .delete(`/posts/${testPost.id}`)
        .expect(401);
    });

    it('should return 404 when deleting non-existent post', async () => {
      await request
        .delete('/posts/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});