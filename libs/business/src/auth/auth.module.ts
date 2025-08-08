import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule } from '@libs/infrastructure';

import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      global: true,
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
