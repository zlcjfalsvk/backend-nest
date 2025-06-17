import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

import { SignUpType } from '@libs/business';
import { IsStrongPassword } from '@libs/utils';

export class SignUpDto implements SignUpType {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(20)
  nickName: string;

  @IsStrongPassword()
  password: string;

  @IsString()
  @IsOptional()
  introduction?: string;
}
