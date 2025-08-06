import { Module } from '@nestjs/common';

import { TrpcModule as TrpcAdapterModule } from '@libs/adapter';
import { AuthModule, CommentModule, PostModule } from '@libs/business';
import { PrismaModule, ConfigModule } from '@libs/infrastructure';

import { TrpcRouter } from './trpc.router';

/**
 * tRPC 애플리케이션의 루트 모듈
 * - tRPC adapter 모듈
 * - Business 로직 모듈들 (Auth, Comment, Post)
 * - Infrastructure 모듈들 (Prisma, Config)
 * - tRPC 라우터를 포함
 */
@Module({
  imports: [
    TrpcAdapterModule,
    AuthModule,
    CommentModule,
    PostModule,
    PrismaModule,
    ConfigModule,
  ],
  providers: [TrpcRouter],
  exports: [TrpcRouter],
})
export class TrpcModule {}
