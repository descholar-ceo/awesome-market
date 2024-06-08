import { ResponseErrorMessageDto } from '../common.dtos';
import { BaseException } from './base.exception';
import { statusCodes, statusMessages } from '@/common/utils/status.utils';

export class CustomBadRequest extends BaseException {
  constructor(
    { messages }: ResponseErrorMessageDto = {
      messages: [statusMessages.BAD_REQUEST],
    },
  ) {
    super(statusCodes.BAD_REQUEST, messages, statusMessages.BAD_REQUEST);
  }
}
export class CustomConflictException extends BaseException {
  constructor(
    { messages }: ResponseErrorMessageDto = {
      messages: [statusMessages.CONFLICT],
    },
  ) {
    super(statusCodes.CONFLICT, messages, statusMessages.CONFLICT);
  }
}
export class CustomNotFoundException extends BaseException {
  constructor(
    { messages }: ResponseErrorMessageDto = {
      messages: [statusMessages.NOT_FOUND],
    },
  ) {
    super(statusCodes.NOT_FOUND, messages, statusMessages.NOT_FOUND);
  }
}
export class CustomUnauthorizedException extends BaseException {
  constructor(
    { messages }: ResponseErrorMessageDto = {
      messages: [statusMessages.UNAUTHORIZED],
    },
  ) {
    super(statusCodes.UNAUTHORIZED, messages, statusMessages.UNAUTHORIZED);
  }
}
export class CustomInternalServerErrorException extends BaseException {
  constructor(
    { messages }: ResponseErrorMessageDto = {
      messages: [statusMessages.INTERNAL_SERVER_ERROR],
    },
  ) {
    super(
      statusCodes.INTERNAL_SERVER_ERROR,
      messages,
      statusMessages.INTERNAL_SERVER_ERROR,
    );
  }
}
export class CustomForbiddenException extends BaseException {
  constructor(
    { messages }: ResponseErrorMessageDto = {
      messages: [statusMessages.FORBIDDEN],
    },
  ) {
    super(statusCodes.FORBIDDEN, messages, statusMessages.FORBIDDEN);
  }
}
