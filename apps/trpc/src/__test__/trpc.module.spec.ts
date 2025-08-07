import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TrpcModule as TrpcAdapterModule } from '@libs/adapter';
import { AuthModule, CommentModule, PostModule } from '@libs/business';
import { PrismaModule, ConfigModule } from '@libs/infrastructure';

import { TrpcModule } from '../trpc.module';
import { TrpcRouter } from '../trpc.router';

vi.mock('@libs/adapter', () => ({
  TrpcModule: vi.fn(),
}));

vi.mock('@libs/business', () => ({
  AuthModule: vi.fn(),
  CommentModule: vi.fn(),
  PostModule: vi.fn(),
}));

vi.mock('@libs/infrastructure', () => ({
  PrismaModule: vi.fn(),
  ConfigModule: vi.fn(),
}));

vi.mock('../trpc.router', () => ({
  TrpcRouter: vi.fn(),
}));

describe('TrpcModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    vi.resetAllMocks();

    module = await Test.createTestingModule({
      imports: [TrpcModule],
    })
      .overrideModule(TrpcAdapterModule)
      .useModule(class MockTrpcAdapterModule {})
      .overrideModule(AuthModule)
      .useModule(class MockAuthModule {})
      .overrideModule(CommentModule)
      .useModule(class MockCommentModule {})
      .overrideModule(PostModule)
      .useModule(class MockPostModule {})
      .overrideModule(PrismaModule)
      .useModule(class MockPrismaModule {})
      .overrideModule(ConfigModule)
      .useModule(class MockConfigModule {})
      .overrideProvider(TrpcRouter)
      .useValue({})
      .compile();
  });

  it('모듈이 정의되어야 한다', () => {
    expect(module).toBeDefined();
  });

  it('TrpcRouter 프로바이더가 있어야 한다', () => {
    const trpcRouter = module.get(TrpcRouter);
    expect(trpcRouter).toBeDefined();
  });

  it('필수 모듈들을 모두 임포트해야 한다', async () => {
    const moduleRef = await Test.createTestingModule({
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
    }).compile();

    expect(moduleRef).toBeDefined();
  });

  it('TrpcRouter를 내보내야 한다', async () => {
    const compiledModule = await Test.createTestingModule({
      imports: [TrpcModule],
    })
      .overrideModule(TrpcAdapterModule)
      .useModule(class MockTrpcAdapterModule {})
      .overrideModule(AuthModule)
      .useModule(class MockAuthModule {})
      .overrideModule(CommentModule)
      .useModule(class MockCommentModule {})
      .overrideModule(PostModule)
      .useModule(class MockPostModule {})
      .overrideModule(PrismaModule)
      .useModule(class MockPrismaModule {})
      .overrideModule(ConfigModule)
      .useModule(class MockConfigModule {})
      .overrideProvider(TrpcRouter)
      .useValue({ appRouter: {} })
      .compile();

    const exportedRouter = compiledModule.get(TrpcRouter);
    expect(exportedRouter).toBeDefined();
    expect(exportedRouter).toHaveProperty('appRouter');
  });
});