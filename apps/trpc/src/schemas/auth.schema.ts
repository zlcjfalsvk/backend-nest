import { z } from 'zod';

/**
 * 회원가입 요청 스키마
 */
export const signUpSchema = z.object({
  email: z.email('유효한 이메일을 입력해주세요'),
  nickName: z.string().min(1).max(20, '닉네임은 20자 이하로 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  introduction: z.string().optional(),
});

/**
 * 로그인 요청 스키마
 */
export const signInSchema = z.object({
  email: z.email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
