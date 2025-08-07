import { describe, expect, it } from 'vitest';

import { signUpSchema, signInSchema } from '../auth.schema';

describe('인증 스키마', () => {
  describe('회원가입 스키마', () => {
    it('올바른 회원가입 데이터를 검증해야 한다', () => {
      const validData = {
        email: 'test@example.com',
        nickName: 'testuser',
        password: 'password123',
        introduction: 'Hello, I am a test user',
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('선택사항인 자기소개 없이도 회원가입 데이터를 검증해야 한다', () => {
      const validData = {
        email: 'test@example.com',
        nickName: 'testuser',
        password: 'password123',
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.introduction).toBeUndefined();
      }
    });

    it('잘못된 이메일 형식을 거부해야 한다', () => {
      const invalidData = {
        email: 'invalid-email',
        nickName: 'testuser',
        password: 'password123',
        introduction: 'Hello',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('유효한 이메일을 입력해주세요');
      }
    });

    it('빈 닉네임을 거부해야 한다', () => {
      const invalidData = {
        email: 'test@example.com',
        nickName: '',
        password: 'password123',
        introduction: 'Hello',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('20자를 초과하는 닉네임을 거부해야 한다', () => {
      const invalidData = {
        email: 'test@example.com',
        nickName: 'a'.repeat(21),
        password: 'password123',
        introduction: 'Hello',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('닉네임은 20자 이하로 입력해주세요');
      }
    });

    it('8자 미만의 비밀번호를 거부해야 한다', () => {
      const invalidData = {
        email: 'test@example.com',
        nickName: 'testuser',
        password: '1234567',
        introduction: 'Hello',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('비밀번호는 최소 8자 이상이어야 합니다');
      }
    });

    it('정확히 20자인 유효한 닉네임을 허용해야 한다', () => {
      const validData = {
        email: 'test@example.com',
        nickName: 'a'.repeat(20),
        password: 'password123',
        introduction: 'Hello',
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('정확히 8자인 비밀번호를 허용해야 한다', () => {
      const validData = {
        email: 'test@example.com',
        nickName: 'testuser',
        password: '12345678',
        introduction: 'Hello',
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('필수 필드가 누락된 경우를 거부해야 한다', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('로그인 스키마', () => {
    it('올바른 로그인 데이터를 검증해야 한다', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = signInSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('잘못된 이메일 형식을 거부해야 한다', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('유효한 이메일을 입력해주세요');
      }
    });

    it('빈 비밀번호를 거부해야 한다', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('비밀번호를 입력해주세요');
      }
    });

    it('한 글자 비밀번호를 허용해야 한다', () => {
      const validData = {
        email: 'test@example.com',
        password: 'a',
      };

      const result = signInSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('이메일이 누락된 경우를 거부해야 한다', () => {
      const invalidData = {
        password: 'password123',
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('비밀번호가 누락된 경우를 거부해야 한다', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});