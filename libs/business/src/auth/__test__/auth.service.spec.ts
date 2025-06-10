import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '@libs/business';

import { SignUpType, SignInType } from '../types';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('회원가입 (signUp)', () => {
    const validSignUpData: SignUpType = {
      email: 'test@example.com',
      nickName: 'testuser',
      password: 'password123',
      name: '홍길동',
      introduction: '안녕하세요',
    };

    it('유효한 데이터로 회원가입이 성공해야 한다', async () => {
      // Given
      const signUpData = { ...validSignUpData };

      // When
      const result = await service.signUp(signUpData);

      // Then
      expect(result).toBeDefined();
      expect(result.email).toBe(signUpData.email);
      expect(result.nickName).toBe(signUpData.nickName);
      expect(result.introduction).toBe(signUpData.introduction);
      expect(result.password).not.toBe(signUpData.password); // 해시된 패스워드
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('중복된 이메일로 회원가입 시 에러가 발생해야 한다', async () => {
      // Given
      await service.signUp(validSignUpData);
      const duplicateEmailData = {
        ...validSignUpData,
        nickName: 'differentuser',
      };

      // When & Then
      await expect(service.signUp(duplicateEmailData)).rejects.toThrow(
        '이미 존재하는 이메일입니다',
      );
    });

    it('중복된 닉네임으로 회원가입 시 에러가 발생해야 한다', async () => {
      // Given
      await service.signUp(validSignUpData);
      const duplicateNickNameData = {
        ...validSignUpData,
        email: 'different@example.com',
      };

      // When & Then
      await expect(service.signUp(duplicateNickNameData)).rejects.toThrow(
        '이미 존재하는 닉네임입니다',
      );
    });

    it('이메일 형식이 올바르지 않으면 에러가 발생해야 한다', async () => {
      // Given
      const invalidEmailData = {
        ...validSignUpData,
        email: 'invalid-email',
      };

      // When & Then
      await expect(service.signUp(invalidEmailData)).rejects.toThrow(
        '유효하지 않은 이메일 형식입니다',
      );
    });

    it('패스워드가 8자 미만이면 에러가 발생해야 한다', async () => {
      // Given
      const shortPasswordData = {
        ...validSignUpData,
        password: '123',
      };

      // When & Then
      await expect(service.signUp(shortPasswordData)).rejects.toThrow(
        '패스워드는 8자 이상이어야 합니다',
      );
    });

    it('필수 필드가 누락되면 에러가 발생해야 한다', async () => {
      // Given
      const incompleteData = {
        email: 'test@example.com',
        // nickName, password, name 누락
      } as SignUpType;

      // When & Then
      await expect(service.signUp(incompleteData)).rejects.toThrow(
        '필수 필드가 누락되었습니다',
      );
    });
  });

  describe('로그인 (signIn)', () => {
    const validSignUpData: SignUpType = {
      email: 'test@example.com',
      nickName: 'testuser',
      password: 'password123',
      name: '홍길동',
    };

    const validSignInData: SignInType = {
      email: 'test@example.com',
      password: 'password123',
    };

    beforeEach(async () => {
      // 로그인 테스트를 위해 사용자를 미리 생성
      await service.signUp(validSignUpData);
    });

    it('유효한 이메일과 패스워드로 로그인이 성공해야 한다', async () => {
      // Given
      const signInData = { ...validSignInData };

      // When
      const result = await service.signIn(signInData);

      // Then
      expect(result).toBeDefined();
      expect(result.email).toBe(signInData.email);
      expect(result.nickName).toBe(validSignUpData.nickName);
      expect(result.id).toBeDefined();
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('존재하지 않는 이메일로 로그인 시 에러가 발생해야 한다', async () => {
      // Given
      const nonExistentEmailData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      // When & Then
      await expect(service.signIn(nonExistentEmailData)).rejects.toThrow(
        '존재하지 않는 사용자입니다',
      );
    });

    it('잘못된 패스워드로 로그인 시 에러가 발생해야 한다', async () => {
      // Given
      const wrongPasswordData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // When & Then
      await expect(service.signIn(wrongPasswordData)).rejects.toThrow(
        '패스워드가 일치하지 않습니다',
      );
    });

    it('이메일 형식이 올바르지 않으면 에러가 발생해야 한다', async () => {
      // Given
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'password123',
      };

      // When & Then
      await expect(service.signIn(invalidEmailData)).rejects.toThrow(
        '유효하지 않은 이메일 형식입니다',
      );
    });

    it('필수 필드가 누락되면 에러가 발생해야 한다', async () => {
      // Given
      const incompleteData = {
        email: 'test@example.com',
        // password 누락
      } as SignInType;

      // When & Then
      await expect(service.signIn(incompleteData)).rejects.toThrow(
        '필수 필드가 누락되었습니다',
      );
    });

    it('로그인 시 JWT 토큰이 유효한 형식이어야 한다', async () => {
      // Given
      const signInData = { ...validSignInData };

      // When
      const result = await service.signIn(signInData);

      // Then
      expect(result.token).toBeDefined();
      expect(result.token.split('.')).toHaveLength(3); // JWT는 3개 부분으로 구성
    });
  });

  describe('통합 시나리오', () => {
    it('회원가입 후 즉시 로그인이 가능해야 한다', async () => {
      // Given
      const signUpData: SignUpType = {
        email: 'integration@example.com',
        nickName: 'integrationuser',
        password: 'password123',
        name: '통합테스트',
      };

      // When
      const signUpResult = await service.signUp(signUpData);
      const signInResult = await service.signIn({
        email: signUpData.email,
        password: signUpData.password,
      });

      // Then
      expect(signUpResult.email).toBe(signInResult.email);
      expect(signUpResult.nickName).toBe(signInResult.nickName);
      expect(signInResult.token).toBeDefined();
    });

    it('여러 사용자가 연속으로 회원가입할 수 있어야 한다', async () => {
      // Given
      const users = [
        {
          email: 'user1@example.com',
          nickName: 'user1',
          password: 'password123',
          name: '사용자1',
        },
        {
          email: 'user2@example.com',
          nickName: 'user2',
          password: 'password123',
          name: '사용자2',
        },
        {
          email: 'user3@example.com',
          nickName: 'user3',
          password: 'password123',
          name: '사용자3',
        },
      ];

      // When
      const results = await Promise.all(
        users.map((user) => service.signUp(user)),
      );

      // Then
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.email).toBe(users[index].email);
        expect(result.nickName).toBe(users[index].nickName);
        expect(result.id).toBeDefined();
      });
    });
  });
});
