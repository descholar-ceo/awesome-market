import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const { user } = request ?? {};
    if (!!user) {
      return { ...user };
    }
    return null;
  },
);
