import { ExecutionContext } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import {
  CustomConflictException,
  CustomBadRequest,
  CustomNotFoundException,
  CustomUnauthorizedException,
  CustomInternalServerErrorException,
} from './custom.exception';
import { BaseExceptionFilter } from './base-exception.filter';

@Catch(CustomConflictException)
export class ConflictFilter extends BaseExceptionFilter {
  constructor() {
    super();
  }
  catch(exception: CustomConflictException, context: ExecutionContext) {
    console.log('===>exception: ', exception);
    return this.writeToClient(context, exception);
  }
}
@Catch(CustomBadRequest)
export class BadRequestFilter extends BaseExceptionFilter {
  constructor() {
    super();
  }
  catch(exception: CustomBadRequest, context: ExecutionContext) {
    return this.writeToClient(context, exception);
  }
}
@Catch(CustomNotFoundException)
export class NotFoundExceptionFilter extends BaseExceptionFilter {
  constructor() {
    super();
  }
  catch(exception: CustomNotFoundException, context: ExecutionContext) {
    return this.writeToClient(context, exception);
  }
}
@Catch(CustomUnauthorizedException)
export class CustomUnauthorizedExceptionFilter extends BaseExceptionFilter {
  constructor() {
    super();
  }
  catch(exception: CustomUnauthorizedException, context: ExecutionContext) {
    return this.writeToClient(context, exception);
  }
}
@Catch(CustomInternalServerErrorException)
export class CustomInternalServerErrorExceptionFilter extends BaseExceptionFilter {
  constructor() {
    super();
  }
  catch(
    exception: CustomInternalServerErrorException,
    context: ExecutionContext,
  ) {
    return this.writeToClient(context, exception);
  }
}
