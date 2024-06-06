import { ResponseMessageType } from './response.message';
import { BaseException } from './base.exception';
import { statusCodes, statusNames } from '@/common/utils/status.utils';

export class CustomBadRequest extends BaseException {
  constructor({ messages }: ResponseMessageType = null) {
    super(statusCodes.BAD_REQUEST, messages, statusNames.BAD_REQUEST);
  }
}
export class CustomConflictException extends BaseException {
  constructor({ messages }: ResponseMessageType = null) {
    super(statusCodes.CONFLICT, messages, statusNames.CONFLICT);
  }
}
export class CustomNotFoundException extends BaseException {
  constructor({ messages }: ResponseMessageType = null) {
    super(statusCodes.NOT_FOUND, messages, statusNames.NOT_FOUND);
  }
}
export class CustomUnauthorizedException extends BaseException {
  constructor({ messages }: ResponseMessageType = null) {
    super(statusCodes.NOT_FOUND, messages, statusNames.NOT_FOUND);
  }
}
export class CustomInternalServerErrorException extends BaseException {
  constructor({ messages }: ResponseMessageType = null) {
    super(
      statusCodes.INTERNAL_SERVER_ERROR,
      messages,
      statusNames.INTERNAL_SERVER_ERROR,
    );
  }
}
export class CustomForbiddenException extends BaseException {
  constructor({ messages }: ResponseMessageType = null) {
    super(statusCodes.FORBIDDEN, messages, statusNames.FORBIDDEN);
  }
}
