import { User } from '@prisma-client/index';

export type SignUpType = {
  email: string;
  nickName: string;
  password: string;
  name: string;
  introduction?: string;
};

export type SignUpResponseType = User;

export type SignInType = {
  email: string;
  password: string;
};

export type SignInResponseType = Pick<User, 'id' | 'email' | 'nickName'> & {
  token: string;
};
