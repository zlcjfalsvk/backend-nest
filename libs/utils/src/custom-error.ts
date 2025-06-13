const AUTH_ERROR_CODES = {
  AUTH_CONFLICT: 'AUTH_CONFLICT',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
} as const;

export const ERROR_CODES = { ...AUTH_ERROR_CODES } as const;

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
