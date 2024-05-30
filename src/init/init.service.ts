import { PRODUCTION } from '@/common/constants.common';
import { ConfigService } from '@/config/config.service';
import {
  ADMIN_ROLE,
  INITIAL_ADMIN_EMAIL,
  INITIAL_ADMIN_FNAME,
  INITIAL_ADMIN_LNAME,
  INITIAL_ADMIN_PASSWORD,
  INITIAL_ADMIN_PHONE,
  NODE_ENV,
} from '@/config/config.utils';
import { RoleService } from '@/role/role.service';
import { UserService } from '@/user/user.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class InitService {
  constructor(
    private readonly config: ConfigService,
    private readonly roleService: RoleService,
    private readonly userService: UserService,
  ) {}

  async createInitialDatabaseDataNeededToWork(): Promise<void> {
    const adminRoleName = this.config.get<string>(ADMIN_ROLE);
    const nodeEnv = this.config.get<string>(NODE_ENV);
    const adminUserEmail = this.config.get<string>(INITIAL_ADMIN_EMAIL);
    let adminRole = (
      await this.roleService.find({
        name: adminRoleName,
      })
    )?.[0];
    if (!adminRole) {
      if (nodeEnv !== PRODUCTION) {
        Logger.debug('Initial admin role name does not exist, creating it...');
      }
      adminRole = await this.roleService.create({ name: adminRoleName });
    } else {
      if (nodeEnv !== PRODUCTION) {
        Logger.debug(
          'Initial admin role name already exists, skipping its initialzation...',
        );
      }
    }
    let initialAdmin = (
      await this.userService.find({
        email: adminUserEmail,
      })
    )?.[0];
    if (!initialAdmin) {
      if (nodeEnv !== PRODUCTION) {
        Logger.debug('The initial Admin does not exist, creating it...');
      }
      initialAdmin = await this.userService.create({
        email: adminUserEmail,
        firstName: this.config.get<string>(INITIAL_ADMIN_FNAME),
        lastName: this.config.get<string>(INITIAL_ADMIN_LNAME),
        phoneNumber: this.config.get<string>(INITIAL_ADMIN_PHONE),
        password: this.config.get<string>(INITIAL_ADMIN_PASSWORD),
        roles: [adminRole],
      });
    } else {
      if (nodeEnv !== PRODUCTION) {
        Logger.debug(
          'Initial admin user already exists, skipping its initialzation...',
        );
      }
    }
  }
}
