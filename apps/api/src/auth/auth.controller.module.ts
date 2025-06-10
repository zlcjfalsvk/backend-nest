import { Module } from '@nestjs/common';

import { AuthModule } from '@libs/business';

import { AuthController } from './auth.controller';

@Module({
  imports: [AuthModule],
  controllers: [AuthController],
})
export class AuthControllerModule {}
