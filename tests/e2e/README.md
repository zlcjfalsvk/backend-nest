# E2E Tests Documentation

이 문서는 분리된 API와 tRPC E2E 테스트 구조에 대해 설명합니다.

## 디렉토리 구조

```
tests/e2e/
├── api/                          # API 전용 설정
│   ├── global-setup.ts          # API E2E 글로벌 설정
│   ├── global-teardown.ts       # API E2E 글로벌 정리
│   └── vitest.config.e2e.mts    # API E2E vitest 설정
├── trpc/                        # tRPC 전용 설정
│   ├── global-setup.ts          # tRPC E2E 글로벌 설정
│   ├── global-teardown.ts       # tRPC E2E 글로벌 정리
│   └── vitest.config.e2e.mts    # tRPC E2E vitest 설정
├── setup.ts                     # 공통 테스트 설정
├── seed.ts                      # 테스트 데이터 시드
└── playwright.config.ts         # Playwright 설정

apps/
├── api/e2e/                     # API E2E 테스트 파일들
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   ├── health.e2e-spec.ts
│   ├── posts.e2e-spec.ts
│   └── comments.e2e-spec.ts
└── trpc/e2e/                    # tRPC E2E 테스트 파일들
    ├── app.e2e-spec.ts
    ├── auth.e2e-spec.ts
    ├── health.e2e-spec.ts
    ├── posts.e2e-spec.ts
    └── comments.e2e-spec.ts

scripts/
├── e2e-api-setup.sh            # API 전용 설정 스크립트
├── e2e-api-teardown.sh         # API 전용 정리 스크립트
├── e2e-trpc-setup.sh           # tRPC 전용 설정 스크립트
└── e2e-trpc-teardown.sh        # tRPC 전용 정리 스크립트
```

## NPM 스크립트

### API E2E 테스트

```bash
# API E2E 테스트만 실행
npm run e2e:api

# 개별 단계 실행
npm run e2e:api:setup      # API 서버 및 데이터베이스 설정
npm run e2e:api:test       # API E2E 테스트 실행
npm run e2e:api:teardown   # API 환경 정리
```

### tRPC E2E 테스트

```bash
# tRPC E2E 테스트만 실행
npm run e2e:trpc

# 개별 단계 실행
npm run e2e:trpc:setup     # tRPC 서버 및 데이터베이스 설정
npm run e2e:trpc:test      # tRPC E2E 테스트 실행
npm run e2e:trpc:teardown  # tRPC 환경 정리
```

### 통합 E2E 테스트

```bash
# 모든 E2E 테스트 실행 (API + tRPC) - 순차 실행
npm run e2e

# Playwright 포함 전체 테스트
npm run e2e:full
```

**주의**: 통합 E2E 테스트(`npm run e2e`)는 API와 tRPC 테스트를 순차적으로 실행합니다. 각 테스트는 독립적인 환경에서 실행되므로 더 안정적입니다.

## 분리의 장점

1. **독립적 실행**: API와 tRPC 테스트를 각각 독립적으로 실행 가능
2. **빠른 피드백**: 특정 서비스의 테스트만 실행하여 개발 속도 향상
3. **리소스 효율성**: 필요한 서버만 시작하여 시스템 리소스 절약
4. **병렬 실행**: CI/CD에서 API와 tRPC 테스트를 병렬로 실행 가능
5. **디버깅 용이성**: 특정 서비스의 문제를 격리하여 디버깅 가능
6. **구조화된 설정**: 각 서비스의 설정이 해당 폴더에 집중되어 관리 용이

## 포트 사용

- **API 서버**: http://localhost:3000
- **tRPC 서버**: http://localhost:3001/trpc
- **테스트 데이터베이스**: postgresql://testuser:testpass@localhost:5433/testdb

## 사용 시나리오

### API 개발 중

```bash
npm run e2e:api
```

### tRPC 개발 중

```bash
npm run e2e:trpc
```

### 전체 통합 테스트

```bash
npm run e2e
```

### CI/CD에서 병렬 실행

```yaml
# GitHub Actions 예시
jobs:
  api-e2e:
    runs-on: ubuntu-latest
    steps:
      - run: npm run e2e:api

  trpc-e2e:
    runs-on: ubuntu-latest
    steps:
      - run: npm run e2e:trpc
```

## 설정 파일 구조

각 서비스의 vitest 설정 파일은 해당 서비스 폴더 안에 위치합니다:

- `tests/e2e/api/vitest.config.e2e.mts` - API 전용 설정
- `tests/e2e/trpc/vitest.config.e2e.mts` - tRPC 전용 설정

이를 통해 각 서비스의 설정을 독립적으로 관리할 수 있으며, 설정 파일을 찾기도 쉬워집니다.
