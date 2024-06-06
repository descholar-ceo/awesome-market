import { HttpException } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    public statusNumber: number,
    public messagesArr: string[],
    public errorName: string,
  ) {
    super(
      { message: messagesArr, statusCode: statusNumber, error: errorName },
      statusNumber,
    );
  }

  getMessagesArr(): string[] {
    return this.messagesArr;
  }
  getStatusCode(): number {
    return this.statusNumber;
  }
  getErrorName(): string {
    return this.errorName;
  }
}
