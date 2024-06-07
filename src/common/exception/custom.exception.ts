import { ResponseMessageType } from './response.message';
import { BaseException } from './base.exception';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';

export class CustomBadRequest extends BaseException {
  constructor({ messages }: ResponseMessageType = null) {
    super(statusCodes.BAD_REQUEST, messages, statusMessages.BAD_REQUEST);
  }
}
export class CustomConflictException extends BaseException {
  constructor({ messages }: ResponseMessageType = null) {
    super(statusCodes.CONFLICT, messages, statusMessages.CONFLICT);
  }
}
export class CustomNotFoundException extends BaseException {
  constructor({ messages }: ResponseMessageType = null) {
    super(statusCodes.NOT_FOUND, messages, statusMessages.NOT_FOUND);
  }
}
export class CustomUnauthorizedException extends BaseException {
  constructor({ messages }: ResponseMessageType = null) {
    super(statusCodes.NOT_FOUND, messages, statusMessages.NOT_FOUND);
  }
}
export class CustomInternalServerErrorException extends BaseException {
  constructor({ messages }: ResponseMessageType = null) {
    super(
      statusCodes.INTERNAL_SERVER_ERROR,
      messages,
      statusMessages.INTERNAL_SERVER_ERROR,
    );
  }
}
export class CustomForbiddenException extends BaseException {
  constructor({ messages }: ResponseMessageType = null) {
    super(statusCodes.FORBIDDEN, messages, statusMessages.FORBIDDEN);
  }
}
