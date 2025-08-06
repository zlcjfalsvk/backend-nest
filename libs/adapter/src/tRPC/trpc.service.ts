import { Injectable } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './types';

/**
 * tRPC 서비스 - tRPC 인스턴스와 프로시저 생성을 담당
 */
@Injectable()
export class TrpcService {
  private readonly trpc = initTRPC.context<Context>().create();

  /**
   * tRPC 라우터 생성기 반환
   */
  get router() {
    return this.trpc.router;
  }

  /**
   * 공개 프로시저 (인증 불필요)
   */
  get publicProcedure() {
    return this.trpc.procedure;
  }

  /**
   * 보호된 프로시저 (인증 필요)
   */
  get protectedProcedure() {
    return this.trpc.procedure.use(({ ctx, next }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '인증이 필요합니다.',
        });
      }

      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
        },
      });
    });
  }

  /**
   * tRPC 미들웨어 생성기
   */
  get middleware() {
    return this.trpc.middleware;
  }
}