import { Module } from '@nestjs/common';

import { TrpcService } from './trpc.service';

/**
 * tRPC 모듈 - tRPC 서비스를 제공하는 모듈
 */
@Module({
  providers: [TrpcService],
  exports: [TrpcService],
})
export class TrpcModule {}
