---

# ⚠️ CRITICAL LANGUAGE POLICY ⚠️

**MANDATORY: ALL reasoning and work MUST be conducted in English. ONLY the final answer should be provided in Korean.**

**반드시 추론과 작업은 영어로 진행하고 최종 답변만 한국어로 대답해라**

- **Reasoning**: English only
- **Tool usage**: English only
- **Code comments**: English only
- **Internal communication**: English only
- **Final user-facing response**: Korean only

---

## npm install 명령

- `--registry https://registry.npmjs.org` 옵션을 추가 해주세요.

## Codeing

- 작업 진행 이후 Prettier 적용 해주세요
- 작업 진행 이후 Eslint 적용 해주세요

## Claude 명령어

### /commit [메시지]

Git 변경사항에 대해 코드 정리(Prettier, ESLint) 후 커밋합니다.

- 모든 수정된 TypeScript 파일에 Prettier 포맷팅 적용
- 모든 수정된 TypeScript 파일에 ESLint 자동 수정 적용
- Git 커밋 생성 (메시지 제공 시 사용, 미제공 시 자동 생성)
- **원격 저장소로 푸시하지 않음** (로컬 커밋만)

**사용법:**

- `/commit "feat: 새 기능 추가"` - 직접 커밋 메시지 작성
- `/commit` - 변경사항 분석 후 자동으로 커밋 메시지 생성

### /commit-push

위의 `/commit` 과정을 진행한 후 원격 저장소로 푸시합니다.

- `/commit` 명령어의 모든 단계 수행
- 원격 저장소로 변경사항 푸시
- 푸시 성공 여부 확인

**사용법:**

- `/commit-push` - 포맷팅, 린팅, 커밋, 푸시를 한 번에 실행

---

## 프로젝트 문서

이 프로젝트는 효율적인 컨텍스트 관리를 위해 모듈화된 문서 구조를 사용합니다. 작업 시 관련 문서를 참조하세요.

### 아키텍처 문서

- **[전체 아키텍처](../docs/ARCHITECTURE.md)**: 시스템 설계, 레이어 구조, 디자인 패턴, 기술 스택

### 라이브러리 문서 (libs/)

- **[비즈니스 레이어](../docs/libs/BUSINESS.md)**: 핵심 비즈니스 로직과 서비스 (AuthService, PostService, CommentService)
- **[인프라 레이어](../docs/libs/INFRASTRUCTURE.md)**: 데이터베이스 접근 (Prisma), 설정 관리 (ConfigService)
- **[어댑터 레이어](../docs/libs/ADAPTER.md)**: 프로토콜 어댑터 (tRPC 통합)
- **[유틸리티 레이어](../docs/libs/UTILS.md)**: 가드, 필터, 데코레이터, 헬퍼 함수

### 애플리케이션 문서 (apps/)

- **[REST API](../docs/apps/API.md)**: REST API 엔드포인트, DTO, 가드, 사용법
- **[tRPC API](../docs/apps/TRPC.md)**: tRPC 프로시저, Zod 스키마, 타입 안전성

### 문서 활용 가이드

**작업 시나리오별 참조 문서:**

1. **새로운 API 엔드포인트 추가**
   - [REST API 문서](../docs/apps/API.md) - 엔드포인트 구조 및 DTO 패턴
   - [비즈니스 레이어 문서](../docs/libs/BUSINESS.md) - 서비스 사용법
   - [유틸리티 문서](../docs/libs/UTILS.md) - 가드 및 데코레이터 사용

2. **데이터베이스 스키마 변경**
   - [인프라 레이어 문서](../docs/libs/INFRASTRUCTURE.md) - Prisma 설정 및 마이그레이션
   - [비즈니스 레이어 문서](../docs/libs/BUSINESS.md) - 서비스 업데이트 방법

3. **tRPC 프로시저 추가**
   - [tRPC 문서](../docs/apps/TRPC.md) - 프로시저 작성 및 스키마 정의
   - [어댑터 레이어 문서](../docs/libs/ADAPTER.md) - tRPC 서비스 통합

4. **인증/인가 로직 수정**
   - [비즈니스 레이어 문서](../docs/libs/BUSINESS.md) - AuthService 구조
   - [유틸리티 문서](../docs/libs/UTILS.md) - 가드 커스터마이징
   - [REST API 문서](../docs/apps/API.md) - 가드 적용 방법

5. **새로운 비즈니스 로직 추가**
   - [아키텍처 문서](../docs/ARCHITECTURE.md) - 레이어 의존성 규칙
   - [비즈니스 레이어 문서](../docs/libs/BUSINESS.md) - 서비스 작성 패턴

6. **에러 처리 개선**
   - [유틸리티 문서](../docs/libs/UTILS.md) - 커스텀 에러 및 필터
   - [REST API 문서](../docs/apps/API.md) - 에러 응답 형식

**중요 원칙:**

- 작업 전에 항상 관련 문서를 먼저 읽어 기존 패턴과 규칙을 파악하세요
- 문서에 정의된 구조와 패턴을 따라 일관성을 유지하세요
- 새로운 패턴을 도입할 경우 해당 문서를 업데이트하세요
