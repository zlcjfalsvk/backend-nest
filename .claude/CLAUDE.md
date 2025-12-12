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
