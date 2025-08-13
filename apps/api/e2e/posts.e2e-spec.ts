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

interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    nickName: string;
  };
}

const API_BASE_URL = 'http://localhost:3000';

describe('Posts API E2E Tests', () => {
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

  beforeEach(async () => {
    request = supertest(API_BASE_URL);

    // Create a test user with unique email for each test
    const uniqueId = Math.random().toString(36).substring(7);
    const userResponse = await request
      .post('/auth/sign-up')
      .send({
        email: `testuser${uniqueId}@example.com`,
        nickName: `testuser${uniqueId}`,
        password: 'SecurePassword123!',
        introduction: 'Test user for E2E testing',
      })
      .expect(201);

    testUser = userResponse.body as AuthUser;

    const signInResponse = await request
      .post('/auth/sign-in')
      .send({
        email: `testuser${uniqueId}@example.com`,
        password: 'SecurePassword123!',
      })
      .expect(201);

    authToken = (signInResponse.body as SignInResponse).accessToken;

    // Create a test post with unique slug
    testPost = await prisma.post.create({
      data: {
        title: 'Test Post for E2E',
        content: 'This is a test post content',
        slug: `test-post-e2e-${uniqueId}`,
        published: true,
        authorId: testUser.id,
      },
    });
  });

  describe('GET /posts', () => {
    it('should return all published posts', async () => {
      const response = await request.get('/posts').expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.posts).toBeDefined();
      expect(Array.isArray(response.body.posts)).toBe(true);
      expect(response.body.totalCount).toBeDefined();
      expect(typeof response.body.totalCount).toBe('number');
    });

    it('should return posts with pagination', async () => {
      const response = await request.get('/posts?take=5').expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.posts).toBeDefined();
      expect(Array.isArray(response.body.posts)).toBe(true);
      expect(response.body.posts.length).toBeLessThanOrEqual(5);
    });

    it('should filter posts by published status', async () => {
      // Create an unpublished post to test filtering
      const unpublishedPost = await prisma.post.create({
        data: {
          title: 'Unpublished Test Post',
          content: 'This post is not published',
          slug: `unpublished-test-${Math.random().toString(36).substring(7)}`,
          published: false,
          authorId: testUser.id,
        },
      });

      const response = await request
        .get('/posts?onlyPublished=true')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.posts).toBeDefined();
      expect(Array.isArray(response.body.posts)).toBe(true);

      // Check that we have the published post
      const hasPublishedPost = response.body.posts.some(
        (post: any) => post.id === testPost.id,
      );
      expect(hasPublishedPost).toBe(true);

      // Check that we don't have the unpublished post
      const hasUnpublishedPost = response.body.posts.some(
        (post: any) => post.id === unpublishedPost.id,
      );
      expect(hasUnpublishedPost).toBe(false);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return a specific post by ID', async () => {
      const response = await request.get(`/posts/${testPost.id}`).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(testPost.id);
      expect(response.body.title).toBe(testPost.title);
    });

    it('should return 404 for non-existent post', async () => {
      await request.get('/posts/99999').expect(404);
    });

    it('should return 400 for invalid post ID', async () => {
      await request.get('/posts/invalid-id').expect(400);
    });
  });

  describe('POST /posts', () => {
    it('should create a new post with valid data', async () => {
      const uniquePostId = Math.random().toString(36).substring(7);
      const newPostData = {
        title: 'New Test Post',
        content: 'This is new test post content',
        slug: `new-test-post-${uniquePostId}`,
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
      const uniquePostId = Math.random().toString(36).substring(7);
      const newPostData = {
        title: 'Unauthorized Post',
        content: 'This should fail',
        slug: `unauthorized-post-${uniquePostId}`,
        published: true,
        authorId: testUser.id,
      };

      await request.post('/posts').send(newPostData).expect(401);
    });

    it('should return 400 for invalid post data', async () => {
      const uniquePostId = Math.random().toString(36).substring(7);
      const invalidPostData = {
        title: '', // Empty title should be invalid
        content: 'Valid content',
        slug: `valid-slug-${uniquePostId}`,
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

      await request.put(`/posts/${testPost.id}`).send(updateData).expect(401);
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
      await request.get(`/posts/${testPost.id}`).expect(404);
    });

    it('should return 401 when deleting post without authentication', async () => {
      await request.delete(`/posts/${testPost.id}`).expect(401);
    });

    it('should return 404 when deleting non-existent post', async () => {
      await request
        .delete('/posts/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
