import { PRODUCTION } from '@/common/constants.common';
import { decodeToken } from '@/common/utils/token.utils';
import { ConfigService } from '@/config/config.service';
import { NODE_ENV } from '@/config/config.utils';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const {
      headers: { authorization },
    } = request ?? {};
    if (!authorization) {
      throw new UnauthorizedException('Login first');
    }
    try {
      const user = decodeToken(authorization);
      if (!!user) {
        request.user = user;
        return true;
      }
      throw new UnauthorizedException('Login first');
    } catch (err) {
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.error(err);
      }
      throw new UnauthorizedException('Login first');
    }
  }
}
