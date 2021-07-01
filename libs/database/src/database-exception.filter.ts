import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { DatabaseError } from './database.errors';

@Catch(DatabaseError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(error: DatabaseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(error.status).json({
      statusCode: error.status,
      timestamp: new Date().toISOString(),
      path: request.url,
      code: error.code,
      message: error.message,
    });
  }
}
