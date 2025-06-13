import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PrismaService } from '@libs/infrastructure';
import { CustomError, ERROR_CODES } from '@libs/utils';

import {
  SignInResponseType,
  SignInType,
  SignUpResponseType,
  SignUpType,
  TokenType,
} from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(param: SignUpType): Promise<SignUpResponseType> {
    // 1. 단일 쿼리로 중복 체크
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: param.email }, { nickName: param.nickName }],
      },
      select: {
        email: true,
        nickName: true,
      },
    });

    // 2. 중복 검사
    if (existingUser) {
      if (existingUser.email === param.email) {
        throw new CustomError(
          ERROR_CODES.AUTH_CONFLICT,
          'Email already exists',
        );
      }
      if (existingUser.nickName === param.nickName) {
        throw new CustomError(
          ERROR_CODES.AUTH_CONFLICT,
          'Nickname already exists',
        );
      }
    }

    // 3. 비밀번호 해싱
    // 주의. 한국에서 서비스할 때는 argon2 사용못함 => KISA 표준 목록에 없기 때문에 pbkdf2-sha256 사용 해야 함
    const hashedPassword = await argon2.hash(param.password);

    // 4. 사용자 생성 (비밀번호 제외하고 반환)
    return this.prismaService.user.create({
      data: {
        ...param,
        password: hashedPassword,
      },
      omit: {
        password: true,
      },
    });
  }

  async signIn(param: SignInType): Promise<SignInResponseType> {
    // 1. 이메일로 사용자 찾기
    const user = await this.prismaService.user.findUnique({
      where: { email: param.email },
    });

    // 2. 사용자가 존재하지 않는 경우
    if (!user) {
      throw new CustomError(
        ERROR_CODES.AUTH_UNAUTHORIZED,
        'Invalid email or password',
      );
    }

    // 3. 비밀번호 검증
    const isPasswordValid = await argon2.verify(user.password, param.password);
    if (!isPasswordValid) {
      throw new CustomError(
        ERROR_CODES.AUTH_UNAUTHORIZED,
        'Invalid email or password',
      );
    }

    // 4. JWT 토큰 생성
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        type: TokenType.ACCESS_TOKEN,
      },
      { expiresIn: '1h' },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: accessToken,
        type: TokenType.REFRESH_TOKEN,
      },
      { expiresIn: '1h' },
    );

    // 5. 응답 반환
    return {
      id: user.id,
      accessToken,
      refreshToken,
    };
  }
}
