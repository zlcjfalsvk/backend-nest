import { Injectable } from '@nestjs/common';
import { z } from 'zod';

// 환경 변수 타입 정의, 나중에 추가할 수 있음
export type ServerType = 'api' | 'trpc';

export interface EnvConfig {
  // 서버
  API_PORT: number;
  TRPC_PORT: number;

  // JWT
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;

  // 데이터베이스
  DATABASE_URL: string;
}

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;
  private readonly serverType: ServerType;

  constructor(serverType: ServerType = 'api') {
    this.serverType = serverType;
    this.envConfig = this.validateEnvVariables(process.env);
  }

  get<T extends keyof EnvConfig>(key: T): EnvConfig[T] {
    return this.envConfig[key];
  }

  private validateEnvVariables(env: NodeJS.ProcessEnv): EnvConfig {
    const baseSchema = {
      JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
      JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
      JWT_EXPIRES_IN: z.string().min(1, 'JWT_EXPIRES_IN is required'),
      DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    };

    const serverSchemas: Record<ServerType, z.ZodSchema<any>> = {
      api: z.object({
        API_PORT: z.coerce.number().default(3000),
        ...baseSchema,
      }),
      trpc: z.object({
        TRPC_PORT: z.coerce.number().default(3001),
        ...baseSchema,
      }),
    };

    // 현재 서버 타입에 대한 스키마 가져오기
    const schema = serverSchemas[this.serverType];

    // 환경 변수 검증
    try {
      const validationResult = schema.parse(env);
      return validationResult as EnvConfig;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        throw new Error(`Config validation error: ${errorMessage}`);
      }
      throw error;
    }
  }
}
