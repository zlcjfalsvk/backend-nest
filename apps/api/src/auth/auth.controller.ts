import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from '@libs/business';

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
    return this.authService.signUp(signUpDto);
  }

  @Post('/sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return this.authService.signIn(signInDto);
  }
}
