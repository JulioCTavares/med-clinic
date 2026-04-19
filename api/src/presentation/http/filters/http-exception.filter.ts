import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

const HTTP_CODES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  500: 'INTERNAL_SERVER_ERROR',
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const isObject =
      typeof exceptionResponse === 'object' && exceptionResponse !== null;

    const message = isObject
      ? ((exceptionResponse as Record<string, unknown>).message as string)
      : exceptionResponse;

    const details = isObject
      ? ((exceptionResponse as Record<string, unknown>).errors as unknown[])
      : undefined;

    void reply.status(statusCode).send({
      statusCode,
      code: HTTP_CODES[statusCode] ?? 'UNKNOWN_ERROR',
      message: Array.isArray(message) ? message[0] : message,
      path: request.url,
      method: request.method,
      requestId: request.id,
      timestamp: new Date().toISOString(),
      ...(details?.length && { details }),
    });
  }
}

export function toHttpStatus(code: string): HttpStatus {
  const map: Record<string, HttpStatus> = {
    EMAIL_ALREADY_IN_USE: HttpStatus.CONFLICT,
  };
  return map[code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
}
