import { Module } from '@nestjs/common';

import { PrismaModule } from '@libs/infrastructure';

import { AuthControllerModule } from './auth/auth.controller.module';

@Module({
  imports: [PrismaModule.forRoot(), AuthControllerModule],
  controllers: [],
  providers: [],
})
export class ApiModule {}
