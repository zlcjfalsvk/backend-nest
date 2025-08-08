import { Test, TestingModule } from '@nestjs/testing';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { ConfigService, EnvConfig } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let originalEnv: NodeJS.ProcessEnv;

  // 테스트 전에 원본 환경 변수 저장
  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  // 각 테스트 후 환경 변수 초기화
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // 모든 테스트 후 원본 환경 복원
  afterAll(() => {
    process.env = originalEnv;
  });

  // 테스트용 환경 변수 설정 헬퍼 함수
  const setupEnvVariables = (config: Partial<EnvConfig> = {}) => {
    process.env.JWT_ACCESS_SECRET = config.JWT_ACCESS_SECRET || 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = config.JWT_REFRESH_SECRET || 'test-refresh-secret';
    process.env.JWT_EXPIRES_IN = config.JWT_EXPIRES_IN || '1h';
    process.env.DATABASE_URL =
      config.DATABASE_URL || 'postgresql://user:password@localhost:5432/db';

    if (config.API_PORT) {
      process.env.API_PORT = config.API_PORT.toString();
    }
  };

  describe('기본 기능', () => {
    beforeEach(async () => {
      setupEnvVariables();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: ConfigService,
            useFactory: () => new ConfigService('api'),
          },
        ],
      }).compile();

      service = module.get<ConfigService>(ConfigService);
    });

    it('정의되어야 함', () => {
      expect(service).toBeDefined();
    });

    it('설정 값을 조회할 수 있어야 함', () => {
      expect(service.get('JWT_ACCESS_SECRET')).toBe('test-access-secret');
      expect(service.get('JWT_REFRESH_SECRET')).toBe('test-refresh-secret');
      expect(service.get('JWT_EXPIRES_IN')).toBe('1h');
      expect(service.get('DATABASE_URL')).toBe(
        'postgresql://user:password@localhost:5432/db',
      );
    });
  });

  describe('서버 타입 시나리오', () => {
    it('기본 서버 타입(api)으로 초기화되어야 함', () => {
      setupEnvVariables({ API_PORT: 3000 });
      const configService = new ConfigService();
      expect(configService.get('API_PORT')).toBe(3000);
    });

    it('api 서버 타입으로 초기화되어야 함', () => {
      setupEnvVariables({ API_PORT: 4000 });
      const configService = new ConfigService('api');
      expect(configService.get('API_PORT')).toBe(4000);
    });
  });

  describe('환경 변수 검증', () => {
    it('API_PORT가 제공되지 않을 때 기본값을 사용해야 함', () => {
      setupEnvVariables();
      delete process.env.API_PORT;

      const configService = new ConfigService('api');
      expect(configService.get('API_PORT')).toBe(3000); // 스키마의 기본값
    });

    it('필수 변수가 누락될 때 오류를 발생시켜야 함', () => {
      // JWT_ACCESS_SECRET 누락
      process.env = {
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_EXPIRES_IN: '1h',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
      };

      expect(() => new ConfigService()).toThrow(/Config validation error/);
    });

    it('JWT_ACCESS_SECRET이 누락될 때 오류를 발생시켜야 함', () => {
      setupEnvVariables();
      delete process.env.JWT_ACCESS_SECRET;

      expect(() => new ConfigService()).toThrow(/Config validation error/);
    });

    it('JWT_REFRESH_SECRET이 누락될 때 오류를 발생시켜야 함', () => {
      setupEnvVariables();
      delete process.env.JWT_REFRESH_SECRET;

      expect(() => new ConfigService()).toThrow(/Config validation error/);
    });

    it('JWT_EXPIRES_IN이 누락될 때 오류를 발생시켜야 함', () => {
      setupEnvVariables();
      delete process.env.JWT_EXPIRES_IN;

      expect(() => new ConfigService()).toThrow(/Config validation error/);
    });

    it('DATABASE_URL이 누락될 때 오류를 발생시켜야 함', () => {
      setupEnvVariables();
      delete process.env.DATABASE_URL;

      expect(() => new ConfigService()).toThrow(/Config validation error/);
    });
  });

  describe('API 타입 검증', () => {
    it('유효한 서버 타입을 허용해야 함', () => {
      setupEnvVariables();

      // 이들은 오류를 발생시키지 않아야 함
      expect(() => new ConfigService('api')).not.toThrow();
      expect(() => new ConfigService('admin')).not.toThrow();
      expect(() => new ConfigService('worker')).not.toThrow();
    });

    it('API_PORT를 숫자로 변환해야 함', () => {
      process.env = {
        API_PORT: '4000',
        JWT_ACCESS_SECRET: 'test-access-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_EXPIRES_IN: '1h',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
      };

      const configService = new ConfigService('api');
      const port = configService.get('API_PORT');

      expect(port).toBe(4000);
      expect(typeof port).toBe('number');
    });
  });
});
