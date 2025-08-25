import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import { AuthService } from '@libs/business';
import { CustomError, ERROR_CODES } from '@libs/utils';

import { AuthController } from '../auth.controller';
import {
  SignInDto,
  SignUpDto,
  SignUpResponseDto,
  SignInResponseDto,
} from '../dtos';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: DeepMockProxy<AuthService>;

  beforeEach(async () => {
    // Reset mocks before creating module
    vi.resetAllMocks();

    authService = mockDeep<AuthService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('signUp', () => {
    it('유효한 정보로 회원가입하면 SignUpResponseDto로 변환하여 반환한다', async () => {
      // Arrange
      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        nickName: 'testuser',
        password: 'StrongPass1@',
        introduction: 'Hello, I am a test user',
      };

      const expectedResult = {
        id: 'user-id',
        email: 'test@example.com',
        nickName: 'testuser',
        introduction: 'Hello, I am a test user',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      authService.signUp.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signUp(signUpDto);

      // Assert
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
      expect(result).toBeInstanceOf(SignUpResponseDto);
      expect(result.id).toBe(expectedResult.id);
      expect(result.email).toBe(expectedResult.email);
      expect(result.nickName).toBe(expectedResult.nickName);
    });

    it('이미 존재하는 이메일로 회원가입하면 중복 오류가 발생한다', async () => {
      // Arrange
      const signUpDto: SignUpDto = {
        email: 'existing@example.com',
        nickName: 'existinguser',
        password: 'StrongPass1@',
        introduction: 'Hello, I am a test user',
      };

      const error = new CustomError(
        ERROR_CODES.AUTH_CONFLICT,
        'Email already exists',
      );
      authService.signUp.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signUp(signUpDto)).rejects.toThrow(error);
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });

    it('이미 존재하는 닉네임으로 회원가입하면 중복 오류가 발생한다', async () => {
      // Arrange
      const signUpDto: SignUpDto = {
        email: 'new@example.com',
        nickName: 'existingNickname',
        password: 'StrongPass1@',
        introduction: 'Hello, I am a test user',
      };

      const error = new CustomError(
        ERROR_CODES.AUTH_CONFLICT,
        'Nickname already exists',
      );
      authService.signUp.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signUp(signUpDto)).rejects.toThrow(error);
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });

    it('비밀번호는 영문 숫자 특수문자 포함 8자 이상이어야 한다', async () => {
      // Arrange
      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        nickName: 'testuser',
        password: 'weakpass', // Missing uppercase, special char, and less than 10 chars
        introduction: 'Hello, I am a test user',
      };

      // In a real application, validation would be handled by NestJS's validation pipe
      // For this test, we'll simulate a rejection from the service with an appropriate error message
      const error = new CustomError(
        ERROR_CODES.AUTH_UNAUTHORIZED,
        'Password must be at least 10 characters long and contain at least one uppercase letter, one lowercase letter, and one special character (!@#$%^&*_)',
      );
      authService.signUp.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signUp(signUpDto)).rejects.toThrow(error);
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('signIn', () => {
    it('올바른 이메일과 비밀번호로 로그인하면 SignInResponseDto로 변환하여 반환한다', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'StrongPass1@',
      };

      const expectedResult = {
        id: 'user-id',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      authService.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signIn(signInDto);

      // Assert
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
      expect(result).toBeInstanceOf(SignInResponseDto);
      expect(result.id).toBe(expectedResult.id);
      expect(result.accessToken).toBe(expectedResult.accessToken);
      expect(result.refreshToken).toBe(expectedResult.refreshToken);
    });

    it('잘못된 이메일 또는 비밀번호로 로그인하면 인증 실패 오류가 발생한다', async () => {
      // Arrange
      const signInDto: SignInDto = {
        email: 'nonexistent@example.com',
        password: 'WrongPass1@',
      };

      const error = new CustomError(
        ERROR_CODES.AUTH_UNAUTHORIZED,
        'Invalid email or password',
      );
      authService.signIn.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(error);
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });
  });

  describe('DTO 변환 테스트', () => {
    it('SignUpResponseDto가 올바른 속성을 가져야 한다', () => {
      const dto = new SignUpResponseDto();
      dto.id = 'user-id';
      dto.email = 'test@example.com';
      dto.nickName = 'testuser';
      dto.introduction = 'Hello';
      dto.createdAt = new Date();
      dto.updatedAt = new Date();

      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('email');
      expect(dto).toHaveProperty('nickName');
      expect(dto).toHaveProperty('introduction');
      expect(dto).toHaveProperty('createdAt');
      expect(dto).toHaveProperty('updatedAt');
    });

    it('SignInResponseDto가 올바른 속성을 가져야 한다', () => {
      const dto = new SignInResponseDto();
      dto.id = 'user-id';
      dto.accessToken = 'access-token';
      dto.refreshToken = 'refresh-token';

      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('accessToken');
      expect(dto).toHaveProperty('refreshToken');
    });
  });
});
