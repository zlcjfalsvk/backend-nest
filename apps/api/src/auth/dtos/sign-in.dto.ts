import { IsEmail } from 'class-validator';

import { SignInType } from '@libs/business';
import { IsStrongPassword } from '@libs/utils';

export class SignInDto implements SignInType {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
