import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import { prisma } from './setup';

const API_BASE_URL = 'http://localhost:3000';

describe('Auth API E2E Tests', () => {
  let request: supertest.SuperTest<supertest.Test>;

  beforeEach(() => {
    request = supertest(API_BASE_URL);
  });

  describe('POST /auth/sign-up', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        nickName: 'newuser',
        password: 'securePassword123',
        introduction: 'Hello, I am a new user!',
      };

      const response = await request
        .post('/auth/sign-up')
        .send(userData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe(userData.email);
      expect(response.body.nickName).toBe(userData.nickName);
      expect(response.body.introduction).toBe(userData.introduction);
      expect(response.body.password).toBeUndefined(); // Password should not be returned
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        nickName: 'user1',
        password: 'password123',
        introduction: 'First user',
      };

      // Create first user
      await request
        .post('/auth/sign-up')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const duplicateUserData = {
        email: 'duplicate@example.com', // Same email
        nickName: 'user2',
        password: 'password456',
        introduction: 'Second user',
      };

      await request
        .post('/auth/sign-up')
        .send(duplicateUserData)
        .expect(400);
    });

    it('should return 400 for duplicate nickname', async () => {
      const userData = {
        email: 'user1@example.com',
        nickName: 'duplicateNick',
        password: 'password123',
        introduction: 'First user',
      };

      // Create first user
      await request
        .post('/auth/sign-up')
        .send(userData)
        .expect(201);

      // Try to create second user with same nickname
      const duplicateUserData = {
        email: 'user2@example.com',
        nickName: 'duplicateNick', // Same nickname
        password: 'password456',
        introduction: 'Second user',
      };

      await request
        .post('/auth/sign-up')
        .send(duplicateUserData)
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidUserData = {
        email: 'invalid-email-format',
        nickName: 'validuser',
        password: 'password123',
        introduction: 'Valid introduction',
      };

      await request
        .post('/auth/sign-up')
        .send(invalidUserData)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteUserData = {
        email: 'incomplete@example.com',
        // Missing nickName and password
        introduction: 'Incomplete user data',
      };

      await request
        .post('/auth/sign-up')
        .send(incompleteUserData)
        .expect(400);
    });

    it('should return 400 for weak password', async () => {
      const weakPasswordData = {
        email: 'weakpass@example.com',
        nickName: 'weakpassuser',
        password: '123', // Too weak
        introduction: 'User with weak password',
      };

      await request
        .post('/auth/sign-up')
        .send(weakPasswordData)
        .expect(400);
    });
  });

  describe('POST /auth/sign-in', () => {
    beforeEach(async () => {
      // Create a test user for sign-in tests
      await request
        .post('/auth/sign-up')
        .send({
          email: 'signin@example.com',
          nickName: 'signinuser',
          password: 'correctPassword123',
          introduction: 'User for sign-in testing',
        })
        .expect(201);
    });

    it('should sign in with valid credentials', async () => {
      const signInData = {
        email: 'signin@example.com',
        password: 'correctPassword123',
      };

      const response = await request
        .post('/auth/sign-in')
        .send(signInData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.accessToken).toBeDefined();
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(signInData.email);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should return 401 for incorrect password', async () => {
      const signInData = {
        email: 'signin@example.com',
        password: 'wrongPassword123',
      };

      await request
        .post('/auth/sign-in')
        .send(signInData)
        .expect(401);
    });

    it('should return 401 for non-existent email', async () => {
      const signInData = {
        email: 'nonexistent@example.com',
        password: 'anyPassword123',
      };

      await request
        .post('/auth/sign-in')
        .send(signInData)
        .expect(401);
    });

    it('should return 400 for missing credentials', async () => {
      const incompleteSignInData = {
        email: 'signin@example.com',
        // Missing password
      };

      await request
        .post('/auth/sign-in')
        .send(incompleteSignInData)
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidSignInData = {
        email: 'invalid-email-format',
        password: 'correctPassword123',
      };

      await request
        .post('/auth/sign-in')
        .send(invalidSignInData)
        .expect(400);
    });
  });

  describe('Authentication Integration', () => {
    it('should create user, sign in, and use token for protected routes', async () => {
      // Create user
      const userData = {
        email: 'integration@example.com',
        nickName: 'integrationuser',
        password: 'integrationPassword123',
        introduction: 'Integration test user',
      };

      const signUpResponse = await request
        .post('/auth/sign-up')
        .send(userData)
        .expect(201);

      expect(signUpResponse.body.id).toBeDefined();

      // Sign in
      const signInResponse = await request
        .post('/auth/sign-in')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(201);

      const { accessToken } = signInResponse.body;
      expect(accessToken).toBeDefined();

      // Use token to create a post (protected route)
      const postData = {
        title: 'Integration Test Post',
        content: 'This post was created using the auth token',
        slug: 'integration-test-post',
        published: true,
        authorId: signUpResponse.body.id,
      };

      const postResponse = await request
        .post('/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(postData)
        .expect(201);

      expect(postResponse.body.title).toBe(postData.title);
      expect(postResponse.body.authorId).toBe(signUpResponse.body.id);
    });
  });
});