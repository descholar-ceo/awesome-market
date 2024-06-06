import { ResponseMessageType } from './response.message';
import { BaseException } from './base.exception';
import { statusCodes, statusNames } from '@/common/utils/status.utils';

export class CustomBadRequest extends BaseException {
  constructor(messageObj: ResponseMessageType = null) {
    super(
      statusCodes.BAD_REQUEST,
      messageObj.messages,
      statusNames.BAD_REQUEST,
    );
  }
}
export class CustomConflictException extends BaseException {
  constructor(messageObj: ResponseMessageType = null) {
    super(statusCodes.CONFLICT, messageObj.messages, statusNames.CONFLICT);
  }
}
export class CustomNotFoundException extends BaseException {
  constructor(messageObj: ResponseMessageType = null) {
    super(statusCodes.NOT_FOUND, messageObj.messages, statusNames.NOT_FOUND);
  }
}
export class CustomUnauthorizedException extends BaseException {
  constructor(messageObj: ResponseMessageType = null) {
    super(statusCodes.NOT_FOUND, messageObj.messages, statusNames.NOT_FOUND);
  }
}
export class CustomInternalServerErrorException extends BaseException {
  constructor(messageObj: ResponseMessageType = null) {
    super(
      statusCodes.INTERNAL_SERVER_ERROR,
      messageObj.messages,
      statusNames.INTERNAL_SERVER_ERROR,
    );
  }
}
export class CustomForbiddenException extends BaseException {
  constructor(messageObj: ResponseMessageType = null) {
    super(statusCodes.FORBIDDEN, messageObj.messages, statusNames.FORBIDDEN);
  }
}
