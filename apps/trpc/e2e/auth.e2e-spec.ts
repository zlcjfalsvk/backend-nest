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

describe('tRPC Auth E2E Tests', () => {
  let trpc: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeEach(() => {
    trpc = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: TRPC_BASE_URL,
        }),
      ],
    });
  });

  describe('auth.signUp', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'trpc-newuser@example.com',
        nickName: 'trpcnewuser',
        password: 'SecurePassword123!',
        introduction: 'Hello, I am a new tRPC user!',
      };

      const user = await trpc.auth.signUp.mutate(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.nickName).toBe(userData.nickName);
      expect(user.introduction).toBe(userData.introduction);
      expect((user as any).password).toBeUndefined(); // Password should not be returned
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'trpc-duplicate@example.com',
        nickName: 'trpcuser1',
        password: 'Password123!@',
        introduction: 'First user',
      };

      // Create first user
      await trpc.auth.signUp.mutate(userData);

      // Try to create second user with same email
      const duplicateUserData = {
        email: 'trpc-duplicate@example.com', // Same email
        nickName: 'trpcuser2',
        password: 'Password456!@',
        introduction: 'Second user',
      };

      await expect(
        trpc.auth.signUp.mutate(duplicateUserData),
      ).rejects.toThrow();
    });

    it('should throw error for duplicate nickname', async () => {
      const userData = {
        email: 'trpc-user1@example.com',
        nickName: 'trpcduplicateNick',
        password: 'Password123!@',
        introduction: 'First user',
      };

      // Create first user
      await trpc.auth.signUp.mutate(userData);

      // Try to create second user with same nickname
      const duplicateUserData = {
        email: 'trpc-user2@example.com',
        nickName: 'trpcduplicateNick', // Same nickname
        password: 'Password456!@',
        introduction: 'Second user',
      };

      await expect(
        trpc.auth.signUp.mutate(duplicateUserData),
      ).rejects.toThrow();
    });

    it('should throw error for invalid email format', async () => {
      const invalidUserData = {
        email: 'invalid-email-format',
        nickName: 'trpcvaliduser',
        password: 'Password123!@',
        introduction: 'Valid introduction',
      };

      await expect(trpc.auth.signUp.mutate(invalidUserData)).rejects.toThrow();
    });

    it('should throw error for missing required fields', async () => {
      const incompleteUserData = {
        email: 'trpc-incomplete@example.com',
        // Missing nickName and password
        introduction: 'Incomplete user data',
      } as any;

      await expect(
        trpc.auth.signUp.mutate(incompleteUserData),
      ).rejects.toThrow();
    });

    it('should throw error for weak password', async () => {
      const weakPasswordData = {
        email: 'trpc-weakpass@example.com',
        nickName: 'trpcweakpassuser',
        password: '123', // Too weak
        introduction: 'User with weak password',
      };

      await expect(trpc.auth.signUp.mutate(weakPasswordData)).rejects.toThrow();
    });
  });

  describe('auth.signIn', () => {
    beforeEach(async () => {
      // Create a test user for sign-in tests
      await trpc.auth.signUp.mutate({
        email: 'trpc-signin@example.com',
        nickName: 'trpcsigninuser',
        password: 'CorrectPassword123!',
        introduction: 'User for sign-in testing',
      });
    });

    it('should sign in with valid credentials', async () => {
      const signInData = {
        email: 'trpc-signin@example.com',
        password: 'CorrectPassword123!',
      };

      const signInResponse = await trpc.auth.signIn.mutate(signInData);

      expect(signInResponse).toBeDefined();
      expect(signInResponse.accessToken).toBeDefined();
      expect(typeof signInResponse.accessToken).toBe('string');
      expect(signInResponse.id).toBeDefined();
      expect(signInResponse.refreshToken).toBeDefined();
    });

    it('should throw error for incorrect password', async () => {
      const signInData = {
        email: 'trpc-signin@example.com',
        password: 'WrongPassword123!',
      };

      await expect(trpc.auth.signIn.mutate(signInData)).rejects.toThrow();
    });

    it('should throw error for non-existent email', async () => {
      const signInData = {
        email: 'trpc-nonexistent@example.com',
        password: 'AnyPassword123!',
      };

      await expect(trpc.auth.signIn.mutate(signInData)).rejects.toThrow();
    });

    it('should throw error for missing credentials', async () => {
      const incompleteSignInData = {
        email: 'trpc-signin@example.com',
        // Missing password
      } as any;

      await expect(
        trpc.auth.signIn.mutate(incompleteSignInData),
      ).rejects.toThrow();
    });

    it('should throw error for invalid email format', async () => {
      const invalidSignInData = {
        email: 'invalid-email-format',
        password: 'CorrectPassword123!',
      };

      await expect(
        trpc.auth.signIn.mutate(invalidSignInData),
      ).rejects.toThrow();
    });
  });

  describe('Authentication Integration', () => {
    it('should create user and sign in successfully', async () => {
      // Create user
      const userData = {
        email: 'trpc-integration@example.com',
        nickName: 'trpcintegrationuser',
        password: 'IntegrationPassword123!',
        introduction: 'Integration test user',
      };

      const user = await trpc.auth.signUp.mutate(userData);
      expect(user.id).toBeDefined();

      // Sign in
      const signInResponse = await trpc.auth.signIn.mutate({
        email: userData.email,
        password: userData.password,
      });

      const { accessToken } = signInResponse;
      expect(accessToken).toBeDefined();

      // For tRPC, we would need to create an authenticated client to test protected routes
      // This is a basic test to ensure the auth flow works
      expect(typeof accessToken).toBe('string');
      expect(accessToken.length).toBeGreaterThan(0);
    });
  });
});
