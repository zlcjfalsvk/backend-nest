import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from '@libs/business';
import { plainToInstance } from '@libs/utils';

import {
  SignInDto,
  SignInResponseDto,
  SignUpDto,
  SignUpResponseDto,
} from './dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResponseDto> {
    const result = await this.authService.signUp(signUpDto);
    return plainToInstance(SignUpResponseDto, result);
  }

  @Post('/sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    const result = await this.authService.signIn(signInDto);
    return plainToInstance(SignInResponseDto, result);
  }
}
