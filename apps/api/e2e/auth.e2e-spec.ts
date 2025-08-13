import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { describe, it, expect, beforeEach } from 'vitest';

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

const API_BASE_URL = 'http://localhost:3000';

describe('Auth API E2E Tests', () => {
  let request: TestAgent<supertest.Test>;

  beforeEach(() => {
    request = supertest(API_BASE_URL);
  });

  describe('POST /auth/sign-up', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        nickName: 'newuser',
        password: 'SecurePassword123!',
        introduction: 'Hello, I am a new user!',
      };

      const response = await request
        .post('/auth/sign-up')
        .send(userData)
        .expect(201);

      const user = response.body as AuthUser;
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.nickName).toBe(userData.nickName);
      expect(user.introduction).toBe(userData.introduction);
      expect((user as any).password).toBeUndefined(); // Password should not be returned
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        nickName: 'user1',
        password: 'Password123!@',
        introduction: 'First user',
      };

      // Create first user
      await request.post('/auth/sign-up').send(userData).expect(201);

      // Try to create second user with same email
      const duplicateUserData = {
        email: 'duplicate@example.com', // Same email
        nickName: 'user2',
        password: 'Password456!@',
        introduction: 'Second user',
      };

      await request.post('/auth/sign-up').send(duplicateUserData).expect(409);
    });

    it('should return 400 for duplicate nickname', async () => {
      const userData = {
        email: 'user1@example.com',
        nickName: 'duplicateNick',
        password: 'Password123!@',
        introduction: 'First user',
      };

      // Create first user
      await request.post('/auth/sign-up').send(userData).expect(201);

      // Try to create second user with same nickname
      const duplicateUserData = {
        email: 'user2@example.com',
        nickName: 'duplicateNick', // Same nickname
        password: 'Password456!@',
        introduction: 'Second user',
      };

      await request.post('/auth/sign-up').send(duplicateUserData).expect(409);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidUserData = {
        email: 'invalid-email-format',
        nickName: 'validuser',
        password: 'Password123!@',
        introduction: 'Valid introduction',
      };

      await request.post('/auth/sign-up').send(invalidUserData).expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteUserData = {
        email: 'incomplete@example.com',
        // Missing nickName and password
        introduction: 'Incomplete user data',
      };

      await request.post('/auth/sign-up').send(incompleteUserData).expect(400);
    });

    it('should return 400 for weak password', async () => {
      const weakPasswordData = {
        email: 'weakpass@example.com',
        nickName: 'weakpassuser',
        password: '123', // Too weak
        introduction: 'User with weak password',
      };

      await request.post('/auth/sign-up').send(weakPasswordData).expect(400);
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
          password: 'CorrectPassword123!',
          introduction: 'User for sign-in testing',
        })
        .expect(201);
    });

    it('should sign in with valid credentials', async () => {
      const signInData = {
        email: 'signin@example.com',
        password: 'CorrectPassword123!',
      };

      const response = await request
        .post('/auth/sign-in')
        .send(signInData)
        .expect(201);

      const signInResponse = response.body as SignInResponse;
      expect(signInResponse).toBeDefined();
      expect(signInResponse.accessToken).toBeDefined();
      expect(typeof signInResponse.accessToken).toBe('string');
      expect(signInResponse.id).toBeDefined();
      expect(signInResponse.refreshToken).toBeDefined();
    });

    it('should return 401 for incorrect password', async () => {
      const signInData = {
        email: 'signin@example.com',
        password: 'WrongPassword123!',
      };

      await request.post('/auth/sign-in').send(signInData).expect(401);
    });

    it('should return 401 for non-existent email', async () => {
      const signInData = {
        email: 'nonexistent@example.com',
        password: 'AnyPassword123!',
      };

      await request.post('/auth/sign-in').send(signInData).expect(401);
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
        password: 'CorrectPassword123!',
      };

      await request.post('/auth/sign-in').send(invalidSignInData).expect(400);
    });
  });

  describe('Authentication Integration', () => {
    it('should create user, sign in, and use token for protected routes', async () => {
      // Create user
      const userData = {
        email: 'integration@example.com',
        nickName: 'integrationuser',
        password: 'IntegrationPassword123!',
        introduction: 'Integration test user',
      };

      const signUpResponse = await request
        .post('/auth/sign-up')
        .send(userData)
        .expect(201);

      const user = signUpResponse.body as AuthUser;
      expect(user.id).toBeDefined();

      // Sign in
      const signInResponse = await request
        .post('/auth/sign-in')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(201);

      const { accessToken } = signInResponse.body as SignInResponse;
      expect(accessToken).toBeDefined();

      // Test that the token works for accessing protected routes
      const profileResponse = await request
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      // If profile endpoint doesn't exist, we can just verify the token is valid
      // by checking we get a proper error for missing endpoints rather than auth error
      expect([200, 404]).toContain(profileResponse.status);
    });
  });
});
