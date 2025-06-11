import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { AuthService } from '@libs/business';
import { PrismaService } from '@libs/infrastructure';

import { SignUpResponseType, SignUpType } from '../types';

jest.mock('argon2', () => ({
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaService = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    const mockSignUpData: SignUpType = {
      email: 'test@example.com',
      nickName: 'testuser',
      password: 'password123!#@#',
      name: 'Test User',
      introduction: 'Hello, I am a test user',
    };

    const mockCreatedUser = {
      id: 'test-uuid',
      email: mockSignUpData.email,
      nickName: mockSignUpData.nickName,
      password: mockSignUpData.password,
      name: mockSignUpData.name,
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

    it('정상적인 회원가입 이후 password 를 제외한 User Data 가 반환 된다', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      const userWithoutPassword: SignUpResponseType = {
        id: mockCreatedUser.id,
        email: mockCreatedUser.email,
        nickName: mockCreatedUser.nickName,
        introduction: mockCreatedUser.introduction,
        deletedAt: mockCreatedUser.deletedAt,
        createdAt: mockCreatedUser.createdAt,
        updatedAt: mockCreatedUser.updatedAt,
      };

      prismaService.user.create.mockResolvedValue(userWithoutPassword as any);

      const result = await service.signUp(mockSignUpData);

      expect(result).toEqual(userWithoutPassword);
      expect(result).not.toHaveProperty('password');
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

      await expect(service.signUp(mockSignUpData)).rejects.toThrow(
        new ConflictException('Email already exists'),
      );
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

      await expect(service.signUp(mockSignUpData)).rejects.toThrow(
        new ConflictException('Nickname already exists'),
      );
      expect(prismaService.user.create.mock.calls.length).toBe(0);
    });
  });
});
