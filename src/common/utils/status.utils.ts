import { HttpStatus } from '@nestjs/common';

export enum statusCodes {
  OK = HttpStatus.OK,
  PERMANENTLY_MOVED = HttpStatus.MOVED_PERMANENTLY,
  BAD_REQUEST = HttpStatus.BAD_REQUEST,
  UNAUTHORIZED = HttpStatus.UNAUTHORIZED,
  CONFLICT = HttpStatus.CONFLICT,
  INTERNAL_SERVER_ERROR = HttpStatus.INTERNAL_SERVER_ERROR,
  NOT_FOUND = HttpStatus.NOT_FOUND,
  FORBIDDEN = HttpStatus.FORBIDDEN,
  CREATED = HttpStatus.CREATED,
  SEE_OTHER = HttpStatus.SEE_OTHER,
}

export enum statusNames {
  OK = 'Ok',
  PERMANENTLY_MOVED = 'Permanently Moved',
  BAD_REQUEST = 'Bad Request',
  UNAUTHORIZED = 'Unauthorized',
  CONFLICT = 'Conflict',
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
  NOT_FOUND = 'Not Found',
  FORBIDDEN = 'Forbidden',
  CREATED = 'Created',
  SEE_OTHER = 'See Other',
}
