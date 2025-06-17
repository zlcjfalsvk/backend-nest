import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

import { CustomError, ERROR_CODES } from '../custom-error';

@Catch(CustomError)
export class HttpFilter implements ExceptionFilter {
  catch(exception: CustomError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let httpException: HttpException;

    // Map CustomError to appropriate HttpException based on error code
    switch (exception.code) {
      case ERROR_CODES.AUTH_CONFLICT:
        httpException = new ConflictException(exception.message || 'Conflict');
        break;
      case ERROR_CODES.AUTH_UNAUTHORIZED:
        httpException = new UnauthorizedException(
          exception.message || 'Unauthorized',
        );
        break;
      default:
        httpException = new BadRequestException(
          exception.message || 'Bad Request',
        );
    }

    // Get status and response body from the HttpException
    const status = httpException.getStatus();
    const responseBody = httpException.getResponse();

    // Send the response
    response.status(status).json(responseBody);
  }
}
