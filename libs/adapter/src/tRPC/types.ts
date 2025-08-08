import { inferAsyncReturnType } from '@trpc/server';

/**
 * tRPC 컨텍스트 타입 정의
 */
export interface TrpcContext {
  user?: {
    id: number;
    email: string;
  };
}

/**
 * tRPC 컨텍스트 생성 함수 타입
 */
export type CreateTrpcContext = () => Promise<TrpcContext>;

/**
 * tRPC 컨텍스트 추론 타입
 */
export type Context = inferAsyncReturnType<CreateTrpcContext>;
