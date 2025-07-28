const AUTH_ERROR_CODES = {
  AUTH_CONFLICT: 'AUTH_CONFLICT',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
} as const;

const POST_ERROR_CODES = {
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  POST_CONFLICT: 'POST_CONFLICT',
  POST_DELETED: 'POST_DELETED',
} as const;

const COMMENT_ERROR_CODES = {
  COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',
  COMMENT_DELETED: 'COMMENT_DELETED',
  COMMENT_ALREADY_DELETED: 'COMMENT_ALREADY_DELETED',
} as const;

export const ERROR_CODES = {
  ...AUTH_ERROR_CODES,
  ...POST_ERROR_CODES,
  ...COMMENT_ERROR_CODES,
} as const;

type ErrorCodeType = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export class CustomError extends Error {
  readonly #code: ErrorCodeType;
  constructor(code: ErrorCodeType, message?: string) {
    super(message ?? '');
    this.name = 'CustomError';
    this.#code = code;
  }

  get code() {
    return this.#code;
  }
}
