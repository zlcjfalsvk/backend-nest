import { Injectable } from '@nestjs/common';

import {
  SignInResponseType,
  SignInType,
  SignUpResponseType,
  SignUpType,
} from './types';

@Injectable()
export class AuthService {
  constructor() {}

  async signUp(param: SignUpType): Promise<SignUpResponseType> {
    // TODO
  }

  async signIn(param: SignInType): Promise<SignInResponseType> {
    // TODO
  }
}
