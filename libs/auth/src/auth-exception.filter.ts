import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthError, OauthError } from './auth.errors';

@Catch(AuthError)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(error: AuthError, host: ArgumentsHost) {
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

@Catch(OauthError)
export class OAuthExceptionFilter implements ExceptionFilter {
  catch(error: AuthError, host: ArgumentsHost) {
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
