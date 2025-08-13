import { NestFactory } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

import { ConfigService } from '@libs/infrastructure';

import { TrpcModule } from './trpc.module';
import { TrpcRouter } from './trpc.router';

async function bootstrap() {
  // NestJS 애플리케이션 생성 (Express 어댑터 사용)
  const app = await NestFactory.create<NestExpressApplication>(TrpcModule);

  // CORS 설정
  app.enableCors({ origin: true });

  // tRPC 라우터 인스턴스 가져오기
  const trpcRouter = app.get(TrpcRouter);

  // ConfigService 인스턴스 가져오기
  const configService = app.get(ConfigService);

  // JwtService 인스턴스 가져오기
  const jwtService = app.get(JwtService);

  // tRPC Express 미들웨어 생성
  const trpcMiddleware = createExpressMiddleware({
    router: trpcRouter.appRouter,
    createContext: ({ req }) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return { user: undefined };
        }

        const token = authHeader.substring(7);
        const payload = jwtService.verify(token, {
          secret: configService.get('JWT_ACCESS_SECRET'),
        });

        return {
          user: {
            id: payload.sub,
          },
        };
      } catch (error) {
        // JWT 검증 실패 시 인증되지 않은 사용자로 처리
        return { user: undefined };
      }
    },
  });

  // tRPC 미들웨어 등록
  app.use('/trpc', trpcMiddleware);

  const port = configService.get('TRPC_PORT');
  await app.listen(port, '0.0.0.0');

  console.log(`tRPC 서버가 http://localhost:${port}/trpc 에서 실행 중입니다.`);
}

void bootstrap();
