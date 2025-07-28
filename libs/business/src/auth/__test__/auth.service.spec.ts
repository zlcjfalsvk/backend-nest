import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';

import { AuthService } from '@libs/business';
import { PrismaService } from '@libs/infrastructure';
import { CustomError, ERROR_CODES } from '@libs/utils';

import {
  SignInResponseType,
  SignInType,
  SignUpResponseType,
  SignUpType,
  TokenType,
} from '../types';

vi.mock('argon2', () => ({
  hash: vi.fn(),
  verify: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: DeepMockProxy<PrismaService>;
  let jwtService: DeepMockProxy<JwtService>;

  beforeEach(async () => {
    prismaService = mockDeep<PrismaService>();
    jwtService = mockDeep<JwtService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    const mockSignUpData: SignUpType = {
      email: 'test@example.com',
      nickName: 'testuser',
      password: 'password123!#@#',
      introduction: 'Hello, I am a test user',
    };

    const mockCreatedUser = {
      id: 'test-uuid',
      email: mockSignUpData.email,
      nickName: mockSignUpData.nickName,
      password: mockSignUpData.password,
      introduction: mockSignUpData.introduction || null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('존재하지 않은 Email, NickName 일 경우 정상적인 회원가입이 진행 된다', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockCreatedUser);

      await service.signUp(mockSignUpData);

      expect(prismaService.user.findFirst.mock.calls[0][0]).toEqual({
        where: {
          OR: [
            { email: mockSignUpData.email },
            { nickName: mockSignUpData.nickName },
          ],
        },
        select: {
          email: true,
          nickName: true,
        },
      });
      expect(prismaService.user.create.mock.calls.length).toBeGreaterThan(0);
    });

    it('정상적인 회원가입 이후 deletedAt, password 를 제외한 User Data 가 반환 된다', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      const userWithoutPassword: SignUpResponseType = {
        id: mockCreatedUser.id,
        email: mockCreatedUser.email,
        nickName: mockCreatedUser.nickName,
        introduction: mockCreatedUser.introduction,
        createdAt: mockCreatedUser.createdAt,
        updatedAt: mockCreatedUser.updatedAt,
      };

      prismaService.user.create.mockResolvedValue(userWithoutPassword as any);

      const result = await service.signUp(mockSignUpData);

      expect(result).toEqual(userWithoutPassword);
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('deletedAt');
    });

    it('존재하는 Email 일 경우 회원가입 실패한다', async () => {
      prismaService.user.findFirst.mockResolvedValue({
        id: 'existing-user-id',
        email: mockSignUpData.email,
        nickName: 'different-nickname',
        password: 'hashed-password',
        introduction: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.signUp(mockSignUpData)).rejects.toThrow(CustomError);
      await expect(service.signUp(mockSignUpData)).rejects.toMatchObject({
        code: ERROR_CODES.AUTH_CONFLICT,
        message: 'Email already exists',
        name: 'CustomError',
      });

      expect(prismaService.user.create.mock.calls.length).toBe(0);
    });

    it('존재하는 Nickname 일 경우 회원가입 실패한다', async () => {
      prismaService.user.findFirst.mockResolvedValue({
        id: 'existing-user-id',
        email: 'different@example.com',
        nickName: mockSignUpData.nickName,
        password: 'hashed-password',
        introduction: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.signUp(mockSignUpData)).rejects.toThrow(CustomError);
      await expect(service.signUp(mockSignUpData)).rejects.toMatchObject({
        code: ERROR_CODES.AUTH_CONFLICT,
        message: 'Nickname already exists',
        name: 'CustomError',
      });

      expect(prismaService.user.create.mock.calls.length).toBe(0);
    });
  });

  describe('signIn', () => {
    const mockSignInData: SignInType = {
      email: 'test@example.com',
      password: 'password123!#@#',
    };

    const mockUser = {
      id: 'test-uuid',
      email: mockSignInData.email,
      nickName: 'testuser',
      password: 'hashed-password',
      introduction: 'Hello, I am a test user',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockSignInResponse: SignInResponseType = {
      id: mockUser.id,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };

    it('존재하는 Email, Password 가 일치할 때 로그인이 성공한다', async () => {
      // Mock the user find
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock password verification
      vi.spyOn(argon2, 'verify').mockResolvedValue(true);

      // Mock JWT token generation
      jwtService.sign.mockImplementation((payload: any) => {
        return payload.type === TokenType.ACCESS_TOKEN
          ? 'mock-access-token'
          : 'mock-refresh-token';
      });

      const result = await service.signIn(mockSignInData);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockSignInData.email },
      });
      expect(argon2.verify).toHaveBeenCalledWith(
        mockUser.password,
        mockSignInData.password,
      );
      expect(result).toEqual(mockSignInResponse);
    });

    it('Email 이 존재하지 않을시 에러를 반환한다', async () => {
      // Mock user not found
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.signIn(mockSignInData)).rejects.toThrow(CustomError);
      await expect(service.signIn(mockSignInData)).rejects.toMatchObject({
        code: ERROR_CODES.AUTH_UNAUTHORIZED,
        message: 'Invalid email or password',
        name: 'CustomError',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockSignInData.email },
      });
    });

    it('Password가 일치하지 않을 시 에러를 반환한다', async () => {
      // Mock user found but password doesn't match
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock password verification to fail
      vi.spyOn(argon2, 'verify').mockResolvedValue(false);

      await expect(service.signIn(mockSignInData)).rejects.toThrow(CustomError);
      await expect(service.signIn(mockSignInData)).rejects.toMatchObject({
        code: ERROR_CODES.AUTH_UNAUTHORIZED,
        message: 'Invalid email or password',
        name: 'CustomError',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockSignInData.email },
      });
      expect(argon2.verify).toHaveBeenCalledWith(
        mockUser.password,
        mockSignInData.password,
      );
    });
  });
});
