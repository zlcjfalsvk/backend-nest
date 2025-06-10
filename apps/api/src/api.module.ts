import { Module } from '@nestjs/common';

import { AuthControllerModule } from './auth/auth.controller.module';

@Module({
  imports: [AuthControllerModule],
  controllers: [],
  providers: [],
})
export class ApiModule {}
