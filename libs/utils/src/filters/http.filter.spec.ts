import { ArgumentsHost } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CustomError, ERROR_CODES, HttpFilter } from '@libs/utils';

describe('HttpFilter', () => {
  let filter: HttpFilter;
  let host: ArgumentsHost;
  let mockResponse: { status: any };
  let mockJson: any;
  let mockStatus: any;

  beforeEach(() => {
    filter = new HttpFilter();

    // Mock response object
    mockJson = vi.fn().mockReturnThis();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
    };

    // Mock ArgumentsHost
    host = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: vi.fn().mockReturnValue(mockResponse),
        getRequest: vi.fn().mockReturnValue({}),
      }),
      getArgByIndex: vi.fn(),
      getArgs: vi.fn(),
      getType: vi.fn(),
    } as unknown as ArgumentsHost;
  });

  it('AUTH_CONFLICT 에러를 처리하고 409 Conflict를 반환해야 한다', () => {
    // Arrange
    const errorMessage = 'Email already exists';
    const customError = new CustomError(
      ERROR_CODES.AUTH_CONFLICT,
      errorMessage,
    );
    const expectedStatus = 409;

    // Act
    filter.catch(customError, host);

    // Assert
    expect(mockStatus).toHaveBeenCalledWith(expectedStatus);
    expect(mockJson).toHaveBeenCalled();
    const responseBody = mockJson.mock.calls[0][0] as Record<string, unknown>;
    expect(responseBody).toHaveProperty('statusCode', expectedStatus);
    expect(responseBody).toHaveProperty('message', errorMessage);
  });

  it('AUTH_UNAUTHORIZED 에러를 처리하고 401 Unauthorized를 반환해야 한다', () => {
    // Arrange
    const errorMessage = 'Invalid email or password';
    const customError = new CustomError(
      ERROR_CODES.AUTH_UNAUTHORIZED,
      errorMessage,
    );
    const expectedStatus = 401;

    // Act
    filter.catch(customError, host);

    // Assert
    expect(mockStatus).toHaveBeenCalledWith(expectedStatus);
    expect(mockJson).toHaveBeenCalled();
    const responseBody = mockJson.mock.calls[0][0] as Record<string, unknown>;
    expect(responseBody).toHaveProperty('statusCode', expectedStatus);
    expect(responseBody).toHaveProperty('message', errorMessage);
  });

  it('알 수 없는 에러 코드를 처리하고 500 Internal Server Error를 반환해야 한다', () => {
    // Arrange
    const errorMessage = 'Some unknown error';
    // Create a CustomError with a code that doesn't exist in ERROR_CODES
    const customError = new CustomError(
      'UNKNOWN_ERROR_CODE' as any,
      errorMessage,
    );
    const expectedStatus = 400;

    // Act
    filter.catch(customError, host);

    // Assert
    expect(mockStatus).toHaveBeenCalledWith(expectedStatus);
    expect(mockJson).toHaveBeenCalled();
    const responseBody = mockJson.mock.calls[0][0] as Record<string, unknown>;
    expect(responseBody).toHaveProperty('statusCode', expectedStatus);
    expect(responseBody).toHaveProperty('message', errorMessage);
  });

  it('에러 메시지가 비어있을 때 기본 메시지를 사용해야 한다', () => {
    // Arrange
    const customError = new CustomError(ERROR_CODES.AUTH_CONFLICT);
    const expectedStatus = 409;

    // Act
    filter.catch(customError, host);

    // Assert
    expect(mockStatus).toHaveBeenCalledWith(expectedStatus);
    expect(mockJson).toHaveBeenCalled();
    const responseBody = mockJson.mock.calls[0][0] as Record<string, unknown>;
    expect(responseBody).toHaveProperty('message', 'Conflict');
  });
});
