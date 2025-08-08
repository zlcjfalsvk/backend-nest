import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';

// 환경 변수 타입 정의, 나중에 추가할 수 있음
export type ServerType = 'api' | 'admin' | 'worker';

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
      API_PORT: Joi.number().default(3000),
      TRPC_PORT: Joi.number().default(3001),
      JWT_ACCESS_SECRET: Joi.string().required(),
      JWT_REFRESH_SECRET: Joi.string().required(),
      JWT_EXPIRES_IN: Joi.string().required(),
      DATABASE_URL: Joi.string().required(),
    };

    const serverSchemas: Record<ServerType, Joi.SchemaMap> = {
      api: {
        ...baseSchema,
        API_PORT: Joi.number().default(3000),
      },
      admin: {
        ...baseSchema,
      },
      worker: {
        ...baseSchema,
      },
    };

    // 현재 서버 타입에 대한 스키마 가져오기
    const schema = Joi.object(serverSchemas[this.serverType]);

    // 환경 변수 검증
    const validationResult = schema.validate(env, {
      allowUnknown: true,
      convert: true,
    });

    if (validationResult.error) {
      throw new Error(
        `Config validation error: ${validationResult.error.message}`,
      );
    }

    return validationResult.value as EnvConfig;
  }
}
