import { statusCodes, statusMessages } from '@/common/utils/status.utils';
import { ExceptionFilter, ExecutionContext } from '@nestjs/common';
import { Response } from 'express';
import { BaseException } from './base.exception';

export abstract class BaseExceptionFilter
  implements ExceptionFilter<BaseException>
{
  abstract catch(exception: BaseException, context: ExecutionContext);

  protected getHttpContext(context: ExecutionContext) {
    return context;
  }

  protected getResponse(context: ExecutionContext): Response {
    return context.switchToHttp().getResponse();
  }

  protected writeToClient(context: ExecutionContext, exception: BaseException) {
    const httpContext = this.getHttpContext(context);
    if (exception instanceof BaseException) {
      this.getResponse(httpContext).status(exception.statusNumber).json({
        message: exception.getMessagesArr(),
        error: exception.getErrorName(),
        statusCode: exception.getErrorName(),
      });
    } else {
      this.getResponse(httpContext)
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: [statusMessages.INTERNAL_SERVER_ERROR],
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          error: statusMessages.INTERNAL_SERVER_ERROR,
        });
    }
  }
}
