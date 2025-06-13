import { Prisma, User } from '@prisma-client/index';

export type SignUpType = {
  email: string;
  nickName: string;
  password: string;
  name: string;
  introduction?: string;
};

export type SignUpResponseType = Prisma.UserGetPayload<{
  omit: {
    password: true;
  };
}>;

export type SignInType = {
  email: string;
  password: string;
};

export type SignInResponseType = Pick<User, 'id'> & {
  accessToken: string;
  refreshToken: string;
};

export const TokenType = {
  ACCESS_TOKEN: 'a',
  REFRESH_TOKEN: 'r',
} as const;
