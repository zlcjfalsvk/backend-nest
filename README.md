# BE Layered Example

[![Unit Tests](https://github.com/zlcjfalsvk/be-layered-example/actions/workflows/run-tests.yml/badge.svg)](https://github.com/zlcjfalsvk/be-layered-example/actions/workflows/run-tests.yml)
[![E2E Tests](https://github.com/zlcjfalsvk/be-layered-example/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/zlcjfalsvk/be-layered-example/actions/workflows/e2e-tests.yml)

## 🔧 Requirements

- Node.js >= 22.0.0
- npm >= 10.0.0

## 🚀 Skill Set

- nestjs
- PostgreSQL
- Prisma ORM
- Vitest
- SWC

## 📁 Project Structure

```
be-layered-example/
├── apps/                          # 애플리케이션
│   ├── api/                       # REST API 애플리케이션
│   └── trpc/                      # tRPC 애플리케이션
├── libs/                          # 공유 라이브러리
│   ├── adapter/                   # 어댑터 계층 (tRPC 통합)
│   ├── business/                  # 비즈니스 로직 계층
│   ├── infrastructure/            # 인프라스트럭처 계층
│   └── utils/                     # 유틸리티 함수 및 헬퍼
└── prisma/                        # 데이터베이스 스키마 및 마이그레이션
    ├── migrations/                # 데이터베이스 마이그레이션 파일
    └── schema.prisma              # Prisma 스키마 정의
```

## 🧪 Testing

이 프로젝트는 포괄적인 테스트 전략을 구현하고 있습니다:

### Unit Tests

- **Framework**: Vitest
- **Coverage**: 비즈니스 로직, 서비스, 가드, 필터 등
- **Command**: `npm run test:unit`
- **Status**: ![Unit Tests](https://github.com/zlcjfalsvk/be-layered-example/actions/workflows/run-tests.yml/badge.svg)

### E2E Tests

- **Applications**: API (REST) & tRPC 서버
- **Database**: PostgreSQL with Prisma ORM
- **Test Environment**: Docker containers
- **Command**: `npm run e2e:test`
- **Status**: ![E2E Tests](https://github.com/zlcjfalsvk/be-layered-example/actions/workflows/e2e-tests.yml/badge.svg)

### CI/CD Pipeline

- **Unit Tests**: 모든 브랜치에서 push 시 실행
- **E2E Tests**: main/develop 브랜치와 PR에서 실행
- **Matrix Testing**: API와 tRPC 애플리케이션 병렬 테스트
- **Test Results**: GitHub Actions Summary에서 상세 결과 확인 가능

### 로컬 테스트 실행

```bash
# Unit Tests
npm run test:unit
npm run test:unit:watch    # Watch mode
npm run test:unit:coverage # Coverage report

# E2E Tests - API
npm run e2e:api:test

# E2E Tests - tRPC
npm run e2e:trpc:test

# 모든 E2E Tests
npm run e2e:test
```

### 테스트 결과 확인

- **Live Results**: 각 워크플로우 배지를 클릭하여 최신 실행 결과 확인
- **Action History**: GitHub Actions 탭에서 전체 실행 기록 조회
- **Detailed Logs**: 실패한 테스트의 경우 artifacts에서 상세 로그 다운로드 가능

## ⚠️ Issues

- **Prisma ORM PostgreSQL FTS**: Prisma에서 PostgreSQL의 전체 텍스트 검색 인덱싱을 지원하지 않음 [참조링크](https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search#postgresql-1)
  - FTS 인덱스 지원이 필요한 경우 MySQL 사용 고려
- **한국 내 패스워드 해싱**: 이 예제에서는 패스워드 해싱에 Argon2를 사용하지만, 한국 내 프로덕션 서비스에서는 KISA 표준에 따라 Argon2 대신 PBKDF2-SHA256 사용 필요
