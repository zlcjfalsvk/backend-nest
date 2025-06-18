import { Module } from '@nestjs/common';

import { ConfigModule, PrismaModule } from '@libs/infrastructure';

import { AuthControllerModule } from './auth/auth.controller.module';

@Module({
  imports: [
    ConfigModule.forRoot('api'),
    PrismaModule.forRoot(),
    AuthControllerModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
