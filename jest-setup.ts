import { CustomError } from '@libs/utils';

// Prisma 의 prisma-clients/runtime/library.js 의 CustomError 와 이름 중복으로 테스트 코드 실행할 수 없어 추가
global.CustomError = CustomError;
