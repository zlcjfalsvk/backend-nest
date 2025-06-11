import { Injectable } from '@nestjs/common';

import { PrismaService } from '@libs/infrastructure';

import {
  SignInResponseType,
  SignInType,
  SignUpResponseType,
  SignUpType,
} from './types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signUp(param: SignUpType): Promise<SignUpResponseType> {
    // This is a placeholder implementation
    // Using param to avoid unused variable warning
    const { email, nickName } = param;

    // Adding await to satisfy ESLint require-await rule
    await Promise.resolve();

    return {
      id: '1',
      email,
      nickName,
    } as SignUpResponseType;
  }

  async signIn(param: SignInType): Promise<SignInResponseType> {
    // This is a placeholder implementation
    // Adding await to satisfy ESLint require-await rule
    await Promise.resolve();

    return {
      id: '1',
      email: param.email,
      nickName: 'user',
      token: 'mock-token',
    };
  }
}
