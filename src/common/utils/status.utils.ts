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
  OK = 'OK',
  PERMANENTLY_MOVED = 'PERMANENTLY_MOVED',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  CREATED = 'CREATED',
  SEE_OTHER = 'SEE_OTHER',
}
