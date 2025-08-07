# BE Layered Example

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


## ⚠️ Issues

- **Prisma ORM PostgreSQL FTS**: Prisma에서 PostgreSQL의 전체 텍스트 검색 인덱싱을 지원하지 않음 [참조링크](https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search#postgresql-1)
  - FTS 인덱스 지원이 필요한 경우 MySQL 사용 고려
- **한국 내 패스워드 해싱**: 이 예제에서는 패스워드 해싱에 Argon2를 사용하지만, 한국 내 프로덕션 서비스에서는 KISA 표준에 따라 Argon2 대신 PBKDF2-SHA256 사용 필요
