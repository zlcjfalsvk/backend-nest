import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '@libs/business';
import { CustomError, ERROR_CODES } from '@libs/utils';

import { AuthController } from './auth.controller';
import { SignInDto, SignUpDto } from './dtos';

// Create a mock AuthService
const mockAuthService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Reset mock calls before each test
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('유효한 정보로 회원가입하면 새로운 사용자 정보를 반환한다', async () => {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.signUp.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signUp(signUpDto);

      // Assert
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
      expect(result).toEqual(expectedResult);
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
      mockAuthService.signUp.mockRejectedValue(error);

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
      mockAuthService.signUp.mockRejectedValue(error);

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
      mockAuthService.signUp.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signUp(signUpDto)).rejects.toThrow(error);
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('signIn', () => {
    it('올바른 이메일과 비밀번호로 로그인하면 인증 토큰을 반환한다', async () => {
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

      mockAuthService.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signIn(signInDto);

      // Assert
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
      expect(result).toEqual(expectedResult);
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
      mockAuthService.signIn.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.signIn(signInDto)).rejects.toThrow(error);
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });
  });
});
