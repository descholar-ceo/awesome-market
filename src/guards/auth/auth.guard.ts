import { PRODUCTION } from '@/common/constants.common';
import { CustomUnauthorizedException } from '@/common/exception/custom.exception';
import { statusMessages } from '@/common/utils/status.utils';
import { decodeToken } from '@/common/utils/token.utils';
import { ConfigService } from '@/config/config.service';
import { NODE_ENV } from '@/config/config.utils';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
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
    if (!authorization) this.throwUnauthorizedError();
    try {
      const user = decodeToken(authorization);
      if (!!user) {
        request.user = user;
        return true;
      }
      this.throwUnauthorizedError();
    } catch (err) {
      if (this.config.get<string>(NODE_ENV) !== PRODUCTION) {
        Logger.error(err);
      }
      this.throwUnauthorizedError();
    }
  }

  private throwUnauthorizedError(): void {
    throw new CustomUnauthorizedException({
      messages: [`${statusMessages.UNAUTHORIZED}: You need to login`],
    });
  }
}
