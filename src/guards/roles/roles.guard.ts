import { CustomForbiddenException } from '@/common/exception/custom.exception';
import { statusMessages } from '@/common/utils/status.utils';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;
    const request = context.switchToHttp().getRequest();
    const { user } = request ?? {};
    if (!user) this.throwForbiddenError();
    if (roles.some((role) => user?.roles?.includes(role))) {
      return true;
    }
    this.throwForbiddenError();
  }

  private throwForbiddenError(): void {
    throw new CustomForbiddenException({
      messages: [
        `${statusMessages.FORBIDDEN}: You are not allowed to perform this action`,
      ],
    });
  }
}
