import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if(exception instanceof HttpException){
      const status = exception.getStatus();
      return response.status(status).json({
        code: status,
        status: HttpStatus[status],
        message: exception.message,
        path: request.url,
        timestamp: new Date().toISOString()
      })
    }

    return response.status(500).json({
      statusCode: 500,
      statusMessage: HttpStatus[500],
      message: "Internal Server Error",
      path: request.url,
      timestamp: new Date().toISOString()
    })
  }
}
