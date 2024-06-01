import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;
    const request = context.switchToHttp().getRequest();
    const { user } = request ?? {};
    if (!user) {
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );
    }
    if (roles.some((role) => user?.roles?.includes(role))) {
      return true;
    }
    throw new ForbiddenException('You are not allowed to perform this action');
  }
}
